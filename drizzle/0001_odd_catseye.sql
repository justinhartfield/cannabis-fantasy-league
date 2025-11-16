CREATE TABLE "brandDailyStats" (
	"id" serial NOT NULL,
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
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "brand_daily_unique" UNIQUE("brandId","statDate")
);
--> statement-breakpoint
CREATE TABLE "cannabisStrainDailyStats" (
	"id" serial NOT NULL,
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
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cannabis_strain_daily_unique" UNIQUE("cannabisStrainId","statDate")
);
--> statement-breakpoint
CREATE TABLE "dailyMatchups" (
	"id" serial NOT NULL,
	"matchupDate" date NOT NULL,
	"entityType" varchar(50) NOT NULL,
	"entityAId" integer NOT NULL,
	"entityBId" integer NOT NULL,
	"entityAName" varchar(255) NOT NULL,
	"entityBName" varchar(255) NOT NULL,
	"winnerId" integer,
	"entityAPoints" integer,
	"entityBPoints" integer,
	"isScored" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "matchup_unique" UNIQUE("matchupDate","entityAId","entityBId")
);
--> statement-breakpoint
CREATE TABLE "dailyScoringBreakdowns" (
	"id" serial NOT NULL,
	"dailyTeamScoreId" integer NOT NULL,
	"assetType" varchar(50) NOT NULL,
	"assetId" integer NOT NULL,
	"position" varchar(20) NOT NULL,
	"breakdown" json NOT NULL,
	"totalPoints" integer NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dailyTeamScores" (
	"id" serial NOT NULL,
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
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "daily_scores_unique" UNIQUE("challengeId","teamId","statDate")
);
--> statement-breakpoint
CREATE TABLE "invitations" (
	"id" serial NOT NULL,
	"leagueId" integer NOT NULL,
	"email" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"invitedBy" integer NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"acceptedAt" timestamp with time zone,
	CONSTRAINT "invitations_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "manufacturerDailyStats" (
	"id" serial NOT NULL,
	"manufacturerId" integer NOT NULL,
	"statDate" date NOT NULL,
	"salesVolumeGrams" integer DEFAULT 0 NOT NULL,
	"growthRatePercent" integer DEFAULT 0 NOT NULL,
	"marketShareRank" integer DEFAULT 0 NOT NULL,
	"rankChange" integer DEFAULT 0 NOT NULL,
	"productCount" integer DEFAULT 0 NOT NULL,
	"totalPoints" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "manufacturer_daily_unique" UNIQUE("manufacturerId","statDate")
);
--> statement-breakpoint
CREATE TABLE "pharmacyDailyStats" (
	"id" serial NOT NULL,
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
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pharmacy_daily_unique" UNIQUE("pharmacyId","statDate")
);
--> statement-breakpoint
CREATE TABLE "strainDailyStats" (
	"id" serial NOT NULL,
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
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "strain_daily_unique" UNIQUE("strainId","statDate")
);
--> statement-breakpoint
CREATE TABLE "syncJobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_name" varchar(255) NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"details" text,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"processed_count" integer DEFAULT 0,
	"total_count" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "syncLogs" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_id" integer NOT NULL,
	"level" varchar(50) NOT NULL,
	"message" text NOT NULL,
	"metadata" json,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "userPredictions" (
	"id" serial NOT NULL,
	"userId" integer NOT NULL,
	"matchupId" integer NOT NULL,
	"predictedWinnerId" integer NOT NULL,
	"isCorrect" integer,
	"submittedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_matchup_unique" UNIQUE("userId","matchupId")
);
--> statement-breakpoint
CREATE TABLE "brandDailyChallengeStats" (
	"id" serial PRIMARY KEY NOT NULL,
	"brandId" integer NOT NULL,
	"statDate" date NOT NULL,
	"totalRatings" integer DEFAULT 0 NOT NULL,
	"averageRating" numeric(3, 2) DEFAULT '0' NOT NULL,
	"bayesianAverage" numeric(3, 2) DEFAULT '0' NOT NULL,
	"veryGoodCount" integer DEFAULT 0 NOT NULL,
	"goodCount" integer DEFAULT 0 NOT NULL,
	"acceptableCount" integer DEFAULT 0 NOT NULL,
	"badCount" integer DEFAULT 0 NOT NULL,
	"veryBadCount" integer DEFAULT 0 NOT NULL,
	"totalPoints" integer DEFAULT 0 NOT NULL,
	"rank" integer DEFAULT 0,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "brand_daily_challenge_unique" UNIQUE("brandId","statDate")
);
--> statement-breakpoint
CREATE TABLE "manufacturerDailyChallengeStats" (
	"id" serial PRIMARY KEY NOT NULL,
	"manufacturerId" integer NOT NULL,
	"statDate" date NOT NULL,
	"salesVolumeGrams" integer DEFAULT 0 NOT NULL,
	"orderCount" integer DEFAULT 0 NOT NULL,
	"revenueCents" integer DEFAULT 0 NOT NULL,
	"totalPoints" integer DEFAULT 0 NOT NULL,
	"rank" integer DEFAULT 0,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "manufacturer_daily_challenge_unique" UNIQUE("manufacturerId","statDate")
);
--> statement-breakpoint
CREATE TABLE "pharmacyDailyChallengeStats" (
	"id" serial PRIMARY KEY NOT NULL,
	"pharmacyId" integer NOT NULL,
	"statDate" date NOT NULL,
	"orderCount" integer DEFAULT 0 NOT NULL,
	"revenueCents" integer DEFAULT 0 NOT NULL,
	"totalPoints" integer DEFAULT 0 NOT NULL,
	"rank" integer DEFAULT 0,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pharmacy_daily_challenge_unique" UNIQUE("pharmacyId","statDate")
);
--> statement-breakpoint
CREATE TABLE "productDailyChallengeStats" (
	"id" serial PRIMARY KEY NOT NULL,
	"productId" integer NOT NULL,
	"statDate" date NOT NULL,
	"salesVolumeGrams" integer DEFAULT 0 NOT NULL,
	"orderCount" integer DEFAULT 0 NOT NULL,
	"totalPoints" integer DEFAULT 0 NOT NULL,
	"rank" integer DEFAULT 0,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_daily_challenge_unique" UNIQUE("productId","statDate")
);
--> statement-breakpoint
CREATE TABLE "strainDailyChallengeStats" (
	"id" serial PRIMARY KEY NOT NULL,
	"strainId" integer NOT NULL,
	"statDate" date NOT NULL,
	"salesVolumeGrams" integer DEFAULT 0 NOT NULL,
	"orderCount" integer DEFAULT 0 NOT NULL,
	"totalPoints" integer DEFAULT 0 NOT NULL,
	"rank" integer DEFAULT 0,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "strain_daily_challenge_unique" UNIQUE("strainId","statDate")
);
--> statement-breakpoint
ALTER TABLE "cannabisStrains" ALTER COLUMN "metabaseId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "cannabisStrains" ALTER COLUMN "effects" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "cannabisStrains" ALTER COLUMN "flavors" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "cannabisStrains" ALTER COLUMN "terpenes" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "cannabisStrains" ADD COLUMN "imageUrl" varchar(500);--> statement-breakpoint
ALTER TABLE "cannabisStrains" ADD COLUMN "pharmaceuticalProductCount" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "manufacturers" ADD COLUMN "logoUrl" varchar(500);--> statement-breakpoint
ALTER TABLE "pharmacies" ADD COLUMN "logoUrl" varchar(500);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "currentPredictionStreak" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "longestPredictionStreak" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "avatarUrl" varchar(500);--> statement-breakpoint
ALTER TABLE "syncLogs" ADD CONSTRAINT "syncLogs_job_id_syncJobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."syncJobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brandDailyChallengeStats" ADD CONSTRAINT "brandDailyChallengeStats_brandId_brands_id_fk" FOREIGN KEY ("brandId") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "manufacturerDailyChallengeStats" ADD CONSTRAINT "manufacturerDailyChallengeStats_manufacturerId_manufacturers_id_fk" FOREIGN KEY ("manufacturerId") REFERENCES "public"."manufacturers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pharmacyDailyChallengeStats" ADD CONSTRAINT "pharmacyDailyChallengeStats_pharmacyId_pharmacies_id_fk" FOREIGN KEY ("pharmacyId") REFERENCES "public"."pharmacies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "productDailyChallengeStats" ADD CONSTRAINT "productDailyChallengeStats_productId_strains_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."strains"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "strainDailyChallengeStats" ADD CONSTRAINT "strainDailyChallengeStats_strainId_cannabisStrains_id_fk" FOREIGN KEY ("strainId") REFERENCES "public"."cannabisStrains"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "brand_daily_date_idx" ON "brandDailyStats" USING btree ("statDate");--> statement-breakpoint
CREATE INDEX "cannabis_strain_daily_date_idx" ON "cannabisStrainDailyStats" USING btree ("statDate");--> statement-breakpoint
CREATE INDEX "matchup_date_idx" ON "dailyMatchups" USING btree ("matchupDate");--> statement-breakpoint
CREATE INDEX "matchup_scored_idx" ON "dailyMatchups" USING btree ("isScored");--> statement-breakpoint
CREATE INDEX "daily_scores_date_idx" ON "dailyTeamScores" USING btree ("statDate");--> statement-breakpoint
CREATE INDEX "daily_scores_challenge_idx" ON "dailyTeamScores" USING btree ("challengeId");--> statement-breakpoint
CREATE INDEX "invitations_token_idx" ON "invitations" USING btree ("token");--> statement-breakpoint
CREATE INDEX "invitations_league_idx" ON "invitations" USING btree ("leagueId");--> statement-breakpoint
CREATE INDEX "invitations_email_idx" ON "invitations" USING btree ("email");--> statement-breakpoint
CREATE INDEX "manufacturer_daily_date_idx" ON "manufacturerDailyStats" USING btree ("statDate");--> statement-breakpoint
CREATE INDEX "pharmacy_daily_date_idx" ON "pharmacyDailyStats" USING btree ("statDate");--> statement-breakpoint
CREATE INDEX "strain_daily_date_idx" ON "strainDailyStats" USING btree ("statDate");--> statement-breakpoint
CREATE INDEX "sync_jobs_status_idx" ON "syncJobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sync_jobs_created_at_idx" ON "syncJobs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "sync_logs_job_id_idx" ON "syncLogs" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "sync_logs_timestamp_idx" ON "syncLogs" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "user_matchup_idx" ON "userPredictions" USING btree ("userId","matchupId");--> statement-breakpoint
CREATE INDEX "user_predictions_date_idx" ON "userPredictions" USING btree ("submittedAt");--> statement-breakpoint
CREATE INDEX "brand_daily_challenge_date_idx" ON "brandDailyChallengeStats" USING btree ("statDate");--> statement-breakpoint
CREATE INDEX "brand_daily_challenge_rank_idx" ON "brandDailyChallengeStats" USING btree ("statDate","rank");--> statement-breakpoint
CREATE INDEX "manufacturer_daily_challenge_date_idx" ON "manufacturerDailyChallengeStats" USING btree ("statDate");--> statement-breakpoint
CREATE INDEX "manufacturer_daily_challenge_rank_idx" ON "manufacturerDailyChallengeStats" USING btree ("statDate","rank");--> statement-breakpoint
CREATE INDEX "pharmacy_daily_challenge_date_idx" ON "pharmacyDailyChallengeStats" USING btree ("statDate");--> statement-breakpoint
CREATE INDEX "pharmacy_daily_challenge_rank_idx" ON "pharmacyDailyChallengeStats" USING btree ("statDate","rank");--> statement-breakpoint
CREATE INDEX "product_daily_challenge_date_idx" ON "productDailyChallengeStats" USING btree ("statDate");--> statement-breakpoint
CREATE INDEX "product_daily_challenge_rank_idx" ON "productDailyChallengeStats" USING btree ("statDate","rank");--> statement-breakpoint
CREATE INDEX "strain_daily_challenge_date_idx" ON "strainDailyChallengeStats" USING btree ("statDate");--> statement-breakpoint
CREATE INDEX "strain_daily_challenge_rank_idx" ON "strainDailyChallengeStats" USING btree ("statDate","rank");