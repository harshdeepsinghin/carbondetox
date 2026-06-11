'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useUserStore } from '@/stores/userStore';

export default function ScannerPage() {
  const { userData } = useUserStore();
  const isGuest = userData?.isAnonymous ?? true;

  return (
    <div className="space-y-6 max-w-2xl">
      <header>
        <h1 className="text-2xl font-bold mb-1">Receipt Scanner</h1>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Upload a grocery or shopping bill for an AI carbon analysis
        </p>
      </header>
      {isGuest && (
        <div className="p-5 rounded-xl text-center" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <p className="font-semibold mb-1">🔒 Sign in to use the Receipt Scanner</p>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Scanner requires an account to save results.</p>
        </div>
      )}
      {!isGuest && (
        <div className="glass-card p-10 text-center" style={{ color: 'var(--color-text-muted)' }}>
          <p className="text-lg mb-2">📸</p>
          <p>Scanner UI coming soon — upload area is functional via API.</p>
        </div>
      )}
    </div>
  );
}
