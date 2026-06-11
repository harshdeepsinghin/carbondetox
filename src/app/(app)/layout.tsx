'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Leaf } from 'lucide-react';
import { Sidebar } from '@/components/shared/Sidebar';
import { Navbar } from '@/components/shared/Navbar';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { useAuth } from '@/hooks/useAuth';
import { useUserStore } from '@/stores/userStore';
import { getProfile } from '@/lib/firebase/firestore';

/**
 * Protected layout wrapping all /dashboard /coach /missions /progress /scanner /settings pages.
 * Redirects unauthenticated users to /login.
 * Redirects users who haven't completed onboarding to /onboarding.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { setProfile, profile } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    // Fetch profile if not in store
    if (!profile) {
      getProfile(user.uid).then((p) => {
        if (!p?.completedOnboarding) {
          router.replace('/onboarding');
        } else {
          setProfile(p);
        }
      });
    }
  }, [user, loading, profile, router, setProfile]);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--color-surface)' }}
        role="status"
        aria-live="polite"
        aria-label="Loading CarbonDetox"
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(22,163,74,0.15)' }}
            aria-hidden="true"
          >
            <Leaf className="w-6 h-6 animate-pulse" style={{ color: 'var(--color-forest-light)' }} />
          </div>
          <p style={{ color: 'var(--color-text-muted)' }}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null; // Will redirect via useEffect

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen" style={{ background: 'var(--color-surface)' }}>
        {/* Desktop sidebar */}
        <Sidebar />

        {/* Mobile navbar */}
        <Navbar />

        {/* Main content area */}
        <main
          className="flex-1 lg:ml-64 pt-16 lg:pt-0 min-h-screen"
          id="main-content"
        >
          <div className="max-w-5xl mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}
