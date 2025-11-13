import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import postgres from 'postgres';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

/**
 * Create migrations tracking table if it doesn't exist
 */
async function ensureMigrationsTable(sql) {
  console.log('📋 Ensuring migrations tracking table exists...');
  await sql`
    CREATE TABLE IF NOT EXISTS "_migrations" (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
      checksum VARCHAR(64),
      success BOOLEAN DEFAULT TRUE,
      error_message TEXT
    )
  `;
  console.log('✅ Migrations table ready');
}

/**
 * Calculate checksum for migration content
 */
function calculateChecksum(content) {
  // Simple hash function for content verification
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

/**
 * Check if migration has already been run
 */
async function isMigrationApplied(sql, filename) {
  const result = await sql`
    SELECT id, checksum, executed_at 
    FROM "_migrations" 
    WHERE filename = ${filename} AND success = TRUE
  `;
  return result.length > 0 ? result[0] : null;
}

/**
 * Record migration execution
 */
async function recordMigration(sql, filename, checksum, success = true, errorMessage = null) {
  try {
    await sql`
      INSERT INTO "_migrations" (filename, checksum, success, error_message)
      VALUES (${filename}, ${checksum}, ${success}, ${errorMessage})
      ON CONFLICT (filename) 
      DO UPDATE SET 
        executed_at = NOW(),
        checksum = ${checksum},
        success = ${success},
        error_message = ${errorMessage}
    `;
  } catch (error) {
    console.warn('⚠️  Failed to record migration in tracking table:', error.message);
  }
}

/**
 * Log migration to syncJobs for audit trail
 */
async function logToSyncJobs(sql, filename, status, details = null) {
  try {
    // Check if syncJobs table exists first
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'syncJobs'
      )
    `.then(result => result[0].exists);

    if (tableExists) {
      await sql`
        INSERT INTO "syncJobs" (job_name, status, details, started_at, completed_at, created_at)
        VALUES (
          ${`migration: ${filename}`}, 
          ${status}, 
          ${details}, 
          NOW(), 
          ${status === 'completed' || status === 'failed' ? sql`NOW()` : null},
          NOW()
        )
      `;
    }
  } catch (error) {
    console.warn('⚠️  Failed to log migration to syncJobs:', error.message);
  }
}

/**
 * Run a single migration file with tracking
 */
async function runMigrationFile(sql, migrationPath, options = {}) {
  const filename = basename(migrationPath);
  const { dryRun = false, force = false } = options;
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📄 Processing migration: ${filename}`);
  console.log(`${'='.repeat(60)}`);
  
  if (!existsSync(migrationPath)) {
    throw new Error(`Migration file not found: ${migrationPath}`);
  }

  const migrationSQL = readFileSync(migrationPath, 'utf8');
  const checksum = calculateChecksum(migrationSQL);
  
  // Check if already applied
  const existingMigration = await isMigrationApplied(sql, filename);
  
  if (existingMigration && !force) {
    console.log(`⏭️  Migration already applied on ${new Date(existingMigration.executed_at).toLocaleString()}`);
    
    if (existingMigration.checksum !== checksum) {
      console.warn('⚠️  WARNING: Migration file content has changed since it was applied!');
      console.warn('   Use --force to re-run this migration');
    }
    
    return { skipped: true, filename };
  }
  
  if (dryRun) {
    console.log('🔍 DRY RUN - Would execute the following SQL:');
    console.log('-'.repeat(60));
    console.log(migrationSQL);
    console.log('-'.repeat(60));
    return { dryRun: true, filename };
  }
  
  console.log('🚀 Executing migration...');
  console.log('-'.repeat(60));
  console.log(migrationSQL);
  console.log('-'.repeat(60));
  
  try {
    // Execute migration in a transaction
    await sql.begin(async sql => {
      await sql.unsafe(migrationSQL);
      await recordMigration(sql, filename, checksum, true, null);
    });
    
    console.log(`✅ Migration ${filename} completed successfully!`);
    await logToSyncJobs(sql, filename, 'completed', `Migration executed successfully. Checksum: ${checksum}`);
    
    return { success: true, filename };
  } catch (error) {
    const errorMessage = error.message || String(error);
    console.error(`❌ Migration ${filename} failed:`, errorMessage);
    
    // Record failed migration
    await recordMigration(sql, filename, checksum, false, errorMessage);
    await logToSyncJobs(sql, filename, 'failed', `Error: ${errorMessage}`);
    
    throw error;
  }
}

