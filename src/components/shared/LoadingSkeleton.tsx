/**
 * Reusable loading skeleton components.
 * All skeletons use the shared 'skeleton' CSS class with shimmer animation.
 */

export function SkeletonLine({
  width = '100%',
  height = '1rem',
}: {
  width?: string;
  height?: string;
}) {
  return <div className="skeleton" style={{ width, height }} aria-hidden="true" />;
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`glass-card p-6 space-y-3 ${className}`} aria-hidden="true">
      <SkeletonLine width="60%" height="1.25rem" />
      <SkeletonLine width="100%" height="0.875rem" />
      <SkeletonLine width="80%" height="0.875rem" />
      <SkeletonLine width="40%" height="0.75rem" />
    </div>
  );
}

export function SkeletonScoreRing() {
  return (
    <div
      className="flex flex-col items-center gap-4"
      aria-label="Loading carbon score"
      aria-busy="true"
    >
      <div
        className="skeleton rounded-full"
        style={{ width: 180, height: 180 }}
        aria-hidden="true"
      />
      <SkeletonLine width="120px" height="1rem" />
    </div>
  );
}

export function SkeletonMissionCard() {
  return (
    <div className="glass-card p-5 space-y-4" aria-hidden="true">
      <div className="flex items-start justify-between">
        <SkeletonLine width="70%" height="1.125rem" />
        <SkeletonLine width="60px" height="1.5rem" />
      </div>
      <SkeletonLine width="100%" height="0.875rem" />
      <SkeletonLine width="85%" height="0.875rem" />
      <div className="flex gap-2">
        <SkeletonLine width="70px" height="1.5rem" />
        <SkeletonLine width="60px" height="1.5rem" />
        <SkeletonLine width="50px" height="1.5rem" />
      </div>
      <SkeletonLine width="100%" height="2.75rem" />
    </div>
  );
}

export function SkeletonChatMessage({ align = 'left' }: { align?: 'left' | 'right' }) {
  return (
    <div
      className={`flex gap-3 ${align === 'right' ? 'flex-row-reverse' : ''}`}
      aria-hidden="true"
    >
      <div className="skeleton rounded-full shrink-0" style={{ width: 36, height: 36 }} />
      <div className="flex-1 space-y-2 max-w-xs">
        <SkeletonLine width="100%" height="0.875rem" />
        <SkeletonLine width="75%" height="0.875rem" />
      </div>
    </div>
  );
}
