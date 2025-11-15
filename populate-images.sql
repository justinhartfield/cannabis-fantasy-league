-- Populate image URLs for manufacturers, brands, pharmacies, and strains
-- CloudFront CDN: d3s2hob8w3xwk8.cloudfront.net

-- Update manufacturer logos
UPDATE manufacturers SET "logoUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/logos/canopy-growth.png' WHERE name = 'Canopy Growth';
UPDATE manufacturers SET "logoUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/logos/aurora-cannabis.png' WHERE name = 'Aurora Cannabis';
UPDATE manufacturers SET "logoUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/logos/tilray.png' WHERE name = 'Tilray';
UPDATE manufacturers SET "logoUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/logos/cronos.png' WHERE name = 'Cronos';
UPDATE manufacturers SET "logoUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/logos/hexo.png' WHERE name = 'HEXO';
UPDATE manufacturers SET "logoUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/logos/organigram.png' WHERE name = 'Organigram';
UPDATE manufacturers SET "logoUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/logos/aphria.png' WHERE name = 'Aphria';
UPDATE manufacturers SET "logoUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/logos/curaleaf.png' WHERE name = 'Curaleaf';

-- Update pharmacy logos
UPDATE pharmacies SET "logoUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/logos/tokyo-smoke.png' WHERE name = 'Tokyo Smoke';
UPDATE pharmacies SET "logoUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/logos/fire-and-flower.png' WHERE name = 'Fire & Flower';

-- Update strain images
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/blue-dream.jpg' WHERE name = 'Blue Dream';
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/og-kush.jpg' WHERE name = 'OG Kush';
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/girl-scout-cookies.jpg' WHERE name = 'Girl Scout Cookies';
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/sour-diesel.jpg' WHERE name = 'Sour Diesel';
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/granddaddy-purple.jpg' WHERE name = 'Granddaddy Purple';
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/white-widow.jpg' WHERE name = 'White Widow';
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/ak-47.jpg' WHERE name = 'AK-47';
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/jack-herer.jpg' WHERE name = 'Jack Herer';
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/northern-lights.jpg' WHERE name = 'Northern Lights';
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/pineapple-express.jpg' WHERE name = 'Pineapple Express';
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/green-crack.jpg' WHERE name = 'Green Crack';
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/gorilla-glue.jpg' WHERE name = 'Gorilla Glue';
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/gelato.jpg' WHERE name = 'Gelato';
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/wedding-cake.jpg' WHERE name = 'Wedding Cake';
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/zkittlez.jpg' WHERE name = 'Zkittlez';
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/purple-haze.jpg' WHERE name = 'Purple Haze';
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/strawberry-cough.jpg' WHERE name = 'Strawberry Cough';
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/trainwreck.jpg' WHERE name = 'Trainwreck';
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/super-lemon-haze.jpg' WHERE name = 'Super Lemon Haze';
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/bubba-kush.jpg' WHERE name = 'Bubba Kush';
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/durban-poison.jpg' WHERE name = 'Durban Poison';
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/maui-wowie.jpg' WHERE name = 'Maui Wowie';
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/cheese.jpg' WHERE name = 'Cheese';
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/amnesia-haze.jpg' WHERE name = 'Amnesia Haze';
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/critical-mass.jpg' WHERE name = 'Critical Mass';
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/blueberry.jpg' WHERE name = 'Blueberry';
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/lemon-kush.jpg' WHERE name = 'Lemon Kush';
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/tangie.jpg' WHERE name = 'Tangie';
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/do-si-dos.jpg' WHERE name = 'Do-Si-Dos';
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/sunset-sherbet.jpg' WHERE name = 'Sunset Sherbet';
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/cherry-pie.jpg' WHERE name = 'Cherry Pie';
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/skywalker-og.jpg' WHERE name = 'Skywalker OG';
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/headband.jpg' WHERE name = 'Headband';
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/fire-og.jpg' WHERE name = 'Fire OG';
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/purple-punch.jpg' WHERE name = 'Purple Punch';
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/mimosa.jpg' WHERE name = 'Mimosa';
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/runtz.jpg' WHERE name = 'Runtz';
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/cookies-and-cream.jpg' WHERE name = 'Cookies and Cream';
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/la-confidential.jpg' WHERE name = 'LA Confidential';
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/bruce-banner.jpg' WHERE name = 'Bruce Banner';
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/ghost-train-haze.jpg' WHERE name = 'Ghost Train Haze';
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/candyland.jpg' WHERE name = 'Candyland';
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/forbidden-fruit.jpg' WHERE name = 'Forbidden Fruit';
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/apple-fritter.jpg' WHERE name = 'Apple Fritter';
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/ice-cream-cake.jpg' WHERE name = 'Ice Cream Cake';
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/biscotti.jpg' WHERE name = 'Biscotti';
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/london-pound-cake.jpg' WHERE name = 'London Pound Cake';
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/mac.jpg' WHERE name = 'MAC';
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/jungle-boys.jpg' WHERE name = 'Jungle Boys';
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/cereal-milk.jpg' WHERE name = 'Cereal Milk';
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/gary-payton.jpg' WHERE name = 'Gary Payton';
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/white-truffle.jpg' WHERE name = 'White Truffle';
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/jealousy.jpg' WHERE name = 'Jealousy';
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/pink-rozay.jpg' WHERE name = 'Pink Rozay';
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/tropicana-cookies.jpg' WHERE name = 'Tropicana Cookies';
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/wedding-crasher.jpg' WHERE name = 'Wedding Crasher';
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/motor-breath.jpg' WHERE name = 'Motor Breath';
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/slurricane.jpg' WHERE name = 'Slurricane';
UPDATE "cannabisStrains" SET "imageUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/strains/kush-mints.jpg' WHERE name = 'Kush Mints';

-- Update brand logos (if needed)
UPDATE brands SET "logoUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/logos/tweed.png' WHERE name = 'Tweed';
UPDATE brands SET "logoUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/logos/broken-coast.png' WHERE name = 'Broken Coast';
UPDATE brands SET "logoUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/logos/good-supply.png' WHERE name = 'Good Supply';
UPDATE brands SET "logoUrl" = 'https://d3s2hob8w3xwk8.cloudfront.net/logos/redecan.png' WHERE name = 'Redecan';

-- Show results
SELECT 'Manufacturers updated:' as status, COUNT(*) as count FROM manufacturers WHERE "logoUrl" IS NOT NULL;
SELECT 'Pharmacies updated:' as status, COUNT(*) as count FROM pharmacies WHERE "logoUrl" IS NOT NULL;
SELECT 'Strains updated:' as status, COUNT(*) as count FROM "cannabisStrains" WHERE "imageUrl" IS NOT NULL;
SELECT 'Brands updated:' as status, COUNT(*) as count FROM brands WHERE "logoUrl" IS NOT NULL;
