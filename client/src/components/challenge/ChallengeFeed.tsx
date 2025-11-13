import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Radio, TrendingUp, Trophy, Flame } from "lucide-react";

interface FeedEvent {
  id: string;
  timestamp: Date;
  type: "score" | "milestone" | "leader_change" | "big_play";
  participantName: string;
  assetName: string;
  assetType: "manufacturer" | "cannabis_strain" | "product" | "pharmacy" | "brand";
  points: number;
  message: string;
}

interface ChallengeFeedProps {
  events: FeedEvent[];
  className?: string;
}

export function ChallengeFeed({ events, className }: ChallengeFeedProps) {
  const getEventIcon = (type: FeedEvent["type"]) => {
    switch (type) {
      case "leader_change":
        return <Trophy className="w-4 h-4 text-[#FFD700]" />;
      case "milestone":
        return <Flame className="w-4 h-4 text-[#FF2D55]" />;
      case "big_play":
        return <TrendingUp className="w-4 h-4 text-[#00D9FF]" />;
      default:
        return <Radio className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getEventBadge = (type: FeedEvent["type"]) => {
    switch (type) {
      case "leader_change":
        return (
          <Badge className="gradient-primary text-white border-0">
            LEAD CHANGE
          </Badge>
        );
      case "milestone":
        return (
          <Badge className="bg-[#FF2D55]/10 border-[#FF2D55]/20 text-[#FF2D55]">
            MILESTONE
          </Badge>
        );
      case "big_play":
        return (
          <Badge className="bg-[#00D9FF]/10 border-[#00D9FF]/20 text-[#00D9FF]">
            BIG PLAY
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  return (
    <Card className={cn("gradient-card border-border/50", className)}>
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Radio className="w-5 h-5 text-[#FF2D55]" />
          <span>Live Feed</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="py-12 text-center">
            <Radio className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">
              No events yet. Check back when the challenge starts!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event, index) => (
              <div
                key={event.id}
                className={cn(
                  "p-4 rounded-lg border transition-all slide-in-bottom",
                  "bg-card/50 border-border/50 hover:bg-muted/20",
                  event.type === "leader_change" && "ring-2 ring-[#FFD700]/20",
                  event.type === "big_play" && "ring-2 ring-[#00D9FF]/20",
                  event.type === "milestone" && "ring-2 ring-[#FF2D55]/20"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="mt-1">{getEventIcon(event.type)}</div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Badge */}
                    {getEventBadge(event.type) && (
                      <div className="mb-2">{getEventBadge(event.type)}</div>
                    )}

                    {/* Message */}
                    <p className="text-foreground font-medium mb-1">
                      <span className="font-bold text-[#FF2D55]">{event.participantName}</span>
                      {" • "}
                      <span className="text-muted-foreground">{event.assetName}</span>
                    </p>
                    <p className="text-sm text-muted-foreground mb-2">{event.message}</p>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {formatTime(event.timestamp)}
                      </span>
                      <span className="text-sm font-bold text-[#00D9FF]">
                        +{event.points.toFixed(1)} pts
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

