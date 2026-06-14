'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

/**
 * Toggles between 'dark' and 'light' themes by adding/removing the 'dark' class
 * on <html>. Persists choice in localStorage so it survives page reloads.
 */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Sync with document after mount to avoid hydration mismatch
  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = stored ? stored === 'dark' : prefersDark;
    setIsDark(dark);
    document.documentElement.classList.toggle('dark', dark);
    setMounted(true);
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  }

  // Render a placeholder during SSR to avoid layout shift
  if (!mounted) {
    return (
      <div
        className={`w-9 h-9 rounded-xl ${className}`}
        aria-hidden="true"
      />
    );
  }

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105 ${className}`}
      style={{
        background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
        color: isDark ? 'var(--color-amber)' : 'var(--color-forest)',
        border: '1px solid var(--color-border)',
      }}
    >
      {isDark
        ? <Sun className="w-4 h-4" aria-hidden="true" />
        : <Moon className="w-4 h-4" aria-hidden="true" />
      }
    </button>
  );
}
