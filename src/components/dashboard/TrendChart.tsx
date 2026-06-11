'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import type { CarbonScore } from '@/types';

interface TrendChartProps {
  scores: CarbonScore[];
  days?: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="glass-card px-3 py-2 text-sm"
      role="tooltip"
    >
      <p style={{ color: 'var(--color-text-muted)' }} className="text-xs">{label}</p>
      <p className="font-bold" style={{ color: '#22c55e' }}>
        Score: {payload[0].value}
      </p>
    </div>
  );
}

/**
 * Line chart showing carbon score history.
 * Uses Recharts with custom tooltip and accessible role="img".
 */
export function TrendChart({ scores, days = 7 }: TrendChartProps) {
  const recentScores = [...scores]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-days);

  const data = recentScores.map((s) => ({
    date: s.date.slice(5), // MM-DD format
    score: s.overall,
  }));

  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center h-32"
        style={{ color: 'var(--color-text-muted)' }}
      >
        <p className="text-sm">No history yet — check back tomorrow!</p>
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={`Carbon score trend over last ${days} days. Latest score: ${data[data.length - 1]?.score ?? 'N/A'}`}
    >
      <ResponsiveContainer width="100%" height={140}>
        <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.06)"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#22c55e"
            strokeWidth={2.5}
            dot={{ r: 3, fill: '#22c55e', strokeWidth: 0 }}
            activeDot={{ r: 5, fill: '#22c55e', strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
