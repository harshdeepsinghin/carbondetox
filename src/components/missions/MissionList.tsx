'use client';

import { MissionCard } from './MissionCard';
import { SkeletonMissionCard } from '@/components/shared/LoadingSkeleton';
import type { UserMission } from '@/types';

interface MissionListProps {
  missions: UserMission[];
  loading: boolean;
  error: string | null;
  onComplete: (mission: UserMission) => Promise<void>;
  isGuest?: boolean;
}

/**
 * Renders the list of daily missions.
 * Guest users see the first mission and blurred overlays for the rest.
 */
export function MissionList({
  missions,
  loading,
  error,
  onComplete,
  isGuest = false,
}: MissionListProps) {
  if (loading) {
    return (
      <section aria-label="Loading missions" aria-busy="true">
        <p
          className="text-sm mb-4 animate-pulse"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Generating your missions with AI...
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <SkeletonMissionCard key={i} />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="glass-card p-6 text-center"
        style={{ borderColor: 'rgba(239,68,68,0.3)' }}
      >
        <p className="font-semibold mb-1">Could not load missions</p>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          {error}
        </p>
      </div>
    );
  }

  if (missions.length === 0) return null;

  return (
    <section aria-label="Today's sustainability missions">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {missions.map((mission, idx) => (
          <div key={mission.missionId} className="relative">
            <MissionCard
              mission={mission}
              onComplete={onComplete}
              blurred={isGuest && idx > 0}
            />
            {/* Guest lock overlay */}
            {isGuest && idx > 0 && (
              <div
                className="absolute inset-0 flex items-center justify-center rounded-xl"
                style={{ background: 'rgba(15,23,42,0.75)' }}
                aria-label="Sign in to unlock this mission"
              >
                <div className="text-center p-4">
                  <p className="text-lg mb-1">🔒</p>
                  <p className="font-semibold text-sm">Sign in for all missions</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
