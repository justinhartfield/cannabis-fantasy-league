/**
 * Weekly Stats Sync Script
 * 
 * Populates weekly stats tables from current Metabase data.
 * This creates a snapshot of the current week's performance metrics.
 */

import { getDb } from '../server/db';
import { 
  manufacturers,
  cannabisStrains,
  strains,
  pharmacies,
  manufacturerWeeklyStats,
  cannabisStrainWeeklyStats,
  strainWeeklyStats,
  pharmacyWeeklyStats
} from '../drizzle/schema';
import { eq } from 'drizzle-orm';

// Get current year and week
function getCurrentYearWeek(): { year: number; week: number } {
  const now = new Date();
  const year = now.getFullYear();
  
  // Calculate ISO week number
  const firstDayOfYear = new Date(year, 0, 1);
  const pastDaysOfYear = (now.getTime() - firstDayOfYear.getTime()) / 86400000;
  const week = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  
  return { year, week };
}

async function syncWeeklyStats() {
  console.log('🚀 Starting weekly stats sync...\n');

  const db = await getDb();
  if (!db) {
    console.error('❌ Database connection failed');
    process.exit(1);
  }

  const { year, week } = getCurrentYearWeek();
  console.log(`📅 Syncing stats for ${year}-W${week}\n`);

  try {
    // 1. Sync Manufacturer Weekly Stats
    console.log('📦 Syncing manufacturer weekly stats...');
    const manufacturerData = await db.select().from(manufacturers);
    
    let mfgCount = 0;
    for (const mfg of manufacturerData) {
      // Calculate rank based on product count (simple ranking for now)
      const allMfgs = await db.select().from(manufacturers);
      const sorted = allMfgs.sort((a, b) => (b.productCount || 0) - (a.productCount || 0));
      const rank = sorted.findIndex(m => m.id === mfg.id) + 1;
      
      await db.insert(manufacturerWeeklyStats).values({
        manufacturerId: mfg.id,
        year,
        week,
        salesVolumeGrams: (mfg.productCount || 0) * 1000, // Estimate: 1000g per product
        growthRatePercent: 0, // No previous week to compare
        marketShareRank: rank,
        rankChange: 0, // No previous week to compare
        productCount: mfg.productCount || 0,
        totalPoints: 0, // Will be calculated by scoring engine
      }).onConflictDoNothing();
      
      mfgCount++;
    }
    console.log(`✅ Synced ${mfgCount} manufacturer weekly stats\n`);

    // 2. Sync Cannabis Strain Weekly Stats
    console.log('🌿 Syncing cannabis strain weekly stats...');
    const cannabisStrainData = await db.select().from(cannabisStrains);
    
    let cstrCount = 0;
    for (const strain of cannabisStrainData) {
      // Get products for this strain to calculate stats
      const products = await db.select()
        .from(strains)
        .where(eq(strains.name, strain.name));
      
      const totalFavorites = products.reduce((sum, p) => sum + (p.favoriteCount || 0), 0);
      const avgPrice = products.length > 0 
        ? products.reduce((sum, p) => sum + (p.avgPriceCents || 0), 0) / products.length
        : 0;
      
      await db.insert(cannabisStrainWeeklyStats).values({
        cannabisStrainId: strain.id,
        year,
        week,
        totalFavorites,
        pharmacyCount: products.reduce((sum, p) => sum + (p.pharmacyCount || 0), 0),
        productCount: products.length,
        avgPriceCents: Math.round(avgPrice),
        priceChange: 0, // No previous week to compare
        marketPenetration: 0, // Would need market data
        totalPoints: 0, // Will be calculated by scoring engine
      }).onConflictDoNothing();
      
      cstrCount++;
    }
    console.log(`✅ Synced ${cstrCount} cannabis strain weekly stats\n`);

    // 3. Sync Strain (Product) Weekly Stats
    console.log('💊 Syncing product weekly stats...');
    const strainData = await db.select().from(strains);
    
    let strainCount = 0;
    for (const strain of strainData) {
      await db.insert(strainWeeklyStats).values({
        strainId: strain.id,
        year,
        week,
        favoriteCount: strain.favoriteCount || 0,
        favoriteGrowth: 0, // No previous week to compare
        pharmacyCount: strain.pharmacyCount || 0,
        pharmacyExpansion: 0, // No previous week to compare
        avgPriceCents: strain.avgPriceCents || 0,
        priceStability: 100, // Assume stable for first week
        orderVolumeGrams: (strain.favoriteCount || 0) * 5, // Estimate: 5g per favorite
        totalPoints: 0, // Will be calculated by scoring engine
      }).onConflictDoNothing();
      
      strainCount++;
    }
    console.log(`✅ Synced ${strainCount} product weekly stats\n`);

    // 4. Sync Pharmacy Weekly Stats
    console.log('🏥 Syncing pharmacy weekly stats...');
    const pharmacyData = await db.select().from(pharmacies);
    
    let pharmCount = 0;
    for (const pharmacy of pharmacyData) {
      await db.insert(pharmacyWeeklyStats).values({
        pharmacyId: pharmacy.id,
        year,
        week,
        revenueCents: pharmacy.weeklyRevenueCents || 0,
        orderCount: pharmacy.weeklyOrderCount || 0,
        avgOrderSizeGrams: pharmacy.avgOrderSizeGrams || 0,
        customerRetentionRate: pharmacy.customerRetentionRate || 0,
        productVariety: pharmacy.productCount || 0,
        appUsageRate: pharmacy.appUsageRate || 0,
        growthRatePercent: 0, // No previous week to compare
        totalPoints: 0, // Will be calculated by scoring engine
      }).onConflictDoNothing();
      
      pharmCount++;
    }
    console.log(`✅ Synced ${pharmCount} pharmacy weekly stats\n`);

    console.log('🎉 Weekly stats sync complete!');
    console.log(`📊 Summary:`);
    console.log(`   - ${mfgCount} manufacturers`);
    console.log(`   - ${cstrCount} cannabis strains`);
    console.log(`   - ${strainCount} products`);
    console.log(`   - ${pharmCount} pharmacies`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Weekly stats sync failed:', error);
    process.exit(1);
  }
}

syncWeeklyStats();
