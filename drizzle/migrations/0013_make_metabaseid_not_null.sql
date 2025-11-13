-- Migration: Make metabaseId NOT NULL in cannabisStrains table

ALTER TABLE "cannabisStrains" ALTER COLUMN "metabaseId" SET NOT NULL;
