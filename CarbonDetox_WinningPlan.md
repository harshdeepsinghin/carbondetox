# 🏆 CarbonDetox — Winning Plan for Hack2Skill PromptWars

> **Challenge:** Carbon Footprint Awareness Platform
> **Strategy:** Ship fast, impress on every evaluation axis, stand out from 100 other "calculator" projects.

---

## ⚠️ Critical Meta-Strategy First

Before any code: understand what the judges are actually scoring.

| Evaluation Axis | What Average Teams Do   | What YOU Should Do                                               |
| --------------- | ----------------------- | ---------------------------------------------------------------- |
| Code Quality    | One big messy file      | Feature-sliced folder structure, typed everything                |
| Security        | No auth checks          | Firestore rules, input sanitization, rate limiting middleware    |
| Efficiency      | Fetch everything always | SWR/React Query caching, Firestore composite indexes             |
| Testing         | None                    | At least unit tests for scoring logic + E2E for critical paths   |
| Accessibility   | Ignored                 | ARIA, keyboard nav, screen reader tested, color contrast ≥ 4.5:1 |

The GPT plan was a solid _feature_ plan. This document is a **winning** plan — structured around what gets you points, not just what sounds cool.

---

## 1. Refined Project Vision

### What the GPT Plan Got Right ✅

- Tech stack is excellent (Next.js 15 + Firebase + Gemini)
- Module list covers all key areas
- Development phases are logical

### What Needs Sharpening 🔧

**Problem with the original:** It's too feature-wide for a hackathon. A half-built receipt scanner scores worse than a perfectly built coach. You need **depth over breadth**.

**The Fix:** A tiered feature architecture — Core MVP that wins, with Bonus modules that elevate the score.

---

## 2. Revised Architecture: Depth-First, Not Breadth-First

### Tier 1 — Non-Negotiable (Ship These or Lose) 🔴

These directly satisfy the challenge brief and evaluation criteria.

1. **Authentication** (Google + Guest)
2. **Onboarding Assessment** (6-question flow, stored in Firestore)
3. **Carbon Health Score** (weighted formula, per-category breakdown)
4. **AI Sustainability Coach** (Gemini 2.5 Flash, context-aware)
5. **Dashboard** (score display, category cards, trend chart)
6. **Daily Missions** (3 AI-generated missions/day, XP system)

### Tier 2 — High-Impact Differentiators 🟡

These make you stand out from the 40 other teams building carbon calculators.

7. **Receipt Scanner** (Gemini Vision — unique and visual-wow)
8. **Progress/Streak Tracking** (gamification, emotional hook)
9. **Offline-capable PWA** (service worker, installable — judges love this)

### Tier 3 — Polish (Time Permitting) 🟢

10. **Shareable Carbon Card** (OG image generation — viral potential, impressive)
11. **Onboarding Re-assessment** (track improvement over time)

> ❌ **Cut from original plan:** Google Maps routing, smartwatch, Gmail. These are "future scope" distractions. Never mention features you didn't build.

---

## 3. Corrected Tech Stack

The original stack is good. These are targeted improvements:

```
Frontend:       Next.js 15 (App Router) + TypeScript (strict mode)
Styling:        Tailwind CSS + shadcn/ui
State:          Zustand (simpler than Redux for hackathon; lighter than Context)
Data Fetching:  SWR (caching + revalidation out of the box)
Auth:           Firebase Auth (Google OAuth + Anonymous)
Database:       Firestore (with proper security rules — judges check this)
AI:             Gemini 2.5 Flash (chat + vision)
Storage:        Firebase Storage (receipts)
Testing:        Jest + React Testing Library (unit) + Playwright (E2E, 2-3 flows)
PWA:            next-pwa (service worker, manifest)
Deployment:     Vercel (faster than Cloud Run for hackathon) OR Cloud Run (as planned)
Analytics:      Firebase Analytics (already in plan — keep it)
Lint/Format:    ESLint + Prettier (judges check code quality — this signals professionalism)
```

