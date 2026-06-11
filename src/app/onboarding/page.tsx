'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Leaf } from 'lucide-react';
import { AssessmentStepper } from '@/components/onboarding/AssessmentStepper';
import { useAuth } from '@/hooks/useAuth';
import { useUserStore } from '@/stores/userStore';
import {
  saveProfile,
  saveCarbonScore,
} from '@/lib/firebase/firestore';
import { calculateCarbonScore } from '@/lib/scoring/carbonScore';
import type { UserProfile } from '@/types';
import { toast } from 'sonner';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { setProfile, setCarbonScore } = useUserStore();

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  async function handleOnboardingComplete(
    partialProfile: Omit<UserProfile, 'uid' | 'completedOnboarding' | 'updatedAt'>,
  ) {
    if (!user) return;

    const profile: UserProfile = {
      ...partialProfile,
      uid: user.uid,
      completedOnboarding: true,
      updatedAt: new Date().toISOString(),
    };

    try {
      // Calculate score
      const score = calculateCarbonScore(profile);

      // Save to Firestore (or localStorage for guests without network)
      await saveProfile(profile);
      await saveCarbonScore(score);

      // Update store
      setProfile(profile);
      setCarbonScore(score);

      toast.success(`Your Carbon Score: ${score.overall}/100 🌿`);
      router.replace('/dashboard');
    } catch {
      toast.error('Failed to save your profile. Please try again.');
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-surface)' }}>
        <div role="status" aria-live="polite" className="flex items-center gap-3" style={{ color: 'var(--color-text-muted)' }}>
          <Leaf className="w-5 h-5 animate-pulse" aria-hidden="true" />
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen py-12 px-6"
      style={{ background: 'var(--color-surface)' }}
    >
      {/* Background glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: 'radial-gradient(ellipse 70% 40% at 50% 0%, rgba(22,163,74,0.07) 0%, transparent 60%)',
        }}
      />

      <div className="relative max-w-2xl mx-auto">
        {/* Header */}
        <header className="text-center mb-10">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(22,163,74,0.12)' }}
            aria-hidden="true"
          >
            <Leaf className="w-7 h-7" style={{ color: 'var(--color-forest-light)' }} />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            Let&apos;s build your{' '}
            <span className="gradient-text">Carbon Profile</span>
          </h1>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Answer 6 quick questions to get your personalised carbon health score
          </p>
        </header>

        <AssessmentStepper
          uid={user.uid}
          onComplete={handleOnboardingComplete}
        />

        <p className="text-center text-xs mt-8" style={{ color: 'var(--color-text-muted)' }}>
          Your data is private and stored securely. We never sell or share it.
        </p>
      </div>
    </div>
  );
}
