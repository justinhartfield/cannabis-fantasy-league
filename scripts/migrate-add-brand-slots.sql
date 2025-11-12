-- Add brand slot to weeklyLineups table
ALTER TABLE "weeklyLineups" ADD COLUMN IF NOT EXISTS "brd1Id" INTEGER;

-- Add brand points to weeklyTeamScores table
ALTER TABLE "weeklyTeamScores" ADD COLUMN IF NOT EXISTS "brd1Points" INTEGER DEFAULT 0 NOT NULL;
