CREATE TABLE IF NOT EXISTS "manufacturerDailyStats" (
	"id" serial PRIMARY KEY,
	"manufacturerId" integer NOT NULL,
	"statDate" date NOT NULL,
	"salesVolumeGrams" integer DEFAULT 0 NOT NULL,
	"growthRatePercent" integer DEFAULT 0 NOT NULL,
	"marketShareRank" integer DEFAULT 0 NOT NULL,
	"rankChange" integer DEFAULT 0 NOT NULL,
	"productCount" integer DEFAULT 0 NOT NULL,
	"totalPoints" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "manufacturer_daily_date_idx" ON "manufacturerDailyStats" ("statDate");
CREATE UNIQUE INDEX IF NOT EXISTS "manufacturer_daily_unique" ON "manufacturerDailyStats" ("manufacturerId","statDate");

CREATE TABLE IF NOT EXISTS "cannabisStrainDailyStats" (
	"id" serial PRIMARY KEY,
	"cannabisStrainId" integer NOT NULL,
	"statDate" date NOT NULL,
	"totalFavorites" integer DEFAULT 0 NOT NULL,
	"pharmacyCount" integer DEFAULT 0 NOT NULL,
	"productCount" integer DEFAULT 0 NOT NULL,
	"avgPriceCents" integer DEFAULT 0 NOT NULL,
	"priceChange" integer DEFAULT 0 NOT NULL,
	"marketPenetration" integer DEFAULT 0 NOT NULL,
	"totalPoints" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "cannabis_strain_daily_date_idx" ON "cannabisStrainDailyStats" ("statDate");
CREATE UNIQUE INDEX IF NOT EXISTS "cannabis_strain_daily_unique" ON "cannabisStrainDailyStats" ("cannabisStrainId","statDate");

CREATE TABLE IF NOT EXISTS "strainDailyStats" (
	"id" serial PRIMARY KEY,
	"strainId" integer NOT NULL,
	"statDate" date NOT NULL,
	"favoriteCount" integer DEFAULT 0 NOT NULL,
	"favoriteGrowth" integer DEFAULT 0 NOT NULL,
	"pharmacyCount" integer DEFAULT 0 NOT NULL,
	"pharmacyExpansion" integer DEFAULT 0 NOT NULL,
	"avgPriceCents" integer DEFAULT 0 NOT NULL,
	"priceStability" integer DEFAULT 0 NOT NULL,
	"orderVolumeGrams" integer DEFAULT 0 NOT NULL,
	"totalPoints" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "strain_daily_date_idx" ON "strainDailyStats" ("statDate");
CREATE UNIQUE INDEX IF NOT EXISTS "strain_daily_unique" ON "strainDailyStats" ("strainId","statDate");

CREATE TABLE IF NOT EXISTS "pharmacyDailyStats" (
	"id" serial PRIMARY KEY,
	"pharmacyId" integer NOT NULL,
	"statDate" date NOT NULL,
	"revenueCents" integer DEFAULT 0 NOT NULL,
	"orderCount" integer DEFAULT 0 NOT NULL,
	"avgOrderSizeGrams" integer DEFAULT 0 NOT NULL,
	"customerRetentionRate" integer DEFAULT 0 NOT NULL,
	"productVariety" integer DEFAULT 0 NOT NULL,
	"appUsageRate" integer DEFAULT 0 NOT NULL,
	"growthRatePercent" integer DEFAULT 0 NOT NULL,
	"totalPoints" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "pharmacy_daily_date_idx" ON "pharmacyDailyStats" ("statDate");
CREATE UNIQUE INDEX IF NOT EXISTS "pharmacy_daily_unique" ON "pharmacyDailyStats" ("pharmacyId","statDate");

CREATE TABLE IF NOT EXISTS "brandDailyStats" (
	"id" serial PRIMARY KEY,
	"brandId" integer NOT NULL,
	"statDate" date NOT NULL,
	"favorites" integer DEFAULT 0 NOT NULL,
	"favoriteGrowth" integer DEFAULT 0 NOT NULL,
	"views" integer DEFAULT 0 NOT NULL,
	"viewGrowth" integer DEFAULT 0 NOT NULL,
	"comments" integer DEFAULT 0 NOT NULL,
	"commentGrowth" integer DEFAULT 0 NOT NULL,
	"affiliateClicks" integer DEFAULT 0 NOT NULL,
	"clickGrowth" integer DEFAULT 0 NOT NULL,
	"engagementRate" integer DEFAULT 0 NOT NULL,
	"sentimentScore" integer DEFAULT 0 NOT NULL,
	"totalPoints" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "brand_daily_date_idx" ON "brandDailyStats" ("statDate");
CREATE UNIQUE INDEX IF NOT EXISTS "brand_daily_unique" ON "brandDailyStats" ("brandId","statDate");

CREATE TABLE IF NOT EXISTS "dailyTeamScores" (
	"id" serial PRIMARY KEY,
	"challengeId" integer NOT NULL,
	"teamId" integer NOT NULL,
	"statDate" date NOT NULL,
	"mfg1Points" integer DEFAULT 0 NOT NULL,
	"mfg2Points" integer DEFAULT 0 NOT NULL,
	"cstr1Points" integer DEFAULT 0 NOT NULL,
	"cstr2Points" integer DEFAULT 0 NOT NULL,
	"prd1Points" integer DEFAULT 0 NOT NULL,
	"prd2Points" integer DEFAULT 0 NOT NULL,
	"phm1Points" integer DEFAULT 0 NOT NULL,
	"phm2Points" integer DEFAULT 0 NOT NULL,
	"brd1Points" integer DEFAULT 0 NOT NULL,
	"flexPoints" integer DEFAULT 0 NOT NULL,
	"bonusPoints" integer DEFAULT 0 NOT NULL,
	"penaltyPoints" integer DEFAULT 0 NOT NULL,
	"totalPoints" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "daily_scores_date_idx" ON "dailyTeamScores" ("statDate");
CREATE INDEX IF NOT EXISTS "daily_scores_challenge_idx" ON "dailyTeamScores" ("challengeId");
CREATE UNIQUE INDEX IF NOT EXISTS "daily_scores_unique" ON "dailyTeamScores" ("challengeId","teamId","statDate");

CREATE TABLE IF NOT EXISTS "dailyScoringBreakdowns" (
	"id" serial PRIMARY KEY,
	"dailyTeamScoreId" integer NOT NULL,
	"assetType" varchar(50) NOT NULL,
	"assetId" integer NOT NULL,
	"position" varchar(20) NOT NULL,
	"breakdown" json NOT NULL,
	"totalPoints" integer NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);

