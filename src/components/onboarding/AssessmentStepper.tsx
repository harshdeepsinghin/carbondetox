'use client';

import { useState, useCallback } from 'react';
import {
  Car,
  Bike,
  Bus,
  Footprints,
  Wind,
  Leaf,
  ShoppingBag,
  Trash2,
  Plane,
  Zap,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type {
  UserProfile,
  DietType,
  TransportMode,
  ACUsage,
  ElectricityRange,
  ShoppingFrequency,
  RecyclingHabit,
} from '@/types';

// ─── Step definitions ─────────────────────────────────────────────────────────

type PartialProfile = Omit<UserProfile, 'uid' | 'completedOnboarding' | 'updatedAt'>;

const INITIAL_PROFILE: PartialProfile = {
  diet: 'vegetarian',
  commuteDistance: 10,
  transportMode: 'public',
  acUsage: 'minimal',
  electricityRange: 'medium',
  shoppingFrequency: 'monthly',
  flightsPerYear: 1,
  recyclingHabit: 'sometimes',
  locationType: 'urban',
};

interface AssessmentStepperProps {
  uid: string;
  onComplete: (profile: PartialProfile) => void | Promise<void>;
  initialValues?: Partial<PartialProfile>;
}

// ─── Option Cards ─────────────────────────────────────────────────────────────

function OptionCard<T extends string>({
  value,
  selected,
  onSelect,
  icon,
  label,
  sublabel,
}: {
  value: T;
  selected: boolean;
  onSelect: (v: T) => void;
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      aria-pressed={selected}
      className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center hover:scale-[1.02]"
      style={{
        background: selected ? 'rgba(22,163,74,0.12)' : 'rgba(255,255,255,0.03)',
        borderColor: selected ? 'var(--color-forest)' : 'var(--color-border)',
        color: selected ? 'var(--color-forest-light)' : 'var(--color-text-secondary)',
      }}
    >
      <div aria-hidden="true">{icon}</div>
      <span className="font-semibold text-sm">{label}</span>
      {sublabel && (
        <span className="text-xs opacity-70">{sublabel}</span>
      )}
    </button>
  );
}

// ─── Main Stepper ─────────────────────────────────────────────────────────────

export function AssessmentStepper({
  onComplete,
  initialValues = {},
}: AssessmentStepperProps) {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<PartialProfile>({
    ...INITIAL_PROFILE,
    ...initialValues,
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const TOTAL_STEPS = 6;

  const update = useCallback(
    <K extends keyof PartialProfile>(key: K, value: PartialProfile[K]) => {
      setProfile((prev) => ({ ...prev, [key]: value }));
      setError(null);
    },
    [],
  );

  function validate(): string | null {
    if (step === 1 && (profile.commuteDistance < 0 || profile.commuteDistance > 200)) {
      return 'Commute distance must be between 0 and 200 km';
    }
    if (step === 5 && (profile.flightsPerYear < 0 || profile.flightsPerYear > 100)) {
      return 'Flights per year must be between 0 and 100';
    }
    return null;
  }

  function next() {
    const err = validate();
    if (err) { setError(err); return; }
    if (step < TOTAL_STEPS) setStep((s) => s + 1);
    else handleComplete();
  }

  async function handleComplete() {
    setSaving(true);
    try {
      await onComplete(profile);
    } finally {
      setSaving(false);
    }
  }

  const iconSize = 'w-7 h-7';

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>
            Step {step} of {TOTAL_STEPS}
          </span>
          <span className="text-sm font-semibold gradient-text">
            {Math.round((step / TOTAL_STEPS) * 100)}%
          </span>
        </div>
        <div
          className="w-full rounded-full overflow-hidden"
          style={{ height: 6, background: 'rgba(255,255,255,0.08)' }}
          role="progressbar"
          aria-valuenow={step}
          aria-valuemin={1}
          aria-valuemax={TOTAL_STEPS}
          aria-label={`Onboarding progress: step ${step} of ${TOTAL_STEPS}`}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${(step / TOTAL_STEPS) * 100}%`,
              background: 'linear-gradient(90deg, var(--color-forest), var(--color-lime))',
            }}
          />
        </div>

        {/* Step dots */}
        <div className="flex justify-between mt-3">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              aria-hidden="true"
              style={{
                width: i + 1 <= step ? 24 : 8,
                height: 8,
                background:
                  i + 1 < step
                    ? 'var(--color-forest)'
                    : i + 1 === step
                      ? 'var(--color-forest-light)'
                      : 'rgba(255,255,255,0.12)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="glass-card p-8 mb-6 animate-in">

        {/* Step 1 — Transport */}
        {step === 1 && (
          <fieldset>
            <legend className="text-xl font-bold mb-1">How do you get around?</legend>
            <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
              Tell us about your daily commute
            </p>

            <div className="mb-6">
              <label
                htmlFor="commute-distance"
                className="block text-sm font-medium mb-2"
              >
                Daily one-way commute distance: <strong>{profile.commuteDistance} km</strong>
              </label>
              <input
                id="commute-distance"
                type="range"
                min={0}
                max={50}
                step={1}
                value={profile.commuteDistance}
                onChange={(e) => update('commuteDistance', parseInt(e.target.value))}
                className="w-full accent-green-500"
                aria-valuemin={0}
                aria-valuemax={50}
                aria-valuenow={profile.commuteDistance}
                aria-label={`Commute distance: ${profile.commuteDistance} kilometres`}
              />
              <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                <span>0 km</span><span>50 km</span>
              </div>
            </div>

            <p className="text-sm font-medium mb-3">Primary transport mode</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {([
                { v: 'walk', icon: <Footprints className={iconSize} />, label: 'Walk', sub: '0 emissions' },
                { v: 'cycle', icon: <Wind className={iconSize} />, label: 'Cycle', sub: '0 emissions' },
                { v: 'public', icon: <Bus className={iconSize} />, label: 'Public', sub: 'Metro/Bus/BRTS' },
                { v: 'bike', icon: <Bike className={iconSize} />, label: 'Bike', sub: 'Two-wheeler' },
                { v: 'car', icon: <Car className={iconSize} />, label: 'Car', sub: 'Private vehicle' },
              ] as const).map(({ v, icon, label, sub }) => (
                <OptionCard
                  key={v}
                  value={v}
                  selected={profile.transportMode === v}
                  onSelect={(val: TransportMode) => update('transportMode', val)}
                  icon={icon}
                  label={label}
                  sublabel={sub}
                />
              ))}
            </div>
          </fieldset>
        )}

        {/* Step 2 — Food */}
        {step === 2 && (
          <fieldset>
            <legend className="text-xl font-bold mb-1">What do you eat?</legend>
            <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
              Food accounts for up to 25% of your carbon footprint
            </p>
            <div className="grid grid-cols-2 gap-3">
              {([
                { v: 'vegan', icon: <Leaf className={iconSize} />, label: 'Vegan', sub: 'Lowest impact' },
                { v: 'vegetarian', icon: <Leaf className={iconSize} />, label: 'Vegetarian', sub: 'Low impact' },
                { v: 'eggetarian', icon: <Leaf className={iconSize} />, label: 'Eggetarian', sub: 'Moderate' },
                { v: 'nonveg', icon: <Leaf className={iconSize} />, label: 'Non-Veg', sub: 'Higher impact' },
              ] as const).map(({ v, icon, label, sub }) => (
                <OptionCard
                  key={v}
                  value={v}
                  selected={profile.diet === v}
                  onSelect={(val: DietType) => update('diet', val)}
                  icon={icon}
                  label={label}
                  sublabel={sub}
                />
              ))}
            </div>
          </fieldset>
        )}

        {/* Step 3 — Energy */}
        {step === 3 && (
          <fieldset>
            <legend className="text-xl font-bold mb-1">Home energy usage</legend>
            <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
              AC and electricity are key home emissions
            </p>

            <p className="text-sm font-medium mb-3">Air conditioning usage</p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {([
                { v: 'none', icon: <Wind className={iconSize} />, label: 'No AC', sub: 'Fans only' },
                { v: 'minimal', icon: <Zap className={iconSize} />, label: 'Minimal', sub: 'Weekends only' },
                { v: 'moderate', icon: <Zap className={iconSize} />, label: 'Moderate', sub: 'Few hours/day' },
                { v: 'heavy', icon: <Zap className={iconSize} />, label: 'Heavy', sub: 'All day' },
              ] as const).map(({ v, icon, label, sub }) => (
                <OptionCard
                  key={v}
                  value={v}
                  selected={profile.acUsage === v}
                  onSelect={(val: ACUsage) => update('acUsage', val)}
                  icon={icon}
                  label={label}
                  sublabel={sub}
                />
              ))}
            </div>

            <p className="text-sm font-medium mb-3">Monthly electricity bill</p>
            <div className="grid grid-cols-3 gap-3">
              {([
                { v: 'low', label: 'Low', sub: '< ₹500' },
                { v: 'medium', label: 'Medium', sub: '₹500–₹2000' },
                { v: 'high', label: 'High', sub: '> ₹2000' },
              ] as const).map(({ v, label, sub }) => (
                <OptionCard
                  key={v}
                  value={v}
                  selected={profile.electricityRange === v}
                  onSelect={(val: ElectricityRange) => update('electricityRange', val)}
                  icon={<Zap className={iconSize} />}
                  label={label}
                  sublabel={sub}
                />
              ))}
            </div>
          </fieldset>
        )}

        {/* Step 4 — Shopping */}
        {step === 4 && (
          <fieldset>
            <legend className="text-xl font-bold mb-1">Shopping habits</legend>
            <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
              How often do you buy new clothes, gadgets, or non-essentials?
            </p>
            <div className="grid grid-cols-2 gap-3">
              {([
                { v: 'rarely', icon: <ShoppingBag className={iconSize} />, label: 'Rarely', sub: 'A few times a year' },
                { v: 'monthly', icon: <ShoppingBag className={iconSize} />, label: 'Monthly', sub: 'Once a month' },
                { v: 'weekly', icon: <ShoppingBag className={iconSize} />, label: 'Weekly', sub: 'Every week' },
                { v: 'daily', icon: <ShoppingBag className={iconSize} />, label: 'Daily', sub: 'Online every day' },
              ] as const).map(({ v, icon, label, sub }) => (
                <OptionCard
                  key={v}
                  value={v}
                  selected={profile.shoppingFrequency === v}
                  onSelect={(val: ShoppingFrequency) => update('shoppingFrequency', val)}
                  icon={icon}
                  label={label}
                  sublabel={sub}
                />
              ))}
            </div>
          </fieldset>
        )}

        {/* Step 5 — Flights */}
        {step === 5 && (
          <fieldset>
            <legend className="text-xl font-bold mb-1">Air travel</legend>
            <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
              Each domestic round-trip flight emits ~255 kg CO₂
            </p>
            <div>
              <label htmlFor="flights-input" className="block text-sm font-medium mb-3">
                How many round-trip flights do you take per year?
              </label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Plane
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                    style={{ color: 'var(--color-text-muted)' }}
                    aria-hidden="true"
                  />
                  <input
                    id="flights-input"
                    type="number"
                    min={0}
                    max={100}
                    value={profile.flightsPerYear}
                    onChange={(e) =>
                      update('flightsPerYear', Math.max(0, parseInt(e.target.value) || 0))
                    }
                    className="w-36 pl-10 pr-4 py-3 rounded-xl border text-lg font-bold text-center"
                    style={{
                      background: 'var(--color-card)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                    aria-label="Number of round-trip flights per year"
                  />
                </div>
                <span style={{ color: 'var(--color-text-muted)' }}>flights / year</span>
              </div>
              {profile.flightsPerYear > 0 && (
                <p className="mt-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  ≈ {Math.round(profile.flightsPerYear * 255)} kg CO₂ from flights alone
                </p>
              )}
            </div>
          </fieldset>
        )}

        {/* Step 6 — Waste */}
        {step === 6 && (
          <fieldset>
            <legend className="text-xl font-bold mb-1">Waste & recycling</legend>
            <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
              How consistently do you segregate and recycle waste?
            </p>
            <div className="grid grid-cols-3 gap-3">
              {([
                { v: 'always', icon: <Trash2 className={iconSize} />, label: 'Always', sub: 'Diligent recycler' },
                { v: 'sometimes', icon: <Trash2 className={iconSize} />, label: 'Sometimes', sub: 'When convenient' },
                { v: 'never', icon: <Trash2 className={iconSize} />, label: 'Rarely', sub: 'Mixed waste' },
              ] as const).map(({ v, icon, label, sub }) => (
                <OptionCard
                  key={v}
                  value={v}
                  selected={profile.recyclingHabit === v}
                  onSelect={(val: RecyclingHabit) => update('recyclingHabit', val)}
                  icon={icon}
                  label={label}
                  sublabel={sub}
                />
              ))}
            </div>
          </fieldset>
        )}

        {/* Error message */}
        {error && (
          <p
            role="alert"
            className="mt-4 text-sm font-medium"
            style={{ color: 'var(--color-danger)' }}
          >
            {error}
          </p>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1}
          className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all"
          style={{
            background: step === 1 ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)',
            color: step === 1 ? 'var(--color-text-muted)' : 'var(--color-text-secondary)',
            cursor: step === 1 ? 'not-allowed' : 'pointer',
          }}
          aria-label="Go to previous step"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          Back
        </button>

        <button
          onClick={next}
          disabled={saving}
          className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all"
          style={{
            background: 'linear-gradient(135deg, var(--color-forest), var(--color-forest-dark))',
            color: 'white',
            opacity: saving ? 0.7 : 1,
          }}
          aria-label={step === TOTAL_STEPS ? 'Calculate my carbon score' : 'Continue to next step'}
        >
          {saving
            ? 'Calculating...'
            : step === TOTAL_STEPS
              ? 'Calculate My Score'
              : 'Continue'}
          {!saving && <ChevronRight className="w-4 h-4" aria-hidden="true" />}
        </button>
      </div>
    </div>
  );
}
