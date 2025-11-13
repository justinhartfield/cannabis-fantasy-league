/**
 * Direct Strains Sync Script
 * Directly syncs cannabis strains without relying on exported functions
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { eq, sql } from 'drizzle-orm';

const { Pool } = pg;

// Metabase configuration
const METABASE_URL = process.env.METABASE_URL || 'https://bi.weed.de';
const CANNABIS_STRAIN_TABLE_ID = 16; // Cannabis strains table ID

async function fetchStrainsFromMetabase() {
  console.log('📡 Fetching strains from Metabase...');
  
  const apiKey = process.env.METABASE_API_KEY;
  if (!apiKey) {
    throw new Error('METABASE_API_KEY environment variable not set');
  }

  const response = await fetch(`${METABASE_URL}/api/dataset`, {
    method: 'POST',
    headers: {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      database: 2, // Weed.de Prod DB
      type: 'query',
      query: {
        'source-table': CANNABIS_STRAIN_TABLE_ID,
        limit: 2000,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Metabase API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  const rows = data.data.rows || [];
  console.log(`✅ Fetched ${rows.length} strains from Metabase`);
  
  return rows;
}

function normalizeStrainName(name) {
  if (!name) return name;
  
  // Replace underscores with spaces and capitalize each word
  return name
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

async function syncStrains() {
  console.log('🌿 Starting cannabis strains sync...');
  
  try {
    // Connect to database
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    const db = drizzle(pool);
    
    // Fetch strains from Metabase
    const rows = await fetchStrainsFromMetabase();
    
    let synced = 0;
    let errors = 0;
    
    for (const row of rows) {
      try {
        // Extract THC range from index 44
        let thcMin = null, thcMax = null;
        if (row[44] && typeof row[44] === 'object') {
          thcMin = row[44].rangeLow || null;
          thcMax = row[44].rangeHigh || null;
        }

        // Extract CBD range from index 11
        let cbdMin = null, cbdMax = null;
        if (row[11] && typeof row[11] === 'object') {
          cbdMin = row[11].rangeLow || null;
          cbdMax = row[11].rangeHigh || null;
        }

        // Extract type from index 36 (array of types)
        let strainType = null;
        if (row[36] && Array.isArray(row[36]) && row[36].length > 0) {
          const typeStr = row[36][0].toLowerCase();
          if (typeStr.includes('sativa')) strainType = 'sativa';
          else if (typeStr.includes('indica')) strainType = 'indica';
          else if (typeStr.includes('hybrid')) strainType = 'hybrid';
        }

        // Get pharmaceutical product count
        const pharmaceuticalProductCount = typeof row[29] === 'number' ? row[29] : 0;

        // Convert arrays to JSON strings for PostgreSQL
        const effects = row[24] ? JSON.stringify(row[24]) : null;
        const flavors = row[35] ? JSON.stringify(row[35]) : null;
        const terpenes = row[37] ? JSON.stringify(row[37]) : null;

        const strainData = {
          metabaseId: row[0],
          name: normalizeStrainName(row[1]),
          slug: row[2],
          type: strainType,
          description: null,
          effects,
          flavors,
          terpenes,
          thcMin,
          thcMax,
          cbdMin,
          cbdMax,
          pharmaceuticalProductCount,
        };
        
        // Insert or update using raw SQL
        await db.execute(sql`
          INSERT INTO "cannabisStrains" (
            "metabaseId", name, slug, type, description, effects, flavors, terpenes,
            "thcMin", "thcMax", "cbdMin", "cbdMax", "pharmaceuticalProductCount"
          ) VALUES (
            ${strainData.metabaseId}, ${strainData.name}, ${strainData.slug}, ${strainData.type},
            ${strainData.description}, ${strainData.effects}, ${strainData.flavors}, ${strainData.terpenes},
            ${strainData.thcMin}, ${strainData.thcMax}, ${strainData.cbdMin}, ${strainData.cbdMax},
            ${strainData.pharmaceuticalProductCount}
          )
          ON CONFLICT ("metabaseId") DO UPDATE SET
            name = EXCLUDED.name,
            slug = EXCLUDED.slug,
            type = EXCLUDED.type,
            description = EXCLUDED.description,
            effects = EXCLUDED.effects,
            flavors = EXCLUDED.flavors,
            terpenes = EXCLUDED.terpenes,
            "thcMin" = EXCLUDED."thcMin",
            "thcMax" = EXCLUDED."thcMax",
            "cbdMin" = EXCLUDED."cbdMin",
            "cbdMax" = EXCLUDED."cbdMax",
            "pharmaceuticalProductCount" = EXCLUDED."pharmaceuticalProductCount",
            "updatedAt" = CURRENT_TIMESTAMP
        `);
        
        synced++;
        
        if (synced % 10 === 0) {
          console.log(`  Synced ${synced}/${rows.length} strains...`);
        }
      } catch (error) {
        console.error(`  Error syncing strain ${row[1]}:`, error.message);
        errors++;
      }
    }
    
    console.log(`\n✅ Sync complete!`);
    console.log(`  - Synced: ${synced} strains`);
    console.log(`  - Errors: ${errors}`);
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Strains sync failed:', error);
    process.exit(1);
  }
}

syncStrains();
