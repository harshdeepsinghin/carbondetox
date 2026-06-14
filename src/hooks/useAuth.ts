'use client';

import { useState, useEffect, useCallback } from 'react';
import type { User } from 'firebase/auth';
import {
  signInWithGoogle,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  getGoogleRedirectResult,
} from '@/lib/firebase/auth';
import { saveUserData, getUserData } from '@/lib/firebase/firestore';
import { useUserStore } from '@/stores/userStore';
import type { UserData } from '@/types';

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInAnonymously: () => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
}

/**
 * Hook for managing Firebase authentication state.
 * On first login, creates a user document in Firestore.
 * Handles Google popup (localhost) / redirect (deployed) and anonymous flows.
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setUserData, clearStore } = useUserStore();

  // Capture pending redirect result on mount (Google redirect sign-in on prod)
  useEffect(() => {
    getGoogleRedirectResult().catch(() => {
      // Errors handled silently; auth state listener will pick up the user
    });
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await handleUserLogin(firebaseUser);
      } else {
        setUser(null);
        clearStore();
      }
      setLoading(false);
    });

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Create or update the user document on auth state change. */
  async function handleUserLogin(firebaseUser: User): Promise<void> {
    try {
      const existing = await getUserData(firebaseUser.uid);
      const now = new Date().toISOString();
      const today = now.slice(0, 10);

      const userData: UserData = {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName ?? (firebaseUser.isAnonymous ? 'Guest' : 'User'),
        email: firebaseUser.email,
        avatar: firebaseUser.photoURL,
        isAnonymous: firebaseUser.isAnonymous,
        xp: existing?.xp ?? 0,
        level: existing?.level ?? 1,
        badges: existing?.badges ?? [],
        currentStreak: existing?.currentStreak ?? 0,
        longestStreak: existing?.longestStreak ?? 0,
        lastActiveDate: existing?.lastActiveDate ?? today,
        createdAt: existing?.createdAt ?? now,
        lastLogin: now,
      };

      await saveUserData(userData);
      setUserData(userData);
    } catch {
      // Non-fatal: continue even if Firestore write fails
    }
  }

  const handleGoogleSignIn = useCallback(async () => {
    setError(null);
    try {
      await signInWithGoogle();
      // On deployed domains this initiates a redirect (page leaves);
      // on localhost the popup resolves directly via onAuthStateChanged.
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sign-in failed';
      // Translate common Firebase error codes to human-readable messages
      if (msg.includes('auth/unauthorized-domain')) {
        setError('This domain is not authorised. Please sign in at the official site.');
      } else if (msg.includes('auth/operation-not-allowed')) {
        setError('Google sign-in is not yet configured. Please try guest access.');
      } else if (msg.includes('auth/popup-blocked')) {
        setError('Popup was blocked. Please allow popups and try again.');
      } else {
        setError(msg);
      }
    }
  }, []);

  const handleAnonymousSignIn = useCallback(async () => {
    setError(null);
    try {
      await signInAnonymously();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Guest sign-in failed';
      if (msg.includes('auth/operation-not-allowed')) {
        setError('Anonymous sign-in is not enabled. Please contact support.');
      } else {
        setError(msg);
      }
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    setError(null);
    try {
      await signOut();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-out failed');
    }
  }, []);

  return {
    user,
    loading,
    signInWithGoogle: handleGoogleSignIn,
    signInAnonymously: handleAnonymousSignIn,
    signOut: handleSignOut,
    error,
  };
}
