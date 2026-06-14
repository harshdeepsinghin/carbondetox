import { adminDb } from './admin';
import type { UserProfile, CarbonScore, UserMission, UserData, ReceiptRecord } from '@/types';
import { FieldValue } from 'firebase-admin/firestore';

const COLLECTIONS = {
  USERS: 'users',
  PROFILES: 'profiles',
  CARBON_SCORES: 'carbon_scores',
  USER_MISSIONS: 'user_missions',
  RATE_LIMITS: 'rate_limits',
  RECEIPTS: 'receipts',
} as const;

export async function getAdminProfile(uid: string): Promise<UserProfile | null> {
  const docRef = adminDb.collection(COLLECTIONS.PROFILES).doc(uid);
  const snap = await docRef.get();
  return snap.exists ? (snap.data() as UserProfile) : null;
}

export async function getAdminLatestCarbonScore(uid: string): Promise<CarbonScore | null> {
  const snap = await adminDb
    .collection(COLLECTIONS.CARBON_SCORES)
    .where('uid', '==', uid)
    .orderBy('createdAt', 'desc')
    .limit(1)
    .get();
  if (snap.empty) return null;
  return snap.docs[0].data() as CarbonScore;
}

export async function getAdminMissions(uid: string, date: string): Promise<UserMission[]> {
  const snap = await adminDb
    .collection(COLLECTIONS.USER_MISSIONS)
    .where('uid', '==', uid)
    .where('generatedDate', '==', date)
    .get();
  return snap.docs.map((d) => ({
    ...(d.data() as UserMission),
    missionId: d.id,
  }));
}

export async function getAdminYesterdayMissions(uid: string): Promise<UserMission[]> {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dateStr = yesterday.toISOString().slice(0, 10);
  return getAdminMissions(uid, dateStr);
}

export async function saveAdminMissions(missions: UserMission[]): Promise<void> {
  const batch = adminDb.batch();
  missions.forEach((m) => {
    const docRef = adminDb.collection(COLLECTIONS.USER_MISSIONS).doc();
    batch.set(docRef, m);
  });
  await batch.commit();
}

export async function getAdminUserData(uid: string): Promise<UserData | null> {
  const docRef = adminDb.collection(COLLECTIONS.USERS).doc(uid);
  const snap = await docRef.get();
  return snap.exists ? (snap.data() as UserData) : null;
}

export async function checkAdminRateLimit(
  uid: string,
  action: 'chat' | 'scan',
  limitPerDay: number,
): Promise<boolean> {
  const today = new Date().toISOString().slice(0, 10);
  const docId = `${uid}_${action}_${today}`;
  const docRef = adminDb.collection(COLLECTIONS.RATE_LIMITS).doc(docId);

  try {
    const snap = await docRef.get();
    if (!snap.exists) {
      await docRef.set({ count: 1, resetAt: today });
      return true;
    }

    const data = snap.data() as { count: number; resetAt: string };
    if (data.count >= limitPerDay) {
      return false;
    }

    await docRef.update({
      count: FieldValue.increment(1),
    });
    return true;
  } catch (err) {
    console.error('Rate limit error:', err);
    return true; // Fail open
  }
}

export async function saveAdminReceipt(record: ReceiptRecord): Promise<void> {
  await adminDb.collection(COLLECTIONS.RECEIPTS).add(record);
}
