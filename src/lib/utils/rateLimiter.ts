import { doc, getDoc, setDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

type RateLimitAction = 'chat' | 'scan';

interface RateLimitDoc {
  count: number;
  resetAt: string;
}

/**
 * Check and enforce a per-user, per-day rate limit using Firestore.
 *
 * @param uid - The user's Firebase UID
 * @param action - The action to rate-limit ('chat' | 'scan')
 * @param limitPerDay - Maximum allowed calls per day
 * @returns `true` if the action is allowed (and count is incremented),
 *          `false` if the limit is already reached.
 *
 * If the Firestore check fails (network error, etc.), the function fails open
 * and returns `true` to avoid blocking the user unnecessarily.
 */
export async function checkRateLimit(
  uid: string,
  action: RateLimitAction,
  limitPerDay: number,
): Promise<boolean> {
  const today = new Date().toISOString().slice(0, 10);
  const docId = `${uid}_${action}_${today}`;
  const ref = doc(db, 'rate_limits', docId);

  try {
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      // First call today — create the document
      const newDoc: RateLimitDoc = { count: 1, resetAt: today };
      await setDoc(ref, newDoc);
      return true;
    }

    const data = snap.data() as RateLimitDoc;

    if (data.count >= limitPerDay) {
      return false; // Limit exceeded
    }

    // Increment atomically to avoid race conditions
    await setDoc(ref, { count: increment(1) }, { merge: true });
    return true;
  } catch {
    // Fail open: if Firestore is unreachable, allow the action
    return true;
  }
}

/**
 * Get the current usage count for a rate-limited action today.
 * Returns 0 if no record exists.
 */
export async function getRateLimitUsage(
  uid: string,
  action: RateLimitAction,
): Promise<number> {
  const today = new Date().toISOString().slice(0, 10);
  const docId = `${uid}_${action}_${today}`;
  const ref = doc(db, 'rate_limits', docId);

  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) return 0;
    return (snap.data() as RateLimitDoc).count;
  } catch {
    return 0;
  }
}
