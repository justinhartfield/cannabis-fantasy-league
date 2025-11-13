import { readFileSync, readdirSync } from 'fs';
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
 * Run a single migration file
 */
async function runMigrationFile(sql: ReturnType<typeof postgres>, migrationPath: string): Promise<void> {
  console.log(`\n📄 Reading migration file: ${basename(migrationPath)}`);
  const migrationSQL = readFileSync(migrationPath, 'utf8');
  
  console.log('Running migration...');
  console.log(migrationSQL);
  
  await sql.unsafe(migrationSQL);
  console.log(`✅ Migration ${basename(migrationPath)} completed successfully!`);
}

/**
 * Run all migrations in the migrations directory
 */
async function runAllMigrations() {
  const sql = postgres(DATABASE_URL, {
    ssl: 'require'
  });
  
  try {
    const migrationsDir = join(__dirname, '../drizzle/migrations');
    const files = readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql') && file !== '.gitkeep')
      .sort(); // Run migrations in alphabetical order
    
    if (files.length === 0) {
      console.log('No migration files found');
      return;
    }
    
    console.log(`Found ${files.length} migration file(s)`);
    
    for (const file of files) {
      const migrationPath = join(migrationsDir, file);
      await runMigrationFile(sql, migrationPath);
    }
    
    console.log('\n✅ All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

/**
 * Run a specific migration file
 */
async function runSpecificMigration(migrationFileName: string) {
  const sql = postgres(DATABASE_URL, {
    ssl: 'require'
  });
  
  try {
    const migrationPath = join(__dirname, '../drizzle/migrations', migrationFileName);
    await runMigrationFile(sql, migrationPath);
    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length === 0) {
  // Default: run the pharmaceutical product count migration
  console.log('No migration specified, running add_pharmaceutical_product_count.sql by default');
  runSpecificMigration('add_pharmaceutical_product_count.sql');
} else if (args[0] === '--all' || args[0] === '-a') {
  // Run all migrations
  runAllMigrations();
} else {
  // Run specific migration file
  runSpecificMigration(args[0]);
}
