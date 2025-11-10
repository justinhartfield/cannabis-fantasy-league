import { z } from "zod";
import { router, protectedProcedure } from "./_core/trpc";
import { getDb } from "./db";
import { matchups, teams, leagues } from "../drizzle/schema";
import { eq, and, gte } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { standingsRouter } from "./standingsRouter";

/**
 * Playoff Router
 * 
 * Handles:
 * - Playoff bracket generation
 * - Playoff matchup creation
 * - Bracket progression
 * - Championship determination
 */

interface PlayoffBracket {
  round: number;
  roundName: string;
  matchups: Array<{
    matchupId?: number;
    seed1: number;
    seed2: number;
    team1Id?: number;
    team2Id?: number;
    team1Name?: string;
    team2Name?: string;
    team1Score: number;
    team2Score: number;
    winnerId?: number;
    status: string;
  }>;
}

export const playoffRouter = router({
  /**
   * Generate playoff bracket based on regular season standings
   */
  generatePlayoffBracket: protectedProcedure
    .input(z.object({
      leagueId: z.number(),
      year: z.number(),
      playoffStartWeek: z.number(),
      playoffTeams: z.number().default(6),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      }

      // Check if user is league commissioner
      const league = await db
        .select()
        .from(leagues)
        .where(eq(leagues.id, input.leagueId))
        .limit(1);

      if (league.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'League not found' });
      }

      if (league[0].commissionerUserId !== ctx.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Only commissioner can generate playoff bracket' });
      }

      // Get playoff seeding
      const seeding = await standingsRouter.createCaller({ user: ctx.user } as any)
        .getPlayoffSeeding({ 
          leagueId: input.leagueId, 
          year: input.year,
          playoffTeams: input.playoffTeams 
        });

      const playoffTeams = seeding.filter(s => s.isPlayoffTeam);

      if (playoffTeams.length < 2) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Need at least 2 teams for playoffs' });
      }

      // Determine playoff format based on number of teams
      let bracket: PlayoffBracket[];
      let currentWeek = input.playoffStartWeek;

      if (input.playoffTeams === 4) {
        // 4-team bracket: Semifinals (week 1) → Finals (week 2)
        bracket = [
          {
            round: 1,
            roundName: 'Semifinals',
            matchups: [
              { seed1: 1, seed2: 4, team1Score: 0, team2Score: 0, status: 'scheduled' },
              { seed1: 2, seed2: 3, team1Score: 0, team2Score: 0, status: 'scheduled' },
            ],
          },
          {
            round: 2,
            roundName: 'Championship',
            matchups: [
              { seed1: 0, seed2: 0, team1Score: 0, team2Score: 0, status: 'pending' },
            ],
          },
        ];
      } else if (input.playoffTeams === 6) {
        // 6-team bracket: First Round (week 1, seeds 3-6) → Semifinals (week 2) → Finals (week 3)
        bracket = [
          {
            round: 1,
            roundName: 'First Round',
            matchups: [
              { seed1: 3, seed2: 6, team1Score: 0, team2Score: 0, status: 'scheduled' },
              { seed1: 4, seed2: 5, team1Score: 0, team2Score: 0, status: 'scheduled' },
            ],
          },
          {
            round: 2,
            roundName: 'Semifinals',
            matchups: [
              { seed1: 1, seed2: 0, team1Score: 0, team2Score: 0, status: 'pending' }, // #1 vs winner of 3/6
              { seed1: 2, seed2: 0, team1Score: 0, team2Score: 0, status: 'pending' }, // #2 vs winner of 4/5
            ],
          },
          {
            round: 3,
            roundName: 'Championship',
            matchups: [
              { seed1: 0, seed2: 0, team1Score: 0, team2Score: 0, status: 'pending' },
            ],
          },
        ];
      } else {
        // Default: single elimination bracket
        const rounds = Math.ceil(Math.log2(input.playoffTeams));
        bracket = [];
        
        for (let round = 1; round <= rounds; round++) {
          const matchupsInRound = Math.pow(2, rounds - round);
          const roundMatchups = [];

          for (let i = 0; i < matchupsInRound; i++) {
            if (round === 1) {
              const seed1 = i * 2 + 1;
              const seed2 = input.playoffTeams - i * 2;
              roundMatchups.push({
                seed1,
                seed2,
                team1Score: 0,
                team2Score: 0,
                status: seed1 <= input.playoffTeams && seed2 <= input.playoffTeams ? 'scheduled' : 'pending',
              });
            } else {
              roundMatchups.push({
                seed1: 0,
                seed2: 0,
                team1Score: 0,
                team2Score: 0,
                status: 'pending',
              });
            }
          }

          bracket.push({
            round,
            roundName: round === rounds ? 'Championship' : 
                      round === rounds - 1 ? 'Semifinals' :
                      `Round ${round}`,
            matchups: roundMatchups,
          });
        }
      }

      // Create actual matchups in database for first round
      const firstRound = bracket[0];
      const matchupsCreated = [];

      for (const matchup of firstRound.matchups) {
        if (matchup.status === 'scheduled' && matchup.seed1 > 0 && matchup.seed2 > 0) {
          const team1 = playoffTeams.find(t => t.playoffSeed === matchup.seed1);
          const team2 = playoffTeams.find(t => t.playoffSeed === matchup.seed2);

          if (team1 && team2) {
            const [created] = await db.insert(matchups).values({
              leagueId: input.leagueId,
              year: input.year,
              week: currentWeek,
              team1Id: team1.teamId,
              team2Id: team2.teamId,
              team1Score: 0,
              team2Score: 0,
              winnerId: null,
              status: 'scheduled',
            });

            matchupsCreated.push({
              matchupId: created.insertId,
              week: currentWeek,
              team1: team1.teamName,
              team2: team2.teamName,
            });
          }
        }
      }

      return {
        success: true,
        bracket,
        matchupsCreated,
        message: `Generated playoff bracket with ${matchupsCreated.length} first-round matchups`,
      };
    }),

  /**
   * Get current playoff bracket
   */
  getPlayoffBracket: protectedProcedure
    .input(z.object({
      leagueId: z.number(),
      year: z.number(),
      playoffStartWeek: z.number(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      }

      // Get all playoff matchups (from playoffStartWeek onwards)
      const playoffMatchups = await db
        .select()
        .from(matchups)
        .where(and(
          eq(matchups.leagueId, input.leagueId),
          eq(matchups.year, input.year),
          gte(matchups.week, input.playoffStartWeek)
        ));

      // Group by week (round)
      const matchupsByWeek = new Map<number, typeof playoffMatchups>();
      for (const matchup of playoffMatchups) {
        if (!matchupsByWeek.has(matchup.week)) {
          matchupsByWeek.set(matchup.week, []);
        }
        matchupsByWeek.get(matchup.week)!.push(matchup);
      }

      // Build bracket structure
      const bracket: PlayoffBracket[] = [];
      const sortedWeeks = Array.from(matchupsByWeek.keys()).sort((a, b) => a - b);

      for (let i = 0; i < sortedWeeks.length; i++) {
        const week = sortedWeeks[i];
        const weekMatchups = matchupsByWeek.get(week)!;
        const round = i + 1;

        const roundMatchups = await Promise.all(
          weekMatchups.map(async (matchup) => {
            const team1 = await db
              .select()
              .from(teams)
              .where(eq(teams.id, matchup.team1Id))
              .limit(1);

            const team2 = await db
              .select()
              .from(teams)
              .where(eq(teams.id, matchup.team2Id))
              .limit(1);

            return {
              matchupId: matchup.id,
              seed1: 0, // Seeds not stored, would need to calculate
              seed2: 0,
              team1Id: matchup.team1Id,
              team2Id: matchup.team2Id,
              team1Name: team1[0]?.name,
              team2Name: team2[0]?.name,
              team1Score: matchup.team1Score,
              team2Score: matchup.team2Score,
              winnerId: matchup.winnerId,
              status: matchup.status,
            };
          })
        );

        const roundName = 
          i === sortedWeeks.length - 1 ? 'Championship' :
          i === sortedWeeks.length - 2 ? 'Semifinals' :
          roundMatchups.length === 2 && i === 0 ? 'First Round' :
          `Round ${round}`;

        bracket.push({
          round,
          roundName,
          matchups: roundMatchups,
        });
      }

      return bracket;
    }),

  /**
   * Advance playoff bracket to next round
   * Creates matchups for the next round based on winners
   */
  advancePlayoffRound: protectedProcedure
    .input(z.object({
      leagueId: z.number(),
      year: z.number(),
      currentWeek: z.number(),
      nextWeek: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      }

      // Check if user is league commissioner
      const league = await db
        .select()
        .from(leagues)
        .where(eq(leagues.id, input.leagueId))
        .limit(1);

      if (league.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'League not found' });
      }

      if (league[0].commissionerUserId !== ctx.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Only commissioner can advance playoff rounds' });
      }

      // Get current round matchups
      const currentRoundMatchups = await db
        .select()
        .from(matchups)
        .where(and(
          eq(matchups.leagueId, input.leagueId),
          eq(matchups.year, input.year),
          eq(matchups.week, input.currentWeek)
        ));

      // Verify all matchups are final
      const allFinal = currentRoundMatchups.every(m => m.status === 'final' && m.winnerId !== null);
      if (!allFinal) {
        throw new TRPCError({ 
          code: 'BAD_REQUEST', 
          message: 'All current round matchups must be finalized before advancing' 
        });
      }

      // Get winners
      const winners = currentRoundMatchups.map(m => m.winnerId!);

      if (winners.length < 2) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Need at least 2 winners to create next round' });
      }

      // Create next round matchups
      const nextRoundMatchups = [];
      for (let i = 0; i < winners.length; i += 2) {
        if (i + 1 < winners.length) {
          nextRoundMatchups.push({
            leagueId: input.leagueId,
            year: input.year,
            week: input.nextWeek,
            team1Id: winners[i],
            team2Id: winners[i + 1],
            team1Score: 0,
            team2Score: 0,
            winnerId: null,
            status: 'scheduled' as const,
          });
        }
      }

      if (nextRoundMatchups.length > 0) {
        await db.insert(matchups).values(nextRoundMatchups);
      }

      return {
        success: true,
        matchupsCreated: nextRoundMatchups.length,
        message: `Created ${nextRoundMatchups.length} matchups for next playoff round`,
      };
    }),

  /**
   * Get playoff summary
   */
  getPlayoffSummary: protectedProcedure
    .input(z.object({
      leagueId: z.number(),
      year: z.number(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      }

      // Get league info
      const league = await db
        .select()
        .from(leagues)
        .where(eq(leagues.id, input.leagueId))
        .limit(1);

      if (league.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'League not found' });
      }

      const playoffStartWeek = league[0].playoffStartWeek;

      // Get all playoff matchups
      const playoffMatchups = await db
        .select()
        .from(matchups)
        .where(and(
          eq(matchups.leagueId, input.leagueId),
          eq(matchups.year, input.year),
          gte(matchups.week, playoffStartWeek)
        ));

      // Find champion (winner of last final matchup)
      const finalMatchups = playoffMatchups
        .filter(m => m.status === 'final')
        .sort((a, b) => b.week - a.week);

      let champion = null;
      let runnerUp = null;

      if (finalMatchups.length > 0) {
        const championshipMatchup = finalMatchups[0];
        if (championshipMatchup.winnerId) {
          const championTeam = await db
            .select()
            .from(teams)
            .where(eq(teams.id, championshipMatchup.winnerId))
            .limit(1);

          const runnerUpId = championshipMatchup.winnerId === championshipMatchup.team1Id 
            ? championshipMatchup.team2Id 
            : championshipMatchup.team1Id;

          const runnerUpTeam = await db
            .select()
            .from(teams)
            .where(eq(teams.id, runnerUpId))
            .limit(1);

          champion = championTeam[0];
          runnerUp = runnerUpTeam[0];
        }
      }

      // Count rounds
      const rounds = new Set(playoffMatchups.map(m => m.week)).size;
      const totalMatchups = playoffMatchups.length;
      const completedMatchups = playoffMatchups.filter(m => m.status === 'final').length;

      return {
        playoffStartWeek,
        rounds,
        totalMatchups,
        completedMatchups,
        isComplete: completedMatchups === totalMatchups && totalMatchups > 0,
        champion,
        runnerUp,
      };
    }),
});
