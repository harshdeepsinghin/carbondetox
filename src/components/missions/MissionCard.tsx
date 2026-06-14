'use client';

import { CheckCircle2 } from 'lucide-react';
import type { UserMission } from '@/types';
import { formatCO2Saved } from '@/lib/utils/co2Formatter';

interface MissionCardProps {
  mission: UserMission;
  onComplete: (mission: UserMission) => Promise<void>;
  blurred?: boolean;
}

const CATEGORY_COLORS: Record<UserMission['category'], string> = {
  transport: '#3b82f6',
  food: '#f97316',
  energy: '#f59e0b',
  shopping: '#a855f7',
  waste: '#22c55e',
};

const DIFFICULTY_COLORS: Record<UserMission['difficulty'], string> = {
  easy: '#22c55e',
  medium: '#f59e0b',
  hard: '#ef4444',
};

/**
 * Mission card showing title, description, badges, and completion button.
 * Completed state: green checkmark header, muted colors, disabled button.
 */
export function MissionCard({ mission, onComplete, blurred = false }: MissionCardProps) {
  const categoryColor = CATEGORY_COLORS[mission.category];
  const difficultyColor = DIFFICULTY_COLORS[mission.difficulty];

  return (
    <article
      className="glass-card flex flex-col overflow-hidden transition-all"
      style={{
        filter: blurred ? 'blur(4px)' : undefined,
        pointerEvents: blurred ? 'none' : undefined,
        opacity: mission.completed ? 0.75 : 1,
        borderColor: mission.completed ? 'rgba(22,163,74,0.3)' : 'rgba(255,255,255,0.06)',
      }}
      aria-label={`Mission: ${mission.title}${mission.completed ? ', completed' : ''}`}
    >
      {/* Completed header stripe */}
      {mission.completed && (
        <div
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium"
          style={{
            background: 'rgba(22,163,74,0.15)',
            color: 'var(--color-forest-light)',
          }}
          aria-live="polite"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
          Completed!
        </div>
      )}

      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Title */}
        <h3 className="font-bold text-base leading-snug">{mission.title}</h3>

        {/* Description */}
        <p
          className="text-sm leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {mission.description}
        </p>

        {/* Badge row */}
        <div className="flex flex-wrap gap-1.5">
          {/* Category */}
          <span
            className="px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
            style={{
              background: `${categoryColor}18`,
              color: categoryColor,
              border: `1px solid ${categoryColor}30`,
            }}
          >
            {mission.category}
          </span>

          {/* Difficulty */}
          <span
            className="px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
            style={{
              background: `${difficultyColor}18`,
              color: difficultyColor,
              border: `1px solid ${difficultyColor}30`,
            }}
          >
            {mission.difficulty}
          </span>

          {/* XP */}
          <span
            className="px-2.5 py-0.5 rounded-full text-xs font-medium"
            style={{
              background: 'rgba(251,191,36,0.12)',
              color: '#fbbf24',
              border: '1px solid rgba(251,191,36,0.25)',
            }}
          >
            +{mission.xp} XP
          </span>

          {/* CO₂ saved */}
          {mission.co2Saved > 0 && (
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-medium"
              style={{
                background: 'rgba(22,163,74,0.1)',
                color: 'var(--color-forest-light)',
                border: '1px solid rgba(22,163,74,0.2)',
              }}
            >
              🌿 {formatCO2Saved(mission.co2Saved)}
            </span>
          )}
        </div>
      </div>

      {/* Complete button */}
      <div className="px-5 pb-5">
        <button
          onClick={() => !mission.completed && onComplete(mission)}
          disabled={mission.completed}
          aria-label={
            mission.completed
              ? `${mission.title} — already completed`
              : `Mark ${mission.title} as complete and earn ${mission.xp} XP`
          }
          className="w-full py-3 rounded-xl font-semibold text-sm transition-all"
          style={{
            background: mission.completed ? 'rgba(22,163,74,0.1)' : 'var(--color-forest)',
            color: mission.completed ? 'var(--color-forest-light)' : 'white',
            cursor: mission.completed ? 'default' : 'pointer',
          }}
        >
          {mission.completed ? '✓ Done' : 'Mark Complete'}
        </button>
      </div>
    </article>
  );
}