### Why Vercel over Cloud Run?

- Zero-config deployment from GitHub
- Saves 2-4 hours of Docker/Artifact Registry setup
- Automatically handles HTTPS, edge caching
- If the rubric specifically rewards Docker/Cloud Run, use Cloud Run. Otherwise, ship faster.

---

## 4. Bulletproof Folder Structure

A clean structure signals code quality instantly.

```
carbondetox/
├── src/
│   ├── app/                        # Next.js App Router pages
│   │   ├── (auth)/
│   │   │   └── login/page.tsx
│   │   ├── (app)/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── coach/page.tsx
│   │   │   ├── missions/page.tsx
│   │   │   ├── progress/page.tsx
│   │   │   ├── scanner/page.tsx
│   │   │   └── settings/page.tsx
│   │   ├── onboarding/page.tsx
│   │   ├── api/
│   │   │   ├── coach/route.ts       # Gemini chat
│   │   │   ├── missions/route.ts    # AI mission generation
│   │   │   ├── scanner/route.ts     # Vision analysis
│   │   │   └── score/route.ts       # Carbon score calculation
│   │   ├── layout.tsx
│   │   └── page.tsx                 # Landing page
│   ├── components/
│   │   ├── ui/                      # shadcn components
│   │   ├── dashboard/               # Dashboard-specific components
│   │   ├── coach/                   # Chat interface components
│   │   ├── missions/                # Mission card components
│   │   └── shared/                  # Navbar, Footer, etc.
│   ├── lib/
│   │   ├── firebase/
│   │   │   ├── config.ts
│   │   │   ├── auth.ts
│   │   │   └── firestore.ts
│   │   ├── gemini/
│   │   │   ├── coach.ts             # Chat logic + system prompt
│   │   │   ├── missions.ts          # Mission generation prompt
│   │   │   └── scanner.ts           # Vision analysis prompt
│   │   ├── scoring/
│   │   │   └── carbonScore.ts       # Pure function — easy to test
│   │   └── utils/
│   │       ├── validation.ts
│   │       └── rateLimiter.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useCarbonScore.ts
│   │   ├── useMissions.ts
│   │   └── useChat.ts
│   ├── stores/
│   │   └── userStore.ts             # Zustand store
│   └── types/
│       └── index.ts                 # All shared TypeScript types
├── __tests__/
│   ├── unit/
│   │   └── carbonScore.test.ts
│   └── e2e/
│       └── onboarding.spec.ts
├── public/
│   └── manifest.json                # PWA manifest
├── firestore.rules                  # Security rules — DO NOT skip
├── .env.example                     # Show structure without secrets
├── .eslintrc.json
├── prettier.config.js
├── jest.config.ts
├── playwright.config.ts
└── README.md
```

---

## 5. Improved Carbon Scoring Formula

The original used a vague "weighted model." Here's the actual formula — make it transparent and testable.

### Score Calculation (Pure Function, 0–100, higher = better)

