'use client';

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
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserStore } from '@/stores/userStore';
import { ThemeToggle } from './ThemeToggle';

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/coach', icon: MessageCircle, label: 'AI Coach' },
  { href: '/missions', icon: Target, label: 'Missions' },
  { href: '/progress', icon: TrendingUp, label: 'Progress' },
  { href: '/scanner', icon: ScanLine, label: 'Scanner' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

/**
 * Desktop sidebar with navigation links, user info, and sign-out.
 * Hidden on mobile (handled by Navbar).
 */
export function Sidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const { userData, carbonScore } = useUserStore();

  return (
    <aside
      className="hidden lg:flex flex-col h-screen w-64 fixed left-0 top-0 z-20 border-r"
      style={{
        background: 'var(--color-surface-2)',
        borderColor: 'var(--color-border)',
      }}
      aria-label="Main navigation"
    >
      {/* Logo + Theme Toggle */}
      <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-border)' }}>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 no-underline"
          aria-label="CarbonDetox home"
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--color-forest)' }}
            aria-hidden="true"
          >
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg gradient-text">CarbonDetox</span>
        </Link>
        <ThemeToggle />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1" aria-label="App sections">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? 'page' : undefined}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium"
              style={{
                background: isActive
                  ? 'rgba(22, 163, 74, 0.15)'
                  : 'transparent',
                color: isActive
                  ? 'var(--color-forest-light)'
                  : 'var(--color-text-secondary)',
                border: isActive
                  ? '1px solid rgba(22, 163, 74, 0.3)'
                  : '1px solid transparent',
              }}
            >
              <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile + Score */}
      {userData && (
        <div
          className="p-4 border-t space-y-3"
          style={{ borderColor: 'var(--color-border)' }}
        >
          {carbonScore && (
            <div
              className="flex items-center justify-between px-4 py-2 rounded-xl"
              style={{ background: 'rgba(22, 163, 74, 0.1)' }}
            >
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                Carbon Score
              </span>
              <span
                className="font-mono font-bold text-sm"
                style={{ color: 'var(--color-forest-light)' }}
              >
                {carbonScore.overall}/100
              </span>
            </div>
          )}
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
              style={{
                background: 'var(--color-forest)',
                color: 'white',
              }}
              aria-hidden="true"
            >
              {userData.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{userData.name}</p>
              <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                {userData.isAnonymous ? 'Guest' : userData.email}
              </p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-2 w-full px-4 py-2 rounded-xl text-sm transition-all"
            style={{ color: 'var(--color-text-muted)' }}
            aria-label="Sign out of CarbonDetox"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
            Sign out
          </button>
        </div>
      )}
    </aside>
  );
}
