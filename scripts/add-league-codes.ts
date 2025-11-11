import { getDb } from '../server/db';
import { leagues } from '../drizzle/schema';
import { isNull } from 'drizzle-orm';

/**
 * Generate a random 6-character alphanumeric league code
 */
function generateLeagueCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

async function addLeagueCodes() {
  const db = await getDb();
  
  // Find all leagues without a code
  const leaguesWithoutCode = await db
    .select()
    .from(leagues)
    .where(isNull(leagues.leagueCode));
  
  console.log(`Found ${leaguesWithoutCode.length} leagues without codes`);
  
  // Update each league with a unique code
  for (const league of leaguesWithoutCode) {
    const code = generateLeagueCode();
    await db
      .update(leagues)
      .set({ leagueCode: code })
      .where(leagues.id.eq(league.id));
    
    console.log(`Updated league ${league.id} (${league.name}) with code: ${code}`);
  }
  
  console.log('Done!');
  process.exit(0);
}

addLeagueCodes().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
