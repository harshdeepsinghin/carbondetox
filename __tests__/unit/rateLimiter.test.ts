import { checkRateLimit, getRateLimitUsage } from '@/lib/utils/rateLimiter';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Mock firebase/firestore
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(() => ({ id: 'mock-doc' })),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  increment: jest.fn((val) => `increment_${val}`),
}));

// Mock the db config to prevent loading actual firebase client
jest.mock('@/lib/firebase/config', () => ({
  db: {},
}));

describe('rateLimiter', () => {
  const mockUid = 'user-123';
  const mockAction = 'chat';
  const mockLimit = 5;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkRateLimit', () => {
    it('returns true and creates a new document if rate limit doc does not exist', async () => {
      // Setup mock getDoc to return exists() = false
      (getDoc as jest.Mock).mockResolvedValueOnce({
        exists: () => false,
      });

      const allowed = await checkRateLimit(mockUid, mockAction, mockLimit);

      expect(allowed).toBe(true);
      expect(doc).toHaveBeenCalledWith(
        expect.any(Object),
        'rate_limits',
        expect.any(String),
      );
      expect(getDoc).toHaveBeenCalled();
      expect(setDoc).toHaveBeenCalledWith(expect.any(Object), {
        count: 1,
        resetAt: expect.any(String),
      });
    });

    it('returns true and increments count if count is below limit', async () => {
      // Setup mock getDoc to return exists() = true with count = 3 (below limit 5)
      (getDoc as jest.Mock).mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ count: 3, resetAt: '2025-01-01' }),
      });

      const allowed = await checkRateLimit(mockUid, mockAction, mockLimit);

      expect(allowed).toBe(true);
      expect(setDoc).toHaveBeenCalledWith(
        expect.any(Object),
        { count: 'increment_1' },
        { merge: true },
      );
    });

    it('returns false and does not write if count is at or above limit', async () => {
      // Setup mock getDoc to return exists() = true with count = 5 (equals limit 5)
      (getDoc as jest.Mock).mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ count: 5, resetAt: '2025-01-01' }),
      });

      const allowed = await checkRateLimit(mockUid, mockAction, mockLimit);

      expect(allowed).toBe(false);
      expect(setDoc).not.toHaveBeenCalled();
    });

    it('fails open (returns true) if an exception occurs in Firestore operations', async () => {
      // Setup mock getDoc to reject (throw error)
      (getDoc as jest.Mock).mockRejectedValueOnce(new Error('Firestore error'));

      const allowed = await checkRateLimit(mockUid, mockAction, mockLimit);

      expect(allowed).toBe(true);
    });
  });

  describe('getRateLimitUsage', () => {
    it('returns 0 if document does not exist', async () => {
      (getDoc as jest.Mock).mockResolvedValueOnce({
        exists: () => false,
      });

      const usage = await getRateLimitUsage(mockUid, mockAction);
      expect(usage).toBe(0);
    });

    it('returns the count if document exists', async () => {
      (getDoc as jest.Mock).mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ count: 4 }),
      });

      const usage = await getRateLimitUsage(mockUid, mockAction);
      expect(usage).toBe(4);
    });

    it('returns 0 if Firestore operations fail', async () => {
      (getDoc as jest.Mock).mockRejectedValueOnce(new Error('Firestore error'));

      const usage = await getRateLimitUsage(mockUid, mockAction);
      expect(usage).toBe(0);
    });
  });
});
