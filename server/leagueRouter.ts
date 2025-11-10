import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "./_core/trpc";
import { getDb } from "./db";
import { leagues, teams, users } from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

/**
 * League Router
 * Handles all league management operations for Season Mode
 */

export const leagueRouter = router({
  /**
   * Create a new league
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(3).max(100),
        description: z.string().max(500).optional(),
        maxTeams: z.number().min(4).max(16).default(10),
        draftDate: z.string().optional().transform(val => val === "" ? undefined : val),
        scoringSystem: z.enum(["standard", "ppr", "custom"]).default("standard"),
        waiverType: z.enum(["faab", "rolling"]).default("faab"),
        faabBudget: z.number().min(0).max(1000).default(100),
        tradeDeadlineWeek: z.number().min(1).max(18).default(13),
        playoffTeams: z.number().min(4).max(8).default(6),
        isPublic: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      try {
        // Create league
        const currentYear = new Date().getFullYear();
        const [leagueResult] = await db
          .insert(leagues)
          .values({
            name: input.name,
            commissionerUserId: ctx.user.id,
            teamCount: input.maxTeams,
            currentWeek: 1,
            status: "draft",
            draftDate: input.draftDate ? new Date(input.draftDate) : null,
            scoringType: input.scoringSystem === "standard" ? "standard" : "custom",
            playoffTeams: input.playoffTeams,
            seasonYear: currentYear,
          })
          .$returningId();

        const leagueId = leagueResult.id;

        // Create commissioner's team
        await db.insert(teams).values({
          leagueId: leagueId,
          userId: ctx.user.id,
          name: `${ctx.user.name}'s Team`,
          faabBudget: input.faabBudget,
        });

        return {
          success: true,
          leagueId: leagueId,
        };
      } catch (error) {
        console.error("[LeagueRouter] Error creating league:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create league",
        });
      }
    }),

  /**
   * Get all leagues for the current user
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      return [];
    }

    try {
      // Get leagues where user has a team
      const userTeams = await db
        .select({
          league: leagues,
          team: teams,
        })
        .from(teams)
        .innerJoin(leagues, eq(teams.leagueId, leagues.id))
        .where(eq(teams.userId, ctx.user.id))
        .orderBy(desc(leagues.createdAt));

      return userTeams.map((ut) => ({
        ...ut.league,
        myTeam: ut.team,
      }));
    } catch (error) {
      console.error("[LeagueRouter] Error fetching user leagues:", error);
      return [];
    }
  }),

  /**
   * Get league details by ID
   */
  getById: protectedProcedure
    .input(z.object({ leagueId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      try {
        const [league] = await db
          .select()
          .from(leagues)
          .where(eq(leagues.id, input.leagueId))
          .limit(1);

        if (!league) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "League not found",
          });
        }

        // Get all teams in the league
        const leagueTeams = await db
          .select({
            team: teams,
            user: users,
          })
          .from(teams)
          .innerJoin(users, eq(teams.userId, users.id))
          .where(eq(teams.leagueId, input.leagueId))
          .orderBy(desc(teams.pointsFor));

        // Check if current user is in this league
        const userTeam = leagueTeams.find((t) => t.team.userId === ctx.user.id);

        return {
          ...league,
          teams: leagueTeams.map((t) => ({
            ...t.team,
            userName: t.user.name,
            userEmail: t.user.email,
          })),
          isCommissioner: league.commissionerUserId === ctx.user.id,
          isMember: !!userTeam,
          myTeam: userTeam?.team,
        };
      } catch (error) {
        console.error("[LeagueRouter] Error fetching league:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch league",
        });
      }
    }),

  /**
   * Join a league
   */
  join: protectedProcedure
    .input(
      z.object({
        leagueId: z.number(),
        teamName: z.string().min(3).max(50),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      try {
        // Check if league exists and has space
        const [league] = await db
          .select()
          .from(leagues)
          .where(eq(leagues.id, input.leagueId))
          .limit(1);

        if (!league) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "League not found",
          });
        }

        // Count current teams
        const currentTeams = await db
          .select()
          .from(teams)
          .where(eq(teams.leagueId, input.leagueId));

        if (currentTeams.length >= league.maxTeams) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "League is full",
          });
        }

        // Check if user already has a team in this league
        const existingTeam = currentTeams.find((t) => t.userId === ctx.user.id);
        if (existingTeam) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "You already have a team in this league",
          });
        }

        // Create team
        await db.insert(teams).values({
          leagueId: input.leagueId,
          userId: ctx.user.id,
          teamName: input.teamName,
          faabRemaining: league.faabBudget,
        });

        return {
          success: true,
        };
      } catch (error) {
        console.error("[LeagueRouter] Error joining league:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to join league",
        });
      }
    }),

  /**
   * Get public leagues available to join
   */
  public: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      return [];
    }

    try {
      const publicLeagues = await db
        .select()
        .from(leagues)
        .where(and(eq(leagues.isPublic, true), eq(leagues.seasonStatus, "pre_draft")))
        .orderBy(desc(leagues.createdAt))
        .limit(20);

      // Get team counts for each league
      const leaguesWithCounts = await Promise.all(
        publicLeagues.map(async (league) => {
          const teamCount = await db
            .select()
            .from(teams)
            .where(eq(teams.leagueId, league.id));

          return {
            ...league,
            currentTeams: teamCount.length,
            spotsAvailable: league.maxTeams - teamCount.length,
          };
        })
      );

      return leaguesWithCounts.filter((l) => l.spotsAvailable > 0);
    } catch (error) {
      console.error("[LeagueRouter] Error fetching public leagues:", error);
      return [];
    }
  }),

  /**
   * Update league settings (commissioner only)
   */
  updateSettings: protectedProcedure
    .input(
      z.object({
        leagueId: z.number(),
        name: z.string().min(3).max(100).optional(),
        description: z.string().max(500).optional(),
        draftDate: z.string().optional().transform(val => val === "" ? undefined : val),
        tradeDeadlineWeek: z.number().min(1).max(18).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      try {
        // Check if user is commissioner
        const [league] = await db
          .select()
          .from(leagues)
          .where(eq(leagues.id, input.leagueId))
          .limit(1);

        if (!league) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "League not found",
          });
        }

        if (league.commissionerUserId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only the commissioner can update league settings",
          });
        }

        // Update league
        const updateData: any = {};
        if (input.name) updateData.name = input.name;
        if (input.description !== undefined) updateData.description = input.description;
        if (input.draftDate) updateData.draftDate = new Date(input.draftDate);
        if (input.tradeDeadlineWeek) updateData.tradeDeadlineWeek = input.tradeDeadlineWeek;

        await db.update(leagues).set(updateData).where(eq(leagues.id, input.leagueId));

        return {
          success: true,
        };
      } catch (error) {
        console.error("[LeagueRouter] Error updating league:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update league",
        });
      }
    }),

  /**
   * Delete league (commissioner only, pre-draft only)
   */
  delete: protectedProcedure
    .input(z.object({ leagueId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      try {
        // Check if user is commissioner
        const [league] = await db
          .select()
          .from(leagues)
          .where(eq(leagues.id, input.leagueId))
          .limit(1);

        if (!league) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "League not found",
          });
        }

        if (league.commissionerUserId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only the commissioner can delete the league",
          });
        }

        if (league.seasonStatus !== "pre_draft") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Can only delete leagues that haven't started",
          });
        }

        // Delete all teams first
        await db.delete(teams).where(eq(teams.leagueId, input.leagueId));

        // Delete league
        await db.delete(leagues).where(eq(leagues.id, input.leagueId));

        return {
          success: true,
        };
      } catch (error) {
        console.error("[LeagueRouter] Error deleting league:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete league",
        });
      }
    }),

  /**
   * Get current user's team in a league
   */
  getMyTeam: protectedProcedure
    .input(z.object({ leagueId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      try {
        const [team] = await db
          .select()
          .from(teams)
          .where(and(eq(teams.leagueId, input.leagueId), eq(teams.userId, ctx.user.id)))
          .limit(1);

        return team || null;
      } catch (error) {
        console.error("[LeagueRouter] Error fetching user team:", error);
        return null;
      }
    }),
});
