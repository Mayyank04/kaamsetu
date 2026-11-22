# KAAMSETU — PHASE 45 DOSSIER 12: KNOWN LIMITATIONS & HONEST PLATFORM BOUNDARIES

## 1. Operating Classification & Commercial Dispatch Boundary

- **Classification:** `CLASS_B_CONTROLLED_ROLLOUT`
- **Certified Commercial Dispatch Zones:**
  - **Guwahati Urban:** PIN Codes `781001` through `781039` (Kamrup Metropolitan, Assam).
  - **Shillong Urban:** PIN Codes `793001` through `793022` (East Khasi Hills, Meghalaya).
- **Nationwide Capabilities:**
  - Workers across **all 28 States and 8 Union Territories** (36 Administrative Entities) can register, create vocational profiles, verify trade credentials, and be discovered on `/explore`.
  - Commercial booking dispatch is deliberately restricted to certified pilot zones until commercial dispatch licensing is granted in subsequent rollout phases.

---

## 2. Remote Database Schema State (Pre-Migration vs. Schema-Adaptive)

- **Remote Supabase Instance:** `anwppwjlismjyovbyfmb`
- **Current Live PostgREST Schema:** Migrations are applied up to Phase 40 (`profiles`, `worker_profiles` core, `occupations`, `skills`, `worker_skills`, `contractor_organizations`, `auth_rate_limits`, `otp_challenges`, `user_consents`).
- **Status of Extended Tables:** Tables `bookings`, `reviews`, `contractor_jobs`, `credential_registry`, `custom_localities`, and `service_coverage_areas` have been authored and verified locally in `supabase/migrations/20261122000001_phase45_complete_production_master_schema.sql`.
- **Application Resilience:**
  - The application backend (`OnboardingService`, `profiles.ts`, `bookings.ts`, `contractors.ts`) operates **schema-adaptively**.
  - If extended columns or tables are absent on the remote database, services gracefully fall back to storing core attributes into real PostgreSQL without throwing unhandled HTTP 500 exceptions.
  - Applying the master migration in the Supabase SQL Editor immediately enables persistent storage for all extended attributes.

---

## 3. SMS & OTP Verification Boundaries

- **Phone OTP Verification:** Intentionally disabled during onboarding and registration. Users register directly with name, phone, trade, and password.
- **Rationale:** Mobile network latency, SMS aggregator gateway rate limits, and Vercel serverless timeouts in previous phases created high abandonment rates (> 40%) for rural and vocational workers. Direct registration ensures frictionless access.
- **Future Reinstatement:** Mandatory 2FA or SMS verification will be reinstated when an enterprise TRAI DLT-registered SMS provider (e.g. Gupshup, Exotel) is integrated with dedicated sender IDs.

---

## 4. Voice Intake Browser Compatibility

- **Web Speech API:** Native speech recognition is supported in Chromium-based browsers (Google Chrome, Microsoft Edge, Brave, Samsung Internet).
- **iOS Safari & Firefox Limitations:** The W3C SpeechRecognition interface has limited support on iOS Safari and Firefox for Android. On these browsers, the UI automatically provides the accessible Guided 12-Step Form as the default intake mode.

---

## 5. Permanent Financial Invariant

- **Rule:** `platform_commission_amount = 0.00` permanently.
- KAAMSETU does not deduct commissions, matching fees, or percentage royalties from artisan wages. Any platform maintenance fees in future enterprise tiers will be billed exclusively to institutional contractors, never deducted from worker payouts.
