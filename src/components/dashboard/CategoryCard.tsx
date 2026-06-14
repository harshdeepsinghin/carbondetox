'use client';

import { Zap, Car, Utensils, Bolt, ShoppingBag, Trash2 } from 'lucide-react';
import type { MissionCategory } from '@/types';

interface CategoryCardProps {
  category: MissionCategory;
  score: number;
  className?: string;
}

const CATEGORY_CONFIG: Record<
  MissionCategory,
  { label: string; icon: React.ElementType; color: string; bg: string }
> = {
  transport: {
    label: 'Transport',
    icon: Car,
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.1)',
  },
  food: {
    label: 'Food',
    icon: Utensils,
    color: '#f97316',
    bg: 'rgba(249,115,22,0.1)',
  },
  energy: {
    label: 'Energy',
    icon: Bolt,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.1)',
  },
  shopping: {
    label: 'Shopping',
    icon: ShoppingBag,
    color: '#a855f7',
    bg: 'rgba(168,85,247,0.1)',
  },
  waste: {
    label: 'Waste',
    icon: Trash2,
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.1)',
  },
};

function getAssessment(score: number): { label: string; color: string } {
  if (score >= 80) return { label: 'Excellent', color: '#22c55e' };
  if (score >= 60) return { label: 'Good', color: '#84cc16' };
  if (score >= 40) return { label: 'Fair', color: '#f59e0b' };
  if (score >= 20) return { label: 'Needs Work', color: '#f97316' };
  return { label: 'Critical', color: '#ef4444' };
}

/**
 * Card showing a category's name, icon, score bar, and assessment label.
 * Color + icon ensure status is never conveyed by color alone (WCAG 1.4.1).
 */
export function CategoryCard({ category, score, className = '' }: CategoryCardProps) {
  const config = CATEGORY_CONFIG[category];
  const assessment = getAssessment(score);
  const Icon = config.icon;

  return (
    <article
      className={`glass-card p-4 flex flex-col gap-3 transition-all hover:scale-[1.01] ${className}`}
      aria-label={`${config.label}: score ${score} out of 100, ${assessment.label}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: config.bg }}
            aria-hidden="true"
          >
            <Icon className="w-4 h-4" style={{ color: config.color }} />
          </div>
          <span className="font-semibold text-sm">{config.label}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-mono font-bold text-lg" style={{ color: config.color }}>
            {score}
          </span>
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            /100
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div
          className="w-full rounded-full overflow-hidden"
          style={{ height: 6, background: 'rgba(255,255,255,0.08)' }}
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${config.label} score: ${score}%`}
        >
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${score}%`,
              background: config.color,
              boxShadow: `0 0 6px ${config.color}60`,
            }}
          />
        </div>
      </div>

      {/* Assessment text + icon */}
      <div className="flex items-center gap-1.5">
        <Zap
          className="w-3 h-3 shrink-0"
          style={{ color: assessment.color }}
          aria-hidden="true"
        />
        <span className="text-xs font-medium" style={{ color: assessment.color }}>
          {assessment.label}
        </span>
      </div>
    </article>
  );
}
