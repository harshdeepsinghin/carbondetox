import { NextRequest, NextResponse } from 'next/server';
import { MissionsRequestSchema } from '@/lib/utils/validation';
import {
  getProfile,
  getLatestCarbonScore,
  getMissions,
  getYesterdayMissions,
  saveMissions,
  getTodayString,
} from '@/lib/firebase/firestore';
import { generateMissions } from '@/lib/gemini/missions';
import type { UserMission } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json() as unknown;
    const parsed = MissionsRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { uid } = parsed.data;
    const today = getTodayString();

    // Check for existing missions today
    const existing = await getMissions(uid, today);
    if (existing.length > 0) {
      return NextResponse.json({ missions: existing });
    }

    // Fetch required context
    const [profile, score, yesterday] = await Promise.all([
      getProfile(uid),
      getLatestCarbonScore(uid),
      getYesterdayMissions(uid),
    ]);

    if (!profile || !score) {
      return NextResponse.json(
        { error: 'Complete onboarding to generate missions.' },
        { status: 422 },
      );
    }

    const yesterdayTitles = yesterday.map((m) => m.title);

    // Generate 3 missions via Gemini
    const generatedMissions = await generateMissions(profile, score, yesterdayTitles);

    const userMissions: UserMission[] = generatedMissions.map((m) => ({
      ...m,
      uid,
      completed: false,
      completedAt: null,
      generatedDate: today,
    }));

    // Persist to Firestore
    await saveMissions(userMissions);

    return NextResponse.json({ missions: userMissions });
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to generate missions. Please try again.' },
      { status: 500 },
    );
  }
}
