import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const METABASE_URL = process.env.METABASE_URL || 'https://bi.weed.de';
const METABASE_API_KEY = process.env.METABASE_API_KEY || '';

async function testBrands() {
  try {
    console.log('Fetching brands from Metabase...');
    const response = await axios.post(
      `${METABASE_URL}/api/dataset`,
      {
        'source-table': 36, // BRAND table
        limit: 5
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': METABASE_API_KEY,
        },
        timeout: 60000
      }
    );

    console.log('\nColumn names:');
    response.data.data.cols.forEach((col, idx) => {
      console.log(`  [${idx}] ${col.name} (${col.display_name})`);
    });

    console.log('\nFirst 3 brand rows:');
    response.data.data.rows.slice(0, 3).forEach((row, idx) => {
      console.log(`\nBrand ${idx + 1}:`);
      response.data.data.cols.forEach((col, colIdx) => {
        console.log(`  ${col.display_name}: ${row[colIdx]}`);
      });
    });

    console.log(`\nTotal brands: ${response.data.data.rows.length}`);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testBrands();
