-- Fix strainDailyChallengeStats to reference cannabisStrains instead of strains
-- This migration drops and recreates the foreign key constraint

-- Step 1: Drop the old foreign key constraint (if it exists)
ALTER TABLE "strainDailyChallengeStats" 
DROP CONSTRAINT IF EXISTS "strainDailyChallengeStats_strainId_strains_id_fk";

-- Step 2: Clear any existing data (since the strainId references were wrong)
TRUNCATE TABLE "strainDailyChallengeStats";

-- Step 3: Add the correct foreign key constraint to cannabisStrains
ALTER TABLE "strainDailyChallengeStats"
ADD CONSTRAINT "strainDailyChallengeStats_strainId_cannabisStrains_id_fk"
FOREIGN KEY ("strainId") REFERENCES "cannabisStrains"(id) ON DELETE CASCADE;
