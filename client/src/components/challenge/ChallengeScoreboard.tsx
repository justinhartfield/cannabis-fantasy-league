import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CategoryScore {
  manufacturer: number;
  strain: number;
  product: number;
  pharmacy: number;
  brand: number;
}

interface ParticipantScoreboard {
  id: number;
  name: string;
  scores: CategoryScore;
  total: number;
}

interface ChallengeScoreboardProps {
  participant1: ParticipantScoreboard;
  participant2: ParticipantScoreboard;
  className?: string;
}

export function ChallengeScoreboard({
  participant1,
  participant2,
  className,
}: ChallengeScoreboardProps) {
  const categories = [
    { key: "manufacturer" as keyof CategoryScore, label: "MFG", color: "text-blue-400" },
    { key: "strain" as keyof CategoryScore, label: "STRAIN", color: "text-green-400" },
    { key: "product" as keyof CategoryScore, label: "PROD", color: "text-purple-400" },
    { key: "pharmacy" as keyof CategoryScore, label: "PHARM", color: "text-orange-400" },
    { key: "brand" as keyof CategoryScore, label: "BRAND", color: "text-amber-400" },
  ];

  return (
    <Card className={cn("gradient-card border-border/50", className)}>
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <span>Scoreboard</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 bg-muted/30">
                <TableHead className="w-[140px] text-foreground font-bold">TEAM</TableHead>
                {categories.map((cat) => (
                  <TableHead
                    key={cat.key}
                    className={cn("text-center font-bold uppercase", cat.color)}
                  >
                    {cat.label}
                  </TableHead>
                ))}
                <TableHead className="text-center text-foreground font-bold uppercase">
                  TOTAL
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Participant 1 */}
              <TableRow className="border-border/30 hover:bg-muted/20 transition-colors">
                <TableCell className="font-bold text-foreground">
                  {participant1.name}
                </TableCell>
                {categories.map((cat) => (
                  <TableCell
                    key={cat.key}
                    className={cn("text-center font-semibold", cat.color)}
                  >
                    {participant1.scores[cat.key].toFixed(1)}
                  </TableCell>
                ))}
                <TableCell className="text-center font-bold text-xl text-gradient-primary">
                  {participant1.total.toFixed(1)}
                </TableCell>
              </TableRow>

              {/* Participant 2 */}
              <TableRow className="border-border/30 hover:bg-muted/20 transition-colors">
                <TableCell className="font-bold text-foreground">
                  {participant2.name}
                </TableCell>
                {categories.map((cat) => (
                  <TableCell
                    key={cat.key}
                    className={cn("text-center font-semibold", cat.color)}
                  >
                    {participant2.scores[cat.key].toFixed(1)}
                  </TableCell>
                ))}
                <TableCell className="text-center font-bold text-xl text-gradient-secondary">
                  {participant2.total.toFixed(1)}
                </TableCell>
              </TableRow>

              {/* Difference Row */}
              <TableRow className="border-border/50 bg-muted/20">
                <TableCell className="font-bold text-muted-foreground uppercase text-sm">
                  Difference
                </TableCell>
                {categories.map((cat) => {
                  const diff = participant1.scores[cat.key] - participant2.scores[cat.key];
                  return (
                    <TableCell
                      key={cat.key}
                      className={cn(
                        "text-center font-semibold",
                        diff > 0 ? "text-green-400" : diff < 0 ? "text-red-400" : "text-muted-foreground"
                      )}
                    >
                      {diff > 0 ? "+" : ""}{diff.toFixed(1)}
                    </TableCell>
                  );
                })}
                <TableCell
                  className={cn(
                    "text-center font-bold text-lg",
                    participant1.total > participant2.total
                      ? "text-green-400"
                      : participant1.total < participant2.total
                      ? "text-red-400"
                      : "text-muted-foreground"
                  )}
                >
                  {participant1.total > participant2.total ? "+" : ""}
                  {(participant1.total - participant2.total).toFixed(1)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

