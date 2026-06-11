import { GoogleGenerativeAI } from '@google/generative-ai';
import type { CarbonScore, UserProfile, UserMission, ChatRole } from '@/types';
import { getWeakestCategories, getScoreLabel } from '@/lib/scoring/carbonScore';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const MODEL = 'gemini-2.5-flash';

interface CoachContext {
  score: CarbonScore;
  profile: UserProfile;
  recentMissions: UserMission[];
  streakDays: number;
}

interface ChatHistoryItem {
  role: ChatRole;
  content: string;
}

function buildSystemPrompt(ctx: CoachContext): string {
  const weakCategories = getWeakestCategories(ctx.score)
    .slice(0, 3)
    .join(', ');
  const recentMissionTitles = ctx.recentMissions
    .filter((m) => m.completed)
    .map((m) => m.title)
    .slice(0, 5)
    .join(', ') || 'none yet';

  return `You are CarbonDetox Coach, a warm and practical sustainability mentor focused on the Indian context.

User context:
- Carbon Health Score: ${ctx.score.overall}/100 (${getScoreLabel(ctx.score.overall)})
- Weakest categories: ${weakCategories}
- Active streak: ${ctx.streakDays} days
- Diet: ${ctx.profile.diet}, Transport: ${ctx.profile.transportMode}, Location: ${ctx.profile.locationType}
- Recent completed missions: ${recentMissionTitles}

Rules:
1. Never shame or guilt. Focus on what the user CAN do.
2. Give ONE specific, actionable suggestion per response unless more are asked for.
3. Quantify impact when possible (e.g. 'saves ~45 kg CO₂/year' or '₹200/month').
4. Keep responses under 150 words unless the user asks for detail.
5. Use Indian context: mention auto-rickshaw, metro, BRTS, dal, tiffin, Swiggy/Zomato alternatives.
6. Never hallucinate statistics. If unsure, say 'approximately'.
7. Celebrate streaks and completions proactively.`;
}

/**
 * Send a chat message to Gemini with full coach context injected.
 * Returns the assistant's reply string.
 */
export async function getCoachReply(
  userMessage: string,
  history: ChatHistoryItem[],
  ctx: CoachContext,
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: MODEL,
    systemInstruction: buildSystemPrompt(ctx),
  });

  // Convert our history format to Gemini's format
  const geminiHistory = history.map((h) => ({
    role: h.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: h.content }],
  }));

  const chat = model.startChat({ history: geminiHistory });
  const result = await chat.sendMessage(userMessage);
  return result.response.text();
}
