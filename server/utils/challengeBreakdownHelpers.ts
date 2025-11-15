import type { BreakdownDetail } from "../scoringEngine";

export type ChallengeSlotDefinition = {
  position: string;
  assetType: string | null;
};

export type ChallengeSlotInfo = {
  position: string;
  assetType: string | null;
  assetId: number | null;
  assetName?: string | null;
};

export type ChallengeStatBreakdown = {
  position: string;
  assetType: string | null;
  assetId: number | null;
  assetName: string | null;
  totalPoints: number;
  breakdown: BreakdownDetail;
  source: "stats" | "lineup";
  hasStats: boolean;
};

export const CHALLENGE_SLOT_ORDER: ChallengeSlotDefinition[] = [
  { position: "MFG1", assetType: "manufacturer" },
  { position: "MFG2", assetType: "manufacturer" },
  { position: "CSTR1", assetType: "cannabis_strain" },
  { position: "CSTR2", assetType: "cannabis_strain" },
  { position: "PRD1", assetType: "product" },
  { position: "PRD2", assetType: "product" },
  { position: "PHM1", assetType: "pharmacy" },
  { position: "PHM2", assetType: "pharmacy" },
  { position: "BRD1", assetType: "brand" },
  // Flex type is dynamic and derived from the lineup
  { position: "FLEX", assetType: null },
];

type PositionPoints = Record<string, number | undefined>;

export function mergeLineupWithBreakdowns({
  lineupSlots,
  statBreakdowns,
  fallbackBreakdown,
  positionPoints,
  slotOrder = CHALLENGE_SLOT_ORDER,
}: {
  lineupSlots: ChallengeSlotInfo[];
  statBreakdowns: ChallengeStatBreakdown[];
  fallbackBreakdown: (pointTotal: number) => BreakdownDetail;
  positionPoints?: PositionPoints;
  slotOrder?: ChallengeSlotDefinition[];
}): ChallengeStatBreakdown[] {
  const final: ChallengeStatBreakdown[] = [];
  const statsByPosition = new Map(
    statBreakdowns.map((row) => [row.position, row])
  );
  const lineupByPosition = new Map(
    lineupSlots.map((slot) => [slot.position, slot])
  );

  const resolvePoints = (position: string, fallback = 0) =>
    positionPoints?.[position] ?? fallback ?? 0;

  for (const slot of slotOrder) {
    const statRow = statsByPosition.get(slot.position);
    if (statRow) {
      final.push({
        ...statRow,
        totalPoints: resolvePoints(slot.position, statRow.totalPoints),
        source: "stats",
        hasStats: true,
      });
      statsByPosition.delete(slot.position);
      continue;
    }

    const lineupSlot = lineupByPosition.get(slot.position);
    const assetType = lineupSlot?.assetType ?? slot.assetType ?? null;
    const assetId = lineupSlot?.assetId ?? null;
    final.push({
      position: slot.position,
      assetType,
      assetId,
      assetName: assetId ? lineupSlot?.assetName ?? null : null,
      totalPoints: resolvePoints(slot.position, 0),
      breakdown: fallbackBreakdown(resolvePoints(slot.position, 0)),
      source: "lineup",
      hasStats: false,
    });
  }

  // Include any remaining stat rows (future positions or data anomalies)
  for (const statRow of statsByPosition.values()) {
    final.push({
      ...statRow,
      totalPoints: resolvePoints(statRow.position, statRow.totalPoints),
      source: "stats",
      hasStats: true,
    });
  }

  return final;
}