```typescript
// lib/scoring/carbonScore.ts

interface UserProfile {
  diet: 'vegan' | 'vegetarian' | 'eggetarian' | 'nonveg';
  commuteDistance: number; // km/day
  transportMode: 'walk' | 'cycle' | 'public' | 'car' | 'bike';
  acUsage: 'none' | 'minimal' | 'moderate' | 'heavy';
  electricityRange: 'low' | 'medium' | 'high'; // <100, 100-300, >300 units
  shoppingFrequency: 'rarely' | 'monthly' | 'weekly' | 'daily';
  flightsPerYear: number;
  recyclingHabit: 'always' | 'sometimes' | 'never';
}

// Raw emission estimates in kg CO2e/year (approximate IPCC-aligned values)
const DIET_EMISSIONS = { vegan: 1500, vegetarian: 1700, eggetarian: 2000, nonveg: 2500 };
const TRANSPORT_FACTORS = { walk: 0, cycle: 0, public: 0.04, bike: 0.09, car: 0.21 }; // kg CO2/km
const AC_EMISSIONS = { none: 0, minimal: 200, moderate: 600, heavy: 1200 };
const ELECTRICITY_EMISSIONS = { low: 300, medium: 700, high: 1400 };
const SHOPPING_EMISSIONS = { rarely: 100, monthly: 300, weekly: 700, daily: 1500 };
const FLIGHT_EMISSION_PER = 255; // kg CO2 per round-trip domestic flight average
const RECYCLING_FACTOR = { always: 0.8, sometimes: 0.9, never: 1.0 }; // waste multiplier

// Category weights
const WEIGHTS = { transport: 0.3, food: 0.25, energy: 0.2, shopping: 0.15, waste: 0.1 };

// Category max emissions (for normalization)
const MAX = { transport: 7665, food: 2500, energy: 2600, shopping: 1500, waste: 500 };
```

This matters because:

- It's **testable** (pure function with no side effects)
- It's **documented** (judges can verify the logic)
- It uses **real IPCC-adjacent values** (adds credibility)
- It's **transparent to users** (you can explain why their score is what it is)

---

## 6. Gemini Prompts — Precise, Not Vague

The original plan said "give it context and rules." Here are the actual system prompts.

### Coach System Prompt

```
You are CarbonDetox Coach, a warm and practical sustainability mentor.

USER CONTEXT (injected per session):
- Carbon Health Score: {score}/100
- Highest-emission categories: {topCategories}
- Active streak: {streakDays} days
- Last 5 completed missions: {recentMissions}
- Diet: {diet}, Transport: {transportMode}, Location type: {locationType}

RULES:
1. Never shame or guilt the user. Focus on what they CAN do, not what they're doing wrong.
2. Give ONE specific, actionable suggestion per response unless asked for more.
3. Quantify impact when possible (e.g., "saves ~45 kg CO₂/year" not "reduces emissions").
4. Keep responses under 150 words unless the user asks for detail.
5. If asked something outside sustainability, gently redirect.
6. Use Indian context when relevant (KSRTC, BRTS, local vegetarian options, etc.)
7. Never hallucinate statistics. If unsure, say "approximately" or "research suggests."
8. Celebrate streaks and completed missions proactively if visible in context.
```

### Mission Generation Prompt

```
Generate exactly 3 daily sustainability missions for a user with this profile:
{userProfile}
Carbon score: {score}/100
Weakest category: {weakestCategory}

Format as JSON array. Each mission:
{
  "title": "Short action title (max 8 words)",
  "description": "One sentence with specific, measurable action",
  "category": "transport|food|energy|shopping|waste",
  "difficulty": "easy|medium|hard",
  "impact": "low|medium|high",
  "xp": 10|25|50,
  "co2Saved": number (kg CO2 saved if completed, approximate)
}

Rules:
- One easy, one medium, one hard mission
- At least one mission targeting the weakest category
- Make them achievable TODAY, not aspirational
- Avoid repetition of yesterday's missions: {yesterdayMissions}
- Indian context preferred (e.g., auto-rickshaw, dal instead of meat, etc.)
```

### Receipt Scanner Prompt

```
Analyze this grocery/shopping receipt image. Extract purchased items and evaluate their environmental impact.

Return JSON:
{
  "items": [
    {
      "name": "item name",
      "category": "food|household|clothing|electronics|other",
      "carbonImpact": "low|medium|high",
      "reasoning": "one sentence explanation"
    }
  ],
  "overallScore": "A|B|C|D|F",
  "topConcerns": ["up to 3 high-impact items"],
  "swapSuggestions": [
    {
      "instead": "current item",
      "try": "sustainable alternative",
      "co2Reduction": "approximate kg CO2 saved"
    }
  ],
  "positives": ["things they did well, if any"]
}

Be specific, practical, and non-judgmental.
```

