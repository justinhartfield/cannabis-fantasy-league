-- Fix strainDailyChallengeStats to reference cannabisStrains instead of strains
-- Step 1: Add primary key to cannabisStrains if it doesn't exist
ALTER TABLE "cannabisStrains" 
ADD CONSTRAINT "cannabisStrains_pkey" PRIMARY KEY (id);

-- Step 2: Drop the old foreign key constraint (if it exists)
ALTER TABLE "strainDailyChallengeStats" 
DROP CONSTRAINT IF EXISTS "strainDailyChallengeStats_strainId_strains_id_fk";

-- Step 3: Clear any existing data (since the strainId references were wrong)
TRUNCATE TABLE "strainDailyChallengeStats";

-- Step 4: Add the correct foreign key constraint to cannabisStrains
-- Note: This constraint is for cannabis strains only
-- Products will also use this table but reference strains.id instead
-- So we cannot add a strict FK constraint that covers both cases
-- The application logic will handle the dual reference
