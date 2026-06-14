import { formatCO2, formatCO2Saved, formatAnnualCO2 } from '@/lib/utils/co2Formatter';

describe('co2Formatter', () => {
  describe('formatCO2', () => {
    it('handles values <= 0', () => {
      expect(formatCO2(0)).toBe('zero CO₂');
      expect(formatCO2(-5.5)).toBe('zero CO₂');
    });

    it('handles values < 10 (plastic bags equivalency)', () => {
      // 0.1 * 10 = 1 bag
      expect(formatCO2(0.1)).toBe('like 1 plastic bag');
      // 0.55 * 10 = 6 bags
      expect(formatCO2(0.55)).toBe('like 6 plastic bags');
      // 9.9 * 10 = 99 bags
      expect(formatCO2(9.9)).toBe('like 99 plastic bags');
    });

    it('handles values >= 10 and <= 100 (Delhi distance trips)', () => {
      // 21 kg => 21 / 0.21 = 100 km => closest distance in DELHI_DISTANCES is Mathura (185 km)
      expect(formatCO2(21)).toBe('like driving Delhi to Mathura once');
      // 58.8 kg => 58.8 / 0.21 = 280 km => closest distance is Jaipur (280 km)
      expect(formatCO2(58.8)).toBe('like driving Delhi to Jaipur once');
      // 100 kg => 100 / 0.21 = 476 km => closest is Amritsar (450 km) or Lucknow (555 km)?
      // 476 - 450 = 26 km. 555 - 476 = 79 km. Closest is Amritsar.
      expect(formatCO2(100)).toBe('like driving Delhi to Amritsar once');
    });

    it('handles values > 100 and <= 500 (car km travel)', () => {
      // 300 kg / 0.21 = 1428.57... -> 1429 km
      expect(formatCO2(300)).toBe('like 1,429 km in a car');
      // 500 kg / 0.21 = 2380.95... -> 2381 km
      expect(formatCO2(500)).toBe('like 2,381 km in a car');
    });

    it('handles values > 500 (domestic flights equivalent)', () => {
      // 510 kg / 255 = 2 domestic flights
      expect(formatCO2(510)).toBe('like 2 domestic flights');
      // 255 kg / 255 = 1 domestic flight
      // Note: formatCO2 has a boundary condition. Let's pass 501.
      // 501 kg / 255 = 1.96... -> Math.round is 2
      expect(formatCO2(501)).toBe('like 2 domestic flights');
      // To get 1 domestic flight: we need the input to be > 500 but round to 1.
      // Wait, 255 * 1.4 = 357 kg (not in range > 500).
      // What if we pass 255 * 0.9 = 229? No, it only goes here if kg > 500.
      // If kg > 500, then kg / 255 >= 1.96. So flights will always be >= 2.
      // But let's check flights !== 1 branch. It will always be true since flights >= 2.
      // Let's write the test for values > 500.
      expect(formatCO2(1000)).toBe('like 4 domestic flights');
    });
  });

  describe('formatCO2Saved', () => {
    it('formats values < 0.1 kg', () => {
      expect(formatCO2Saved(0.05)).toBe('<0.1 kg CO₂');
      expect(formatCO2Saved(0.001)).toBe('<0.1 kg CO₂');
    });

    it('formats values >= 1 kg (one decimal place)', () => {
      expect(formatCO2Saved(1)).toBe('1.0 kg CO₂');
      expect(formatCO2Saved(2.45)).toBe('2.5 kg CO₂');
      expect(formatCO2Saved(10.899)).toBe('10.9 kg CO₂');
    });

    it('formats values between 0.1 and 1 kg (two decimal places)', () => {
      expect(formatCO2Saved(0.123)).toBe('0.12 kg CO₂');
      expect(formatCO2Saved(0.999)).toBe('1.00 kg CO₂');
      expect(formatCO2Saved(0.5)).toBe('0.50 kg CO₂');
    });
  });

  describe('formatAnnualCO2', () => {
    it('formats values >= 1000 kg as tonnes/year', () => {
      expect(formatAnnualCO2(1000)).toBe('1.0 tonnes/year');
      expect(formatAnnualCO2(2567)).toBe('2.6 tonnes/year');
    });

    it('formats values < 1000 kg as kg/year', () => {
      expect(formatAnnualCO2(999)).toBe('999 kg/year');
      expect(formatAnnualCO2(50)).toBe('50 kg/year');
      expect(formatAnnualCO2(0)).toBe('0 kg/year');
    });
  });
});
