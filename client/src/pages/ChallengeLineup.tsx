import { useAuth } from "@/_core/hooks/useAuth";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2, ArrowLeft, Clock, Lock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import LineupEditor from "@/components/LineupEditor";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function ChallengeLineup() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { user, loading: authLoading, isAuthenticated } = useAuth();

  const challengeId = parseInt(id!);

  const { data: league, isLoading: leagueLoading } = trpc.league.getById.useQuery(
    { leagueId: challengeId },
    { enabled: !!id && isAuthenticated }
  );

  const { data: myTeam, isLoading: teamLoading } = trpc.league.getMyTeam.useQuery(
    { leagueId: challengeId },
    { enabled: !!id && isAuthenticated }
  );

  // Get current year/week from league
  const currentYear = league?.seasonYear || new Date().getFullYear();
  const currentWeek = league?.currentWeek || 1;

  // Fetch weekly lineup
  const { data: weeklyLineup, isLoading: lineupLoading, refetch: refetchLineup } =
    trpc.lineup.getWeeklyLineup.useQuery(
      { teamId: myTeam?.id || 0, year: currentYear, week: currentWeek },
      { enabled: !!myTeam && !!league }
    );

  // Fetch roster
  const { data: roster, isLoading: rosterLoading } = trpc.roster.getMyRoster.useQuery(
    { leagueId: challengeId },
    { enabled: !!id && isAuthenticated }
  );

  // Mutations
  const updateLineupMutation = trpc.lineup.updateLineup.useMutation({
    onSuccess: () => {
      toast.success("Lineup saved!");
      refetchLineup();
    },
    onError: (error) => {
      toast.error("Error saving lineup: " + error.message);
    },
  });

  const toggleLockMutation = trpc.lineup.toggleLock.useMutation({
    onSuccess: () => {
      toast.success("Lineup status changed!");
      refetchLineup();
    },
    onError: (error) => {
      toast.error("Error: " + error.message);
    },
  });

  // Redirect to login if not authenticated
  if (!authLoading && !isAuthenticated) {
    const loginUrl = getLoginUrl();
    if (loginUrl) window.location.href = loginUrl;
    else window.location.href = "/login";
    return null;
  }

  if (authLoading || leagueLoading || teamLoading || lineupLoading || rosterLoading) {
    return (
      <div className="min-h-screen gradient-dark flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading lineup...</p>
        </div>
      </div>
    );
  }

  if (!league || !myTeam || league.leagueType !== "challenge") {
    return (
      <div className="min-h-screen gradient-dark flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-foreground">
            Challenge or team not found
          </h2>
          <Button onClick={() => setLocation("/")} className="gradient-primary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-dark">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/95 backdrop-blur-lg sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation(`/challenge/${challengeId}`)}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Challenge
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gradient-primary">
                  {league.name}
                </h1>
                <p className="text-sm text-muted-foreground">{myTeam.name}</p>
              </div>
            </div>

            {/* Lock Status */}
            <div className="flex items-center gap-3">
              {weeklyLineup?.isLocked ? (
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/30 border border-border/50">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-semibold text-foreground">
                    Lineup Locked
                  </span>
                </div>
              ) : (
                <Badge className="gradient-secondary text-white">
                  <Clock className="w-3 h-3 mr-1" />
                  Set Lineup
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Info Card */}
        <Card className="gradient-card border-border/50 mb-6">
          <CardContent className="py-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl gradient-secondary flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground mb-1">
                  Daily Challenge Lineup
                </h3>
                <p className="text-sm text-muted-foreground">
                  Set your lineup for today's competition. Scores are calculated at the end of
                  the day.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lineup Editor */}
        <LineupEditor
          teamId={myTeam.id}
          year={currentYear}
          week={currentWeek}
          lineup={weeklyLineup || null}
          roster={roster || []}
          isLocked={weeklyLineup?.isLocked || false}
          onUpdateLineup={(updates) => {
            updateLineupMutation.mutate({
              teamId: myTeam.id,
              year: currentYear,
              week: currentWeek,
              lineup: updates,
            });
          }}
          onLockLineup={() => {
            toggleLockMutation.mutate({
              teamId: myTeam.id,
              year: currentYear,
              week: currentWeek,
            });
          }}
        />
      </div>
    </div>
  );
}
