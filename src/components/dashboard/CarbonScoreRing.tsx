'use client';

import { useEffect, useRef } from 'react';

interface CarbonScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  animated?: boolean;
}

/** Map score to color */
function scoreColor(score: number): string {
  if (score >= 70) return '#22c55e'; // green
  if (score >= 40) return '#f59e0b'; // amber
  return '#ef4444'; // red
}

/** Map score to label */
function scoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  if (score >= 20) return 'Needs Work';
  return 'Critical';
}

/**
 * SVG-based circular progress ring showing carbon health score.
 * Animates stroke-dashoffset on mount for a satisfying reveal.
 *
 * Accessibility: uses role="img" with aria-label describing the score.
 */
export function CarbonScoreRing({
  score,
  size = 200,
  strokeWidth = 14,
  animated = true,
}: CarbonScoreRingProps) {
  const circleRef = useRef<SVGCircleElement>(null);
  const center = size / 2;
  const radius = center - strokeWidth / 2 - 4;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = scoreColor(score);

  useEffect(() => {
    if (!animated || !circleRef.current) return;
    const el = circleRef.current;
    el.style.strokeDashoffset = String(circumference);
    const timer = setTimeout(() => {
      el.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)';
      el.style.strokeDashoffset = String(offset);
    }, 100);
    return () => clearTimeout(timer);
  }, [score, circumference, offset, animated]);

  return (
    <div
      className="relative inline-flex flex-col items-center gap-2"
      role="img"
      aria-label={`Carbon Health Score: ${score} out of 100, ${scoreLabel(score)}`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="glow-green"
        aria-hidden="true"
      >
        {/* Background track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />

        {/* Score arc — starts at top (rotate -90deg) */}
        <circle
          ref={circleRef}
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animated ? circumference : offset}
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: 'center',
            filter: `drop-shadow(0 0 6px ${color}80)`,
          }}
        />

        <text
          x={center}
          y={center - 8}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={size * 0.2}
          fontWeight="800"
          fontFamily="'Inter', monospace"
          fill="currentColor"
          className="text-[var(--color-text-primary)]"
        >
          {score}
        </text>

        {/* /100 label */}
        <text
          x={center}
          y={center + size * 0.14}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={size * 0.07}
          fontWeight="500"
          fill="currentColor"
          className="text-[var(--color-text-secondary)]"
        >
          / 100
        </text>
      </svg>

      {/* Label below ring */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-sm font-semibold" style={{ color }}>
          {scoreLabel(score)}
        </span>
        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          Carbon Health Score
        </span>
      </div>
    </div>
  );
}
