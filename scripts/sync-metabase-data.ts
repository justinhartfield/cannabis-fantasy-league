/**
 * Metabase Data Sync Script
 * 
 * Imports manufacturers, strains, products, and pharmacies from weed.de Metabase
 * into the PostgreSQL database for the Cannabis Fantasy League.
 */

import { getMetabaseClient } from '../server/lib/metabase';
import { getDb } from '../server/db';
import { manufacturers, cannabisStrains, strains, pharmacies } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

async function syncData() {
  console.log('🚀 Starting Metabase data sync...\n');

  const metabase = getMetabaseClient();
  const db = await getDb();

  if (!db) {
    console.error('❌ Database connection failed');
    process.exit(1);
  }

  try {
    // 1. First fetch products to get manufacturer names and calculate counts
    console.log('💊 Fetching product strains for counting...');
    const strainData = await metabase.fetchStrains();
    
    // Count products per manufacturer and collect unique manufacturers
    const manufacturerStats = new Map<string, {
      productCount: number;
      totalFavorites: number;
    }>();
    
    for (const strain of strainData) {
      const stats = manufacturerStats.get(strain.manufacturer) || { productCount: 0, totalFavorites: 0 };
      stats.productCount++;
      stats.totalFavorites += strain.favorite_count;
      manufacturerStats.set(strain.manufacturer, stats);
    }
    console.log(`📊 Found ${manufacturerStats.size} unique manufacturers from product data\n`);

    // 2. Sync Manufacturers from the actual product data (not BRAND table)
    console.log('📦 Syncing manufacturers from product data...');
    
    let syncedCount = 0;
    for (const [manufacturerName, stats] of manufacturerStats.entries()) {
      // Skip "Unknown" manufacturers
      if (manufacturerName === 'Unknown') continue;
      
      // Check if manufacturer exists
      const existing = await db.select().from(manufacturers).where(eq(manufacturers.name, manufacturerName)).limit(1);
      
      if (existing.length > 0) {
        // Update existing manufacturer
        await db.update(manufacturers)
          .set({
            productCount: stats.productCount,
            // Use total favorites as a proxy for ranking (higher favorites = better rank)
            currentRank: null, // Will be calculated later based on actual stats
            weeklyRank: null,
            monthlyRank: null,
            quarterlyRank: null,
          })
          .where(eq(manufacturers.name, manufacturerName));
      } else {
        // Insert new manufacturer
        await db.insert(manufacturers).values({
          name: manufacturerName,
          currentRank: null,
          weeklyRank: null,
          monthlyRank: null,
          quarterlyRank: null,
          productCount: stats.productCount,
        });
      }
      syncedCount++;
    }
    console.log(`✅ Synced ${syncedCount} manufacturers with product counts\n`);

    // 3. Sync Cannabis Strains (Genetics/Cultivars)
    console.log('🌿 Syncing cannabis strains...');
    const cannabisStrainData = await metabase.fetchCannabisStrains();
    
    for (const strain of cannabisStrainData) {
      await db.insert(cannabisStrains).values({
        metabaseId: strain.metabaseId,
        name: strain.name,
        slug: strain.slug,
        type: strain.type,
        description: strain.description,
        effects: strain.effects,
        flavors: strain.flavors,
        terpenes: strain.terpenes,
        thcMin: strain.thcMin,
        thcMax: strain.thcMax,
        cbdMin: strain.cbdMin,
        cbdMax: strain.cbdMax,
      }).onConflictDoNothing();
    }
    console.log(`✅ Synced ${cannabisStrainData.length} cannabis strains\n`);

    // 4. Sync Strains (Products) - already fetched above
    console.log('💊 Syncing product strains...');
    // strainData already fetched above for counting
    
    for (const strain of strainData) {
      await db.insert(strains).values({
        name: strain.name,
        manufacturerName: strain.manufacturer,
        favoriteCount: strain.favorite_count,
        pharmacyCount: strain.pharmacy_count,
        avgPriceCents: Math.round(strain.avg_price * 100),
        minPriceCents: Math.round(strain.min_price * 100),
        maxPriceCents: Math.round(strain.max_price * 100),
        priceCategory: strain.price_category,
        thcContent: strain.thc_content,
        cbdContent: strain.cbd_content,
      }).onConflictDoNothing();
    }
    console.log(`✅ Synced ${strainData.length} product strains\n`);

    // 5. Sync Pharmacies
    console.log('🏥 Syncing pharmacies...');
    const pharmacyData = await metabase.fetchPharmacies();
    
    for (const pharmacy of pharmacyData) {
      await db.insert(pharmacies).values({
        name: pharmacy.name,
        city: pharmacy.city,
        state: pharmacy.state,
        productCount: pharmacy.product_count,
        weeklyRevenueCents: Math.round(pharmacy.weekly_revenue * 100),
        weeklyOrderCount: pharmacy.weekly_orders,
        avgOrderSizeGrams: Math.round(pharmacy.avg_order_size),
        customerRetentionRate: Math.round(pharmacy.retention_rate * 100),
        appUsageRate: Math.round(pharmacy.app_usage_rate * 100),
      }).onConflictDoNothing();
    }
    console.log(`✅ Synced ${pharmacyData.length} pharmacies\n`);

    console.log('🎉 Data sync complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Sync failed:', error);
    process.exit(1);
  }
}

syncData();
