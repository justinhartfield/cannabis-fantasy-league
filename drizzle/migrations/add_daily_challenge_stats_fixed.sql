-- Daily Challenge Stats Tables (Fixed - No Foreign Keys)
-- These tables store daily performance metrics optimized for daily challenges

-- Manufacturer Daily Challenge Stats
CREATE TABLE IF NOT EXISTS "manufacturerDailyChallengeStats" (
  "id" SERIAL PRIMARY KEY,
  "manufacturerId" INTEGER NOT NULL,
  "statDate" DATE NOT NULL,
  "salesVolumeGrams" INTEGER DEFAULT 0 NOT NULL,
  "orderCount" INTEGER DEFAULT 0 NOT NULL,
  "revenueCents" INTEGER DEFAULT 0 NOT NULL,
  "totalPoints" INTEGER DEFAULT 0 NOT NULL,
  "rank" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE("manufacturerId", "statDate")
);

CREATE INDEX IF NOT EXISTS "manufacturer_daily_challenge_stats_date_idx" ON "manufacturerDailyChallengeStats" ("statDate");
CREATE INDEX IF NOT EXISTS "manufacturer_daily_challenge_stats_manufacturer_idx" ON "manufacturerDailyChallengeStats" ("manufacturerId");

-- Strain Daily Challenge Stats
CREATE TABLE IF NOT EXISTS "strainDailyChallengeStats" (
  "id" SERIAL PRIMARY KEY,
  "strainId" INTEGER NOT NULL,
  "statDate" DATE NOT NULL,
  "salesVolumeGrams" INTEGER DEFAULT 0 NOT NULL,
  "orderCount" INTEGER DEFAULT 0 NOT NULL,
  "totalPoints" INTEGER DEFAULT 0 NOT NULL,
  "rank" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE("strainId", "statDate")
);

CREATE INDEX IF NOT EXISTS "strain_daily_challenge_stats_date_idx" ON "strainDailyChallengeStats" ("statDate");
CREATE INDEX IF NOT EXISTS "strain_daily_challenge_stats_strain_idx" ON "strainDailyChallengeStats" ("strainId");

-- Pharmacy Daily Challenge Stats
CREATE TABLE IF NOT EXISTS "pharmacyDailyChallengeStats" (
  "id" SERIAL PRIMARY KEY,
  "pharmacyId" INTEGER NOT NULL,
  "statDate" DATE NOT NULL,
  "orderCount" INTEGER DEFAULT 0 NOT NULL,
  "revenueCents" INTEGER DEFAULT 0 NOT NULL,
  "totalPoints" INTEGER DEFAULT 0 NOT NULL,
  "rank" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE("pharmacyId", "statDate")
);

CREATE INDEX IF NOT EXISTS "pharmacy_daily_challenge_stats_date_idx" ON "pharmacyDailyChallengeStats" ("statDate");
CREATE INDEX IF NOT EXISTS "pharmacy_daily_challenge_stats_pharmacy_idx" ON "pharmacyDailyChallengeStats" ("pharmacyId");

-- Brand Daily Challenge Stats (uses ratings, not sales)
CREATE TABLE IF NOT EXISTS "brandDailyChallengeStats" (
  "id" SERIAL PRIMARY KEY,
  "brandId" INTEGER NOT NULL,
  "statDate" DATE NOT NULL,
  "ratingCount" INTEGER DEFAULT 0 NOT NULL,
  "averageRating" DECIMAL(3, 2) DEFAULT 0 NOT NULL,
  "bayesianAverage" DECIMAL(3, 2) DEFAULT 0 NOT NULL,
  "totalPoints" INTEGER DEFAULT 0 NOT NULL,
  "rank" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE("brandId", "statDate")
);

CREATE INDEX IF NOT EXISTS "brand_daily_challenge_stats_date_idx" ON "brandDailyChallengeStats" ("statDate");
CREATE INDEX IF NOT EXISTS "brand_daily_challenge_stats_brand_idx" ON "brandDailyChallengeStats" ("brandId");
