// Manual script to trigger matchup generation
// Run with: node trigger-matchups.js

async function triggerMatchups() {
  console.log('🎲 Triggering matchup generation...');
  
  try {
    // Import the service
    const { generateDailyMatchups } = await import('./server/predictionService.js');
    
    // Generate matchups
    await generateDailyMatchups();
    
    console.log('✅ Matchup generation complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

triggerMatchups();
