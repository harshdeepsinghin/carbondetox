'use client';

import Link from 'next/link';
import { Leaf } from 'lucide-react';
import { ThemeToggle } from '@/components/shared/ThemeToggle';

/**
 * Landing page header/nav — separated into its own client component
 * so the ThemeToggle (which needs localStorage) can be rendered client-side
 * while the rest of the landing page stays a server component.
 */
export function LandingNav() {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-10 px-6 py-4 border-b"
      style={{
        background: 'rgba(var(--color-surface-rgb, 15,23,42), 0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderColor: 'var(--color-border)',
        backgroundColor: 'color-mix(in srgb, var(--color-surface) 92%, transparent)',
      }}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 no-underline"
          aria-label="CarbonDetox home"
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--color-forest)' }}
            aria-hidden="true"
          >
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold gradient-text">CarbonDetox</span>
        </Link>

        <nav aria-label="Site navigation" className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/login"
            className="px-5 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
            style={{
              background: 'var(--color-forest)',
              color: 'white',
            }}
          >
            Get Started
          </Link>
        </nav>
      </div>
    </header>
  );
}