---

## 7. Firestore Security Rules — Write These Before Judges Check

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /profiles/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /carbon_scores/{scoreId} {
      allow read: if request.auth != null && resource.data.uid == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.uid == request.auth.uid;
    }

    match /user_missions/{docId} {
      allow read, write: if request.auth != null && resource.data.uid == request.auth.uid;
    }

    match /chat_history/{docId} {
      allow read, write: if request.auth != null && resource.data.uid == request.auth.uid;
    }

    match /receipts/{docId} {
      allow read, write: if request.auth != null && resource.data.uid == request.auth.uid;
    }

    // Public missions library (read-only for all authenticated users)
    match /missions/{missionId} {
      allow read: if request.auth != null;
      allow write: if false; // Admin only via Firebase console
    }
  }
}
```

> ⚠️ **Judges will check security rules.** The default "allow all" rules will cost you points.

---

## 8. Improved Firestore Schema

The original schema was correct but missing some fields that make the app actually work well.

```json
// users/{uid}
{
  "uid": "string",
  "name": "string",
  "email": "string | null",
  "avatar": "string | null",
  "isAnonymous": "boolean",
  "xp": "number",
  "level": "number",
  "badges": ["string"],
  "currentStreak": "number",
  "longestStreak": "number",
  "lastActiveDate": "timestamp",
  "createdAt": "timestamp",
  "lastLogin": "timestamp"
}

// profiles/{uid}
{
  "uid": "string",
  "diet": "vegan | vegetarian | eggetarian | nonveg",
  "commuteDistance": "number",
  "transportMode": "walk | cycle | public | car | bike",
  "acUsage": "none | minimal | moderate | heavy",
  "electricityRange": "low | medium | high",
  "shoppingFrequency": "rarely | monthly | weekly | daily",
  "flightsPerYear": "number",
  "recyclingHabit": "always | sometimes | never",
  "locationType": "urban | suburban | rural",   // NEW: affects recommendations
  "completedOnboarding": "boolean",
  "updatedAt": "timestamp"
}

// carbon_scores/{uid_date}  ← composite key for querying trends
{
  "uid": "string",
  "date": "string (YYYY-MM-DD)",
  "overall": "number",
  "transport": "number",
  "food": "number",
  "energy": "number",
  "shopping": "number",
  "waste": "number",
  "createdAt": "timestamp"
}

// user_missions/{uid_missionId_date}
{
  "uid": "string",
  "missionId": "string",
  "title": "string",           // Denormalized for display without extra fetch
  "category": "string",
  "xp": "number",
  "co2Saved": "number",
  "completed": "boolean",
  "completedAt": "timestamp | null",
  "generatedDate": "string (YYYY-MM-DD)"
}
```

---

## 9. Rate Limiting & Security (Don't Skip This)

The Gemini API calls are the most expensive. Add a simple rate limiter.

```typescript
// lib/utils/rateLimiter.ts
import { doc, getDoc, setDoc } from 'firebase/firestore';

export async function checkRateLimit(
  uid: string,
  action: 'chat' | 'scan',
  limit: number,
) {
  const key = `rate_limits/${uid}_${action}_${new Date().toISOString().slice(0, 10)}`;
  const ref = doc(db, key);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, { count: 1 });
    return true;
  }

  const { count } = snap.data();
  if (count >= limit) return false;

  await setDoc(ref, { count: count + 1 }, { merge: true });
  return true;
}

// Usage in API route:
// Chat: 20 messages/day per user
// Scanner: 5 scans/day per user
```

Also add to all API routes:

```typescript
// Input validation
import { z } from 'zod';

