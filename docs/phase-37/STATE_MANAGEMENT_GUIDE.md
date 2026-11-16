# KAAMSETU — STATE MANAGEMENT & DRAFT PERSISTENCE GUIDE

**Programme:** KAAMSETU Digital Identity & Worker Empowerment Platform  
**Phase:** 37 — Scalable Architecture, Codebase Restructuring & Technical Debt Elimination  
**Status:** Certified & Grounded in Repository

---

## 1. Overview & Architectural Principles

KAAMSETU employs a clear state management hierarchy designed to support informal workers on mobile connections, preserve draft progress during multi-step onboarding, and maintain predictable data synchronization between client and server.

State is categorized into four explicit tiers:
1. **Server State:** Persistent data housed in PostgreSQL via Supabase, accessed through server repositories and domain services.
2. **URL / Route State:** Filters, navigation tabs, pagination, and modal query parameters managed directly in the browser URL (`searchParams`).
3. **Local Component State:** Ephemeral UI state (open/close dropdowns, audio playback status, input focus).
4. **Resilient Offline Draft State:** Multi-step voice onboarding draft data saved in `localStorage` under `kaamsetu_voice_onboarding_draft`.

---

## 2. Voice Onboarding Draft Persistence

### 2.1 The Problem
Workers operating in regions with intermittent mobile connectivity (such as Guwahati Urban or rural outskirts) frequently experience signal drops or browser tab restarts while recording spoken testimony or filling out trade details.

### 2.2 The Architecture
The voice onboarding flow (`src/components/onboarding/voice-onboarding-flow.tsx`) utilizes resilient local persistence:

1. **Storage Key:** `kaamsetu_voice_onboarding_draft`
2. **Schema:**
   ```typescript
   interface OnboardingDraft {
     step: number;
     selectedLanguage: string;
     fullName: string;
     phone: string;
     city: string;
     state: string;
     pincode: string;
     primaryTrade: string;
     yearsExperience: number;
     skills: string[];
     dailyRateMin: number;
     dailyRateMax: number;
     audioRecordingId?: string;
     audioStoragePath?: string;
     workerConfirmedVoice: boolean;
     lastSavedAt: string;
   }
   ```
3. **Lifecycle:**
   - **On Input:** Debounced write to `localStorage` on every step progression and form field change.
   - **On Mount:** Hydration check; if a valid uncompleted draft exists, the user is offered a prompt: *"Resume where you left off"*.
   - **On Successful Submission:** Draft key is explicitly purged upon receiving a `200 OK` from `/api/worker/onboarding/save`.

---

## 3. Server State & Mutation Protocol

1. **Read Path:**
   - Server Components fetch data directly using `src/server/database/repositories/`.
   - Client components fetch data via Route Handlers using standard fetch envelopes (`ApiResponse<T>`).
2. **Mutation Path:**
   - Client components trigger POST/PATCH/DELETE calls to API route handlers.
   - Route handlers validate schemas with Zod, invoke domain services, and return the standard envelope.
   - Next.js `revalidatePath` or client-side SWR/router refresh is invoked to invalidate stale cache.

---

## 4. URL State & Filter Synchronization

For discovery and directory views (`/explore`, `/contractor/workforce`):
- Filter state (trade, city, min KaamScore, availability) is mirrored into URL query parameters.
- Enables shareable links, browser back/forward navigation, and server-side rendering of filtered directory pages without client-only state drift.

---

## 5. Security & Session State

- Session cookies (`kaamsetu_session`, `sb-access-token`) are `HttpOnly; Secure; SameSite=Lax`.
- Session state is **never** mirrored to `localStorage` or `sessionStorage` to eliminate XSS token theft vectors.
- Auth state in client components is derived from server-rendered layouts or lightweight verification endpoints.
