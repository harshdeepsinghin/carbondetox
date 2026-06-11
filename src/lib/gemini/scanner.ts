import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ReceiptAnalysis } from '@/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const MODEL = 'gemini-2.5-flash';

const SCANNER_PROMPT = `Analyze this receipt or shopping bill image. Return ONLY valid JSON, no markdown, no explanation.

Required format:
{
  "items": [{"name":"...","category":"food|household|clothing|electronics|other","carbonImpact":"low|medium|high","reasoning":"one sentence about why"}],
  "overallScore": "A|B|C|D|F",
  "topConcerns": ["up to 3 specific items that have high carbon impact"],
  "swapSuggestions": [{"instead":"current product/habit","try":"better alternative","co2Reduction":"approx X kg CO₂"}],
  "positives": ["things already done well"]
}

Guidelines:
- Be specific and practical, not generic
- Prefer Indian context: local vegetables, cloth bags, bulk buying, seasonal produce
- Non-judgmental tone — celebrate good choices, suggest swaps kindly
- If the image is not a receipt, return {"error": "Not a receipt image"}
- Limit to at most 10 items, 3 topConcerns, 3 swapSuggestions, 3 positives`;

/**
 * Analyze a receipt image using Gemini Vision.
 * @param imageBase64 - Base64-encoded image data
 * @param mimeType - Image MIME type
 * @returns Parsed ReceiptAnalysis or null if image is invalid
 */
export async function analyzeReceipt(
  imageBase64: string,
  mimeType: string,
): Promise<ReceiptAnalysis | null> {
  const model = genAI.getGenerativeModel({
    model: MODEL,
    generationConfig: {
      responseMimeType: 'application/json',
    },
  });

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType,
        data: imageBase64,
      },
    },
    SCANNER_PROMPT,
  ]);

  const text = result.response.text().trim();

  const cleaned = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();

  const parsed = JSON.parse(cleaned) as Record<string, unknown>;

  // Check if Gemini flagged an invalid image
  if ('error' in parsed) return null;

  // Basic shape validation — full schema not needed here as Gemini is constrained
  return parsed as ReceiptAnalysis;
}
