/**
 * Check the actual PostgreSQL column types for cannabisStrains table
 */

import pg from 'pg';
const { Pool } = pg;

async function checkColumnTypes() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Checking cannabisStrains table column types...\n');
    
    const result = await pool.query(`
      SELECT 
        column_name, 
        data_type, 
        udt_name,
        is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'cannabisStrains' 
      AND column_name IN ('effects', 'flavors', 'terpenes')
      ORDER BY ordinal_position
    `);
    
    console.log('JSON Columns:');
    console.table(result.rows);
    
    // Also check if there's any existing data
    const dataCheck = await pool.query(`
      SELECT effects, flavors, terpenes 
      FROM "cannabisStrains" 
      LIMIT 1
    `);
    
    if (dataCheck.rows.length > 0) {
      console.log('\nSample data:');
      console.log('effects type:', typeof dataCheck.rows[0].effects);
      console.log('effects value:', dataCheck.rows[0].effects);
      console.log('flavors type:', typeof dataCheck.rows[0].flavors);
      console.log('flavors value:', dataCheck.rows[0].flavors);
    } else {
      console.log('\nNo data in cannabisStrains table yet.');
    }
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
    process.exit(1);
  }
}

checkColumnTypes();
