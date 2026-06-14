/**
 * @jest-environment jsdom
 */

import { renderHook, act } from '@testing-library/react';
import { useCarbonScore } from '@/hooks/useCarbonScore';
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/hooks/useChat';
import { useMissions } from '@/hooks/useMissions';
import { useUserStore } from '@/stores/userStore';
import {
  getCarbonScores,
  saveUserData,
  getUserData,
  saveChatMessage,
  getMissions,
  completeMission,
  updateUserData,
  getTodayString,
} from '@/lib/firebase/firestore';
import {
  signInWithGoogle,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  getGoogleRedirectResult,
} from '@/lib/firebase/auth';

// Mock Zustand Store
const mockSetUserData = jest.fn();
const mockSetProfile = jest.fn();
const mockSetCarbonScore = jest.fn();
const mockSetMissions = jest.fn();
const mockUpdateMission = jest.fn();
const mockAddChatMessage = jest.fn();
const mockClearChatHistory = jest.fn();
const mockClearStore = jest.fn();

jest.mock('@/stores/userStore', () => ({
  useUserStore: jest.fn(),
}));

// Mock Firebase Firestore functions
jest.mock('@/lib/firebase/firestore', () => ({
  getCarbonScores: jest.fn(),
  saveUserData: jest.fn(),
  getUserData: jest.fn(),
  saveChatMessage: jest.fn(),
  getMissions: jest.fn(),
  completeMission: jest.fn(),
  updateUserData: jest.fn(),
  getTodayString: jest.fn(() => '2025-01-01'),
}));

// Mock Firebase Auth functions
let authStateCallback: ((user: any) => void) | null = null;
jest.mock('@/lib/firebase/auth', () => ({
  signInWithGoogle: jest.fn(),
  signInAnonymously: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn((cb) => {
    authStateCallback = cb;
    return jest.fn(); // unsubscribe function
  }),
  getGoogleRedirectResult: jest.fn(() => Promise.resolve(null)),
}));

