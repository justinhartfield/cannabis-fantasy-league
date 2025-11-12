/**
 * Webhook-based Scoring Trigger
 * 
 * This script can be called via HTTP webhook from external cron services
 * like cron-job.org, EasyCron, or GitHub Actions
 */

import 'dotenv/config';
import { getDb } from '../server/db.js';
import { leagues } from '../drizzle/schema.js';
import { eq } from 'drizzle-orm';
import { calculateWeeklyScores } from '../server/scoringEngine.js';

// Get current year and week
function getCurrentYearWeek(): { year: number; week: number } {
  const now = new Date();
  const year = now.getFullYear();
  const firstDayOfYear = new Date(year, 0, 1);
  const pastDaysOfYear = (now.getTime() - firstDayOfYear.getTime()) / 86400000;
  const week = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  return { year, week };
}

/**
 * Calculate scores for all active leagues
 */
async function runScoringForAllLeagues(): Promise<void> {
  console.log('🏆 Starting automated scoring...\n');

  const { year, week } = getCurrentYearWeek();
  console.log(`Target week: ${year}-W${week}\n`);

  const db = await getDb();
  if (!db) {
    throw new Error('Database connection failed');
  }

  try {
    // Get all active leagues
    const activeLeagues = await db
      .select()
      .from(leagues)
      .where(eq(leagues.status, 'active'));

    console.log(`Found ${activeLeagues.length} active leagues\n`);

    let successCount = 0;
    let failCount = 0;

    for (const league of activeLeagues) {
      try {
        console.log(`⚡ Calculating scores for league ${league.id} (${league.name})...`);
        await calculateWeeklyScores(league.id, year, week);
        console.log(`✅ Completed scoring for league ${league.id}\n`);
        successCount++;
      } catch (error) {
        console.error(`❌ Error calculating scores for league ${league.id}:`, error);
        failCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 SCORING SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successful: ${successCount} leagues`);
    console.log(`❌ Failed: ${failCount} leagues`);
    console.log(`📅 Week: ${year}-W${week}`);
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Error in scoring process:', error);
    throw error;
  }
}

// Main execution
async function main() {
  try {
    await runScoringForAllLeagues();
    process.exit(0);
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

main();
