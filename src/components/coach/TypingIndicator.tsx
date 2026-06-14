'use client';

/**
 * Three bouncing dots indicating the AI coach is typing.
 * Reduced motion: falls back to a static indicator.
 */
export function TypingIndicator() {
  return (
    <div
      className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-bl-sm w-fit"
      style={{
        background: 'rgba(22,163,74,0.12)',
        border: '1px solid rgba(22,163,74,0.2)',
      }}
      role="status"
      aria-label="Coach is typing"
      aria-live="polite"
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="rounded-full"
          style={{
            width: 7,
            height: 7,
            background: 'var(--color-forest-light)',
            display: 'block',
            animation: `bounce-dot 1.2s ${i * 0.2}s infinite ease-in-out`,
          }}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}
