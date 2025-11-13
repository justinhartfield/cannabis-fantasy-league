import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { leagues, teams, weeklyScores } from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

/**
 * Challenge Router
 * 
 * Provides challenge-specific endpoints optimized for daily challenges
 */
export const challengeRouter = router({
  /**
   * Get challenge details with participants
   */
  getChallenge: protectedProcedure
    .input(z.object({ challengeId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get league (challenge)
      const [league] = await db
        .select()
        .from(leagues)
        .where(and(
          eq(leagues.id, input.challengeId),
          eq(leagues.leagueType, 'challenge')
        ))
        .limit(1);

      if (!league) {
        throw new Error("Challenge not found");
      }

      // Get participants (teams)
      const participants = await db
        .select()
        .from(teams)
        .where(eq(teams.leagueId, input.challengeId));

      return {
        ...league,
        participants,
      };
    }),

  /**
   * Get challenge scoreboard with category breakdowns
   */
  getChallengeScoreboard: protectedProcedure
    .input(z.object({
      challengeId: z.number(),
      year: z.number(),
      week: z.number(),
    }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get all team scores for this challenge
      const scores = await db
        .select()
        .from(weeklyScores)
        .where(and(
          eq(weeklyScores.leagueId, input.challengeId),
          eq(weeklyScores.year, input.year),
          eq(weeklyScores.week, input.week)
        ));

      // Join with team names
      const teamsData = await db
        .select()
        .from(teams)
        .where(eq(teams.leagueId, input.challengeId));

      return scores.map((score) => {
        const team = teamsData.find((t) => t.id === score.teamId);
        return {
          teamId: score.teamId,
          teamName: team?.name || "Unknown Team",
          scores: {
            manufacturer: (score.mfg1Points || 0) + (score.mfg2Points || 0),
            strain: (score.cstr1Points || 0) + (score.cstr2Points || 0),
            product: (score.prd1Points || 0) + (score.prd2Points || 0),
            pharmacy: (score.phm1Points || 0) + (score.phm2Points || 0),
            brand: score.brd1Points || 0,
          },
          total: score.totalPoints || 0,
        };
      });
    }),

  /**
   * Get challenge feed (scoring events timeline)
   */
  getChallengeFeed: protectedProcedure
    .input(z.object({
      challengeId: z.number(),
      year: z.number(),
      week: z.number(),
    }))
    .query(async ({ input, ctx }) => {
      // TODO: Implement scoring events tracking in database
      // For now, return empty array
      // In future, track events like:
      // - Asset score updates
      // - Milestone achievements (50pts, 100pts, etc.)
      // - Leader changes
      // - Big plays (assets scoring 10+ points in one update)
      
      return [];
    }),

  /**
   * Get game leaders (top performing assets)
   */
  getGameLeaders: protectedProcedure
    .input(z.object({
      challengeId: z.number(),
      year: z.number(),
      week: z.number(),
      limit: z.number().default(6),
    }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // TODO: Implement asset-level scoring in database
      // For now, return empty array
      // In future, query individual asset scores across both teams
      // and return top performers
      
      return [];
    }),
});

