'use client';

import { useState, useCallback } from 'react';
import { useUserStore } from '@/stores/userStore';
import {
  getMissions,
  completeMission,
  updateUserData,
  getTodayString,
} from '@/lib/firebase/firestore';
import type { UserMission } from '@/types';

interface UseMissionsReturn {
  missions: UserMission[];
  loading: boolean;
  error: string | null;
  loadMissions: (uid: string) => Promise<void>;
  complete: (mission: UserMission) => Promise<void>;
}

/** XP awarded per difficulty level */
const DIFFICULTY_XP: Record<UserMission['difficulty'], number> = {
  easy: 10,
  medium: 25,
  hard: 50,
};

/**
 * Hook for fetching, displaying, and completing daily missions.
 * Handles Firestore updates and XP awarding.
 */
export function useMissions(): UseMissionsReturn {
  const { missions, setMissions, updateMission, userData, setUserData } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMissions = useCallback(
    async (uid: string) => {
      setLoading(true);
      setError(null);
      try {
        const today = getTodayString();
        const fetched = await getMissions(uid, today);

        if (fetched.length > 0) {
          setMissions(fetched);
        } else {
          // Trigger server-side generation
          const res = await fetch('/api/missions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid }),
          });
          if (res.ok) {
            const data = (await res.json()) as { missions: UserMission[] };
            setMissions(data.missions);
          } else {
            throw new Error('Failed to generate missions');
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not load missions');
      } finally {
        setLoading(false);
      }
    },
    [setMissions],
  );

  const complete = useCallback(
    async (mission: UserMission) => {
      if (mission.completed) return;
      const now = new Date().toISOString();
      const today = now.slice(0, 10);

      // Optimistic update
      updateMission(mission.missionId, { completed: true, completedAt: now });

      try {
        await completeMission(mission.missionId, now);

        // Award XP and update streak
        if (userData) {
          const xpGain = DIFFICULTY_XP[mission.difficulty] ?? mission.xp;
          const newXp = userData.xp + xpGain;
          const newStreak =
            userData.lastActiveDate === today
              ? userData.currentStreak
              : userData.currentStreak + 1;

          const updated = {
            ...userData,
            xp: newXp,
            currentStreak: newStreak,
            longestStreak: Math.max(newStreak, userData.longestStreak),
            lastActiveDate: today,
          };
          setUserData(updated);
          await updateUserData(userData.uid, {
            xp: newXp,
            currentStreak: newStreak,
            longestStreak: updated.longestStreak,
            lastActiveDate: today,
          });
        }
      } catch {
        // Revert optimistic update on failure
        updateMission(mission.missionId, {
          completed: false,
          completedAt: null,
        });
      }
    },
    [userData, updateMission, setUserData],
  );

  return { missions, loading, error, loadMissions, complete };
}
