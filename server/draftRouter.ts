import { z } from "zod";
import { eq, and, notInArray, inArray, sql } from "drizzle-orm";
import { protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { 
  manufacturers, 
  cannabisStrains, 
  strains, 
  pharmacies, 
  brands, 
  rosters, 
  leagues, 
  teams, 
  draftPicks,
  manufacturerWeeklyStats,
  cannabisStrainWeeklyStats,
  strainWeeklyStats,
  pharmacyWeeklyStats,
  brandWeeklyStats,
} from "../drizzle/schema";
import {
  manufacturerDailyChallengeStats,
  strainDailyChallengeStats,
  productDailyChallengeStats,
  pharmacyDailyChallengeStats,
  brandDailyChallengeStats,
} from "../drizzle/dailyChallengeSchema";
import { wsManager } from "./websocket";
import { validateDraftPick, advanceDraftPick, calculateNextPick, getDraftStatus, checkAndCompleteDraft } from "./draftLogic";
import { draftTimerManager } from "./draftTimer";

/**
 * Helper function to get yesterday's and today's dates in YYYY-MM-DD format
 */
function getDraftDates() {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  return {
    yesterday: formatDate(yesterday),
    today: formatDate(today),
  };
}

/**
 * Helper function to fetch daily challenge scores for an entity
 */
async function getDailyScores(
  db: any,
  table: any,
  idField: string,
  entityId: number
): Promise<{ yesterday: number; today: number }> {
  const dates = getDraftDates();
  
  const [yesterdayStats, todayStats] = await Promise.all([
    db.select().from(table).where(
      and(
        eq(table[idField], entityId),
        eq(table.statDate, dates.yesterday)
      )
    ).limit(1),
    db.select().from(table).where(
      and(
        eq(table[idField], entityId),
        eq(table.statDate, dates.today)
      )
    ).limit(1),
  ]);
  
  return {
    yesterday: yesterdayStats[0]?.totalPoints || 0,
    today: todayStats[0]?.totalPoints || 0,
  };
}

/**
 * Helper function to parse JSON or comma-separated string into array
 */
function parseJsonOrArray(value: string | null | undefined): string[] {
  if (!value) return [];
  
  // If it's already an array (shouldn't happen but safe check)
  if (Array.isArray(value)) return value;
  
  // Try to parse as JSON first
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed;
    // If it's a single value, wrap it in array
    return [String(parsed)];
  } catch {
    // If JSON parse fails, try comma-separated
    if (typeof value === 'string' && value.includes(',')) {
      return value.split(',').map(s => s.trim()).filter(s => s.length > 0);
    }
    // Single value
    return value ? [value] : [];
  }
}

/**
 * Draft Router
 * 
 * Handles draft operations:
 * - Get available players by category
 * - Make draft pick
 * - Get draft status
 */
