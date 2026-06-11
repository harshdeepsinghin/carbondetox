import {
  calculateCarbonScore,
  getWeakestCategories,
} from '@/lib/scoring/carbonScore';
import type { UserProfile, CarbonScore } from '@/types';

// ─── Test Fixtures ────────────────────────────────────────────────────────────

const BASE_PROFILE: UserProfile = {
  uid: 'test-uid-001',
  diet: 'vegan',
  commuteDistance: 0,
  transportMode: 'cycle',
  acUsage: 'none',
  electricityRange: 'low',
  shoppingFrequency: 'rarely',
  flightsPerYear: 0,
  recyclingHabit: 'always',
  locationType: 'urban',
  completedOnboarding: true,
  updatedAt: new Date().toISOString(),
};

const HIGH_IMPACT_PROFILE: UserProfile = {
  uid: 'test-uid-002',
  diet: 'nonveg',
  commuteDistance: 40,
  transportMode: 'car',
  acUsage: 'heavy',
  electricityRange: 'high',
  shoppingFrequency: 'daily',
  flightsPerYear: 12,
  recyclingHabit: 'never',
  locationType: 'suburban',
  completedOnboarding: true,
  updatedAt: new Date().toISOString(),
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('calculateCarbonScore', () => {
  it('1. Vegan cyclist with minimal consumption scores > 80 overall', () => {
    const score = calculateCarbonScore(BASE_PROFILE);
    expect(score.overall).toBeGreaterThan(80);
  });

  it('2. Heavy car user, nonveg diet, heavy AC, and frequent flights scores < 35 overall', () => {
    const score = calculateCarbonScore(HIGH_IMPACT_PROFILE);
    expect(score.overall).toBeLessThan(35);
  });

  it('3. All individual category scores are clamped between 0 and 100', () => {
    const score1 = calculateCarbonScore(BASE_PROFILE);
    const score2 = calculateCarbonScore(HIGH_IMPACT_PROFILE);

    const categories: (keyof CarbonScore)[] = [
      'overall',
      'transport',
      'food',
      'energy',
      'shopping',
      'waste',
    ];

    for (const score of [score1, score2]) {
      for (const cat of categories) {
        const value = score[cat];
        if (typeof value === 'number') {
          expect(value).toBeGreaterThanOrEqual(0);
          expect(value).toBeLessThanOrEqual(100);
        }
      }
    }
  });

  it('4. Transport weight is 30% of the overall weighted score', () => {
    // Create a profile where only transport varies, everything else is minimal
    const lowTransport: UserProfile = {
      ...BASE_PROFILE,
      uid: 'test-uid-003',
      transportMode: 'walk',
      commuteDistance: 0,
    };
    const highTransport: UserProfile = {
      ...BASE_PROFILE,
      uid: 'test-uid-004',
      transportMode: 'car',
      commuteDistance: 50,
    };

    const lowScore = calculateCarbonScore(lowTransport);
    const highScore = calculateCarbonScore(highTransport);

    // The difference in overall score should reflect the 30% transport weight
    const transportDiff = lowScore.transport - highScore.transport;
    const overallDiff = lowScore.overall - highScore.overall;

    // overall diff should be ~30% of transport diff (±5 due to rounding)
    expect(Math.abs(overallDiff - transportDiff * 0.3)).toBeLessThanOrEqual(5);
  });

  it('5. Returns correct uid, date, and createdAt metadata', () => {
    const score = calculateCarbonScore(BASE_PROFILE);
    expect(score.uid).toBe('test-uid-001');
    expect(score.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(score.createdAt).toBeTruthy();
  });

  it('6. Score changes when profile changes (no stale caching)', () => {
    const score1 = calculateCarbonScore(BASE_PROFILE);
    const changedProfile: UserProfile = {
      ...BASE_PROFILE,
      uid: 'test-uid-001',
      transportMode: 'car',
      commuteDistance: 30,
    };
    const score2 = calculateCarbonScore(changedProfile);
    expect(score1.overall).not.toEqual(score2.overall);
    expect(score1.transport).not.toEqual(score2.transport);
  });
});

describe('getWeakestCategories', () => {
  it('7. Returns categories sorted worst (lowest score) first', () => {
    const mockScore: CarbonScore = {
      uid: 'test-uid',
      date: '2025-01-01',
      overall: 50,
      transport: 20, // worst
      food: 65,
      energy: 45,
      shopping: 80, // best
      waste: 55,
      createdAt: new Date().toISOString(),
    };

    const weakest = getWeakestCategories(mockScore);
    expect(weakest[0]).toBe('transport'); // score: 20
    expect(weakest[1]).toBe('energy'); // score: 45
    expect(weakest[weakest.length - 1]).toBe('shopping'); // score: 80
  });

  it('8. Returns all 5 categories with no duplicates', () => {
    const score = calculateCarbonScore(BASE_PROFILE);
    const weakest = getWeakestCategories(score);
    expect(weakest).toHaveLength(5);
    expect(new Set(weakest).size).toBe(5);
  });
});
