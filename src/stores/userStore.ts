import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  UserData,
  UserProfile,
  CarbonScore,
  UserMission,
  ChatMessage,
} from '@/types';

interface UserStore {
  // State
  userData: UserData | null;
  profile: UserProfile | null;
  carbonScore: CarbonScore | null;
  missions: UserMission[];
  chatHistory: ChatMessage[];

  // Setters
  setUserData: (data: UserData) => void;
  setProfile: (profile: UserProfile) => void;
  setCarbonScore: (score: CarbonScore) => void;
  setMissions: (missions: UserMission[]) => void;
  updateMission: (missionId: string, patch: Partial<UserMission>) => void;
  addChatMessage: (message: ChatMessage) => void;
  clearChatHistory: () => void;

  // Reset
  clearStore: () => void;
}

const INITIAL_STATE = {
  userData: null,
  profile: null,
  carbonScore: null,
  missions: [],
  chatHistory: [],
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      ...INITIAL_STATE,

      setUserData: (userData) => set({ userData }),

      setProfile: (profile) => set({ profile }),

      setCarbonScore: (carbonScore) => set({ carbonScore }),

      setMissions: (missions) => set({ missions }),

      updateMission: (missionId, patch) =>
        set((state) => ({
          missions: state.missions.map((m) =>
            m.missionId === missionId ? { ...m, ...patch } : m,
          ),
        })),

      addChatMessage: (message) =>
        set((state) => ({
          chatHistory: [
            ...state.chatHistory.slice(-19), // Keep last 20 messages
            message,
          ],
        })),

      clearChatHistory: () => set({ chatHistory: [] }),

      clearStore: () => set(INITIAL_STATE),
    }),
    {
      name: 'carbondetox-store',
      storage: createJSONStorage(() => sessionStorage),
      // Only persist non-sensitive derived state
      partialize: (state) => ({
        userData: state.userData,
        profile: state.profile,
        carbonScore: state.carbonScore,
      }),
    },
  ),
);
