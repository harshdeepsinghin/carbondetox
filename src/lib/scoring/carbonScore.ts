import type {
  UserProfile,
  CarbonScore,
  MissionCategory,
  DietType,
  TransportMode,
  ACUsage,
  ElectricityRange,
  ShoppingFrequency,
  RecyclingHabit,
} from '@/types';

// ─── Emission Constants ───────────────────────────────────────────────────────

/** kg CO₂e per year for different diet types */
const DIET_EMISSIONS: Record<DietType, number> = {
  vegan: 1500,
  vegetarian: 1700,
  eggetarian: 2000,
  nonveg: 2500,
};

/** kg CO₂e per km for each transport mode */
const TRANSPORT_FACTORS: Record<TransportMode, number> = {
  walk: 0,
  cycle: 0,
  public: 0.04,
  bike: 0.09,
  car: 0.21,
};

/** Working days per year used for commute calculation */
const ANNUAL_COMMUTE_DAYS = 250;

/** kg CO₂e per year for AC usage levels */
const AC_EMISSIONS: Record<ACUsage, number> = {
  none: 0,
  minimal: 200,
  moderate: 600,
  heavy: 1200,
};

/** kg CO₂e per year for electricity consumption ranges */
const ELECTRICITY_EMISSIONS: Record<ElectricityRange, number> = {
  low: 300,
  medium: 700,
  high: 1400,
};

/** kg CO₂e per year for shopping frequency */
const SHOPPING_EMISSIONS: Record<ShoppingFrequency, number> = {
  rarely: 100,
  monthly: 300,
  weekly: 700,
  daily: 1500,
};

/** kg CO₂e per round-trip domestic flight */
const FLIGHT_EMISSION_PER = 255;

/**
 * Multiplier applied to waste emissions based on recycling habits.
 * Reduces overall waste score for good recyclers.
 */
const RECYCLING_FACTOR: Record<RecyclingHabit, number> = {
  always: 0.8,
  sometimes: 0.9,
  never: 1.0,
};

/**
 * Category weights for computing the overall score.
 * Must sum to 1.0.
 */
const WEIGHTS: Record<MissionCategory, number> = {
  transport: 0.3,
  food: 0.25,
  energy: 0.2,
  shopping: 0.15,
  waste: 0.1,
};

/**
 * Maximum plausible annual emissions (kg CO₂e) per category.
 * Used to normalise raw emissions into a 0–100 score.
 */
const MAX_EMISSIONS: Record<MissionCategory, number> = {
  transport: 7665, // 50 km × 2 × 250 days × 0.21 (car factor) ≈ max
  food: 2500,
  energy: 2600,
  shopping: 1500,
  waste: 500,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Clamp a number between min and max (inclusive). */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Convert raw emissions to a 0–100 health score.
 * Higher score = lower emissions = better.
 */
function emissionsToScore(emissions: number, max: number): number {
  return clamp(Math.round((1 - emissions / max) * 100), 0, 100);
}

// ─── Core Scoring Function ────────────────────────────────────────────────────

/**
 * Calculate a carbon health score from a user's lifestyle profile.
 *
 * @param profile - The user's onboarding profile answers
 * @returns A CarbonScore object with per-category and overall scores (0–100)
 *
 * Score interpretation:
 *   > 70 → Green (low emissions)
 *   40–70 → Amber (moderate)
 *   < 40 → Red (high emissions, needs work)
 */
export function calculateCarbonScore(profile: UserProfile): CarbonScore {
  const now = new Date().toISOString();
  const today = now.slice(0, 10);

  // Transport: annual commute emissions (round trip)
  const commuteEmissions =
    profile.commuteDistance *
    2 *
    ANNUAL_COMMUTE_DAYS *
    TRANSPORT_FACTORS[profile.transportMode];
  const transportScore = emissionsToScore(commuteEmissions, MAX_EMISSIONS.transport);

  // Food
  const foodEmissions = DIET_EMISSIONS[profile.diet];
  const foodScore = emissionsToScore(foodEmissions, MAX_EMISSIONS.food);

  // Energy: AC + electricity
  const energyEmissions =
    AC_EMISSIONS[profile.acUsage] + ELECTRICITY_EMISSIONS[profile.electricityRange];
  const energyScore = emissionsToScore(energyEmissions, MAX_EMISSIONS.energy);

  // Shopping
  const shoppingEmissions = SHOPPING_EMISSIONS[profile.shoppingFrequency];
  const shoppingScore = emissionsToScore(shoppingEmissions, MAX_EMISSIONS.shopping);

  // Waste: flights + recycling factor applied
  const wasteEmissions =
    profile.flightsPerYear *
    FLIGHT_EMISSION_PER *
    RECYCLING_FACTOR[profile.recyclingHabit];
  const wasteScore = emissionsToScore(wasteEmissions, MAX_EMISSIONS.waste);

  // Weighted overall score
  const overall = clamp(
    Math.round(
      transportScore * WEIGHTS.transport +
        foodScore * WEIGHTS.food +
        energyScore * WEIGHTS.energy +
        shoppingScore * WEIGHTS.shopping +
        wasteScore * WEIGHTS.waste,
    ),
    0,
    100,
  );

  return {
    uid: profile.uid,
    date: today,
    overall,
    transport: transportScore,
    food: foodScore,
    energy: energyScore,
    shopping: shoppingScore,
    waste: wasteScore,
    createdAt: now,
  };
}

// ─── Utility Functions ────────────────────────────────────────────────────────

/**
 * Returns mission categories sorted by score ascending (worst first).
 * Useful for targeting coaching and mission generation.
 *
 * @param score - A computed CarbonScore
 * @returns Array of MissionCategory sorted from lowest (worst) to highest score
 */
export function getWeakestCategories(score: CarbonScore): MissionCategory[] {
  const categories: MissionCategory[] = [
    'transport',
    'food',
    'energy',
    'shopping',
    'waste',
  ];

  return [...categories].sort((a, b) => score[a] - score[b]);
}

/**
 * Returns a human-readable label for a given score value.
 */
export function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  if (score >= 20) return 'Needs Work';
  return 'Critical';
}

/**
 * Returns the CSS color class associated with a score.
 */
export function getScoreColor(score: number): 'green' | 'amber' | 'red' {
  if (score >= 70) return 'green';
  if (score >= 40) return 'amber';
  return 'red';
}
