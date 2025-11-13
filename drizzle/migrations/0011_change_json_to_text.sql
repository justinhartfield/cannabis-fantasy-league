-- Migration: Change effects, flavors, terpenes from JSON to TEXT
-- This fixes serialization issues with postgres-js driver

ALTER TABLE "cannabisStrains" 
  ALTER COLUMN "effects" TYPE TEXT,
  ALTER COLUMN "flavors" TYPE TEXT,
  ALTER COLUMN "terpenes" TYPE TEXT;
