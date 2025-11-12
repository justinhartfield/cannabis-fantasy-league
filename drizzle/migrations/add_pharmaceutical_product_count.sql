-- Add pharmaceuticalProductCount column to cannabisStrains table
ALTER TABLE "cannabisStrains" ADD COLUMN IF NOT EXISTS "pharmaceuticalProductCount" INTEGER NOT NULL DEFAULT 0;
