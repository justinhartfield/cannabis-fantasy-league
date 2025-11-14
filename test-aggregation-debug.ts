/**
 * Debug script to test the aggregation with card 1266
 */

import { getMetabaseClient } from './server/metabase';

async function testAggregation() {
  console.log('Testing aggregation with card 1266...\n');
  
  const metabase = getMetabaseClient();
  const dateString = '2025-11-14';
  
  // Fetch all orders from card 1266
  console.log('Fetching orders from card 1266...');
  const allOrders = await metabase.executeCardQuery(1266);
  console.log(`Total orders from card 1266: ${allOrders.length}\n`);
  
  // Show first order
  if (allOrders.length > 0) {
    console.log('First order sample:');
    console.log(JSON.stringify(allOrders[0], null, 2));
    console.log('\n');
  }
  
  // Filter by date
  const targetDate = new Date(dateString);
  console.log(`Target date: ${targetDate.toISOString()}`);
  console.log(`Target year: ${targetDate.getFullYear()}`);
  console.log(`Target month: ${targetDate.getMonth()}`);
  console.log(`Target day: ${targetDate.getDate()}\n`);
  
  const filtered = allOrders.filter((order: any) => {
    if (!order.OrderDate) return false;
    const orderDate = new Date(order.OrderDate);
    const matches = (
      orderDate.getFullYear() === targetDate.getFullYear() &&
      orderDate.getMonth() === targetDate.getMonth() &&
      orderDate.getDate() === targetDate.getDate()
    );
    
    if (matches) {
      console.log(`Match found: ${order.OrderDate} -> ${orderDate.toISOString()}`);
    }
    
    return matches;
  });
  
  console.log(`\nFiltered orders for ${dateString}: ${filtered.length}`);
  
  if (filtered.length > 0) {
    console.log('\nManufacturers in filtered orders:');
    const manufacturers = new Set();
    filtered.forEach((order: any) => {
      if (order.ProductManufacturer) {
        manufacturers.add(order.ProductManufacturer);
      }
    });
    manufacturers.forEach(mfg => console.log(`  - ${mfg}`));
  }
}

testAggregation().catch(console.error);
