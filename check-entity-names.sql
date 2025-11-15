-- Check actual entity names in database
SELECT 'Manufacturers:' as type;
SELECT id, name FROM manufacturers ORDER BY id LIMIT 10;

SELECT 'Strains:' as type;
SELECT id, name FROM "cannabisStrains" ORDER BY id LIMIT 10;

SELECT 'Brands:' as type;
SELECT id, name FROM brands ORDER BY id LIMIT 10;

SELECT 'Pharmacies:' as type;
SELECT id, name FROM pharmacies ORDER BY id LIMIT 10;
