import { eq, and, asc } from "drizzle-orm";
import { getDb } from "./db";
import { rosters, weeklyLineups, manufacturers, cannabisStrains, strains, pharmacies, brands } from "../drizzle/schema";

/**
 * Auto-populate a team's lineup with their first 10 draft picks
 * 
 * This function:
 * 1. Gets the team's roster ordered by draft order (acquiredWeek ASC, id ASC)
 * 2. Groups players by asset type
 * 3. Assigns them to lineup positions following the roster structure:
 *    - First 2 manufacturers → MFG1, MFG2
 *    - First 2 cannabis_strains → CSTR1, CSTR2
 *    - First 2 products → PRD1, PRD2
 *    - First 2 pharmacies → PHM1, PHM2
 *    - First 1 brand → BRD1
 *    - Remaining player → FLEX
 * 4. Only creates lineup if it doesn't already exist (respects user choices)
 * 5. Handles incomplete rosters gracefully
 * 
 * @param teamId - The team ID
 * @param year - The year
 * @param week - The week number
 * @returns Object with success status and message
 */
export async function autoPopulateTeamLineup(
  teamId: number,
  year: number,
  week: number
): Promise<{ success: boolean; message: string; created: boolean }> {
  const db = await getDb();
  if (!db) {
    return { success: false, message: "Database not available", created: false };
  }

  try {
    // Check if lineup already exists
    const existingLineup = await db
      .select()
      .from(weeklyLineups)
      .where(
        and(
          eq(weeklyLineups.teamId, teamId),
          eq(weeklyLineups.year, year),
          eq(weeklyLineups.week, week)
        )
      )
      .limit(1);

    if (existingLineup.length > 0) {
      // Lineup already exists - don't override user's choices or locked lineups
      return {
        success: true,
        message: `Lineup already exists for team ${teamId}, week ${week}. Skipped.`,
        created: false,
      };
    }

    // Get team's roster ordered by draft order
    const teamRoster = await db
      .select()
      .from(rosters)
      .where(eq(rosters.teamId, teamId))
      .orderBy(asc(rosters.acquiredWeek), asc(rosters.id))
      .limit(10); // Only need first 10 for starting lineup

    if (teamRoster.length === 0) {
      return {
        success: true,
        message: `Team ${teamId} has no roster players. Skipped.`,
        created: false,
      };
    }

    // Group players by asset type
    const manufacturers = teamRoster.filter((r) => r.assetType === "manufacturer");
    const cannabisStrains = teamRoster.filter((r) => r.assetType === "cannabis_strain");
    const products = teamRoster.filter((r) => r.assetType === "product");
    const pharmacies = teamRoster.filter((r) => r.assetType === "pharmacy");
    const brands = teamRoster.filter((r) => r.assetType === "brand");

    // Build lineup object
    const lineupData: any = {
      teamId,
      year,
      week,
      isLocked: 0, // Start unlocked
      mfg1Id: manufacturers[0]?.assetId || null,
      mfg2Id: manufacturers[1]?.assetId || null,
      cstr1Id: cannabisStrains[0]?.assetId || null,
      cstr2Id: cannabisStrains[1]?.assetId || null,
      prd1Id: products[0]?.assetId || null,
      prd2Id: products[1]?.assetId || null,
      phm1Id: pharmacies[0]?.assetId || null,
      phm2Id: pharmacies[1]?.assetId || null,
      brd1Id: brands[0]?.assetId || null,
      flexId: null,
      flexType: null,
    };

    // Determine flex slot
    // Find the first player not yet assigned to a position
    let flexAssigned = false;
    
    // Count how many slots are filled per type
    const mfgCount = manufacturers.length;
    const cstrCount = cannabisStrains.length;
    const prdCount = products.length;
    const phmCount = pharmacies.length;
    const brdCount = brands.length;

    // Flex should be the 10th pick if all required positions are filled
    // Priority: 3rd manufacturer, 3rd cannabis strain, 3rd product, 3rd pharmacy, 2nd brand
    if (mfgCount >= 3 && !flexAssigned) {
      lineupData.flexId = manufacturers[2].assetId;
      lineupData.flexType = "manufacturer";
      flexAssigned = true;
    } else if (cstrCount >= 3 && !flexAssigned) {
      lineupData.flexId = cannabisStrains[2].assetId;
      lineupData.flexType = "cannabis_strain";
      flexAssigned = true;
    } else if (prdCount >= 3 && !flexAssigned) {
      lineupData.flexId = products[2].assetId;
      lineupData.flexType = "product";
      flexAssigned = true;
    } else if (phmCount >= 3 && !flexAssigned) {
      lineupData.flexId = pharmacies[2].assetId;
      lineupData.flexType = "pharmacy";
      flexAssigned = true;
    } else if (brdCount >= 2 && !flexAssigned) {
      lineupData.flexId = brands[1].assetId;
      lineupData.flexType = "brand";
      flexAssigned = true;
    }

    // Create the lineup
    await db.insert(weeklyLineups).values(lineupData);

    const filledSlots = [
      lineupData.mfg1Id,
      lineupData.mfg2Id,
      lineupData.cstr1Id,
      lineupData.cstr2Id,
      lineupData.prd1Id,
      lineupData.prd2Id,
      lineupData.phm1Id,
      lineupData.phm2Id,
      lineupData.brd1Id,
      lineupData.flexId,
    ].filter((id) => id !== null).length;

    return {
      success: true,
      message: `Auto-populated lineup for team ${teamId}, week ${week} with ${filledSlots}/10 slots filled.`,
      created: true,
    };
  } catch (error) {
    console.error(`[autoPopulateTeamLineup] Error for team ${teamId}, week ${week}:`, error);
    return {
      success: false,
      message: `Error auto-populating lineup: ${(error as Error).message}`,
      created: false,
    };
  }
}

/**
 * Auto-populate lineups for all teams in a league for a specific week
 * 
 * @param leagueId - The league ID
 * @param year - The year
 * @param week - The week number
 * @returns Summary of results
 */
export async function autoPopulateLeagueLineups(
  leagueId: number,
  year: number,
  week: number
): Promise<{
  success: boolean;
  totalTeams: number;
  lineupsCreated: number;
  lineupsSkipped: number;
  errors: number;
}> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Get all teams in the league
  const { teams } = await import("../drizzle/schema");
  const leagueTeams = await db
    .select()
    .from(teams)
    .where(eq(teams.leagueId, leagueId));

  let lineupsCreated = 0;
  let lineupsSkipped = 0;
  let errors = 0;

  for (const team of leagueTeams) {
    const result = await autoPopulateTeamLineup(team.id, year, week);
    if (result.success) {
      if (result.created) {
        lineupsCreated++;
      } else {
        lineupsSkipped++;
      }
    } else {
      errors++;
    }
  }

  console.log(
    `[autoPopulateLeagueLineups] League ${leagueId}, Week ${week}: ` +
    `${lineupsCreated} created, ${lineupsSkipped} skipped, ${errors} errors`
  );

  return {
    success: true,
    totalTeams: leagueTeams.length,
    lineupsCreated,
    lineupsSkipped,
    errors,
  };
}

