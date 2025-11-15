-- Regenerate today's matchups to use entities that have images
-- This will delete old matchups and let the system create new ones

-- Delete today's matchups and predictions
DELETE FROM "userPredictions" WHERE "matchupId" IN (
  SELECT id FROM "dailyMatchups" WHERE "matchupDate" = CURRENT_DATE
);

DELETE FROM "dailyMatchups" WHERE "matchupDate" = CURRENT_DATE;

SELECT 'Matchups deleted. Server will regenerate them automatically.' as status;
