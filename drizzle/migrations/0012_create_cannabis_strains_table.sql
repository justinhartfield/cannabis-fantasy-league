-- Migration: Create cannabisStrains table

CREATE TABLE IF NOT EXISTS "cannabisStrains" (
  "id" SERIAL PRIMARY KEY,
  "metabaseId" VARCHAR(64),
  "name" VARCHAR(255) NOT NULL,
  "slug" VARCHAR(255),
  "type" VARCHAR(50),
  "description" TEXT,
  "effects" TEXT,
  "flavors" TEXT,
  "terpenes" TEXT,
  "thcMin" INTEGER,
  "thcMax" INTEGER,
  "cbdMin" INTEGER,
  "cbdMax" INTEGER,
  "pharmaceuticalProductCount" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS "cannabis_strains_name_idx" ON "cannabisStrains" ("name");
CREATE INDEX IF NOT EXISTS "cannabis_strains_slug_idx" ON "cannabisStrains" ("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "cannabisStrains_metabaseId_unique" ON "cannabisStrains" ("metabaseId");
CREATE UNIQUE INDEX IF NOT EXISTS "cannabisStrains_slug_unique" ON "cannabisStrains" ("slug");