describe('Custom React Hooks', () => {
  let mockStoreState: any;

  beforeEach(() => {
    jest.clearAllMocks();
    authStateCallback = null;

    mockStoreState = {
      userData: {
        uid: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        isAnonymous: false,
        xp: 100,
        level: 3,
        badges: [],
        currentStreak: 2,
        longestStreak: 5,
        lastActiveDate: '2025-01-01',
        createdAt: '2025-01-01T00:00:00.000Z',
        lastLogin: '2025-01-01T00:00:00.000Z',
      },
      profile: {
        uid: 'user-123',
        diet: 'vegan',
        commuteDistance: 10,
        transportMode: 'cycle',
        acUsage: 'none',
        electricityRange: 'low',
        shoppingFrequency: 'rarely',
        flightsPerYear: 0,
        recyclingHabit: 'always',
        locationType: 'urban',
        completedOnboarding: true,
        updatedAt: '2025-01-01T00:00:00.000Z',
      },
      carbonScore: null,
      missions: [],
      chatHistory: [],
      setUserData: mockSetUserData,
      setProfile: mockSetProfile,
      setCarbonScore: mockSetCarbonScore,
      setMissions: mockSetMissions,
      updateMission: mockUpdateMission,
      addChatMessage: mockAddChatMessage,
      clearChatHistory: mockClearChatHistory,
      clearStore: mockClearStore,
    };

    (useUserStore as unknown as jest.Mock).mockImplementation(() => mockStoreState);
  });

  describe('useCarbonScore', () => {
    it('does not compute or fetch if profile is null', async () => {
      mockStoreState.profile = null;
      const { result } = renderHook(() => useCarbonScore());

      await act(async () => {
        await result.current.refresh();
      });

      expect(mockSetCarbonScore).not.toHaveBeenCalled();
      expect(getCarbonScores).not.toHaveBeenCalled();
    });

    it('computes fresh score and fetches history on refresh', async () => {
      const mockHistory = [{ overall: 85 } as any];
      (getCarbonScores as jest.Mock).mockResolvedValueOnce(mockHistory);

      const { result } = renderHook(() => useCarbonScore());

      await act(async () => {
        await result.current.refresh();
      });

      expect(mockSetCarbonScore).toHaveBeenCalledWith(
        expect.objectContaining({ overall: expect.any(Number) }),
      );
      expect(getCarbonScores).toHaveBeenCalledWith('user-123', 30);
      expect(result.current.scoreHistory).toEqual(mockHistory);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('sets error state if fetching history fails', async () => {
      (getCarbonScores as jest.Mock).mockRejectedValueOnce(
        new Error('History load error'),
      );

      const { result } = renderHook(() => useCarbonScore());

      await act(async () => {
        await result.current.refresh();
      });

      expect(result.current.error).toBe('History load error');
      expect(result.current.loading).toBe(false);
    });

    it('sets error state if fetching history fails with non-Error object', async () => {
      (getCarbonScores as jest.Mock).mockRejectedValueOnce('Some string error');

      const { result } = renderHook(() => useCarbonScore());

      await act(async () => {
        await result.current.refresh();
      });

      expect(result.current.error).toBe('Failed to load score');
    });
  });

  describe('useAuth', () => {
    it('sets loading to true initially, then false on auth state callback', async () => {
      const { result } = renderHook(() => useAuth());
      expect(result.current.loading).toBe(true);

      // Trigger auth state changed to null user
      await act(async () => {
        if (authStateCallback) {
          await authStateCallback(null);
        }
      });

      expect(result.current.user).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(mockClearStore).toHaveBeenCalled();
    });

    it('handles successful Google sign-in and user login data storage', async () => {
      const mockUser = {
        uid: 'google-uid',
        displayName: 'Google User',
        email: 'google@example.com',
        photoURL: 'avatar-url',
        isAnonymous: false,
      };

      (getUserData as jest.Mock).mockResolvedValueOnce(null);

      const { result } = renderHook(() => useAuth());

      // Trigger user login via auth listener callback
      await act(async () => {
        if (authStateCallback) {
          await authStateCallback(mockUser);
        }
      });

      expect(result.current.user).toEqual(mockUser);
      expect(saveUserData).toHaveBeenCalledWith(
        expect.objectContaining({
          uid: 'google-uid',
          name: 'Google User',
          isAnonymous: false,
        }),
      );
      expect(mockSetUserData).toHaveBeenCalled();
    });

    it('triggers signInWithGoogle and handles popup blocked error', async () => {
      (signInWithGoogle as jest.Mock).mockRejectedValueOnce(
        new Error('auth/popup-blocked'),
      );

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signInWithGoogle();
      });

      expect(result.current.error).toContain('Popup was blocked');
    });

    it('handles Google sign-in auth/unauthorized-domain error', async () => {
      (signInWithGoogle as jest.Mock).mockRejectedValueOnce(
        new Error('auth/unauthorized-domain'),
      );
      const { result } = renderHook(() => useAuth());
      await act(async () => {
        await result.current.signInWithGoogle();
      });
      expect(result.current.error).toContain('This domain is not authorised');
    });

    it('handles Google sign-in auth/operation-not-allowed error', async () => {
      (signInWithGoogle as jest.Mock).mockRejectedValueOnce(
        new Error('auth/operation-not-allowed'),
      );
      const { result } = renderHook(() => useAuth());
      await act(async () => {
        await result.current.signInWithGoogle();
      });
      expect(result.current.error).toContain('Google sign-in is not yet configured');
    });

    it('handles general Google sign-in error', async () => {
      (signInWithGoogle as jest.Mock).mockRejectedValueOnce(
        new Error('Some other error'),
      );
      const { result } = renderHook(() => useAuth());
      await act(async () => {
        await result.current.signInWithGoogle();
      });
      expect(result.current.error).toBe('Some other error');
    });

    it('triggers signInAnonymously and handles operations disabled error', async () => {
      (signInAnonymously as jest.Mock).mockRejectedValueOnce(
        new Error('auth/operation-not-allowed'),
      );

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signInAnonymously();
      });

      expect(result.current.error).toContain('Anonymous sign-in is not enabled');
    });

    it('handles general Anonymous sign-in error', async () => {
      (signInAnonymously as jest.Mock).mockRejectedValueOnce(
        new Error('Some anon error'),
      );
      const { result } = renderHook(() => useAuth());
      await act(async () => {
        await result.current.signInAnonymously();
      });
      expect(result.current.error).toBe('Some anon error');
    });

    it('handles sign out successfully', async () => {
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signOut();
      });

      expect(signOut).toHaveBeenCalled();
      expect(result.current.error).toBeNull();
    });

    it('handles sign out failure', async () => {
      (signOut as jest.Mock).mockRejectedValueOnce(new Error('Sign out fail'));
      const { result } = renderHook(() => useAuth());
      await act(async () => {
        await result.current.signOut();
      });
      expect(result.current.error).toBe('Sign out fail');
    });
  });

  describe('useChat', () => {
    beforeEach(() => {
      global.fetch = jest.fn();
    });

    it('sends messages and handles AI reply successfully', async () => {
      const mockReply = { reply: 'AI response reply' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockReply,
      });

      const { result } = renderHook(() => useChat());

      let reply;
      await act(async () => {
        reply = await result.current.sendMessage('Hello bot');
      });

      expect(mockAddChatMessage).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'user', content: 'Hello bot' }),
      );
      expect(mockAddChatMessage).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'assistant', content: 'AI response reply' }),
      );
      expect(reply).toBe('AI response reply');
    });

    it('handles message history mapping and debounced persist failure silently', async () => {
      jest.useFakeTimers();
      (saveChatMessage as jest.Mock).mockRejectedValueOnce(
        new Error('Firestore write failure'),
      );

      const mockReply = { reply: 'AI response reply' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockReply,
      });

      // Provide message history
      mockStoreState.chatHistory = [{ role: 'user', content: 'previous message' }];

      const { result } = renderHook(() => useChat());

      await act(async () => {
        await result.current.sendMessage('Hello');
      });

      // Run timers for debounce
      await act(async () => {
        jest.runAllTimers();
      });

      expect(saveChatMessage).toHaveBeenCalled();
      jest.useRealTimers();
    });

    it('handles rate limit responses (429 status)', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 429,
      });

      const { result } = renderHook(() => useChat());

      let reply;
      await act(async () => {
        reply = await result.current.sendMessage('Hello');
      });

      expect(reply).toContain('Daily limit reached');
    });

    it('handles non-json payload in error response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.reject(new Error('Not JSON')),
      });

      const { result } = renderHook(() => useChat());

      await act(async () => {
        await result.current.sendMessage('Hello');
      });

      expect(mockAddChatMessage).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'assistant', content: 'HTTP 500' }),
      );
    });

    it('handles custom error message in JSON response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Custom API Error' }),
      });

      const { result } = renderHook(() => useChat());

      await act(async () => {
        await result.current.sendMessage('Hello');
      });

      expect(mockAddChatMessage).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'assistant', content: 'Custom API Error' }),
      );
    });

    it('handles general errors on message sending', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network failure'));

      const { result } = renderHook(() => useChat());

      await act(async () => {
        await result.current.sendMessage('Hello');
      });

      expect(mockAddChatMessage).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'assistant', content: 'Network failure' }),
      );
    });
  });

  describe('useMissions', () => {
    beforeEach(() => {
      global.fetch = jest.fn();
    });

    it('fetches existing daily missions from Firestore if present', async () => {
      const mockFetchedMissions = [
        { missionId: 'm1', title: 'Mission 1', completed: false },
      ];
      (getMissions as jest.Mock).mockResolvedValueOnce(mockFetchedMissions);

      const { result } = renderHook(() => useMissions());

      await act(async () => {
        await result.current.loadMissions('user-123');
      });

      expect(getMissions).toHaveBeenCalledWith('user-123', '2025-01-01');
      expect(mockSetMissions).toHaveBeenCalledWith(mockFetchedMissions);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('triggers API call to generate daily missions if none are present in Firestore', async () => {
      (getMissions as jest.Mock).mockResolvedValueOnce([]);
      const mockGeneratedMissions = [
        { missionId: 'm2', title: 'Gen Mission 2', completed: false },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ missions: mockGeneratedMissions }),
      });

      const { result } = renderHook(() => useMissions());

      await act(async () => {
        await result.current.loadMissions('user-123');
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/missions',
        expect.objectContaining({
          method: 'POST',
        }),
      );
      expect(mockSetMissions).toHaveBeenCalledWith(mockGeneratedMissions);
    });

    it('handles API failure during mission generation', async () => {
      (getMissions as jest.Mock).mockResolvedValueOnce([]);
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const { result } = renderHook(() => useMissions());

      await act(async () => {
        await result.current.loadMissions('user-123');
      });

      expect(result.current.error).toBe('Failed to generate missions');
    });

    it('handles mission completion, awards XP, and updates streaks', async () => {
      const mockMission = {
        missionId: 'm1',
        title: 'Walk to work',
        completed: false,
        difficulty: 'easy' as const,
        xp: 10,
      };

      (completeMission as jest.Mock).mockResolvedValueOnce(null);
      (updateUserData as jest.Mock).mockResolvedValueOnce(null);

      const { result } = renderHook(() => useMissions());

      await act(async () => {
        await result.current.complete(mockMission);
      });

      // Optimistic update should be triggered
      expect(mockUpdateMission).toHaveBeenCalledWith(
        'm1',
        expect.objectContaining({ completed: true }),
      );
      expect(completeMission).toHaveBeenCalledWith('m1', expect.any(String));

      // XP gained should be added (100 base + 10 gain = 110)
      expect(mockSetUserData).toHaveBeenCalledWith(
        expect.objectContaining({
          xp: 110,
          currentStreak: 3, // streak increments
        }),
      );
    });

    it('reverts optimistic update if completeMission rejects', async () => {
      const mockMission = {
        missionId: 'm1',
        title: 'Walk to work',
        completed: false,
        difficulty: 'easy' as const,
        xp: 10,
      };

      (completeMission as jest.Mock).mockRejectedValueOnce(new Error('Db write failed'));

      const { result } = renderHook(() => useMissions());

      await act(async () => {
        await result.current.complete(mockMission);
      });

      // Should revert completed to false
      expect(mockUpdateMission).toHaveBeenLastCalledWith(
        'm1',
        expect.objectContaining({ completed: false }),
      );
    });
  });
});
