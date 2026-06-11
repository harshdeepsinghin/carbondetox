import { NextRequest, NextResponse } from 'next/server';
import { UidSchema } from '@/lib/utils/validation';
import {
  getProfile,
  getLatestCarbonScore,
  saveCarbonScore,
} from '@/lib/firebase/firestore';
import { calculateCarbonScore } from '@/lib/scoring/carbonScore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get('uid');

    const parsed = UidSchema.safeParse(uid);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid uid' }, { status: 400 });
    }

    // Try to get the latest score first
    const existingScore = await getLatestCarbonScore(parsed.data);
    const today = new Date().toISOString().slice(0, 10);

    if (existingScore && existingScore.date === today) {
      return NextResponse.json({ score: existingScore });
    }

    // Compute fresh score from profile
    const profile = await getProfile(parsed.data);
    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found. Complete onboarding first.' },
        { status: 404 },
      );
    }

    const freshScore = calculateCarbonScore(profile);

    // Persist today's score
    await saveCarbonScore(freshScore);

    return NextResponse.json({ score: freshScore });
  } catch {
    return NextResponse.json(
      { error: 'Could not compute score.' },
      { status: 500 },
    );
  }
}
