import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerStatCard } from "@/components/PlayerStatCard";
import { Trophy } from "lucide-react";

interface TopPerformer {
  assetId: number;
  assetName: string;
  assetType: "manufacturer" | "cannabis_strain" | "product" | "pharmacy" | "brand";
  points: number;
  ownerName: string;
  stats?: { label: string; value: string | number }[];
}

interface GameLeadersProps {
  topPerformers: TopPerformer[];
  className?: string;
}

export function GameLeaders({ topPerformers, className }: GameLeadersProps) {
  return (
    <Card className={cn("gradient-card border-border/50", className)}>
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Trophy className="w-5 h-5 text-[#FFD700]" />
          <span>Game Leaders</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {topPerformers.length === 0 ? (
          <div className="py-12 text-center">
            <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">
              No performance data yet
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topPerformers.map((performer, index) => (
              <div key={performer.assetId} className="relative">
                {index < 3 && (
                  <div
                    className={cn(
                      "absolute -top-2 -left-2 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs z-10",
                      index === 0 ? "rank-gold text-white" :
                      index === 1 ? "rank-silver text-white" :
                      "rank-bronze text-white"
                    )}
                  >
                    {index + 1}
                  </div>
                )}
                <PlayerStatCard
                  name={performer.assetName}
                  type={performer.assetType}
                  points={performer.points}
                  isHot={index === 0}
                  stats={performer.stats || [
                    { label: "Owner", value: performer.ownerName },
                  ]}
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