export const draftRouter = router({
  /**
   * Get available manufacturers for drafting
   */
  getAvailableManufacturers: protectedProcedure
    .input(
      z.object({
        leagueId: z.number(),
        search: z.string().optional(),
        limit: z.number().default(200),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get all team IDs in the league
      const leagueTeams = await db
        .select({ teamId: teams.id })
        .from(teams)
        .where(eq(teams.leagueId, input.leagueId));

      const teamIds = leagueTeams.map((t) => t.teamId);

      // Get already drafted manufacturers
      const draftedManufacturers = teamIds.length > 0
        ? await db
            .select({ assetId: rosters.assetId })
            .from(rosters)
            .where(
              and(
                inArray(rosters.teamId, teamIds),
                eq(rosters.assetType, "manufacturer")
              )
            )
        : [];

      const draftedIds = draftedManufacturers.map((r) => r.assetId);

      // Get available manufacturers
      let query = db.select().from(manufacturers);

      if (draftedIds.length > 0) {
        query = query.where(notInArray(manufacturers.id, draftedIds)) as any;
      }

      if (input.search) {
        query = query.where(sql`${manufacturers.name} LIKE ${`%${input.search}%`}`) as any;
      }

      const available = await query.limit(input.limit);

      // Fetch daily scores for each manufacturer
      const withScores = await Promise.all(
        available.map(async (mfg) => {
          const dailyScores = await getDailyScores(
            db,
            manufacturerDailyChallengeStats,
            'manufacturerId',
            mfg.id
          );
          return {
            id: mfg.id,
            name: mfg.name,
            logoUrl: mfg.logoUrl,
            productCount: mfg.productCount || 0,
            yesterdayPoints: dailyScores.yesterday,
            todayPoints: dailyScores.today,
          };
        })
      );

      return withScores;
    }),

  /**
   * Get available cannabis strains for drafting
   */
  getAvailableCannabisStrains: protectedProcedure
    .input(
      z.object({
        leagueId: z.number(),
        search: z.string().optional(),
        limit: z.number().default(200),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get all team IDs in the league
      const leagueTeams = await db
        .select({ teamId: teams.id })
        .from(teams)
        .where(eq(teams.leagueId, input.leagueId));

      const teamIds = leagueTeams.map((t) => t.teamId);

      // Get already drafted cannabis strains
      const draftedStrains = teamIds.length > 0
        ? await db
            .select({ assetId: rosters.assetId })
            .from(rosters)
            .where(
              and(
                inArray(rosters.teamId, teamIds),
                eq(rosters.assetType, "cannabis_strain")
              )
            )
        : [];

      const draftedIds = draftedStrains.map((r) => r.assetId);

      // Get available cannabis strains
      let query = db.select().from(cannabisStrains);

      if (draftedIds.length > 0) {
        query = query.where(notInArray(cannabisStrains.id, draftedIds)) as any;
      }

      if (input.search) {
        query = query.where(sql`${cannabisStrains.name} LIKE ${`%${input.search}%`}`) as any;
      }

      const available = await query.limit(input.limit);

      // Fetch daily scores for each cannabis strain
      const withScores = await Promise.all(
        available.map(async (strain) => {
          const dailyScores = await getDailyScores(
            db,
            strainDailyChallengeStats,
            'strainId',
            strain.id
          );
          return {
            id: strain.id,
            name: strain.name,
            type: strain.type || "Unknown",
            effects: parseJsonOrArray(strain.effects),
            flavors: parseJsonOrArray(strain.flavors),
            imageUrl: strain.imageUrl,
            yesterdayPoints: dailyScores.yesterday,
            todayPoints: dailyScores.today,
          };
        })
      );

      return withScores;
    }),

  /**
   * Get available products for drafting
   */
  getAvailableProducts: protectedProcedure
    .input(
      z.object({
        leagueId: z.number(),
        search: z.string().optional(),
        limit: z.number().default(200),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get all team IDs in the league
      const leagueTeams = await db
        .select({ teamId: teams.id })
        .from(teams)
        .where(eq(teams.leagueId, input.leagueId));

      const teamIds = leagueTeams.map((t) => t.teamId);

      // Get already drafted products
      const draftedProducts = teamIds.length > 0
        ? await db
            .select({ assetId: rosters.assetId })
            .from(rosters)
            .where(
              and(
                inArray(rosters.teamId, teamIds),
                eq(rosters.assetType, "product")
              )
            )
        : [];

      const draftedIds = draftedProducts.map((r) => r.assetId);

      // Get available products
      let query = db.select().from(strains);

      if (draftedIds.length > 0) {
        query = query.where(notInArray(strains.id, draftedIds)) as any;
      }

      if (input.search) {
        query = query.where(sql`${strains.name} LIKE ${`%${input.search}%`}`) as any;
      }

      const available = await query.limit(input.limit);

      // Fetch daily scores for each product
      const withScores = await Promise.all(
        available.map(async (product) => {
          const dailyScores = await getDailyScores(
            db,
            productDailyChallengeStats,
            'productId',
            product.id
          );
          return {
            id: product.id,
            name: product.name,
            manufacturer: product.manufacturer || "Unknown",
            thcContent: product.thcContent || 0,
            cbdContent: product.cbdContent || 0,
            favoriteCount: product.favoriteCount || 0,
            yesterdayPoints: dailyScores.yesterday,
            todayPoints: dailyScores.today,
          };
        })
      );

      return withScores;
    }),

  /**
   * Get available pharmacies for drafting
   */
  getAvailablePharmacies: protectedProcedure
    .input(
      z.object({
        leagueId: z.number(),
        search: z.string().optional(),
        limit: z.number().default(200),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get all team IDs in the league
      const leagueTeams = await db
        .select({ teamId: teams.id })
        .from(teams)
        .where(eq(teams.leagueId, input.leagueId));

      const teamIds = leagueTeams.map((t) => t.teamId);

      // Get already drafted pharmacies
      const draftedPharmacies = teamIds.length > 0
        ? await db
            .select({ assetId: rosters.assetId })
            .from(rosters)
            .where(
              and(
                inArray(rosters.teamId, teamIds),
                eq(rosters.assetType, "pharmacy")
              )
            )
        : [];

      const draftedIds = draftedPharmacies.map((r) => r.assetId);

      // Get available pharmacies
      let query = db.select().from(pharmacies);

      if (draftedIds.length > 0) {
        query = query.where(notInArray(pharmacies.id, draftedIds)) as any;
      }

      if (input.search) {
        query = query.where(sql`${pharmacies.name} LIKE ${`%${input.search}%`}`) as any;
      }

      const available = await query.limit(input.limit);

      // Fetch daily scores for each pharmacy
      const withScores = await Promise.all(
        available.map(async (phm) => {
          const dailyScores = await getDailyScores(
            db,
            pharmacyDailyChallengeStats,
            'pharmacyId',
            phm.id
          );
          return {
            id: phm.id,
            name: phm.name,
            city: phm.city || "Unknown",
            yesterdayPoints: dailyScores.yesterday,
            todayPoints: dailyScores.today,
          };
        })
      );

      return withScores;
    }),

  /**
   * Get available brands for drafting
   */
  getAvailableBrands: protectedProcedure
    .input(
      z.object({
        leagueId: z.number(),
        search: z.string().optional(),
        limit: z.number().default(200),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get all team IDs in the league
      const leagueTeams = await db
        .select({ teamId: teams.id })
        .from(teams)
        .where(eq(teams.leagueId, input.leagueId));

      const teamIds = leagueTeams.map((t) => t.teamId);

      // Get already drafted brands
      const draftedBrands = teamIds.length > 0
        ? await db
            .select({ assetId: rosters.assetId })
            .from(rosters)
            .where(
              and(
                inArray(rosters.teamId, teamIds),
                eq(rosters.assetType, "brand")
              )
            )
        : [];

      const draftedIds = draftedBrands.map((r) => r.assetId);

      // Get available brands
      let query = db.select().from(brands);

      if (draftedIds.length > 0) {
        query = query.where(notInArray(brands.id, draftedIds)) as any;
      }

      if (input.search) {
        query = query.where(sql`${brands.name} LIKE ${`%${input.search}%`}`) as any;
      }

      const available = await query.limit(input.limit);

      // Fetch daily scores for each brand
      const withScores = await Promise.all(
        available.map(async (brand) => {
          const dailyScores = await getDailyScores(
            db,
            brandDailyChallengeStats,
            'brandId',
            brand.id
          );
          return {
            id: brand.id,
            name: brand.name,
            totalFavorites: brand.totalFavorites || 0,
            totalViews: brand.totalViews || 0,
            yesterdayPoints: dailyScores.yesterday,
            todayPoints: dailyScores.today,
          };
        })
      );

      return withScores;
    }),

  /**
   * Make a draft pick
   */
  makeDraftPick: protectedProcedure
    .input(
      z.object({
        leagueId: z.number(),
        teamId: z.number(),
        assetType: z.enum(["manufacturer", "cannabis_strain", "product", "pharmacy", "brand"]),
        assetId: z.number(),
        draftRound: z.number().optional(),
        draftPick: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Check if draft should be complete (handles stuck drafts)
      const wasCompleted = await checkAndCompleteDraft(input.leagueId);
      if (wasCompleted) {
        // Draft just completed, notify clients
        wsManager.notifyDraftComplete(input.leagueId);
        throw new Error("Draft is complete");
      }

      // Validate the draft pick
      const validation = await validateDraftPick(
        input.leagueId,
        input.teamId,
        input.assetType,
        input.assetId
      );

      if (!validation.valid) {
        // Check again if draft should be complete before throwing error
        const nowCompleted = await checkAndCompleteDraft(input.leagueId);
        if (nowCompleted) {
          wsManager.notifyDraftComplete(input.leagueId);
          throw new Error("Draft is complete");
        }
        throw new Error(validation.error || "Invalid draft pick");
      }

      // Calculate draft round and pick if not provided
      const currentRosterSize = await db
        .select()
        .from(rosters)
        .where(eq(rosters.teamId, input.teamId));
      
      const draftRound = input.draftRound || Math.floor(currentRosterSize.length / 9) + 1;
      const draftPick = input.draftPick || currentRosterSize.length + 1;

      // Get team and asset details for WebSocket notification
      const [team] = await db
        .select()
        .from(teams)
        .where(eq(teams.id, input.teamId))
        .limit(1);

      let assetName = "Unknown";
      if (input.assetType === "manufacturer") {
        const [mfg] = await db.select().from(manufacturers).where(eq(manufacturers.id, input.assetId)).limit(1);
        assetName = mfg?.name || "Unknown";
      } else if (input.assetType === "cannabis_strain") {
        const [strain] = await db.select().from(cannabisStrains).where(eq(cannabisStrains.id, input.assetId)).limit(1);
        assetName = strain?.name || "Unknown";
      } else if (input.assetType === "product") {
        const [product] = await db.select().from(strains).where(eq(strains.id, input.assetId)).limit(1);
        assetName = product?.name || "Unknown";
      } else if (input.assetType === "pharmacy") {
        const [pharmacy] = await db.select().from(pharmacies).where(eq(pharmacies.id, input.assetId)).limit(1);
        assetName = pharmacy?.name || "Unknown";
      }

      // Add to roster
      await db.insert(rosters).values({
        teamId: input.teamId,
        assetType: input.assetType,
        assetId: input.assetId,
        acquiredWeek: 0, // Draft is week 0
        acquiredVia: "draft",
      });

      // Notify all clients in the draft room
      wsManager.notifyPlayerPicked(input.leagueId, {
        teamId: input.teamId,
        teamName: team?.name || "Unknown Team",
        assetType: input.assetType,
        assetId: input.assetId,
        assetName,
        pickNumber: draftPick,
      });

      // Record draft pick in draftPicks table
      const draftStatus = await getDraftStatus(input.leagueId);
      await db.insert(draftPicks).values({
        leagueId: input.leagueId,
        teamId: input.teamId,
        round: draftStatus.currentRound,
        pickNumber: draftStatus.currentPick,
        assetType: input.assetType,
        assetId: input.assetId,
      });

      // Advance to next pick
      await advanceDraftPick(input.leagueId);

      // Stop current timer
      draftTimerManager.stopTimer(input.leagueId);

      // Check if draft is now complete
      const isDraftComplete = await checkAndCompleteDraft(input.leagueId);

      if (isDraftComplete) {
        // Stop timer
        draftTimerManager.stopTimer(input.leagueId);

        // Notify all clients
        wsManager.notifyDraftComplete(input.leagueId);

        console.log(`[DraftRouter] Draft complete for league ${input.leagueId}`);
      } else {
        // Calculate and notify next pick
        const nextPickInfo = await calculateNextPick(input.leagueId).catch(() => null);
        if (nextPickInfo) {
          wsManager.notifyNextPick(input.leagueId, {
            teamId: nextPickInfo.teamId,
            teamName: nextPickInfo.teamName,
            pickNumber: nextPickInfo.pickNumber,
            round: nextPickInfo.round,
          });

          // Start timer for next pick
          await draftTimerManager.startTimer(input.leagueId);
        }
      }

      return { success: true, assetName };
    }),

  /**
   * Start the draft (Commissioner only)
   */
  startDraft: protectedProcedure
    .input(
      z.object({
        leagueId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get league
      const [league] = await db
        .select()
        .from(leagues)
        .where(eq(leagues.id, input.leagueId))
        .limit(1);

      if (!league) {
        throw new Error("League not found");
      }

      // Verify user is commissioner
      if (league.commissionerUserId !== ctx.user.id) {
        throw new Error("Only the commissioner can start the draft");
      }

      // Check if draft already started
      if (league.draftStarted) {
        throw new Error("Draft has already started");
      }

      // Get all teams in league
      const leagueTeams = await db
        .select()
        .from(teams)
        .where(eq(teams.leagueId, input.leagueId));

      if (leagueTeams.length < 2) {
        throw new Error("Need at least 2 teams to start draft");
      }

      // Update league status
      await db
        .update(leagues)
        .set({
          draftStarted: 1,
          currentDraftPick: 1,
          currentDraftRound: 1,
          // Status remains "draft" during drafting
        })
        .where(eq(leagues.id, input.leagueId));

      // Notify all clients
      wsManager.broadcastToDraftRoom(input.leagueId, {
        type: "draft_started",
        timestamp: Date.now(),
      });

      // Start timer for first pick
      await draftTimerManager.startTimer(input.leagueId);

      // Calculate and notify first pick
      const firstPick = await calculateNextPick(input.leagueId);
      wsManager.notifyNextPick(input.leagueId, {
        teamId: firstPick.teamId,
        teamName: firstPick.teamName,
        pickNumber: firstPick.pickNumber,
        round: firstPick.round,
      });

      return { success: true, teamCount: leagueTeams.length };
    }),

  /**
   * Get current draft status
   */
  getDraftStatus: protectedProcedure
    .input(z.object({ leagueId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const status = await getDraftStatus(input.leagueId);
      const nextPick = await calculateNextPick(input.leagueId).catch(() => null);

      return {
        ...status,
        nextPick,
      };
    }),

  /**
   * Force check and complete draft if it should be done
   * Useful for fixing stuck drafts
   */
  checkDraftCompletion: protectedProcedure
    .input(z.object({ leagueId: z.number() }))
    .mutation(async ({ input }) => {
      const wasCompleted = await checkAndCompleteDraft(input.leagueId);
      
      if (wasCompleted) {
        // Notify all clients
        wsManager.notifyDraftComplete(input.leagueId);
        
        return {
          success: true,
          message: "Draft has been marked as complete",
          completed: true,
        };
      }

      return {
        success: true,
        message: "Draft is not yet complete",
        completed: false,
      };
    }),

  /**
   * Get all draft picks with scoring data for live draft board
   */
  getAllDraftPicks: protectedProcedure
    .input(z.object({
      leagueId: z.number(),
      year: z.number(),
      week: z.number(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Fetch all draft picks for this league
      const picks = await db
        .select()
        .from(draftPicks)
        .where(eq(draftPicks.leagueId, input.leagueId))
        .orderBy(draftPicks.pickNumber);

      // Get team names
      const teamMap = new Map<number, string>();
      const leagueTeams = await db
        .select()
        .from(teams)
        .where(eq(teams.leagueId, input.leagueId));
      leagueTeams.forEach(t => teamMap.set(t.id, t.name));

      // Process each pick to get asset name and stats
      const enrichedPicks = await Promise.all(picks.map(async (pick) => {
        let assetName = "Unknown";
        let lastWeekPoints: number | null = null;
        let trendPercent: number | null = null;

        // Fetch asset name and stats based on type
        if (pick.assetType === 'manufacturer') {
          const [asset] = await db.select().from(manufacturers).where(eq(manufacturers.id, pick.assetId)).limit(1);
          assetName = asset?.name || "Unknown";

          // Fetch last week stats
          const [lastWeekStat] = await db
            .select()
            .from(manufacturerWeeklyStats)
            .where(and(
              eq(manufacturerWeeklyStats.manufacturerId, pick.assetId),
              eq(manufacturerWeeklyStats.year, input.year),
              eq(manufacturerWeeklyStats.week, input.week - 1)
            ))
            .limit(1);
          
          if (lastWeekStat) {
            lastWeekPoints = lastWeekStat.totalPoints;

            // Get week-2 for trend
            const [twoWeeksAgo] = await db
              .select()
              .from(manufacturerWeeklyStats)
              .where(and(
                eq(manufacturerWeeklyStats.manufacturerId, pick.assetId),
                eq(manufacturerWeeklyStats.year, input.year),
                eq(manufacturerWeeklyStats.week, input.week - 2)
              ))
              .limit(1);

            if (twoWeeksAgo && twoWeeksAgo.totalPoints > 0) {
              trendPercent = ((lastWeekStat.totalPoints - twoWeeksAgo.totalPoints) / twoWeeksAgo.totalPoints) * 100;
            }
          }
        } else if (pick.assetType === 'cannabis_strain') {
          const [asset] = await db.select().from(cannabisStrains).where(eq(cannabisStrains.id, pick.assetId)).limit(1);
          assetName = asset?.name || "Unknown";

          const [lastWeekStat] = await db
            .select()
            .from(cannabisStrainWeeklyStats)
            .where(and(
              eq(cannabisStrainWeeklyStats.cannabisStrainId, pick.assetId),
              eq(cannabisStrainWeeklyStats.year, input.year),
              eq(cannabisStrainWeeklyStats.week, input.week - 1)
            ))
            .limit(1);

          if (lastWeekStat) {
            lastWeekPoints = lastWeekStat.totalPoints;

            const [twoWeeksAgo] = await db
              .select()
              .from(cannabisStrainWeeklyStats)
              .where(and(
                eq(cannabisStrainWeeklyStats.cannabisStrainId, pick.assetId),
                eq(cannabisStrainWeeklyStats.year, input.year),
                eq(cannabisStrainWeeklyStats.week, input.week - 2)
              ))
              .limit(1);

            if (twoWeeksAgo && twoWeeksAgo.totalPoints > 0) {
              trendPercent = ((lastWeekStat.totalPoints - twoWeeksAgo.totalPoints) / twoWeeksAgo.totalPoints) * 100;
            }
          }
        } else if (pick.assetType === 'product') {
          const [asset] = await db.select().from(strains).where(eq(strains.id, pick.assetId)).limit(1);
          assetName = asset?.name || "Unknown";

          const [lastWeekStat] = await db
            .select()
            .from(strainWeeklyStats)
            .where(and(
              eq(strainWeeklyStats.strainId, pick.assetId),
              eq(strainWeeklyStats.year, input.year),
              eq(strainWeeklyStats.week, input.week - 1)
            ))
            .limit(1);

          if (lastWeekStat) {
            lastWeekPoints = lastWeekStat.totalPoints;

            const [twoWeeksAgo] = await db
              .select()
              .from(strainWeeklyStats)
              .where(and(
                eq(strainWeeklyStats.strainId, pick.assetId),
                eq(strainWeeklyStats.year, input.year),
                eq(strainWeeklyStats.week, input.week - 2)
              ))
              .limit(1);

            if (twoWeeksAgo && twoWeeksAgo.totalPoints > 0) {
              trendPercent = ((lastWeekStat.totalPoints - twoWeeksAgo.totalPoints) / twoWeeksAgo.totalPoints) * 100;
            }
          }
        } else if (pick.assetType === 'pharmacy') {
          const [asset] = await db.select().from(pharmacies).where(eq(pharmacies.id, pick.assetId)).limit(1);
          assetName = asset?.name || "Unknown";

          const [lastWeekStat] = await db
            .select()
            .from(pharmacyWeeklyStats)
            .where(and(
              eq(pharmacyWeeklyStats.pharmacyId, pick.assetId),
              eq(pharmacyWeeklyStats.year, input.year),
              eq(pharmacyWeeklyStats.week, input.week - 1)
            ))
            .limit(1);

          if (lastWeekStat) {
            lastWeekPoints = lastWeekStat.totalPoints;

            const [twoWeeksAgo] = await db
              .select()
              .from(pharmacyWeeklyStats)
              .where(and(
                eq(pharmacyWeeklyStats.pharmacyId, pick.assetId),
                eq(pharmacyWeeklyStats.year, input.year),
                eq(pharmacyWeeklyStats.week, input.week - 2)
              ))
              .limit(1);

            if (twoWeeksAgo && twoWeeksAgo.totalPoints > 0) {
              trendPercent = ((lastWeekStat.totalPoints - twoWeeksAgo.totalPoints) / twoWeeksAgo.totalPoints) * 100;
            }
          }
        } else if (pick.assetType === 'brand') {
          const [asset] = await db.select().from(brands).where(eq(brands.id, pick.assetId)).limit(1);
          assetName = asset?.name || "Unknown";

          const [lastWeekStat] = await db
            .select()
            .from(brandWeeklyStats)
            .where(and(
              eq(brandWeeklyStats.brandId, pick.assetId),
              eq(brandWeeklyStats.year, input.year),
              eq(brandWeeklyStats.week, input.week - 1)
            ))
            .limit(1);

          if (lastWeekStat) {
            lastWeekPoints = lastWeekStat.totalPoints;

            const [twoWeeksAgo] = await db
              .select()
              .from(brandWeeklyStats)
              .where(and(
                eq(brandWeeklyStats.brandId, pick.assetId),
                eq(brandWeeklyStats.year, input.year),
                eq(brandWeeklyStats.week, input.week - 2)
              ))
              .limit(1);

            if (twoWeeksAgo && twoWeeksAgo.totalPoints > 0) {
              trendPercent = ((lastWeekStat.totalPoints - twoWeeksAgo.totalPoints) / twoWeeksAgo.totalPoints) * 100;
            }
          }
        }

        return {
          pickNumber: pick.pickNumber,
          round: pick.round,
          teamId: pick.teamId,
          teamName: teamMap.get(pick.teamId) || "Unknown Team",
          assetType: pick.assetType,
          assetId: pick.assetId,
          assetName,
          lastWeekPoints,
          trendPercent,
          pickTime: pick.pickTime,
        };
      }));

      return enrichedPicks;
    }),
});
