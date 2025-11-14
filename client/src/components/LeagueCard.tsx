import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { League } from "@/types";
import { Shield, Trophy, Users } from "lucide-react";

type LeagueCardProps = {
  league: League;
};

export function LeagueCard({ league }: LeagueCardProps) {
  const { user } = useAuth();
  const leaguePath = league.leagueType === 'challenge'
    ? `/challenge/${league.id}`
    : `/league/${league.id}`;

  const getLeagueStatus = (status: string) => {
    switch (status) {
      case "pre_draft":
        return { text: "Pre-Draft", color: "text-yellow-400" };
      case "drafting":
        return { text: "Drafting", color: "text-blue-400" };
      case "in_progress":
        return { text: "In Progress", color: "text-green-400" };
      case "playoffs":
        return { text: "Playoffs", color: "text-purple-400" };
      default:
        return { text: "Completed", color: "text-gray-500" };
    }
  };

  const statusInfo = getLeagueStatus(league.seasonStatus);

  return (
    <Link href={leaguePath}>
      <Card className="bg-gray-800/20 border-gray-700/50 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-cyan-500/20 hover:border-cyan-500/50 card-hover-lift h-full">
        <CardHeader className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg font-bold text-white tracking-wider">
                {league.name}
              </CardTitle>
              <CardDescription className="text-sm text-gray-400">
                {league.leagueType === 'challenge' ? 'Daily Challenge' : 'Season League'}
              </CardDescription>
            </div>
            {league.commissionerId === user?.id && (
              <span className="text-xs font-bold uppercase bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-2 py-1 rounded-md">
                Commish
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {league.myTeam && (
            <div className="bg-gray-900/40 p-3 rounded-lg border border-gray-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-8 h-8 text-cyan-400" />
                  <div>
                    <p className="font-semibold text-white">{league.myTeam.teamName}</p>
                    <p className="text-xs text-gray-400">
                      Rank: <span className="font-bold text-cyan-400">#{league.myTeam.rank || 'N/A'}</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">
                    {league.myTeam.totalPoints?.toFixed(1) || "0.0"}
                  </p>
                  <p className="text-xs text-gray-400">Total Points</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-gray-400">Status</p>
                <p className={`font-semibold ${statusInfo.color}`}>{statusInfo.text}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-gray-400">Teams</p>
                <p className="font-semibold text-white">{league.maxTeams}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
