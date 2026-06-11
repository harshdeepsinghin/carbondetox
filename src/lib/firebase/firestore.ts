import {
  doc,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import type {
  UserData,
  UserProfile,
  CarbonScore,
  UserMission,
  ChatMessage,
  ReceiptRecord,
} from '@/types';

// ─── Collection Names ─────────────────────────────────────────────────────────

const COLLECTIONS = {
  USERS: 'users',
  PROFILES: 'profiles',
  CARBON_SCORES: 'carbon_scores',
  USER_MISSIONS: 'user_missions',
  CHAT_HISTORY: 'chat_history',
  RECEIPTS: 'receipts',
  RATE_LIMITS: 'rate_limits',
} as const;

// ─── User Data ────────────────────────────────────────────────────────────────

/** Create or overwrite a user document. Used on first login. */
export async function saveUserData(userData: UserData): Promise<void> {
  const ref = doc(db, COLLECTIONS.USERS, userData.uid);
  await setDoc(ref, userData, { merge: true });
}

/** Fetch user data or null if document doesn't exist. */
export async function getUserData(uid: string): Promise<UserData | null> {
  const ref = doc(db, COLLECTIONS.USERS, uid);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as UserData) : null;
}

/** Update specific fields on the user document. */
export async function updateUserData(
  uid: string,
  partial: Partial<UserData>,
): Promise<void> {
  const ref = doc(db, COLLECTIONS.USERS, uid);
  await updateDoc(ref, { ...partial });
}

// ─── User Profile ─────────────────────────────────────────────────────────────

/** Save (or overwrite) a user's lifestyle profile. */
export async function saveProfile(profile: UserProfile): Promise<void> {
  const ref = doc(db, COLLECTIONS.PROFILES, profile.uid);
  await setDoc(ref, profile, { merge: true });
}

/** Fetch a user's onboarding profile or null if not yet completed. */
export async function getProfile(uid: string): Promise<UserProfile | null> {
  const ref = doc(db, COLLECTIONS.PROFILES, uid);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

// ─── Carbon Scores ────────────────────────────────────────────────────────────

/** Persist a new carbon score document. */
export async function saveCarbonScore(score: CarbonScore): Promise<void> {
  await addDoc(collection(db, COLLECTIONS.CARBON_SCORES), score);
}

/**
 * Fetch the last N carbon score documents for a user.
 * Returns them sorted newest first.
 */
export async function getCarbonScores(
  uid: string,
  count = 30,
): Promise<CarbonScore[]> {
  const q = query(
    collection(db, COLLECTIONS.CARBON_SCORES),
    where('uid', '==', uid),
    orderBy('createdAt', 'desc'),
    limit(count),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as CarbonScore);
}

/** Fetch the most recent carbon score for a user, or null. */
export async function getLatestCarbonScore(
  uid: string,
): Promise<CarbonScore | null> {
  const scores = await getCarbonScores(uid, 1);
  return scores.length > 0 ? scores[0] : null;
}

// ─── Missions ─────────────────────────────────────────────────────────────────

/** Save a batch of generated missions to Firestore. */
export async function saveMissions(missions: UserMission[]): Promise<void> {
  await Promise.all(
    missions.map((m) => addDoc(collection(db, COLLECTIONS.USER_MISSIONS), m)),
  );
}

/** Fetch today's missions for a user. */
export async function getMissions(
  uid: string,
  date: string,
): Promise<UserMission[]> {
  const q = query(
    collection(db, COLLECTIONS.USER_MISSIONS),
    where('uid', '==', uid),
    where('generatedDate', '==', date),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    ...(d.data() as UserMission),
    missionId: d.id,
  }));
}

/** Fetch yesterday's missions (to avoid repetition in generation). */
export async function getYesterdayMissions(uid: string): Promise<UserMission[]> {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dateStr = yesterday.toISOString().slice(0, 10);
  return getMissions(uid, dateStr);
}

/** Mark a specific mission as completed and award XP. */
export async function completeMission(
  missionDocId: string,
  completedAt: string,
): Promise<void> {
  const ref = doc(db, COLLECTIONS.USER_MISSIONS, missionDocId);
  await updateDoc(ref, { completed: true, completedAt });
}

// ─── Chat History ─────────────────────────────────────────────────────────────

/** Save a single chat message. */
export async function saveChatMessage(
  uid: string,
  message: ChatMessage,
): Promise<void> {
  await addDoc(collection(db, COLLECTIONS.CHAT_HISTORY), {
    uid,
    ...message,
  });
}

/** Fetch the last N chat messages for a user, sorted oldest first. */
export async function getChatHistory(
  uid: string,
  count = 20,
): Promise<ChatMessage[]> {
  const q = query(
    collection(db, COLLECTIONS.CHAT_HISTORY),
    where('uid', '==', uid),
    orderBy('timestamp', 'desc'),
    limit(count),
  );
  const snap = await getDocs(q);
  const messages = snap.docs.map((d) => {
    const data = d.data();
    return {
      id: data.id as string,
      role: data.role as ChatMessage['role'],
      content: data.content as string,
      timestamp: data.timestamp as string,
    };
  });
  return messages.reverse(); // Return chronological order
}

// ─── Receipts ────────────────────────────────────────────────────────────────

/** Save a receipt analysis result. */
export async function saveReceipt(record: ReceiptRecord): Promise<void> {
  await addDoc(collection(db, COLLECTIONS.RECEIPTS), record);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert a Firestore Timestamp to an ISO string, gracefully. */
export function timestampToISO(value: unknown): string {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
  if (typeof value === 'string') return value;
  return new Date().toISOString();
}

/** Get today's date as YYYY-MM-DD. */
export function getTodayString(): string {
  return new Date().toISOString().slice(0, 10);
}

// Re-export serverTimestamp for convenience in API routes
export { serverTimestamp };