const ChatSchema = z.object({
  message: z.string().min(1).max(500),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().max(1000),
      }),
    )
    .max(20),
});
```

---

## 10. Testing Strategy — Minimum Viable, Maximum Score

You don't need 100% coverage. You need tests in the right places.

### Unit Tests (Jest)

```typescript
// __tests__/unit/carbonScore.test.ts
describe('calculateCarbonScore', () => {
  it('should give high scores to low-emission profiles', () => {
    const veganCyclist = { diet: 'vegan', transportMode: 'cycle', ... };
    expect(calculateCarbonScore(veganCyclist).overall).toBeGreaterThan(80);
  });

  it('should give low scores to high-emission profiles', () => {
    const heavyDriver = { diet: 'nonveg', transportMode: 'car', flightsPerYear: 10, ... };
    expect(calculateCarbonScore(heavyDriver).overall).toBeLessThan(40);
  });

  it('should return scores between 0 and 100', () => {
    // fuzz test with random inputs
  });

  it('transport weight should be 30% of overall score', () => { ... });
});
```

### E2E Tests (Playwright)

```typescript
// __tests__/e2e/onboarding.spec.ts
test('complete onboarding creates carbon score', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="guest-login"]');
  // Complete onboarding steps
  // Assert dashboard shows a score
  await expect(page.locator('[data-testid="carbon-score"]')).toBeVisible();
});