/**
 * Run all migrations in the migrations directory
 */
async function runAllMigrations(options = {}) {
  const sql = postgres(DATABASE_URL, {
    ssl: 'require'
  });
  
  try {
    await ensureMigrationsTable(sql);
    
    const migrationsDir = join(__dirname, '../drizzle/migrations');
    const files = readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql') && file !== '.gitkeep')
      .sort(); // Run migrations in alphabetical order
    
    if (files.length === 0) {
      console.log('No migration files found');
      return;
    }
    
    console.log(`\n📦 Found ${files.length} migration file(s)\n`);
    
    const results = {
      total: files.length,
      executed: 0,
      skipped: 0,
      failed: 0,
      dryRun: options.dryRun || false
    };
    
    for (const file of files) {
      const migrationPath = join(migrationsDir, file);
      try {
        const result = await runMigrationFile(sql, migrationPath, options);
        if (result.skipped) results.skipped++;
        else if (result.dryRun) results.skipped++;
        else if (result.success) results.executed++;
      } catch (error) {
        results.failed++;
        if (!options.continueOnError) {
          throw error;
        }
      }
    }
    
    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 Migration Summary');
    console.log(`${'='.repeat(60)}`);
    console.log(`Total migrations: ${results.total}`);
    console.log(`Executed: ${results.executed}`);
    console.log(`Skipped: ${results.skipped}`);
    console.log(`Failed: ${results.failed}`);
    
    if (results.dryRun) {
      console.log('\n🔍 DRY RUN MODE - No changes were made to the database');
    } else if (results.failed === 0) {
      console.log('\n✅ All migrations completed successfully!');
    } else {
      console.log('\n⚠️  Some migrations failed. Check the logs above for details.');
    }
    
  } catch (error) {
    console.error('❌ Migration process failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

/**
 * Run a specific migration file
 */
async function runSpecificMigration(migrationFileName, options = {}) {
  const sql = postgres(DATABASE_URL, {
    ssl: 'require'
  });
  
  try {
    await ensureMigrationsTable(sql);
    
    const migrationPath = join(__dirname, '../drizzle/migrations', migrationFileName);
    const result = await runMigrationFile(sql, migrationPath, options);
    
    if (result.skipped) {
      console.log('\n⏭️  Migration was skipped (already applied)');
    } else if (result.dryRun) {
      console.log('\n🔍 DRY RUN complete - No changes were made');
    } else {
      console.log('\n✅ Migration completed successfully!');
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

/**
 * Show migration status
 */
async function showMigrationStatus() {
  const sql = postgres(DATABASE_URL, {
    ssl: 'require'
  });
  
  try {
    await ensureMigrationsTable(sql);
    
    const migrationsDir = join(__dirname, '../drizzle/migrations');
    const files = readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql') && file !== '.gitkeep')
      .sort();
    
    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 Migration Status');
    console.log(`${'='.repeat(60)}\n`);
    
    for (const file of files) {
      const applied = await isMigrationApplied(sql, file);
      const status = applied ? '✅ Applied' : '⏳ Pending';
      const date = applied ? ` (${new Date(applied.executed_at).toLocaleString()})` : '';
      console.log(`${status} - ${file}${date}`);
    }
    
    console.log('');
  } catch (error) {
    console.error('❌ Failed to get migration status:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  dryRun: args.includes('--dry-run') || args.includes('-d'),
  force: args.includes('--force') || args.includes('-f'),
  continueOnError: args.includes('--continue-on-error'),
};

// Remove flags from args
const nonFlagArgs = args.filter(arg => !arg.startsWith('-'));

if (args.includes('--status') || args.includes('-s')) {
  // Show migration status
  showMigrationStatus();
} else if (nonFlagArgs.length === 0) {
  // Default: run the pharmaceutical product count migration
  console.log('No migration specified, running add_pharmaceutical_product_count.sql by default');
  runSpecificMigration('add_pharmaceutical_product_count.sql', options);
} else if (nonFlagArgs[0] === 'all') {
  // Run all migrations
  runAllMigrations(options);
} else {
  // Run specific migration file
  runSpecificMigration(nonFlagArgs[0], options);
}
