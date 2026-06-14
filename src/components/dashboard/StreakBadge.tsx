'use client';

import { Flame } from 'lucide-react';

interface StreakBadgeProps {
  currentStreak: number;
  longestStreak: number;
}

/**
 * Displays the current streak with a flame icon.
 * Color intensifies based on streak length.
 * Accessible: flame icon is aria-hidden, text provides context.
 */
export function StreakBadge({ currentStreak, longestStreak }: StreakBadgeProps) {
  const isHot = currentStreak >= 7;
  const flameColor = isHot ? '#ef4444' : currentStreak >= 3 ? '#f97316' : '#f59e0b';

  return (
    <div
      className="flex flex-col gap-1"
      aria-label={`Current streak: ${currentStreak} day${currentStreak !== 1 ? 's' : ''}. Longest streak: ${longestStreak} days.`}
    >
      <div className="flex items-center gap-2">
        <Flame
          className="w-6 h-6 transition-colors"
          style={{ color: flameColor }}
          aria-hidden="true"
        />
        <span className="font-mono font-bold text-2xl" style={{ color: flameColor }}>
          {currentStreak}
        </span>
        <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          day streak
        </span>
      </div>
      {longestStreak > 0 && (
        <p className="text-xs pl-8" style={{ color: 'var(--color-text-muted)' }}>
          Best: {longestStreak} days 🏆
        </p>
      )}
    </div>
  );
}
