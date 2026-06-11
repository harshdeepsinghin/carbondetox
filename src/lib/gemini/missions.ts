import { GoogleGenerativeAI } from '@google/generative-ai';
import type { UserProfile, CarbonScore, Mission } from '@/types';
import { getWeakestCategories } from '@/lib/scoring/carbonScore';
import { GeneratedMissionsSchema } from '@/lib/utils/validation';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const MODEL = 'gemini-2.5-flash';

function buildMissionsPrompt(
  profile: UserProfile,
  score: CarbonScore,
  yesterdayMissions: string[],
): string {
  const weakestCategory = getWeakestCategories(score)[0];
  const profileSummary = `Diet: ${profile.diet}, Transport: ${profile.transportMode} (${profile.commuteDistance}km), AC: ${profile.acUsage}, Shopping: ${profile.shoppingFrequency}, Location: ${profile.locationType}`;
  const avoidList =
    yesterdayMissions.length > 0
      ? yesterdayMissions.join(', ')
      : 'none';

  return `Generate exactly 3 daily sustainability missions for a user in India.
Profile: ${profileSummary}
Carbon score: ${score.overall}/100. Weakest category: ${weakestCategory}.

Return ONLY a valid JSON array. No markdown. No preamble. No explanation. Example format:
[{"title":"...","description":"...","category":"transport","difficulty":"easy","impact":"medium","xp":25,"co2Saved":0.8}]

Rules:
- One easy mission (xp:10), one medium (xp:25), one hard (xp:50)
- Target weakest category (${weakestCategory}) with at least one mission
- Missions must be achievable TODAY in one day
- Indian context: mention auto, tiffin, chai stall, avoiding Swiggy, metro, walking, etc.
- Include ₹ savings where relevant in the description
- Yesterday's missions to avoid repeating: ${avoidList}
- Keep descriptions under 80 words`;
}

/**
 * Generate 3 daily missions using Gemini.
 * Parses and validates the JSON response before returning.
 * @throws Error if Gemini response cannot be parsed as valid missions
 */
export async function generateMissions(
  profile: UserProfile,
  score: CarbonScore,
  yesterdayMissions: string[],
): Promise<Mission[]> {
  const model = genAI.getGenerativeModel({
    model: MODEL,
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.8,
    },
  });

  const prompt = buildMissionsPrompt(profile, score, yesterdayMissions);
  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  // Strip any accidental markdown fences
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();

  const parsed = JSON.parse(cleaned) as unknown;
  const validated = GeneratedMissionsSchema.parse(parsed);

  return validated.map((m, i) => ({
    missionId: `generated-${Date.now()}-${i}`,
    title: m.title,
    description: m.description,
    category: m.category,
    difficulty: m.difficulty,
    impact: m.impact,
    xp: m.xp,
    co2Saved: m.co2Saved,
  }));
}
