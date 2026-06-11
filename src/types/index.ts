// ─── Primitive Types ─────────────────────────────────────────────────────────

export type DietType = 'vegan' | 'vegetarian' | 'eggetarian' | 'nonveg';
export type TransportMode = 'walk' | 'cycle' | 'public' | 'car' | 'bike';
export type ACUsage = 'none' | 'minimal' | 'moderate' | 'heavy';
export type ElectricityRange = 'low' | 'medium' | 'high';
export type ShoppingFrequency = 'rarely' | 'monthly' | 'weekly' | 'daily';
export type RecyclingHabit = 'always' | 'sometimes' | 'never';
export type LocationType = 'urban' | 'suburban' | 'rural';
export type MissionDifficulty = 'easy' | 'medium' | 'hard';
export type MissionCategory =
  | 'transport'
  | 'food'
  | 'energy'
  | 'shopping'
  | 'waste';
export type ChatRole = 'user' | 'assistant';

// ─── Core Domain Interfaces ───────────────────────────────────────────────────

export interface UserProfile {
  uid: string;
  diet: DietType;
  commuteDistance: number; // km one-way
  transportMode: TransportMode;
  acUsage: ACUsage;
  electricityRange: ElectricityRange;
  shoppingFrequency: ShoppingFrequency;
  flightsPerYear: number;
  recyclingHabit: RecyclingHabit;
  locationType: LocationType;
  completedOnboarding: boolean;
  updatedAt: string; // ISO date string
}

export interface CarbonScore {
  uid: string;
  date: string; // YYYY-MM-DD
  overall: number; // 0–100
  transport: number;
  food: number;
  energy: number;
  shopping: number;
  waste: number;
  createdAt: string; // ISO timestamp
}

export interface Mission {
  missionId: string;
  title: string;
  description: string;
  category: MissionCategory;
  difficulty: MissionDifficulty;
  impact: 'low' | 'medium' | 'high';
  xp: number;
  co2Saved: number; // kg CO₂e
}

export interface UserMission extends Mission {
  uid: string;
  completed: boolean;
  completedAt: string | null;
  generatedDate: string; // YYYY-MM-DD
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: string; // ISO timestamp
}

export interface UserData {
  uid: string;
  name: string;
  email: string | null;
  avatar: string | null;
  isAnonymous: boolean;
  xp: number;
  level: number;
  badges: string[];
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  createdAt: string; // ISO timestamp
  lastLogin: string; // ISO timestamp
}

// ─── Receipt Scanner Types ────────────────────────────────────────────────────

export interface ReceiptItem {
  name: string;
  category: 'food' | 'household' | 'clothing' | 'electronics' | 'other';
  carbonImpact: 'low' | 'medium' | 'high';
  reasoning: string;
}

export interface SwapSuggestion {
  instead: string;
  try: string;
  co2Reduction: string; // e.g. "approx 0.5 kg CO₂"
}

export interface ReceiptAnalysis {
  items: ReceiptItem[];
  overallScore: 'A' | 'B' | 'C' | 'D' | 'F';
  topConcerns: string[];
  swapSuggestions: SwapSuggestion[];
  positives: string[];
}

export interface ReceiptRecord {
  uid: string;
  imageUrl: string;
  analysis: ReceiptAnalysis;
  createdAt: string;
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiError {
  error: string;
  code?: string;
}

export interface CoachApiRequest {
  message: string;
  history: Array<{ role: ChatRole; content: string }>;
  uid: string;
}

export interface CoachApiResponse {
  reply: string;
}

export interface MissionsApiRequest {
  uid: string;
}

export interface MissionsApiResponse {
  missions: UserMission[];
}

// ─── Onboarding Step Config ───────────────────────────────────────────────────

export interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  field: keyof UserProfile | Array<keyof UserProfile>;
}
