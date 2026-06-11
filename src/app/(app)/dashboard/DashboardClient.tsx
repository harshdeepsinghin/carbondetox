'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { MessageCircle, Target, RefreshCw } from 'lucide-react';
import { CarbonScoreRing } from '@/components/dashboard/CarbonScoreRing';
import { CategoryCard } from '@/components/dashboard/CategoryCard';
import { TrendChart } from '@/components/dashboard/TrendChart';
import { StreakBadge } from '@/components/dashboard/StreakBadge';
import {
  SkeletonScoreRing,
  SkeletonCard,
} from '@/components/shared/LoadingSkeleton';
import { useUserStore } from '@/stores/userStore';
import { useCarbonScore } from '@/hooks/useCarbonScore';
import { useMissions } from '@/hooks/useMissions';
import type { MissionCategory } from '@/types';

const CATEGORIES: MissionCategory[] = [
  'transport',
  'food',
  'energy',
  'shopping',
  'waste',
];

export default function DashboardClient() {
  const { userData, carbonScore: storeScore } = useUserStore();
  const { carbonScore, scoreHistory, loading: scoreLoading, refresh } = useCarbonScore();
  const { missions, loadMissions } = useMissions();

  useEffect(() => {
    if (userData?.uid) {
      refresh();
      loadMissions(userData.uid);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData?.uid]);

  const score = carbonScore ?? storeScore;
  const completedMissions = missions.filter((m) => m.completed).length;

  return (
    <div className="space-y-8">
      {/* Page header */}
      <header className="flex items-start justify-between">
        <div>
          <h1 className="mb-1">
            Hey, {userData?.name?.split(' ')[0] ?? 'there'} 👋
          </h1>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Here&apos;s your sustainability snapshot
          </p>
        </div>
        <button
          onClick={refresh}
          aria-label="Refresh carbon score"
          className="p-2 rounded-xl transition-colors"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <RefreshCw className="w-5 h-5" aria-hidden="true" />
        </button>
      </header>

      {/* Score + Streak row */}
      <section aria-labelledby="score-section-heading">
        <h2 id="score-section-heading" className="sr-only">Carbon Health Score</h2>
        <div className="glass-card p-8 flex flex-col sm:flex-row items-center gap-8">
          {scoreLoading || !score ? (
            <SkeletonScoreRing />
          ) : (
            <CarbonScoreRing score={score.overall} size={180} />
          )}

          <div className="flex-1 space-y-4">
            {userData && (
              <StreakBadge
                currentStreak={userData.currentStreak}
                longestStreak={userData.longestStreak}
              />
            )}

            {/* XP bar */}
            {userData && (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span style={{ color: 'var(--color-text-muted)' }}>
                    Level {userData.level}
                  </span>
                  <span className="font-mono font-semibold" style={{ color: '#fbbf24' }}>
                    {userData.xp} XP
                  </span>
                </div>
                <div
                  className="w-full rounded-full overflow-hidden"
                  style={{ height: 6, background: 'rgba(255,255,255,0.08)' }}
                  role="progressbar"
                  aria-valuenow={(userData.xp % 100)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`XP progress: ${userData.xp % 100} of 100 to next level`}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${userData.xp % 100}%`,
                      background: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
                    }}
                  />
                </div>
              </div>
            )}

            {/* Mission progress */}
            <div
              className="flex items-center gap-2 text-sm px-3 py-2 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            >
              <Target className="w-4 h-4 shrink-0" style={{ color: 'var(--color-forest-light)' }} aria-hidden="true" />
              <span style={{ color: 'var(--color-text-secondary)' }}>
                Today&apos;s missions:{' '}
                <span className="font-bold" style={{ color: 'var(--color-forest-light)' }}>
                  {completedMissions} of {missions.length} completed
                </span>
              </span>
            </div>

            {/* Quick actions */}
            <div className="flex gap-3">
              <Link
                href="/coach"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{ background: 'var(--color-forest)', color: 'white' }}
              >
                <MessageCircle className="w-4 h-4" aria-hidden="true" />
                Chat with Coach
              </Link>
              <Link
                href="/missions"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border transition-all"
                style={{
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                <Target className="w-4 h-4" aria-hidden="true" />
                View Missions
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Category Cards */}
      <section aria-labelledby="categories-heading">
        <h2 id="categories-heading" className="text-lg font-bold mb-4">
          Category Breakdown
        </h2>
        {!score ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {CATEGORIES.map((c) => <SkeletonCard key={c} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {CATEGORIES.map((cat) => (
              <CategoryCard
                key={cat}
                category={cat}
                score={score[cat]}
              />
            ))}
          </div>
        )}
      </section>

      {/* Trend Chart */}
      <section aria-labelledby="trend-heading">
        <div className="glass-card p-6">
          <h2 id="trend-heading" className="font-bold mb-4">Score Trend (Last 7 Days)</h2>
          <TrendChart scores={scoreHistory} days={7} />
        </div>
      </section>
    </div>
  );
}
