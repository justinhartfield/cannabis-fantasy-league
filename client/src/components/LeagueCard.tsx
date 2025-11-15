import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { League } from "@/types";
import { Zap } from "lucide-react";

type LeagueCardProps = {
  league: League;
};

export function LeagueCard({ league }: LeagueCardProps) {
  const { user } = useAuth();
  const leaguePath = `/challenge/${league.id}`;

  const isChallenge = league.leagueType === 'challenge';

  // Season league compact card
  if (!isChallenge) {
    return (
      <Link href={leaguePath}>
        <Card className="gradient-card border-border/50 card-hover-lift cursor-pointer overflow-hidden">
          <div className="p-4">
            {/* Header Row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-bold text-foreground truncate mb-0.5">
                  {league.name}
                </h4>
                <p className="text-xs text-muted-foreground truncate">
                  {league.myTeam?.teamName || 'No Team'}
                </p>
              </div>
              {league.commissionerId === user?.id && (
                <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] gradient-primary text-white font-bold uppercase">
                  Comm
                </span>
              )}
            </div>

            {/* Stats Row - Compact */}
            <div className="flex items-center gap-3 mb-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground">Rank</span>
                <span className={`font-bold text-sm ${
                  (league.myTeam?.rank || 999) <= 3 ? 'text-gradient-primary' : 'text-foreground'
                }`}>
                  #{league.myTeam?.rank || "-"}
                </span>
              </div>
              <div className="h-3 w-px bg-border" />
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground">Points</span>
                <span className="font-bold text-sm text-[#00D9FF]">
                  {league.myTeam?.totalPoints?.toFixed(1) || "0.0"}
                </span>
              </div>
              <div className="h-3 w-px bg-border" />
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground">Week</span>
                <span className="font-bold text-sm text-foreground">
                  {league.currentWeek || 1}/18
                </span>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center justify-between">
              <span className={`px-2 py-1 rounded text-[10px] font-semibold uppercase ${
                league.seasonStatus === 'in_progress' ? 'bg-green-500/20 text-green-400' :
                league.seasonStatus === 'playoffs' ? 'bg-purple-500/20 text-purple-400' :
                league.seasonStatus === 'drafting' ? 'bg-blue-500/20 text-blue-400' :
                'bg-muted/50 text-muted-foreground'
              }`}>
                {league.seasonStatus === "pre_draft" ? "Pre-Draft" :
                 league.seasonStatus === "drafting" ? "Drafting" :
                 league.seasonStatus === "in_progress" ? "Active" :
                 league.seasonStatus === "playoffs" ? "Playoffs" : "Complete"}
              </span>
              <span className="text-xs text-muted-foreground">
                {league.maxTeams} teams
              </span>
            </div>
          </div>
        </Card>
      </Link>
    );
  }

  // Challenge league compact card
  return (
    <Link href={leaguePath}>
      <Card className="gradient-card border-border/50 card-hover-lift cursor-pointer overflow-hidden">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00D9FF] to-[#0099CC] flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <h4 className="text-base font-bold text-foreground truncate">
                  {league.name}
                </h4>
              </div>
              <div className="flex items-center gap-3 text-xs ml-10">
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">Rank</span>
                  <span className={`font-bold text-sm ${
                    (league.myTeam?.rank || 999) <= 3 ? 'text-gradient-primary' : 'text-foreground'
                  }`}>
                    #{league.myTeam?.rank || "-"}
                  </span>
                </div>
                <div className="h-3 w-px bg-border" />
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">Score</span>
                  <span className="font-bold text-sm text-[#00D9FF]">
                    {league.myTeam?.totalPoints?.toFixed(1) || "0.0"}
                  </span>
                </div>
                <div className="h-3 w-px bg-border" />
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">{league.teamCount || 2} teams</span>
                </div>
              </div>
            </div>
            <div className="ml-3">
              <span className={`px-2 py-1 rounded text-[10px] font-semibold uppercase ${
                league.status === 'active' || league.seasonStatus === 'in_progress' 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-blue-500/20 text-blue-400'
              }`}>
                {league.status === 'active' || league.seasonStatus === 'in_progress' ? 'LIVE' : 'DRAFT'}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
