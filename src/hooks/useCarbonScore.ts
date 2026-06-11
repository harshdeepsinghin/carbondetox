'use client';

import { useState, useCallback } from 'react';
import { useUserStore } from '@/stores/userStore';
import { getCarbonScores } from '@/lib/firebase/firestore';
import { calculateCarbonScore } from '@/lib/scoring/carbonScore';
import type { CarbonScore } from '@/types';

interface UseCarbonScoreReturn {
  carbonScore: CarbonScore | null;
  scoreHistory: CarbonScore[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Hook for fetching and computing carbon scores.
 * Uses the Zustand store for the current score and fetches history from Firestore.
 */
export function useCarbonScore(): UseCarbonScoreReturn {
  const { profile, carbonScore, setCarbonScore } = useUserStore();
  const [scoreHistory, setScoreHistory] = useState<CarbonScore[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    setError(null);

    try {
      // Compute fresh score from profile
      const freshScore = calculateCarbonScore(profile);
      setCarbonScore(freshScore);

      // Fetch historical scores from Firestore
      const history = await getCarbonScores(profile.uid, 30);
      setScoreHistory(history);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load score');
    } finally {
      setLoading(false);
    }
  }, [profile, setCarbonScore]);

  return { carbonScore, scoreHistory, loading, error, refresh };
}
