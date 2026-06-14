/**
 * Distance ladder for Delhi-to-city comparisons (km, approximate road distances).
 * Used for the 10–100 kg CO₂ equivalency range.
 */
const DELHI_DISTANCES: Array<{ city: string; km: number }> = [
  { city: 'Mathura', km: 185 },
  { city: 'Agra', km: 230 },
  { city: 'Jaipur', km: 280 },
  { city: 'Chandigarh', km: 260 },
  { city: 'Lucknow', km: 555 },
  { city: 'Amritsar', km: 450 },
  { city: 'Jodhpur', km: 620 },
  { city: 'Dehradun', km: 300 },
  { city: 'Shimla', km: 380 },
  { city: 'Udaipur', km: 665 },
];

/**
 * Format a CO₂ quantity in kg into a human-readable Indian-context equivalent.
 *
 * Ranges:
 *  - < 10 kg  → plastic bags equivalent
 *  - 10–100 kg → Delhi road trip equivalent
 *  - 100–500 kg → kilometres in a car
 *  - > 500 kg  → domestic flight count
 *
 * @param kg - CO₂ quantity in kilograms
 * @returns Human-readable string, e.g. "like 240 plastic bags"
 */
export function formatCO2(kg: number): string {
  if (kg <= 0) return 'zero CO₂';

  if (kg < 10) {
    const bags = Math.round(kg * 10);
    return `like ${bags} plastic bag${bags !== 1 ? 's' : ''}`;
  }

  if (kg <= 100) {
    // Find the nearest city by matching km to co2 (car: 0.21 kg/km)
    const carKm = kg / 0.21;
    const closest = DELHI_DISTANCES.reduce((prev, curr) =>
      Math.abs(curr.km - carKm) < Math.abs(prev.km - carKm) ? curr : prev,
    );
    return `like driving Delhi to ${closest.city} once`;
  }

  if (kg <= 500) {
    const carKm = Math.round(kg / 0.21);
    return `like ${carKm.toLocaleString('en-IN')} km in a car`;
  }

  const flights = Math.round(kg / 255);
  return `like ${flights} domestic flights`;
}

/**
 * Format CO₂ savings with a sign, e.g. "+1.2 kg CO₂".
 * Useful for displaying mission impact.
 */
export function formatCO2Saved(kg: number): string {
  if (kg < 0.1) return '<0.1 kg CO₂';
  return `${kg >= 1 ? kg.toFixed(1) : kg.toFixed(2)} kg CO₂`;
}

/**
 * Return a short label for an annual CO₂ estimate.
 * E.g. 1500 kg → "1.5 tonnes/year"
 */
export function formatAnnualCO2(kgPerYear: number): string {
  if (kgPerYear >= 1000) {
    return `${(kgPerYear / 1000).toFixed(1)} tonnes/year`;
  }
  return `${Math.round(kgPerYear)} kg/year`;
}
