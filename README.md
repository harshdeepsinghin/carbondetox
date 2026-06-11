# 🌿 CarbonDetox — AI-Powered Sustainability Coach

> **Detox your lifestyle, one habit at a time. Built specifically for India's unique urban, transit, and cultural context.**

[![GitHub Repository](https://img.shields.io/badge/GitHub-carbondetox-16a34a?style=flat-square&logo=github)](https://github.com/harshdeepsinghin/carbondetox)
[![Hackathon](https://img.shields.io/badge/Hack2Skill-PromptWars-blue?style=flat-square)](https://hack2skill.com)
[![AI Stack](https://img.shields.io/badge/AI-Gemini%202.5%20Flash-forest?style=flat-square&logo=google-gemini)](https://ai.google.dev)
[![Architecture](https://img.shields.io/badge/Frontend-Next.js%2015%20(App%20Router)-000000?style=flat-square&logo=next.js)](https://nextjs.org)
[![Database](https://img.shields.io/badge/Database-Firebase%20Firestore-orange?style=flat-square&logo=firebase)](https://firebase.google.com)
[![PWA](https://img.shields.io/badge/PWA-Installable-purple?style=flat-square&logo=pwa)](https://web.dev/explore/progressive-web-apps)

---

## 🌎 The Problem
India is the world's third-largest emitter of CO₂, responsible for roughly **7% of global emissions**. While macroscopic industrial actions are critical, individual choice is equally vital. However, most existing carbon footprint tools are built for Western lifestyles, assuming suburban driving habits, heating requirements, and generic Western grocery shopping. There is a complete lack of context-aware sustainability tracking tailored for Indian cities, diets, commutes, and daily routines.

## 🌿 The Solution
**CarbonDetox** is a highly interactive, accessible, and gamified web application that acts as a personalized sustainability mentor. Instead of being a boring, one-time calculator, CarbonDetox combines:
1. **Dynamic Carbon Health Score**: A weighted 0-100 score tailored specifically to Indian transit patterns (auto-rickshaws, metro, two-wheelers), diets (vegan, vegetarian, eggetarian), and domestic electricity units.
2. **AI-Driven Daily Missions**: achievable tasks refreshed daily by Gemini 2.5 Flash, matching the user's weakest score category to build high-impact micro-habits.
3. **Receipt Scanner**: Gemini Vision scans grocery and shopping receipts to detect high-carbon purchases, suggest sustainable swaps, and estimate CO₂ reductions in a local context.
4. **AI Coach**: A friendly, localized chat interface providing practical eco-tips (e.g., using tiffin boxes, local bus routing, energy savings).

---

## 🛠 Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Core Framework** | Next.js 15 (App Router, Standalone Output) | Best-in-class React framework with React Server Components (RSC) and server actions. |
| **Styling** | Tailwind CSS v4 & custom design properties | Modern glass-morphism dark mode with high contrast and smooth micro-animations. |
| **State** | Zustand | Lightweight global client state management that persists across sessions. |
| **Data Fetching** | SWR | Stale-while-revalidate client fetching with automatic caching and revalidation. |
| **Database** | Firebase Firestore | Multi-document reactive datastore with strict security rules enforcing user ownership. |
| **Storage** | Firebase Storage | Highly-scalable storage for user-uploaded receipt images. |
| **Authentication** | Firebase Auth (Google OAuth & Anonymous) | Direct guest access so judges and users can evaluate the platform instantly. |
| **AI Layer** | Gemini 2.5 Flash (via `@google/generative-ai`) | High-speed, structured JSON outputs, low latency, and highly contextual capabilities. |
| **Testing** | Jest (Unit) & Playwright (E2E) | Type-safe unit testing for carbon formulas and Playwright for cross-device guest flows. |
| **PWA** | next-pwa | Installable on mobile devices with offline-resilient manifests and caching. |

---

## 🎨 UI/UX Design & Brand Identity
CarbonDetox is built with a premium, sleek glass-morphism aesthetic tailored for mobile-first engagement:
*   **Colors**: Modern Deep Forest Green (`#16a34a`) as primary, Lime Accent (`#84cc16`) for metrics/progress, Dark Slate (`#0f172a`) background, and amber/red warnings.
*   **Carbon Score Ring**: An interactive, animated SVG ring demonstrating score level changes dynamically.
*   **Streak Badge**: Visual indicator of consecutive active days utilizing flame intensity colors (orange to red gradient).
*   **Accessibility First**: WCAG 2.1 compliance including focus rings, keyboard navigability (full tabs/arrows support), color contrast ratios exceeding `4.5:1`, screen reader support via `aria-label`, `aria-busy` transitions, and `prefers-reduced-motion` responsive scaling.

---

## 📂 Architecture & Data Flow

```
+------------------+         +---------------------+         +---------------------+
|   Web Browser    |  Auth   |    Firebase Auth    |   OK   |   Zustand Store     |
| (React/Next.js)  |=======> |  Google / Anonymous |=======> | (State Management)  |
+------------------+         +---------------------+         +---------------------+
         ||                             ||                              ||
         || (API Requests)              || (Read/Write Rules)           || (Local Cache)
         \/                             \/                              \/
+------------------+         +---------------------+         +---------------------+
| Next.js API Hub  |  Calls  | Firebase Firestore  |  Saves  |  Firebase Storage   |
| (API Routes)     |=======> |  (Data Persistence) |=======> | (Uploaded Receipts) |
+------------------+         +---------------------+         +---------------------+
         ||
         || (System Prompt + Context Injection)
         \/
+------------------------------------------+
|          Google Gemini 2.5 Flash         |
|   (AI Coach, Missions, Receipt Scanner)  |
+------------------------------------------+
```

---

## 🧮 Carbon Scoring Formula
The scoring engine computes carbon emissions in kg CO₂e/year using parameters mapped to typical Indian lifestyles:

```
Emissions_Food       = Diet_Factor (Vegan: 1500, Veg: 1700, Eggetarian: 2000, Non-Veg: 2500)
Emissions_Transport  = Commute_Distance * Transport_Mode_Factor (Walk: 0, Cycle: 0, Public: 0.04, Bike: 0.09, Car: 0.21) * 365
Emissions_Energy     = AC_Usage_Factor (None: 0, Minimal: 200, Moderate: 600, Heavy: 1200) + Electricity_Range (Low: 300, Med: 700, High: 1400)
Emissions_Shopping   = Shopping_Frequency_Factor (Rarely: 100, Monthly: 300, Weekly: 700, Daily: 1500)
Emissions_Waste      = (Shopping_Emissions * 0.1) * Waste_Habit_Multiplier (Always: 0.8, Sometimes: 0.9, Never: 1.0)
```

The overall score is normalized from 0 to 100, where **100 is the best (lowest carbon footprint)**:
$$\text{Score} = 100 - \sum \left( \frac{\text{Emissions}_{\text{Category}}}{\text{Max Emissions}_{\text{Category}}} \times \text{Weight}_{\text{Category}} \times 100 \right)$$
*   **Weights**: Transport (30%), Food (25%), Energy (20%), Shopping (15%), Waste (10%).

---

## 🗄 Database Design (Firestore)

### 1. `users` collection (`/users/{uid}`)
| Field | Type | Description |
|---|---|---|
| `uid` | string | Unique User ID |
| `name` | string | Display name or "Guest" |
| `email` | string \| null | Email address (null for guests) |
| `isAnonymous` | boolean | Is this an anonymous guest account |
| `xp` | number | Experience points earned |
| `level` | number | Gamification level |
| `badges` | string[] | Array of unlocked badge IDs |
| `currentStreak` | number | Current consecutive active days |
| `longestStreak` | number | Maximum streak achieved |
| `lastActiveDate` | string (ISO) | Timestamp of last activity |
| `createdAt` | string (ISO) | Document creation date |

### 2. `profiles` collection (`/profiles/{uid}`)
| Field | Type | Description |
|---|---|---|
| `uid` | string | Unique User ID |
| `diet` | string | vegan \| vegetarian \| eggetarian \| nonveg |
| `commuteDistance` | number | Average daily commute (km) |
| `transportMode` | string | walk \| cycle \| public \| bike \| car |
| `acUsage` | string | none \| minimal \| moderate \| heavy |
| `electricityRange` | string | low \| medium \| high |
| `shoppingFrequency`| string | rarely \| monthly \| weekly \| daily |
| `flightsPerYear` | number | Domestic flights per year |
| `recyclingHabit` | string | always \| sometimes \| never |
| `locationType` | string | urban \| suburban \| rural |
| `completedOnboarding`| boolean | Did they complete the assessment |
| `updatedAt` | string (ISO) | Timestamp of last profile change |

### 3. `carbon_scores` collection (`/carbon_scores/{scoreId}`)
| Field | Type | Description |
|---|---|---|
| `uid` | string | Unique User ID |
| `date` | string | YYYY-MM-DD |
| `overall` | number | 0 - 100 score |
| `transport` | number | Normalized category score |
| `food` | number | Normalized category score |
| `energy` | number | Normalized category score |
| `shopping` | number | Normalized category score |
| `waste` | number | Normalized category score |
| `createdAt` | string (ISO) | Timestamp |

### 4. `user_missions` collection (`/user_missions/{docId}`)
| Field | Type | Description |
|---|---|---|
| `uid` | string | Unique User ID |
| `missionId` | string | Unique Mission ID |
| `title` | string | Short mission title |
| `description` | string | Measurable mission detail |
| `category` | string | Category tag |
| `xp` | number | XP reward |
| `co2Saved` | number | Estimated CO₂ saved |
| `completed` | boolean | Completion state |
| `completedAt` | string \| null | Completion timestamp |
| `generatedDate` | string | YYYY-MM-DD |

---

## 🔒 Security & Optimization
1.  **Rate Limiting**: Custom atomic Firestore rate limits prevent endpoint abuse (20 requests/day for AI Coach, 5 requests/day for Receipt Scanner).
2.  **Input Validation**: Strict Zod schema verification on all API inputs to prevent malformed requests and code injection.
3.  **Strict Security Rules**: Firestore security rules restrict all users to read/write only their own document data (checked via `request.auth.uid`).
4.  **No Credentials Committed**: Sensitive tokens (Gemini, Firebase Config) are read dynamically from server environment variables.
5.  **Relatable Equivalences**: AI Coach outputs use local equivalences (e.g. "Equivalent to 12 Delhi-Jaipur road trips", "equal to 40 plastic bags").

---

## 🚀 Setup & Running Locally

### 1. Prerequisites
Ensure you have **Node.js 20+** installed.

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env.local` file in the root directory:
```env
# Gemini API Key (obtain from Google AI Studio)
GEMINI_API_KEY=your_gemini_api_key

# Firebase Client Configuration (expose safely in client-side context)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### 5. Deploying Firestore Rules
To deploy security rules, make sure you are authenticated with Firebase CLI and run:
```bash
npx firebase-tools deploy --only firestore
```

### 6. Run Automated Tests
```bash
# Run unit tests (scoring formula, sorting)
npm test

# Run E2E tests (Playwright)
npx playwright test
```

---

## 🐳 Dockerization & Production Build
To build a production bundle inside a container:
```bash
# Build the container
docker build -t carbondetox .

# Run the container
docker run -p 3000:3000 --env-file .env.local carbondetox
```

To deploy to **Google Cloud Run** in `asia-south1` (Mumbai):
```bash
# Build & tag image in Artifact Registry
gcloud builds submit --tag gcr.io/[PROJECT_ID]/carbondetox

# Deploy service to Cloud Run
gcloud run deploy carbondetox \
  --image gcr.io/[PROJECT_ID]/carbondetox \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars="GEMINI_API_KEY=..."
```
