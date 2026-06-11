'use client';

import { useEffect } from 'react';
import { useCarbonScore } from '@/hooks/useCarbonScore';
import { useUserStore } from '@/stores/userStore';
import { TrendChart } from '@/components/dashboard/TrendChart';
import { CategoryCard } from '@/components/dashboard/CategoryCard';
import { StreakBadge } from '@/components/dashboard/StreakBadge';
import { SkeletonCard } from '@/components/shared/LoadingSkeleton';
import type { MissionCategory } from '@/types';

const CATEGORIES: MissionCategory[] = [
  'transport',
  'food',
  'energy',
  'shopping',
  'waste',
];

const BADGES = [
  { id: 'first-mission', label: 'First Step', emoji: '🌱', description: 'Completed your first mission' },
  { id: 'week-streak', label: 'Week Warrior', emoji: '🔥', description: '7-day streak' },
  { id: 'month-streak', label: 'Habit Maker', emoji: '⚡', description: '30-day streak' },
  { id: 'high-score', label: 'Green Champion', emoji: '🏆', description: 'Score above 80' },
  { id: 'scanner', label: 'Smart Shopper', emoji: '🛒', description: 'Used the receipt scanner' },
  { id: 'coach-10', label: 'Curious Mind', emoji: '💬', description: 'Sent 10 messages to the coach' },
];

export default function ProgressPage() {
  const { userData } = useUserStore();
  const { carbonScore, scoreHistory, loading, refresh } = useCarbonScore();

  useEffect(() => {
    refresh();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold mb-1">Your Progress</h1>
        <p style={{ color: 'var(--color-text-muted)' }} className="text-sm">
          Track your sustainability journey over time
        </p>
      </header>

      {/* Streak section */}
      {userData && (
        <section aria-labelledby="streak-heading">
          <h2 id="streak-heading" className="font-bold text-lg mb-4">Streak</h2>
          <div className="glass-card p-6">
            <StreakBadge
              currentStreak={userData.currentStreak}
              longestStreak={userData.longestStreak}
            />
          </div>
        </section>
      )}

      {/* 30-day trend */}
      <section aria-labelledby="trend-heading">
        <h2 id="trend-heading" className="font-bold text-lg mb-4">Score Trend (Last 30 Days)</h2>
        <div className="glass-card p-6">
          {loading ? (
            <div className="skeleton h-36 rounded-xl" aria-hidden="true" />
          ) : (
            <TrendChart scores={scoreHistory} days={30} />
          )}
        </div>
      </section>

      {/* Category performance */}
      <section aria-labelledby="categories-heading">
        <h2 id="categories-heading" className="font-bold text-lg mb-4">Current Category Scores</h2>
        {!carbonScore ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {CATEGORIES.map((c) => <SkeletonCard key={c} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {CATEGORIES.map((cat) => (
              <CategoryCard key={cat} category={cat} score={carbonScore[cat]} />
            ))}
          </div>
        )}
      </section>

      {/* Badges */}
      <section aria-labelledby="badges-heading">
        <h2 id="badges-heading" className="font-bold text-lg mb-4">Badges</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {BADGES.map((badge) => {
            const earned = userData?.badges?.includes(badge.id) ?? false;
            return (
              <div
                key={badge.id}
                className="glass-card p-4 flex items-center gap-3 transition-all"
                style={{
                  opacity: earned ? 1 : 0.45,
                  filter: earned ? 'none' : 'grayscale(80%)',
                }}
                aria-label={`${badge.label}${earned ? ' — earned' : ' — locked'}: ${badge.description}`}
              >
                <span className="text-2xl" aria-hidden="true">{badge.emoji}</span>
                <div>
                  <p className="font-semibold text-sm">{badge.label}</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {badge.description}
                  </p>
                </div>
                {!earned && (
                  <span className="ml-auto text-lg" aria-hidden="true">🔒</span>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
