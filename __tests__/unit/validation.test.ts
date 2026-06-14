import {
  UidSchema,
  CoachRequestSchema,
  MissionsRequestSchema,
  ScoreRequestSchema,
  UserProfileSchema,
  MissionSchema,
  GeneratedMissionsSchema,
  validateImageFile,
  MAX_FILE_SIZE_BYTES,
} from '@/lib/utils/validation';

describe('validation rules', () => {
  describe('UidSchema', () => {
    it('validates a correct UID', () => {
      expect(UidSchema.safeParse('test-uid-123').success).toBe(true);
    });

    it('fails for empty string', () => {
      const res = UidSchema.safeParse('');
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.message).toContain('UID is required');
      }
    });

    it('fails for too long UID', () => {
      const longUid = 'a'.repeat(129);
      expect(UidSchema.safeParse(longUid).success).toBe(false);
    });
  });

  describe('CoachRequestSchema', () => {
    it('validates correct coach request', () => {
      const payload = {
        message: 'Hello coach!',
        history: [
          { role: 'user', content: 'Hi' },
          { role: 'assistant', content: 'Hello!' },
        ],
        uid: 'user-id-01',
      };
      expect(CoachRequestSchema.safeParse(payload).success).toBe(true);
    });

    it('fails for message too long', () => {
      const payload = {
        message: 'a'.repeat(501),
        history: [],
        uid: 'user-id-01',
      };
      expect(CoachRequestSchema.safeParse(payload).success).toBe(false);
    });

    it('fails for too much history', () => {
      const history = Array.from({ length: 21 }, () => ({
        role: 'user' as const,
        content: 'hello',
      }));
      const payload = {
        message: 'Hello coach!',
        history,
        uid: 'user-id-01',
      };
      expect(CoachRequestSchema.safeParse(payload).success).toBe(false);
    });
  });

  describe('MissionsRequestSchema and ScoreRequestSchema', () => {
    it('validates payloads with UIDs', () => {
      expect(MissionsRequestSchema.safeParse({ uid: 'my-uid' }).success).toBe(true);
      expect(ScoreRequestSchema.safeParse({ uid: 'my-uid' }).success).toBe(true);
      expect(MissionsRequestSchema.safeParse({}).success).toBe(false);
    });
  });

  describe('UserProfileSchema', () => {
    const validProfile = {
      uid: 'user-123',
      diet: 'vegetarian',
      commuteDistance: 25,
      transportMode: 'public',
      acUsage: 'minimal',
      electricityRange: 'medium',
      shoppingFrequency: 'weekly',
      flightsPerYear: 2,
      recyclingHabit: 'sometimes',
      locationType: 'urban',
      completedOnboarding: true,
      updatedAt: '2025-01-01T00:00:00.000Z',
    };

    it('validates a complete, correct user profile', () => {
      expect(UserProfileSchema.safeParse(validProfile).success).toBe(true);
    });

    it('fails on incorrect choices', () => {
      expect(
        UserProfileSchema.safeParse({
          ...validProfile,
          diet: 'meat-lover', // invalid enum
        }).success,
      ).toBe(false);

      expect(
        UserProfileSchema.safeParse({
          ...validProfile,
          commuteDistance: 300, // exceeds max 200
        }).success,
      ).toBe(false);

      expect(
        UserProfileSchema.safeParse({
          ...validProfile,
          flightsPerYear: -1, // below min 0
        }).success,
      ).toBe(false);
    });
  });

  describe('MissionSchema and GeneratedMissionsSchema', () => {
    const validMission = {
      title: 'Eat a veg lunch',
      description: 'Choose a vegetarian meal instead of non-veg for lunch.',
      category: 'food',
      difficulty: 'easy',
      impact: 'medium',
      xp: 25,
      co2Saved: 0.8,
    };

    it('validates a correct mission', () => {
      expect(MissionSchema.safeParse(validMission).success).toBe(true);
    });

    it('validates an array of missions within limits', () => {
      expect(
        GeneratedMissionsSchema.safeParse([validMission, validMission]).success,
      ).toBe(true);
    });

    it('fails for empty mission list', () => {
      expect(GeneratedMissionsSchema.safeParse([]).success).toBe(false);
    });

    it('fails for too many missions in list', () => {
      const tooMany = Array(6).fill(validMission);
      expect(GeneratedMissionsSchema.safeParse(tooMany).success).toBe(false);
    });
  });

  describe('validateImageFile', () => {
    it('returns null for valid file types under size limit', () => {
      const mockFile = {
        type: 'image/jpeg',
        size: 1024 * 1024, // 1 MB
      } as File;
      expect(validateImageFile(mockFile)).toBeNull();

      const mockFileWebp = {
        type: 'image/webp',
        size: 4.9 * 1024 * 1024,
      } as File;
      expect(validateImageFile(mockFileWebp)).toBeNull();
    });

    it('returns error message for invalid file type', () => {
      const mockFile = {
        type: 'text/plain',
        size: 1024,
      } as File;
      expect(validateImageFile(mockFile)).toContain('Invalid file type');
    });

    it('returns error message for file exceeding size limit', () => {
      const mockFile = {
        type: 'image/png',
        size: MAX_FILE_SIZE_BYTES + 1,
      } as File;
      expect(validateImageFile(mockFile)).toContain('File too large');
    });
  });
});
