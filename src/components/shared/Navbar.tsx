'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MessageCircle,
  Target,
  TrendingUp,
  ScanLine,
  Settings,
  Leaf,
  Menu,
  X,
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/coach', icon: MessageCircle, label: 'Coach' },
  { href: '/missions', icon: Target, label: 'Missions' },
  { href: '/progress', icon: TrendingUp, label: 'Progress' },
  { href: '/scanner', icon: ScanLine, label: 'Scanner' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

/**
 * Mobile top navbar with hamburger menu drawer.
 * Shown only on small screens (lg:hidden).
 */
export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header
        className="lg:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 border-b"
        style={{
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(10px)',
          borderColor: 'var(--color-border)',
        }}
      >
        <Link
          href="/dashboard"
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

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <Menu className="w-6 h-6" aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* Drawer overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          id="mobile-menu"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.6)' }}
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <nav
            className="absolute right-0 top-0 bottom-0 w-72 p-6 flex flex-col gap-2"
            style={{
              background: 'var(--color-surface-2)',
              borderLeft: '1px solid var(--color-border)',
            }}
          >
            <button
              onClick={() => setOpen(false)}
              aria-label="Close navigation menu"
              className="self-end p-2 rounded-lg mb-4"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>

            {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive ? 'page' : undefined}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium"
                  style={{
                    background: isActive ? 'rgba(22,163,74,0.15)' : 'transparent',
                    color: isActive
                      ? 'var(--color-forest-light)'
                      : 'var(--color-text-secondary)',
                    border: isActive
                      ? '1px solid rgba(22,163,74,0.3)'
                      : '1px solid transparent',
                  }}
                >
                  <Icon className="w-5 h-5" aria-hidden="true" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </>
  );
}
