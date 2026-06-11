'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Leaf } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getProfile } from '@/lib/firebase/firestore';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, signInWithGoogle, signInAnonymously, error } = useAuth();
  const isGuestMode = searchParams.get('guest') === 'true';

  useEffect(() => {
    if (loading || !user) return;

    async function redirect() {
      if (!user) return;
      const profile = await getProfile(user.uid);
      if (profile?.completedOnboarding) {
        router.replace('/dashboard');
      } else {
        router.replace('/onboarding');
      }
    }
    redirect();
  }, [user, loading, router]);

  // Auto-trigger guest login if coming from "Try as Guest" CTA
  useEffect(() => {
    if (isGuestMode && !user && !loading) {
      signInAnonymously();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGuestMode, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-surface)' }}>
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center animate-pulse"
            style={{ background: 'rgba(22,163,74,0.2)' }}
            aria-hidden="true"
          >
            <Leaf className="w-6 h-6" style={{ color: 'var(--color-forest-light)' }} />
          </div>
          <p style={{ color: 'var(--color-text-muted)' }} role="status" aria-live="polite">
            Signing you in...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: 'var(--color-surface)' }}
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(22,163,74,0.08) 0%, transparent 70%)',
        }}
      />

      <main className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(22,163,74,0.15)', border: '1px solid rgba(22,163,74,0.3)' }}
            aria-hidden="true"
          >
            <Leaf className="w-8 h-8" style={{ color: 'var(--color-forest-light)' }} />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            Welcome to <span className="gradient-text">CarbonDetox</span>
          </h1>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Sign in to get your personalised carbon health score
          </p>
        </div>

        <div className="glass-card p-8 space-y-4">
          {/* Error state */}
          {error && (
            <div
              role="alert"
              className="p-3 rounded-xl text-sm text-center"
              style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--color-danger)', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              {error}
            </div>
          )}

          {/* Google Sign In */}
          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-xl font-semibold transition-all hover:scale-[1.01]"
            style={{
              background: 'white',
              color: '#1f2937',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}
          >
            {/* Google G icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} aria-hidden="true" />
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>or</span>
            <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} aria-hidden="true" />
          </div>

          {/* Guest Sign In */}
          <button
            onClick={signInAnonymously}
            className="w-full py-4 rounded-xl font-semibold border transition-all hover:scale-[1.01]"
            style={{
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-secondary)',
              background: 'rgba(255,255,255,0.03)',
            }}
          >
            Try as Guest
          </button>

          <p className="text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>
            Guest data is stored locally only. Sign in with Google to save your progress.
          </p>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
