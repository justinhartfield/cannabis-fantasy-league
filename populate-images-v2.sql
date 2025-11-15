-- Populate database with S3 image URLs (Version 2)
-- Uses case-insensitive matching for German cannabis entities

-- Manufacturers (matching actual database names)
UPDATE manufacturers SET "logoUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/manufacturers/demecan.png' WHERE LOWER(name) = 'demecan';
UPDATE manufacturers SET "logoUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/manufacturers/cantourage.png' WHERE LOWER(name) LIKE '%cantourage%';
UPDATE manufacturers SET "logoUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/manufacturers/aurora-cannabis.png' WHERE LOWER(name) LIKE '%aurora%';
UPDATE manufacturers SET "logoUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/manufacturers/canopy-growth.png' WHERE LOWER(name) LIKE '%canopy%';
UPDATE manufacturers SET "logoUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/manufacturers/tilray.png' WHERE LOWER(name) LIKE '%tilray%';
UPDATE manufacturers SET "logoUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/manufacturers/aphria.png' WHERE LOWER(name) LIKE '%aphria%';
UPDATE manufacturers SET "logoUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/manufacturers/cronos.png' WHERE LOWER(name) LIKE '%cronos%';
UPDATE manufacturers SET "logoUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/manufacturers/khiron.png' WHERE LOWER(name) LIKE '%khiron%';

-- Pharmacies (no matches expected based on database names)
UPDATE pharmacies SET "logoUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/pharmacies/tokyo-smoke.png' WHERE LOWER(name) LIKE '%tokyo%smoke%';
UPDATE pharmacies SET "logoUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/pharmacies/fire-flower.png' WHERE LOWER(name) LIKE '%fire%flower%';

-- Strains (matching common strain names)
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/blue-dream.png' WHERE LOWER(name) LIKE '%blue%dream%';
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/og-kush.png' WHERE LOWER(name) LIKE '%og%kush%';
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/girl-scout-cookies.png' WHERE LOWER(name) LIKE '%girl%scout%';
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/sour-diesel.png' WHERE LOWER(name) LIKE '%sour%diesel%';
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/white-widow.png' WHERE LOWER(name) LIKE '%white%widow%';
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/ak-47.png' WHERE LOWER(name) LIKE '%ak%47%' OR LOWER(name) LIKE '%ak-47%';
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/northern-lights.png' WHERE LOWER(name) LIKE '%northern%lights%';
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/jack-herer.png' WHERE LOWER(name) LIKE '%jack%herer%';
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/pineapple-express.png' WHERE LOWER(name) LIKE '%pineapple%express%';
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/gorilla-glue.png' WHERE LOWER(name) LIKE '%gorilla%glue%' OR LOWER(name) = 'gg4';
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/gelato.png' WHERE LOWER(name) LIKE '%gelato%';
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/slurricane.png' WHERE LOWER(name) LIKE '%slurricane%';

-- Generic placeholder for entities without specific images
-- UPDATE manufacturers SET "logoUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/placeholder-manufacturer.png' WHERE "logoUrl" IS NULL;
-- UPDATE pharmacies SET "logoUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/placeholder-pharmacy.png' WHERE "logoUrl" IS NULL;
-- UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/placeholder-strain.png' WHERE "imageUrl" IS NULL;

-- Report results
SELECT '=== UPDATE RESULTS ===' as status;
SELECT 'Manufacturers with logos: ' || COUNT(*) as result FROM manufacturers WHERE "logoUrl" IS NOT NULL;
SELECT 'Pharmacies with logos: ' || COUNT(*) as result FROM pharmacies WHERE "logoUrl" IS NOT NULL;
SELECT 'Strains with images: ' || COUNT(*) as result FROM "cannabisStrains" WHERE "imageUrl" IS NOT NULL;

-- Show which manufacturers got updated
SELECT '=== MANUFACTURERS WITH LOGOS ===' as status;
SELECT id, name, "logoUrl" FROM manufacturers WHERE "logoUrl" IS NOT NULL ORDER BY id;

-- Show which strains got updated
SELECT '=== STRAINS WITH IMAGES ===' as status;
SELECT id, name, "imageUrl" FROM "cannabisStrains" WHERE "imageUrl" IS NOT NULL ORDER BY id LIMIT 20;
