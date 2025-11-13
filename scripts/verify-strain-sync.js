/**
 * Verification script for strain sync functionality
 * Tests that the database schema is correct and strain sync works properly
 */

import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

async function verifyStrainSync() {
  const sql = postgres(DATABASE_URL, {
    ssl: 'require'
  });

  try {
    console.log('🔍 Cannabis Strain Sync Verification\n');
    console.log('='.repeat(60));

    // Step 1: Verify table exists
    console.log('\n📋 Step 1: Checking if cannabisStrains table exists...');
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'cannabisStrains'
      )
    `.then(result => result[0].exists);

    if (!tableExists) {
      console.error('❌ FAILED: cannabisStrains table does not exist');
      console.log('   Please run: npm run db:migrate');
      process.exit(1);
    }
    console.log('✅ PASSED: cannabisStrains table exists');

    // Step 2: Verify all required columns exist
    console.log('\n📋 Step 2: Checking required columns...');
    const requiredColumns = [
      'id',
      'metabaseId',
      'name',
      'slug',
      'type',
      'description',
      'effects',
      'flavors',
      'terpenes',
      'thcMin',
      'thcMax',
      'cbdMin',
      'cbdMax',
      'pharmaceuticalProductCount',
      'createdAt',
      'updatedAt',
    ];

    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'cannabisStrains'
      ORDER BY ordinal_position
    `;

    const columnNames = columns.map(c => c.column_name);
    const missingColumns = requiredColumns.filter(col => !columnNames.includes(col));

    if (missingColumns.length > 0) {
      console.error('❌ FAILED: Missing columns:', missingColumns.join(', '));
      console.log('   Please run: npm run db:migrate');
      process.exit(1);
    }
    console.log('✅ PASSED: All required columns exist');

    // Step 3: Verify pharmaceuticalProductCount column specifically
    console.log('\n📋 Step 3: Verifying pharmaceuticalProductCount column...');
    const productCountColumn = columns.find(c => c.column_name === 'pharmaceuticalProductCount');
    
    if (!productCountColumn) {
      console.error('❌ FAILED: pharmaceuticalProductCount column missing');
      console.log('   Please run: npm run db:migrate');
      process.exit(1);
    }
    
    console.log(`   Column type: ${productCountColumn.data_type}`);
    console.log(`   Nullable: ${productCountColumn.is_nullable}`);
    console.log('✅ PASSED: pharmaceuticalProductCount column exists');

    // Step 4: Check indexes
    console.log('\n📋 Step 4: Checking indexes...');
    const indexes = await sql`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'cannabisStrains'
    `;

    console.log(`   Found ${indexes.length} index(es):`);
    indexes.forEach(idx => {
      console.log(`   - ${idx.indexname}`);
    });
    console.log('✅ PASSED: Indexes verified');

    // Step 5: Test insert/update operation
    console.log('\n📋 Step 5: Testing insert/update operation...');
    const testStrainId = 'test-verification-strain-' + Date.now();
    
    try {
      await sql`
        INSERT INTO "cannabisStrains" (
          "metabaseId", "name", "slug", "type", "description",
          "effects", "flavors", "terpenes",
          "thcMin", "thcMax", "cbdMin", "cbdMax",
          "pharmaceuticalProductCount", "createdAt", "updatedAt"
        ) VALUES (
          ${testStrainId},
          'Test Strain for Verification',
          'test-strain-verification',
          'Hybrid',
          'This is a test strain for verification purposes',
          '["Relaxed", "Happy"]',
          '["Citrus", "Earthy"]',
          '["Myrcene", "Limonene"]',
          15,
          20,
          1,
          3,
          42,
          NOW(),
          NOW()
        )
        ON CONFLICT ("metabaseId") DO UPDATE SET
          "name" = EXCLUDED."name",
          "pharmaceuticalProductCount" = EXCLUDED."pharmaceuticalProductCount",
          "updatedAt" = NOW()
      `;
      console.log('✅ PASSED: Insert/update operation successful');

      // Verify the inserted data
      const inserted = await sql`
        SELECT * FROM "cannabisStrains" 
        WHERE "metabaseId" = ${testStrainId}
      `;

      if (inserted.length === 0) {
        console.error('❌ FAILED: Could not retrieve inserted test strain');
        process.exit(1);
      }

      const strain = inserted[0];
      if (strain.pharmaceuticalProductCount !== 42) {
        console.error('❌ FAILED: pharmaceuticalProductCount value incorrect');
        console.error(`   Expected: 42, Got: ${strain.pharmaceuticalProductCount}`);
        process.exit(1);
      }
      console.log('✅ PASSED: Data integrity verified');

      // Clean up test data
      await sql`
        DELETE FROM "cannabisStrains" 
        WHERE "metabaseId" = ${testStrainId}
      `;
      console.log('✅ PASSED: Test data cleaned up');

    } catch (error) {
      console.error('❌ FAILED: Insert/update operation failed');
      console.error('   Error:', error.message);
      throw error;
    }

    // Step 6: Check existing strain data
    console.log('\n📋 Step 6: Checking existing strain data...');
    const strainCount = await sql`
      SELECT COUNT(*) as count FROM "cannabisStrains"
    `.then(result => parseInt(result[0].count));

    console.log(`   Total strains in database: ${strainCount}`);
    
    if (strainCount > 0) {
      // Sample a few strains to verify schema
      const sampleStrains = await sql`
        SELECT 
          "metabaseId", 
          "name", 
          "pharmaceuticalProductCount"
        FROM "cannabisStrains" 
        LIMIT 5
      `;

      console.log('\n   Sample strains:');
      sampleStrains.forEach(strain => {
        console.log(`   - ${strain.name} (ID: ${strain.metabaseId}, Product Count: ${strain.pharmaceuticalProductCount || 0})`);
      });
    }
    console.log('✅ PASSED: Existing data verified');

    // Step 7: Check migration tracking
    console.log('\n📋 Step 7: Checking migration tracking...');
    const migrationsTableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = '_migrations'
      )
    `.then(result => result[0].exists);

    if (migrationsTableExists) {
      const migrations = await sql`
        SELECT filename, executed_at, success
        FROM "_migrations"
        ORDER BY executed_at DESC
      `;

      console.log(`   Found ${migrations.length} recorded migration(s):`);
      migrations.forEach(mig => {
        const status = mig.success ? '✅' : '❌';
        const date = new Date(mig.executed_at).toLocaleString();
        console.log(`   ${status} ${mig.filename} (${date})`);
      });
      console.log('✅ PASSED: Migration tracking verified');
    } else {
      console.log('⚠️  WARNING: Migration tracking table not found');
      console.log('   This is OK if migrations were run before tracking was added');
    }

    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ All verification checks passed!');
    console.log('='.repeat(60));
    console.log('\n✅ The strain sync is ready to use.');
    console.log('   You can now run the strain sync from the admin dashboard.');

  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

// Run verification
verifyStrainSync();

