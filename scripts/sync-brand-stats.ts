/**
 * Sync Brand Weekly Stats
 * 
 * Populates brandWeeklyStats table with current data from Metabase
 * Brands score on marketing metrics: favorites, views, comments, affiliate clicks
 */

import 'dotenv/config';
import { getDb } from '../server/db';
import { brands, brandWeeklyStats } from '../drizzle/schema';
import { eq, and } from 'drizzle-orm';

// Get current ISO week number
function getISOWeek(date: Date = new Date()): { year: number; week: number } {
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  const week = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  return { year: target.getFullYear(), week };
}

async function syncBrandStats() {
  console.log('🔄 Starting brand weekly stats sync...');
  
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  const { year, week } = getISOWeek();
  console.log(`📅 Syncing data for ${year}-W${week}`);

  // Fetch all brands
  const allBrands = await db.select().from(brands);
  console.log(`📊 Found ${allBrands.length} brands to sync`);

  let syncedCount = 0;

  for (const brand of allBrands) {
    // For now, use the base brand data as weekly stats
    // In production, this would fetch actual weekly metrics from Metabase
    
    const weeklyData = {
      brandId: brand.id,
      year,
      week,
      // Use current totals as this week's values
      favorites: brand.totalFavorites,
      favoriteGrowth: 0, // No previous week to compare yet
      views: brand.totalViews,
      viewGrowth: 0,
      comments: brand.totalComments,
      commentGrowth: 0,
      affiliateClicks: brand.affiliateClicks,
      clickGrowth: 0,
      // Calculate engagement rate: (favorites + comments) / views * 100
      engagementRate: brand.totalViews > 0 
        ? ((brand.totalFavorites + brand.totalComments) / brand.totalViews) * 100 
        : 0,
      // Default neutral sentiment
      sentimentScore: 0,
    };

    // Check if stats already exist for this brand/week
    const existing = await db
      .select()
      .from(brandWeeklyStats)
      .where(and(
        eq(brandWeeklyStats.brandId, brand.id),
        eq(brandWeeklyStats.year, year),
        eq(brandWeeklyStats.week, week)
      ))
      .limit(1);

    if (existing.length > 0) {
      // Update existing
      await db
        .update(brandWeeklyStats)
        .set(weeklyData)
        .where(and(
          eq(brandWeeklyStats.brandId, brand.id),
          eq(brandWeeklyStats.year, year),
          eq(brandWeeklyStats.week, week)
        ));
    } else {
      // Insert new
      await db.insert(brandWeeklyStats).values(weeklyData);
    }

    syncedCount++;
  }

  console.log(`✅ Synced ${syncedCount} brand weekly stats for ${year}-W${week}`);
}

// Run the sync
syncBrandStats()
  .then(() => {
    console.log('✅ Brand weekly stats sync complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error syncing brand weekly stats:', error);
    process.exit(1);
  });
