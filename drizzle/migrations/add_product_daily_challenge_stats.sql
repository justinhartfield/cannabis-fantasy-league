-- Migration: Add productDailyChallengeStats table and fix foreign keys
-- This migration creates a separate table for products and fixes the cannabisStrains primary key

-- Step 1: Add primary key to cannabisStrains table
ALTER TABLE "cannabisStrains" 
ADD CONSTRAINT "cannabisStrains_pkey" PRIMARY KEY (id);

-- Step 2: Drop old foreign key from strainDailyChallengeStats (if exists)
ALTER TABLE "strainDailyChallengeStats" 
DROP CONSTRAINT IF EXISTS "strainDailyChallengeStats_strainId_strains_id_fk";

-- Step 3: Clear strainDailyChallengeStats since it was referencing wrong table
TRUNCATE TABLE "strainDailyChallengeStats";

-- Step 4: Add correct foreign key to cannabisStrains
ALTER TABLE "strainDailyChallengeStats"
ADD CONSTRAINT "strainDailyChallengeStats_strainId_cannabisStrains_id_fk"
FOREIGN KEY ("strainId") REFERENCES "cannabisStrains"(id) ON DELETE CASCADE;

-- Step 5: Create productDailyChallengeStats table
CREATE TABLE IF NOT EXISTS "productDailyChallengeStats" (
  id SERIAL PRIMARY KEY,
  "productId" INTEGER NOT NULL REFERENCES "strains"(id) ON DELETE CASCADE,
  "statDate" DATE NOT NULL,
  "salesVolumeGrams" INTEGER DEFAULT 0 NOT NULL,
  "orderCount" INTEGER DEFAULT 0 NOT NULL,
  "totalPoints" INTEGER DEFAULT 0 NOT NULL,
  rank INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  CONSTRAINT "product_daily_challenge_unique" UNIQUE ("productId", "statDate")
);

-- Step 6: Create indexes for productDailyChallengeStats
CREATE INDEX IF NOT EXISTS "product_daily_challenge_date_idx" ON "productDailyChallengeStats"("statDate");
CREATE INDEX IF NOT EXISTS "product_daily_challenge_rank_idx" ON "productDailyChallengeStats"("statDate", rank);
