import { NextRequest, NextResponse } from 'next/server';
import { CoachRequestSchema } from '@/lib/utils/validation';
import { checkRateLimit } from '@/lib/utils/rateLimiter';
import {
  getProfile,
  getLatestCarbonScore,
  getMissions,
  getTodayString,
  getUserData,
} from '@/lib/firebase/firestore';
import { getCoachReply } from '@/lib/gemini/coach';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CHAT_DAILY_LIMIT = 20;

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Parse and validate request body
    const body = await req.json() as unknown;
    const parsed = CoachRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { message, history, uid } = parsed.data;

    // Rate limit check
    const allowed = await checkRateLimit(uid, 'chat', CHAT_DAILY_LIMIT);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Daily limit reached. Come back tomorrow! 🌿' },
        { status: 429 },
      );
    }

    // Fetch user context for coach personalisation
    const [profile, score, recentMissions, userData] = await Promise.allSettled([
      getProfile(uid),
      getLatestCarbonScore(uid),
      getMissions(uid, getTodayString()),
      getUserData(uid),
    ]);

    const userProfile = profile.status === 'fulfilled' ? profile.value : null;
    const carbonScore = score.status === 'fulfilled' ? score.value : null;
    const missions = recentMissions.status === 'fulfilled' ? recentMissions.value : [];
    const user = userData.status === 'fulfilled' ? userData.value : null;

    // Require at minimum a profile to personalise coaching
    if (!userProfile || !carbonScore) {
      return NextResponse.json(
        { error: 'Complete onboarding before chatting with your coach.' },
        { status: 422 },
      );
    }

    const reply = await getCoachReply(message, history, {
      score: carbonScore,
      profile: userProfile,
      recentMissions: missions,
      streakDays: user?.currentStreak ?? 0,
    });

    return NextResponse.json({ reply });
  } catch (err) {
    // Don't leak internal errors to client
    return NextResponse.json(
      { error: 'Coach is temporarily unavailable. Please try again.' },
      { status: 500 },
    );
  }
}
