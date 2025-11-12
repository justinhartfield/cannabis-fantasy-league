import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

async function checkBrands() {
  try {
    const brands = await sql`SELECT id, name, "totalFavorites", "totalViews" FROM brands ORDER BY name LIMIT 100`;
    console.log(`Total brands found: ${brands.length}`);
    console.log('\nFirst 20 brands:');
    brands.slice(0, 20).forEach(b => {
      console.log(`- ${b.name} (ID: ${b.id}, Favorites: ${b.totalFavorites}, Views: ${b.totalViews})`);
    });
    
    // Check for brands with weird favorites
    const highFavorites = await sql`SELECT name, "totalFavorites" FROM brands WHERE "totalFavorites" > 1000 ORDER BY "totalFavorites" DESC`;
    console.log(`\nBrands with >1000 favorites: ${highFavorites.length}`);
    highFavorites.forEach(b => {
      console.log(`- ${b.name}: ${b.totalFavorites} favorites`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sql.end();
  }
}

checkBrands();
