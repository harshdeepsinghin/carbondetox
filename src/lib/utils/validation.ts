import { z } from 'zod';

// ─── Shared Schemas ───────────────────────────────────────────────────────────

export const UidSchema = z.string().min(1, 'UID is required').max(128);

const ChatRoleSchema = z.enum(['user', 'assistant']);

const ChatHistoryItemSchema = z.object({
  role: ChatRoleSchema,
  content: z.string().max(1000),
});

// ─── API Request Schemas ──────────────────────────────────────────────────────

/** Validates the POST body for /api/coach */
export const CoachRequestSchema = z.object({
  message: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(500, 'Message too long (max 500 chars)'),
  history: z.array(ChatHistoryItemSchema).max(20, 'History too long (max 20 items)'),
  uid: UidSchema,
});

/** Validates the POST body for /api/missions */
export const MissionsRequestSchema = z.object({
  uid: UidSchema,
});

/** Validates the POST body for /api/score */
export const ScoreRequestSchema = z.object({
  uid: UidSchema,
});

// ─── Domain Schemas ───────────────────────────────────────────────────────────

export const UserProfileSchema = z.object({
  uid: UidSchema,
  diet: z.enum(['vegan', 'vegetarian', 'eggetarian', 'nonveg']),
  commuteDistance: z.number().min(0).max(200),
  transportMode: z.enum(['walk', 'cycle', 'public', 'car', 'bike']),
  acUsage: z.enum(['none', 'minimal', 'moderate', 'heavy']),
  electricityRange: z.enum(['low', 'medium', 'high']),
  shoppingFrequency: z.enum(['rarely', 'monthly', 'weekly', 'daily']),
  flightsPerYear: z.number().int().min(0).max(100),
  recyclingHabit: z.enum(['always', 'sometimes', 'never']),
  locationType: z.enum(['urban', 'suburban', 'rural']),
  completedOnboarding: z.boolean(),
  updatedAt: z.string(),
});

export const MissionSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(500),
  category: z.enum(['transport', 'food', 'energy', 'shopping', 'waste']),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  impact: z.enum(['low', 'medium', 'high']),
  xp: z.number().int().min(0).max(200),
  co2Saved: z.number().min(0),
});

/** Validates Gemini-generated mission JSON array */
export const GeneratedMissionsSchema = z.array(MissionSchema).min(1).max(5);

// ─── File Upload Schemas ──────────────────────────────────────────────────────

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    return 'Invalid file type. Please upload a JPEG, PNG, or WebP image.';
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return 'File too large. Maximum size is 5 MB.';
  }
  return null;
}

// ─── Type Exports ─────────────────────────────────────────────────────────────

export type CoachRequest = z.infer<typeof CoachRequestSchema>;
export type MissionsRequest = z.infer<typeof MissionsRequestSchema>;
export type ValidatedUserProfile = z.infer<typeof UserProfileSchema>;
