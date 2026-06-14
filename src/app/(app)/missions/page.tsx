'use client';

import { useEffect } from 'react';
import { useUserStore } from '@/stores/userStore';
import { useMissions } from '@/hooks/useMissions';
import { MissionList } from '@/components/missions/MissionList';

export default function MissionsPage() {
  const { userData } = useUserStore();
  const { missions, loading, error, loadMissions, complete } = useMissions();

  useEffect(() => {
    if (userData?.uid) loadMissions(userData.uid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData?.uid]);

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const isGuest = userData?.isAnonymous ?? false;
  const completedCount = missions.filter((m) => m.completed).length;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold mb-1">Today&apos;s Missions</h1>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          {today}
        </p>
      </header>

      {/* Progress */}
      {missions.length > 0 && !loading && (
        <div
          className="flex items-center gap-4 p-4 rounded-xl"
          style={{
            background: 'rgba(22,163,74,0.08)',
            border: '1px solid rgba(22,163,74,0.15)',
          }}
        >
          <div
            className="flex flex-col"
            aria-label={`${completedCount} of ${missions.length} missions completed today`}
          >
            <span
              className="font-bold text-2xl"
              style={{ color: 'var(--color-forest-light)' }}
            >
              {completedCount}/{missions.length}
            </span>
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              completed today
            </span>
          </div>
          <div className="flex-1">
            <div
              className="w-full rounded-full overflow-hidden"
              style={{ height: 8, background: 'rgba(255,255,255,0.08)' }}
              role="progressbar"
              aria-valuenow={completedCount}
              aria-valuemin={0}
              aria-valuemax={missions.length}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${missions.length ? (completedCount / missions.length) * 100 : 0}%`,
                  background: 'var(--color-forest)',
                }}
              />
            </div>
          </div>
        </div>
      )}

      {isGuest && (
        <div
          className="p-4 rounded-xl text-sm text-center"
          style={{
            background: 'rgba(245,158,11,0.08)',
            border: '1px solid rgba(245,158,11,0.2)',
            color: 'var(--color-amber)',
          }}
          role="note"
        >
          🔒 You&apos;re viewing as a guest. Sign in to unlock all 3 missions and save
          progress.
        </div>
      )}

      <MissionList
        missions={missions}
        loading={loading}
        error={error}
        onComplete={complete}
        isGuest={isGuest}
      />
    </div>
  );
}
