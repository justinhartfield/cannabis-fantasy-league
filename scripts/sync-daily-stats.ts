import { getDataSyncServiceV2 } from '../server/services/dataSyncService';

async function main() {
  const [, , dateArg] = process.argv;

  try {
    const service = getDataSyncServiceV2();
    await service.syncDailyStats(dateArg);
    console.log(`✅ Daily stats sync complete for ${dateArg || 'today'}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Daily stats sync failed:', error);
    process.exit(1);
  }
}

main();

