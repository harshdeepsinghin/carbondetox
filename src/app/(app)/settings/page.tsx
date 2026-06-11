'use client';

import { useRouter } from 'next/navigation';
import { LogOut, RefreshCw, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserStore } from '@/stores/userStore';

export default function SettingsPage() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { userData, profile } = useUserStore();

  async function handleSignOut() {
    await signOut();
    router.replace('/');
  }

  return (
    <div className="space-y-6 max-w-xl">
      <header>
        <h1 className="text-2xl font-bold mb-1">Settings</h1>
        <p style={{ color: 'var(--color-text-muted)' }} className="text-sm">
          Manage your account and profile
        </p>
      </header>

      {/* Account section */}
      <section aria-labelledby="account-heading" className="glass-card p-6 space-y-4">
        <h2 id="account-heading" className="font-bold">Account</h2>
        {userData && (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span style={{ color: 'var(--color-text-muted)' }}>Name</span>
              <span>{userData.name}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--color-text-muted)' }}>Email</span>
              <span>{userData.email ?? (userData.isAnonymous ? 'Guest account' : '—')}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--color-text-muted)' }}>Account type</span>
              <span>{userData.isAnonymous ? 'Guest' : 'Google'}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--color-text-muted)' }}>XP</span>
              <span className="font-mono font-bold" style={{ color: '#fbbf24' }}>{userData.xp} XP</span>
            </div>
          </div>
        )}
      </section>

      {/* Profile section */}
      <section aria-labelledby="profile-heading" className="glass-card p-6 space-y-4">
        <h2 id="profile-heading" className="font-bold">Carbon Profile</h2>
        {profile && (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span style={{ color: 'var(--color-text-muted)' }}>Diet</span>
              <span className="capitalize">{profile.diet}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--color-text-muted)' }}>Transport</span>
              <span className="capitalize">{profile.transportMode} — {profile.commuteDistance}km</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--color-text-muted)' }}>Location</span>
              <span className="capitalize">{profile.locationType}</span>
            </div>
          </div>
        )}
        <button
          onClick={() => router.push('/onboarding')}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold border transition-all text-sm"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
        >
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
          Update Assessment
        </button>
      </section>

      {/* Privacy */}
      <section aria-labelledby="privacy-heading" className="glass-card p-6 space-y-2">
        <h2 id="privacy-heading" className="font-bold flex items-center gap-2">
          <Shield className="w-4 h-4" aria-hidden="true" style={{ color: 'var(--color-forest-light)' }} />
          Privacy
        </h2>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Your data stays private and is stored securely on Firebase. We never sell, share, or monetise your personal information.
        </p>
      </section>

      {/* Sign out */}
      <button
        onClick={handleSignOut}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all"
        style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--color-danger)', border: '1px solid rgba(239,68,68,0.2)' }}
      >
        <LogOut className="w-4 h-4" aria-hidden="true" />
        Sign Out
      </button>
    </div>
  );
}
