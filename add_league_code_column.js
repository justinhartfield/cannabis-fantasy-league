const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function addLeagueCodeColumn() {
  const client = await pool.connect();
  try {
    console.log('Adding leagueCode column...');
    
    // Add column
    await client.query('ALTER TABLE leagues ADD COLUMN IF NOT EXISTS "leagueCode" VARCHAR(10);');
    console.log('✓ Column added');
    
    // Generate codes for existing leagues
    const leagues = await client.query('SELECT id FROM leagues WHERE "leagueCode" IS NULL;');
    console.log(`Found ${leagues.rows.length} leagues without codes`);
    
    for (const league of leagues.rows) {
      const code = generateCode();
      await client.query('UPDATE leagues SET "leagueCode" = $1 WHERE id = $2;', [code, league.id]);
      console.log(`✓ Generated code ${code} for league ${league.id}`);
    }
    
    // Add unique constraint
    await client.query('CREATE UNIQUE INDEX IF NOT EXISTS leagues_leagueCode_unique ON leagues("leagueCode");');
    console.log('✓ Unique constraint added');
    
    console.log('Migration complete!');
  } catch (err) {
    console.error('Migration failed:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

addLeagueCodeColumn().catch(console.error);
