import { cn } from "@/lib/utils";
import { BarChart3, Activity, Radio, Users, MessageSquare } from "lucide-react";

export type ChallengeTab = "stats" | "plays" | "feed" | "fantasy" | "chat";

interface ChallengeTabsProps {
  activeTab: ChallengeTab;
  onTabChange: (tab: ChallengeTab) => void;
  className?: string;
}

const tabs: { id: ChallengeTab; label: string; icon: typeof BarChart3 }[] = [
  { id: "stats", label: "STATS", icon: BarChart3 },
  { id: "plays", label: "PLAYS", icon: Activity },
  { id: "feed", label: "FEED", icon: Radio },
  { id: "fantasy", label: "FANTASY", icon: Users },
  { id: "chat", label: "CHAT", icon: MessageSquare },
];

export function ChallengeTabs({
  activeTab,
  onTabChange,
  className,
}: ChallengeTabsProps) {
  return (
    <div className={cn("border-b border-border/50 bg-card/50 sticky top-[120px] md:top-[136px] z-10", className)}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-start overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 md:px-6 py-3 md:py-4 font-bold text-sm md:text-base uppercase tracking-wide transition-all whitespace-nowrap",
                  "border-b-2 relative",
                  isActive
                    ? "border-[#FF2D55] text-[#FF2D55]"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 gradient-primary" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

