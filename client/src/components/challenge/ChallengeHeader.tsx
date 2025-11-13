import { cn } from "@/lib/utils";
import { LiveIndicator } from "@/components/LiveIndicator";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface ChallengeHeaderProps {
  participant1: {
    id: number;
    name: string;
    score: number;
    avatar?: string;
  };
  participant2: {
    id: number;
    name: string;
    score: number;
    avatar?: string;
  };
  status: "scheduled" | "in_progress" | "final";
  startTime?: Date;
  challengeName: string;
  className?: string;
}

export function ChallengeHeader({
  participant1,
  participant2,
  status,
  startTime,
  challengeName,
  className,
}: ChallengeHeaderProps) {
  const isLive = status === "in_progress";
  const isFinal = status === "final";
  const isScheduled = status === "scheduled";

  // Calculate time until start
  const getTimeUntilStart = () => {
    if (!startTime || !isScheduled) return null;
    const now = new Date();
    const diff = startTime.getTime() - now.getTime();
    if (diff <= 0) return null;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const timeUntilStart = getTimeUntilStart();

  return (
    <div className={cn("gradient-dark border-b border-border/50 sticky top-0 z-20", className)}>
      <div className="container mx-auto px-4 py-4">
        {/* Challenge Name */}
        <div className="text-center mb-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {challengeName}
          </h2>
        </div>

        {/* Main Score Display */}
        <div className="flex items-center justify-center gap-4 md:gap-8 mb-4">
          {/* Participant 1 */}
          <div className="flex-1 max-w-[140px] md:max-w-xs">
            <div className="flex flex-col items-end gap-2">
              {participant1.avatar ? (
                <img
                  src={participant1.avatar}
                  alt={participant1.name}
                  className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover ring-2 ring-border"
                />
              ) : (
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-muted flex items-center justify-center text-xl md:text-2xl font-bold ring-2 ring-border">
                  {participant1.name.charAt(0)}
                </div>
              )}
              <h3 className="font-bold text-sm md:text-lg text-foreground truncate w-full text-right">
                {participant1.name}
              </h3>
            </div>
          </div>

          {/* Score Display */}
          <div className="flex flex-col items-center gap-2 min-w-[120px]">
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "text-4xl md:text-6xl font-bold score-animate",
                  isLive && "text-gradient-primary"
                )}
              >
                {participant1.score}
              </div>
              <div className="text-2xl md:text-4xl font-bold text-muted-foreground">-</div>
              <div
                className={cn(
                  "text-4xl md:text-6xl font-bold score-animate",
                  isLive && "text-gradient-secondary"
                )}
              >
                {participant2.score}
              </div>
            </div>
            
            {/* Status Badge */}
            <div className="flex items-center justify-center">
              {isLive ? (
                <LiveIndicator size="sm" />
              ) : isFinal ? (
                <Badge variant="secondary" className="text-xs font-bold uppercase">
                  FINAL
                </Badge>
              ) : isScheduled && timeUntilStart ? (
                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-muted/30 border border-border/50">
                  <Clock className="w-3 h-3 text-[#00D9FF]" />
                  <span className="text-xs font-semibold text-[#00D9FF]">
                    Starts in {timeUntilStart}
                  </span>
                </div>
              ) : (
                <Badge variant="outline" className="text-xs font-bold uppercase">
                  SCHEDULED
                </Badge>
              )}
            </div>
          </div>

          {/* Participant 2 */}
          <div className="flex-1 max-w-[140px] md:max-w-xs">
            <div className="flex flex-col items-start gap-2">
              {participant2.avatar ? (
                <img
                  src={participant2.avatar}
                  alt={participant2.name}
                  className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover ring-2 ring-border"
                />
              ) : (
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-muted flex items-center justify-center text-xl md:text-2xl font-bold ring-2 ring-border">
                  {participant2.name.charAt(0)}
                </div>
              )}
              <h3 className="font-bold text-sm md:text-lg text-foreground truncate w-full">
                {participant2.name}
              </h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

