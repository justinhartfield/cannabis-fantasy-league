import { z } from "zod";
import { router, protectedProcedure } from "./_core/trpc";
import { getDb } from "./db";
import { matchups, teams, weeklyTeamScores } from "../drizzle/schema";
import { eq, and, or, desc, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

/**
 * Standings Router
 * 
 * Handles:
 * - League standings calculation
 * - Win/loss/tie records
 * - Points for/against
 * - Playoff seeding
 * - Tiebreaker logic
 */

interface StandingsRecord {
  teamId: number;
  teamName: string;
  wins: number;
  losses: number;
  ties: number;
  winPercentage: number;
  pointsFor: number;
  pointsAgainst: number;
  pointsDifferential: number;
  rank: number;
  playoffSeed?: number;
  isPlayoffTeam?: boolean;
}

export const standingsRouter = router({
  /**
   * Get current league standings
   */
  getLeagueStandings: protectedProcedure
    .input(z.object({
      leagueId: z.number(),
      year: z.number(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      }

      // Get all teams in the league
      const leagueTeams = await db
        .select()
        .from(teams)
        .where(eq(teams.leagueId, input.leagueId));

      // Calculate standings for each team
      const standings: StandingsRecord[] = await Promise.all(
        leagueTeams.map(async (team) => {
          // Get all matchups for this team
          const teamMatchups = await db
            .select()
            .from(matchups)
            .where(and(
              or(
                eq(matchups.team1Id, team.id),
                eq(matchups.team2Id, team.id)
              ),
              eq(matchups.year, input.year),
              eq(matchups.status, 'final')
            ));

          let wins = 0;
          let losses = 0;
          let ties = 0;
          let pointsFor = 0;
          let pointsAgainst = 0;

          for (const matchup of teamMatchups) {
            const isTeam1 = matchup.team1Id === team.id;
            const teamScore = isTeam1 ? matchup.team1Score : matchup.team2Score;
            const opponentScore = isTeam1 ? matchup.team2Score : matchup.team1Score;

            pointsFor += teamScore;
            pointsAgainst += opponentScore;

            if (matchup.winnerId === team.id) {
              wins++;
            } else if (matchup.winnerId === null) {
              ties++;
            } else {
              losses++;
            }
          }

          const totalGames = wins + losses + ties;
          const winPercentage = totalGames > 0 ? (wins + ties * 0.5) / totalGames : 0;
          const pointsDifferential = pointsFor - pointsAgainst;

          return {
            teamId: team.id,
            teamName: team.name,
            wins,
            losses,
            ties,
            winPercentage,
            pointsFor,
            pointsAgainst,
            pointsDifferential,
            rank: 0, // Will be calculated after sorting
          };
        })
      );

      // Sort by win percentage, then points for (tiebreaker)
      standings.sort((a, b) => {
        if (b.winPercentage !== a.winPercentage) {
          return b.winPercentage - a.winPercentage;
        }
        if (b.pointsFor !== a.pointsFor) {
          return b.pointsFor - a.pointsFor;
        }
        return b.pointsDifferential - a.pointsDifferential;
      });

      // Assign ranks
      standings.forEach((standing, index) => {
        standing.rank = index + 1;
      });

      return standings;
    }),

  /**
   * Get playoff seeding
   */
  getPlayoffSeeding: protectedProcedure
    .input(z.object({
      leagueId: z.number(),
      year: z.number(),
      playoffTeams: z.number().default(6),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      }

      // Get regular season standings
      const standings = await standingsRouter.createCaller({ user: { id: 0 } } as any)
        .getLeagueStandings({ leagueId: input.leagueId, year: input.year });

      // Mark playoff teams
      const playoffStandings = standings.map((standing, index) => ({
        ...standing,
        playoffSeed: index < input.playoffTeams ? index + 1 : undefined,
        isPlayoffTeam: index < input.playoffTeams,
      }));

      return playoffStandings;
    }),

  /**
   * Get team record summary
   */
  getTeamRecord: protectedProcedure
    .input(z.object({
      teamId: z.number(),
      year: z.number(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      }

      // Get team info
      const team = await db
        .select()
        .from(teams)
        .where(eq(teams.id, input.teamId))
        .limit(1);

      if (team.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Team not found' });
      }

      // Get all final matchups
      const teamMatchups = await db
        .select()
        .from(matchups)
        .where(and(
          or(
            eq(matchups.team1Id, input.teamId),
            eq(matchups.team2Id, input.teamId)
          ),
          eq(matchups.year, input.year),
          eq(matchups.status, 'final')
        ));

      let wins = 0;
      let losses = 0;
      let ties = 0;
      let pointsFor = 0;
      let pointsAgainst = 0;
      let currentStreak = 0;
      let streakType: 'W' | 'L' | 'T' | null = null;

      // Sort by week to calculate streak
      teamMatchups.sort((a, b) => a.week - b.week);

      for (const matchup of teamMatchups) {
        const isTeam1 = matchup.team1Id === input.teamId;
        const teamScore = isTeam1 ? matchup.team1Score : matchup.team2Score;
        const opponentScore = isTeam1 ? matchup.team2Score : matchup.team1Score;

        pointsFor += teamScore;
        pointsAgainst += opponentScore;

        let result: 'W' | 'L' | 'T';
        if (matchup.winnerId === input.teamId) {
          wins++;
          result = 'W';
        } else if (matchup.winnerId === null) {
          ties++;
          result = 'T';
        } else {
          losses++;
          result = 'L';
        }

        // Update streak
        if (streakType === result) {
          currentStreak++;
        } else {
          streakType = result;
          currentStreak = 1;
        }
      }

      const totalGames = wins + losses + ties;
      const winPercentage = totalGames > 0 ? (wins + ties * 0.5) / totalGames : 0;
      const pointsDifferential = pointsFor - pointsAgainst;
      const avgPointsFor = totalGames > 0 ? pointsFor / totalGames : 0;
      const avgPointsAgainst = totalGames > 0 ? pointsAgainst / totalGames : 0;

      return {
        teamId: input.teamId,
        teamName: team[0].name,
        wins,
        losses,
        ties,
        winPercentage,
        pointsFor,
        pointsAgainst,
        pointsDifferential,
        avgPointsFor,
        avgPointsAgainst,
        gamesPlayed: totalGames,
        currentStreak: streakType ? `${currentStreak}${streakType}` : null,
      };
    }),

  /**
   * Get head-to-head record between two teams
   */
  getHeadToHeadRecord: protectedProcedure
    .input(z.object({
      team1Id: z.number(),
      team2Id: z.number(),
      year: z.number(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      }

      // Get all matchups between these two teams
      const h2hMatchups = await db
        .select()
        .from(matchups)
        .where(and(
          or(
            and(
              eq(matchups.team1Id, input.team1Id),
              eq(matchups.team2Id, input.team2Id)
            ),
            and(
              eq(matchups.team1Id, input.team2Id),
              eq(matchups.team2Id, input.team1Id)
            )
          ),
          eq(matchups.year, input.year),
          eq(matchups.status, 'final')
        ));

      let team1Wins = 0;
      let team2Wins = 0;
      let ties = 0;
      let team1PointsFor = 0;
      let team2PointsFor = 0;

      for (const matchup of h2hMatchups) {
        const isTeam1First = matchup.team1Id === input.team1Id;
        const team1Score = isTeam1First ? matchup.team1Score : matchup.team2Score;
        const team2Score = isTeam1First ? matchup.team2Score : matchup.team1Score;

        team1PointsFor += team1Score;
        team2PointsFor += team2Score;

        if (matchup.winnerId === input.team1Id) {
          team1Wins++;
        } else if (matchup.winnerId === input.team2Id) {
          team2Wins++;
        } else {
          ties++;
        }
      }

      return {
        team1Id: input.team1Id,
        team2Id: input.team2Id,
        team1Wins,
        team2Wins,
        ties,
        team1PointsFor,
        team2PointsFor,
        totalGames: h2hMatchups.length,
      };
    }),

  /**
   * Get power rankings (standings with additional metrics)
   */
  getPowerRankings: protectedProcedure
    .input(z.object({
      leagueId: z.number(),
      year: z.number(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      }

      // Get base standings
      const standings = await standingsRouter.createCaller({ user: { id: 0 } } as any)
        .getLeagueStandings({ leagueId: input.leagueId, year: input.year });

      // Add power ranking metrics
      const powerRankings = await Promise.all(
        standings.map(async (standing) => {
          // Get recent form (last 3 weeks)
          const recentMatchups = await db
            .select()
            .from(matchups)
            .where(and(
              or(
                eq(matchups.team1Id, standing.teamId),
                eq(matchups.team2Id, standing.teamId)
              ),
              eq(matchups.year, input.year),
              eq(matchups.status, 'final')
            ))
            .orderBy(desc(matchups.week))
            .limit(3);

          let recentWins = 0;
          for (const matchup of recentMatchups) {
            if (matchup.winnerId === standing.teamId) {
              recentWins++;
            }
          }

          const recentForm = recentMatchups.length > 0 ? recentWins / recentMatchups.length : 0;

          // Calculate strength of schedule (average opponent win %)
          const allMatchups = await db
            .select()
            .from(matchups)
            .where(and(
              or(
                eq(matchups.team1Id, standing.teamId),
                eq(matchups.team2Id, standing.teamId)
              ),
              eq(matchups.year, input.year),
              eq(matchups.status, 'final')
            ));

          let totalOpponentWinPct = 0;
          for (const matchup of allMatchups) {
            const opponentId = matchup.team1Id === standing.teamId ? matchup.team2Id : matchup.team1Id;
            const opponentStanding = standings.find(s => s.teamId === opponentId);
            if (opponentStanding) {
              totalOpponentWinPct += opponentStanding.winPercentage;
            }
          }

          const strengthOfSchedule = allMatchups.length > 0 ? totalOpponentWinPct / allMatchups.length : 0;

          // Power score combines multiple factors
          const powerScore = 
            (standing.winPercentage * 40) +
            (standing.pointsFor / 100) +
            (recentForm * 20) +
            (strengthOfSchedule * 10) +
            (standing.pointsDifferential / 50);

          return {
            ...standing,
            recentForm,
            strengthOfSchedule,
            powerScore,
          };
        })
      );

      // Sort by power score
      powerRankings.sort((a, b) => b.powerScore - a.powerScore);

      // Assign power ranks
      powerRankings.forEach((ranking, index) => {
        ranking.rank = index + 1;
      });

      return powerRankings;
    }),
});
