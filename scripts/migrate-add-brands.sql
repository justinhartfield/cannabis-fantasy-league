-- Create brands table
CREATE TABLE IF NOT EXISTS brands (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255),
  description TEXT,
  "logoUrl" VARCHAR(500),
  "websiteUrl" VARCHAR(500),
  "totalFavorites" INTEGER DEFAULT 0 NOT NULL,
  "totalViews" INTEGER DEFAULT 0 NOT NULL,
  "totalComments" INTEGER DEFAULT 0 NOT NULL,
  "affiliateClicks" INTEGER DEFAULT 0 NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS brands_name_idx ON brands(name);

-- Create brandWeeklyStats table
CREATE TABLE IF NOT EXISTS "brandWeeklyStats" (
  id SERIAL PRIMARY KEY,
  "brandId" INTEGER NOT NULL,
  year INTEGER NOT NULL,
  week INTEGER NOT NULL,
  favorites INTEGER DEFAULT 0 NOT NULL,
  "favoriteGrowth" INTEGER DEFAULT 0 NOT NULL,
  views INTEGER DEFAULT 0 NOT NULL,
  "viewGrowth" INTEGER DEFAULT 0 NOT NULL,
  comments INTEGER DEFAULT 0 NOT NULL,
  "commentGrowth" INTEGER DEFAULT 0 NOT NULL,
  "affiliateClicks" INTEGER DEFAULT 0 NOT NULL,
  "clickGrowth" INTEGER DEFAULT 0 NOT NULL,
  "engagementRate" INTEGER DEFAULT 0 NOT NULL,
  "sentimentScore" INTEGER DEFAULT 0 NOT NULL,
  "totalPoints" INTEGER DEFAULT 0 NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE("brandId", year, week)
);

CREATE INDEX IF NOT EXISTS brand_week_idx ON "brandWeeklyStats"(year, week);

-- Migrate brand data from manufacturers table
-- Identify brands (non-pharmaceutical manufacturers)
INSERT INTO brands (name, "totalFavorites", "createdAt", "updatedAt")
SELECT 
  name,
  0 as "totalFavorites",
  "createdAt",
  "updatedAt"
FROM manufacturers
WHERE name IN (
  '8000Kicks',
  '420cloud',
  '420events.de',
  'Marychainz',
  'Toncz',
  'Green House Feeding',
  'Ozo',
  'neverrot',
  'Omura'
)
ON CONFLICT (name) DO NOTHING;

-- Update rosters to change assetType from 'manufacturer' to 'brand' for brands
UPDATE rosters r
SET "assetType" = 'brand',
    "assetId" = (SELECT b.id FROM brands b WHERE b.name = (SELECT m.name FROM manufacturers m WHERE m.id = r."assetId"))
WHERE "assetType" = 'manufacturer'
AND "assetId" IN (
  SELECT id FROM manufacturers WHERE name IN (
    '8000Kicks',
    '420cloud', 
    '420events.de',
    'Marychainz',
    'Toncz',
    'Green House Feeding',
    'Ozo',
    'neverrot',
    'Omura'
  )
);

-- Delete brands from manufacturers table
DELETE FROM manufacturers
WHERE name IN (
  '8000Kicks',
  '420cloud',
  '420events.de',
  'Marychainz',
  'Toncz',
  'Green House Feeding',
  'Ozo',
  'neverrot',
  'Omura'
);
