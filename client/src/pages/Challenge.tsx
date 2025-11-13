import { useState } from "react";
import { useParams } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Loader2 } from "lucide-react";
import { ChallengeHeader } from "@/components/challenge/ChallengeHeader";
import { ChallengeTabs, ChallengeTab } from "@/components/challenge/ChallengeTabs";
import { ChallengeScoreboard } from "@/components/challenge/ChallengeScoreboard";
import { GameLeaders } from "@/components/challenge/GameLeaders";
import { ChallengeFeed } from "@/components/challenge/ChallengeFeed";
import { Card, CardContent } from "@/components/ui/card";
import ScoringBreakdown from "@/components/ScoringBreakdown";
import { Button } from "@/components/ui/button";
import { useWebSocket } from "@/hooks/useWebSocket";
import { toast } from "sonner";

export default function Challenge() {
  const { id } = useParams();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<ChallengeTab>("stats");

  const challengeId = parseInt(id!);

  // Fetch challenge data (it's stored as a league with leagueType: 'challenge')
  const { data: league, isLoading: leagueLoading } = trpc.league.getById.useQuery(
    { leagueId: challengeId },
    { enabled: !!id && isAuthenticated }
  );

  // Get my team in this challenge
  const { data: myTeam } = trpc.league.getMyTeam.useQuery(
    { leagueId: challengeId },
    { enabled: !!id && isAuthenticated }
  );

  // Get current year/week
  const currentYear = league?.seasonYear || new Date().getFullYear();
  const currentWeek = league?.currentWeek || 1;

  // Fetch scoring data for both participants
  const { data: scoringData, refetch: refetchScoring } = trpc.scoring.getLeagueWeekScores.useQuery(
    {
      leagueId: challengeId,
      year: currentYear,
      week: currentWeek,
    },
    { enabled: !!league }
  );

  // Fetch my scoring breakdown
  const { data: myBreakdown } = trpc.scoring.getTeamBreakdown.useQuery(
    { teamId: myTeam?.id || 0, year: currentYear, week: currentWeek },
    { enabled: !!myTeam }
  );

  // WebSocket for real-time updates
  const { isConnected } = useWebSocket({
    userId: user?.id || 0,
    leagueId: challengeId,
    onMessage: (message) => {
      if (message.type === "scores_updated" || message.type === "team_score_calculated") {
        refetchScoring();
        toast.success("Scores updated!", { duration: 2000 });
      }
    },
  });

  // Redirect to login if not authenticated
  if (!authLoading && !isAuthenticated) {
    const loginUrl = getLoginUrl();
    if (loginUrl) window.location.href = loginUrl;
    else window.location.href = "/login";
    return null;
  }

  if (authLoading || leagueLoading) {
    return (
      <div className="min-h-screen gradient-dark flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading challenge...</p>
        </div>
      </div>
    );
  }

  if (!league || league.leagueType !== "challenge") {
    return (
      <div className="min-h-screen gradient-dark flex items-center justify-center">
        <Card className="gradient-card border-border/50 max-w-md">
          <CardContent className="py-12 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Challenge Not Found
            </h2>
            <p className="text-muted-foreground mb-6">
              This challenge doesn't exist or you don't have access to it.
            </p>
            <Button onClick={() => (window.location.href = "/")} className="gradient-primary">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get participants (should be exactly 2 teams in a challenge)
  const participants = league.teams || [];
  const participant1 = participants[0];
  const participant2 = participants[1];

  // Get scores from scoringData
  const participant1Score =
    scoringData?.find((s: any) => s.teamId === participant1?.id)?.points || 0;
  const participant2Score =
    scoringData?.find((s: any) => s.teamId === participant2?.id)?.points || 0;

  // Calculate category breakdowns
  const getCategoryScores = (teamId: number) => {
    const teamScore = scoringData?.find((s: any) => s.teamId === teamId);
    return {
      manufacturer: (teamScore?.mfg1Points || 0) + (teamScore?.mfg2Points || 0),
      strain: (teamScore?.cstr1Points || 0) + (teamScore?.cstr2Points || 0),
      product: (teamScore?.prd1Points || 0) + (teamScore?.prd2Points || 0),
      pharmacy: (teamScore?.phm1Points || 0) + (teamScore?.phm2Points || 0),
      brand: teamScore?.brd1Points || 0,
    };
  };

  // Mock top performers data (in real implementation, this would come from backend)
  const topPerformers =
    myBreakdown?.breakdowns
      ?.map((b: any) => ({
        assetId: b.assetId,
        assetName: b.assetName || `${b.assetType} #${b.assetId}`,
        assetType: b.assetType,
        points: b.totalPoints || 0,
        ownerName: myTeam?.name || "Unknown",
      }))
      .sort((a: any, b: any) => b.points - a.points)
      .slice(0, 6) || [];

  // Mock feed events (in real implementation, this would come from backend)
  const feedEvents: any[] = [];

  return (
    <div className="min-h-screen gradient-dark">
      {/* Challenge Header with Live Scores */}
      {participant1 && participant2 && (
        <ChallengeHeader
          participant1={{
            id: participant1.id,
            name: participant1.name,
            score: participant1Score,
          }}
          participant2={{
            id: participant2.id,
            name: participant2.name,
            score: participant2Score,
          }}
          status={league.seasonStatus === "in_progress" ? "in_progress" : "scheduled"}
          challengeName={league.name}
        />
      )}

      {/* Tab Navigation */}
      <ChallengeTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      <div className="container mx-auto px-4 py-6">
        {/* STATS Tab */}
        {activeTab === "stats" && (
          <div className="space-y-6">
            {participant1 && participant2 && (
              <ChallengeScoreboard
                participant1={{
                  id: participant1.id,
                  name: participant1.name,
                  scores: getCategoryScores(participant1.id),
                  total: participant1Score,
                }}
                participant2={{
                  id: participant2.id,
                  name: participant2.name,
                  scores: getCategoryScores(participant2.id),
                  total: participant2Score,
                }}
              />
            )}

            {topPerformers.length > 0 && <GameLeaders topPerformers={topPerformers} />}
          </div>
        )}

        {/* PLAYS Tab */}
        {activeTab === "plays" && (
          <Card className="gradient-card border-border/50">
            <CardContent className="py-20 text-center">
              <div className="max-w-md mx-auto">
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  Plays Coming Soon
                </h3>
                <p className="text-muted-foreground">
                  Detailed play-by-play analysis will be available here.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* FEED Tab */}
        {activeTab === "feed" && <ChallengeFeed events={feedEvents} />}

        {/* FANTASY Tab */}
        {activeTab === "fantasy" && (
          <div className="space-y-6">
            {/* My Lineup Summary */}
            <Card className="gradient-card border-border/50">
              <CardContent className="py-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-foreground">My Lineup</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => (window.location.href = `/challenge/${challengeId}/lineup`)}
                    className="border-border/50"
                  >
                    Edit Lineup
                  </Button>
                </div>
                <div className="text-center py-8">
                  <div className="text-4xl font-bold text-gradient-primary mb-2">
                    {participant1Score.toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Points</div>
                </div>
              </CardContent>
            </Card>

            {/* Scoring Breakdown */}
            {myBreakdown && myBreakdown.breakdowns && myBreakdown.breakdowns.length > 0 ? (
              <div className="grid gap-4">
                {myBreakdown.breakdowns.map((breakdown: any, index: number) => (
                  <ScoringBreakdown
                    key={index}
                    data={{
                      assetName: breakdown.assetName || "Unknown",
                      assetType: breakdown.assetType,
                      components: breakdown.breakdown?.components || [],
                      bonuses: breakdown.breakdown?.bonuses || [],
                      penalties: breakdown.breakdown?.penalties || [],
                      subtotal: breakdown.breakdown?.subtotal || 0,
                      total: breakdown.totalPoints || 0,
                    }}
                  />
                ))}
              </div>
            ) : (
              <Card className="gradient-card border-border/50">
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    No scoring data available yet.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* CHAT Tab */}
        {activeTab === "chat" && (
          <Card className="gradient-card border-border/50">
            <CardContent className="py-20 text-center">
              <div className="max-w-md mx-auto">
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  Chat Coming Soon
                </h3>
                <p className="text-muted-foreground">
                  Talk trash with your opponent in real-time!
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
