-- Add leagueType column to leagues table
ALTER TABLE leagues ADD COLUMN IF NOT EXISTS "leagueType" VARCHAR(50) NOT NULL DEFAULT 'season';
