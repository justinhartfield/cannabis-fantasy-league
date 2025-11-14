/**
 * Test brand ratings aggregation and scoring
 */

import { calculateBrandScore } from './dailyChallengeScoringEngine';

// Test with sample data from the Metabase query
const testBrands = [
  {
    name: 'Baast',
    totalRatings: 1,
    averageRating: 5,
    bayesianAverage: 3.75,
    veryGoodCount: 1,
    goodCount: 0,
    acceptableCount: 0,
    badCount: 0,
    veryBadCount: 0,
  },
  {
    name: "Barney's Farm",
    totalRatings: 1,
    averageRating: 5,
    bayesianAverage: 3.75,
    veryGoodCount: 1,
    goodCount: 0,
    acceptableCount: 0,
    badCount: 0,
    veryBadCount: 0,
  },
  {
    name: 'Cannasseur Club',
    totalRatings: 1,
    averageRating: 5,
    bayesianAverage: 3.75,
    veryGoodCount: 1,
    goodCount: 0,
    acceptableCount: 0,
    badCount: 0,
    veryBadCount: 0,
  },
];

console.log('Testing Brand Ratings Scoring\n');
console.log('Scoring Formula:');
console.log('- Rating Count: 10 points per rating');
console.log('- Rating Quality: 20 points per star (Bayesian average)');
console.log('- Rank Bonus: +50 points for #1 brand\n');

testBrands.forEach((brand, index) => {
  const rank = index + 1;
  const scoring = calculateBrandScore(brand, rank);
  
  console.log(`${rank}. ${brand.name}`);
  console.log(`   Total Ratings: ${brand.totalRatings}`);
  console.log(`   Average Rating: ${brand.averageRating}/5`);
  console.log(`   Bayesian Average: ${brand.bayesianAverage}/5`);
  console.log(`   Rating Count Points: ${scoring.ratingCountPoints}`);
  console.log(`   Rating Quality Points: ${scoring.ratingQualityPoints}`);
  console.log(`   Rank Bonus: ${scoring.rankBonusPoints}`);
  console.log(`   TOTAL POINTS: ${scoring.totalPoints}\n`);
});

console.log('\nExpected Results:');
console.log('- All three brands have 1 rating with 5 stars');
console.log('- Bayesian average is 3.75 (adjusted for low sample size)');
console.log('- Rating count points: 1 × 10 = 10 points');
console.log('- Rating quality points: 3.75 × 20 = 75 points');
console.log('- Rank #1 gets +50 bonus');
console.log('- Rank #1 total: 10 + 75 + 50 = 135 points');
console.log('- Rank #2-3 total: 10 + 75 = 85 points');
