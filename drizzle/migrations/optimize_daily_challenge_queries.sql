-- Migration: Optimize daily challenge stats queries for draft performance
-- Adds composite indexes on (entityId, statDate) for faster lookups

-- Manufacturer composite index
CREATE INDEX IF NOT EXISTS "manufacturer_daily_challenge_id_date_idx" 
ON "manufacturerDailyChallengeStats"("manufacturerId", "statDate");

-- Cannabis Strain composite index
CREATE INDEX IF NOT EXISTS "strain_daily_challenge_id_date_idx" 
ON "strainDailyChallengeStats"("strainId", "statDate");

-- Product composite index
CREATE INDEX IF NOT EXISTS "product_daily_challenge_id_date_idx" 
ON "productDailyChallengeStats"("productId", "statDate");

-- Pharmacy composite index
CREATE INDEX IF NOT EXISTS "pharmacy_daily_challenge_id_date_idx" 
ON "pharmacyDailyChallengeStats"("pharmacyId", "statDate");

-- Brand composite index
CREATE INDEX IF NOT EXISTS "brand_daily_challenge_id_date_idx" 
ON "brandDailyChallengeStats"("brandId", "statDate");

-- These composite indexes optimize queries like:
-- WHERE entityId = X AND statDate = 'YYYY-MM-DD'
-- Which is exactly what the draft daily scores feature uses