test('chat with AI coach returns response', async ({ page }) => { ... });
```

> **Why this matters:** The judges' rubric says "Testing – validation of functionality." Even 5 meaningful tests > 0 tests.

---

## 11. Accessibility Checklist (Don't Lose Easy Points)

```
✅ All images have alt text (including AI-generated content — add aria-live regions)
✅ Color contrast ≥ 4.5:1 for normal text, ≥ 3:1 for large text
✅ All form inputs have associated <label> elements
✅ Keyboard navigation works for all interactive elements
✅ Focus indicators visible (don't remove outline without replacement)
✅ Modals/dialogs trap focus correctly
✅ Loading states have aria-live="polite" announcements
✅ Error messages are associated with inputs via aria-describedby
✅ Color is never the ONLY indicator of status (use icon + color)
✅ Animations respect prefers-reduced-motion
```

Add this to your global CSS:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 12. UI/UX Design Direction (Make It Look Like a Product)

The original plan mentioned "Mobile-first" but gave no design guidance. Here's what wins visually.

### Design Identity

- **Primary color:** `#16a34a` (deep forest green) — earthy but not cliché
- **Accent:** `#84cc16` (lime green) — progress, life, growth
- **Warning:** `#f59e0b` (amber) — medium impact
- **Danger:** `#ef4444` (red) — high impact
- **Background:** `#0f172a` (dark slate) for dark mode OR `#f0fdf4` (green-tinted white) for light
- **Font:** Geist (already in Next.js default) — clean, modern, readable
- **Radius:** `0.75rem` — friendly but not bubbly

### Must-Have UI Moments

1. **Carbon Score Ring** — circular progress ring showing score, animates on first load. This is your "wow" first impression.
2. **Streak Flame** — 🔥 icon with streak count, visible on every page's header
3. **Mission Cards** — Tappable, with difficulty badge and CO₂ impact shown prominently
4. **Chat Bubbles** — Coach has a small leaf avatar, messages appear with a typing indicator
5. **Category Bars** — Horizontal bars for Transport/Food/Energy etc. with color-coded performance

### Mobile-First Pages Priority

Dashboard → Coach → Missions (in that order)

---

## 13. README Structure That Wins

The README is evaluated. Here's the exact structure:

```markdown
# 🌿 CarbonDetox — AI Sustainability Coach

> Detox your lifestyle, one habit at a time.

[Live Demo](url) | [Video Walkthrough](url)

---

## The Problem

[2-3 sentences on the problem, grounded in real data]

## The Solution

[What CarbonDetox does, in 3 bullet points]

## Features

[Feature list with ✅ for implemented, 🔜 for planned]

## Architecture

[Simple ASCII or diagram showing the flow]

## Tech Stack

[Table: Layer | Technology | Why]

## AI Logic

[Explain how Gemini is used — context injection, prompting strategy]

## Carbon Scoring Formula

[Show the formula and source of emissions data]

## Database Design

[Schema tables — NOT code blocks, use markdown tables]

## Security

[List security measures implemented]

## Accessibility

[WCAG compliance measures taken]

## Setup & Running Locally

[Step-by-step, actually tested]

## Assumptions

[Be honest — judges respect this]

## Future Scope

[2-3 realistic items]
```

---

## 14. Revised Development Phases (Hackathon-Optimized)

The original 10-phase plan was good but too granular. Here's a time-boxed hackathon version.

### Phase 1 — Foundation (2–3 hours)

- [ ] Next.js 15 project init with TypeScript strict mode
- [ ] ESLint + Prettier configured
- [ ] Tailwind + shadcn/ui setup
- [ ] Firebase project created (Auth + Firestore + Storage)
- [ ] Environment variables setup (`.env.local` + `.env.example`)
- [ ] Firestore security rules written (before any data)
- [ ] GitHub repo created, initial commit

### Phase 2 — Auth + Onboarding (2–3 hours)

- [ ] Firebase Auth (Google + Anonymous)
- [ ] `useAuth` hook
- [ ] Landing page (not just lorem ipsum — real copy)
- [ ] Onboarding assessment (6-question stepper)
- [ ] Profile saved to Firestore

### Phase 3 — Carbon Score Engine (1–2 hours)

- [ ] Pure scoring function written
- [ ] Unit tests written for scoring (do this NOW, not later)
- [ ] Score saved to Firestore on onboarding complete
- [ ] Firestore index created for score trend queries

### Phase 4 — Dashboard (2 hours)

- [ ] Score ring component
- [ ] Category breakdown cards
- [ ] Streak display
- [ ] Basic trend chart (Recharts or shadcn Charts)

### Phase 5 — AI Coach (2–3 hours)

- [ ] `/api/coach` route handler with Gemini
- [ ] Context injection (profile + score + missions)
- [ ] Rate limiting (20 messages/day)
- [ ] Chat UI with typing indicator
- [ ] Input validation with Zod

### Phase 6 — Daily Missions (2 hours)

- [ ] `/api/missions` route — Gemini generates 3 missions/day
- [ ] Mission cards with XP display
- [ ] Mark complete → XP awarded → streak updated
- [ ] Yesterday's missions excluded from generation prompt

### Phase 7 — Receipt Scanner (1–2 hours)

- [ ] Image upload to Firebase Storage
- [ ] `/api/scanner` route with Gemini Vision
- [ ] Analysis display (items + swap suggestions)
- [ ] Rate limiting (5 scans/day)

### Phase 8 — Progress + Gamification (1–2 hours)

- [ ] Progress page with score trend chart
- [ ] Mission completion history
- [ ] Level + badge display
- [ ] Streak tracking

### Phase 9 — Polish + PWA (1 hour)

- [ ] PWA manifest + service worker (next-pwa)
- [ ] Accessibility audit (run axe DevTools)
- [ ] Mobile responsiveness check
- [ ] Loading skeletons everywhere (no bare spinners)
- [ ] Error boundaries

### Phase 10 — Tests + Deploy (1–2 hours)

- [ ] E2E tests for onboarding + chat flow
- [ ] Deploy to Vercel (or Cloud Run if required)
- [ ] README finalized
- [ ] Final commit

**Total: ~18–22 hours of focused work.** Doable solo in a weekend hackathon.

---

## 15. Differentiators That Make You Memorable

These are the "judge opens your project and goes wow" moments:

### 1. India-First Context 🇮🇳

Most carbon tools are built for Western lifestyles. CarbonDetox should:

- Reference Indian transport (auto, metro, BRTS, e-rickshaw)
- Indian diet context (dal-rice vs burger)
- Indian electricity tariffs (units, not kWh jargon)
- Indian flight patterns (domestic = Chennai to Delhi, not NYC to LA)

This shows real-world usability — a judge criterion.

### 2. CO₂ in Relatable Units

Instead of "120 kg CO₂e" say:

- "Equivalent to driving Mumbai to Pune 4 times"
- "Like charging your phone 14,000 times"
- "Equal to 50 plastic bags of emissions"

Build a `formatCO2(kg: number): string` utility that does this automatically.

### 3. The Guest Mode That Actually Works

Most apps gate everything behind auth. CarbonDetox should let guest users:

- Complete onboarding
- See their score
- Chat with the coach (5 messages limit)
- View 1 daily mission

This makes the demo dramatically more impressive — judges can try it without logging in.

### 4. AI Missions Rooted in Real Life

Generic missions fail. Good missions sound like:

> "Take a tiffin box for today's lunch instead of ordering delivery. Saves ~0.8 kg CO₂ and ₹80."

The rupee savings angle (sustainability = saves money) is underused and powerful for the student persona.

### 5. One Shareable Moment

Generate a "My Carbon Score" card (like Spotify Wrapped) that users can screenshot. This shows product thinking beyond just functionality.

---

## 16. Things That Will Silently Kill Your Score

- ❌ Hardcoding API keys anywhere (even in git history — use `.env`)
- ❌ No Firestore rules (default is "allow all" — a massive security fail)
- ❌ TypeScript with `any` everywhere (defeats the purpose)
- ❌ `console.log` left in production code
- ❌ `<img>` instead of Next.js `<Image>` (performance hit, accessibility flag)
- ❌ No loading states (blank screens look broken)
- ❌ No error handling (API failures crash the UI)
- ❌ Repo > 10 MB (disqualification risk — check with `du -sh .git`)
- ❌ Committing `.env.local` (add to `.gitignore` immediately on day 1)
- ❌ Single giant commit (commit after each phase — shows process)

---

## 17. Repo Size Management (Critical Rule: < 10 MB)

```bash
# Check your repo size before submitting
du -sh .git

# Add to .gitignore
node_modules/
.next/
.env.local
*.log
coverage/
.firebase/
firebase-debug.log

# If you accidentally committed node_modules
git rm -r --cached node_modules
git commit -m "Remove node_modules from tracking"
```

Keep images in Firebase Storage, never in the repo. Use SVGs for icons.

---

## 18. Final Submission Checklist

```
☐ All Tier 1 features working end-to-end
☐ At least 1 Tier 2 feature working (Receipt Scanner recommended)
☐ Firestore security rules deployed
☐ TypeScript strict mode, no `any` without justification
☐ ESLint passes with zero errors
☐ At least 5 unit tests passing
☐ At least 1 E2E test passing
☐ Accessibility: run axe DevTools, fix critical + serious issues
☐ Mobile responsive (test on 375px width)
☐ .env.local NOT in repo
☐ .env.example IS in repo (with placeholders)
☐ README is complete with all sections
☐ Live deployment URL in README
☐ Repo is public, single branch (main)
☐ Repo size < 10 MB
☐ At least 10 commits showing progress (not one giant dump)
☐ No hardcoded secrets
☐ Rate limiting on all Gemini API routes
☐ Guest mode works without login
```

---

## 19. The One-Line Pitch for Judges

When the judges read your README's first line, they should immediately understand:

> **CarbonDetox is an AI sustainability coach that gives Indians a personalized carbon health score and daily missions to build eco-friendly habits — not just a calculator, but a coach.**

The word "Indians" (or "people in India") is a strategic inclusion — it signals real-world applicability and contextual thinking, which directly maps to the "Practical and real-world usability" evaluation criterion.

---

_Built with precision. Submitted early. Wins._ 🌿
