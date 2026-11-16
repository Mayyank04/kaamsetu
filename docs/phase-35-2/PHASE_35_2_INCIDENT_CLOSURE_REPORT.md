# KAAMSETU — PHASE 35.2 INCIDENT CLOSURE & PRODUCTION REMEDIATION REPORT

**Programme:** KAAMSETU — Digital Identity & Worker Empowerment Platform  
**Workstream:** Phase 35.2 — Production Authentication Restoration, OTP Reliability, Onboarding Continuity & Security Hardening  
**Target Deployment:** `https://kaamsetu-neon.vercel.app`  
**Git Branch:** `phase-35-2-auth-onboarding-production-remediation`  
**Commit SHA:** `ddddd4f`  
**Constitutional Invariant:** `platform_commission_amount = 0.00` permanently on artisan wages  
**Operating Classification:** `CLASS_B_CONTROLLED_ROLLOUT` (Guwahati Urban, Assam & Shillong Urban, Meghalaya)  
**Date of Certification:** 16 November 2026  

---

## 1. EXECUTIVE SUMMARY & PRODUCTION DEFECT REPRODUCTION

Inspection of the live deployment `https://kaamsetu-neon.vercel.app` identified three blocking defects in production that compromised user experience, authentication continuity, and claims truthfulness:

### Incident A: Production Rate-Limiter Secret Configuration Failure
- **Observed Behavior:** On `/login` and `/api/auth/otp/send`, the production service threw an unhandled runtime error:
  `FATAL SECURITY CONFIGURATION: RATE_LIMIT_HMAC_SECRET is missing from environment in production.`
- **Security & Operational Impact:** Leaked internal environment variable names, threw raw 500 exceptions, and blocked artisan login and OTP generation whenever the HMAC secret was missing from the Vercel dashboard.
- **Root Cause:** `rate-limiter.ts` threw a fatal error without catching and failing-closed safely inside route handlers and rate-limit validators. Furthermore, Vercel was running commit `353db54` (origin/main) rather than the updated security challenge branch.

### Incident B: Worker Onboarding Authentication Interruption (Step 3 Save)
- **Observed Behavior:** On `/onboarding`, when an unauthenticated worker completed Step 2 (Voice Testimony) and approved Step 3 (Review & Skills), the save action failed with:
  `Action encountered an error: Authentication required. Please sign in to continue.`
- **Operational Impact:** Artisan testimonies were rejected at the final submission hurdle, causing disorientation and risk of lost draft progress.
- **Root Cause:** When `executeSave` received a 401 response from `/api/worker/onboarding/save`, it threw an unhandled exception rather than intercepting the 401, retaining `pendingSubmission`, and displaying the inline OTP modal.

### Incident C: Fabricated AI Confidence Scores & Unearned Verified Badges
- **Observed Behavior:** The extraction review interface previously rendered `72% AI Confidence` based on synthetic multipliers (`confidenceScore * 100`).
- **Institutional Impact:** Violated the core KAAMSETU principle: *Every skill deserves to be seen, even without a degree* by presenting arbitrary mathematical certainty over self-declared artisanal testimony.
- **Root Cause:** `extraction-editor.tsx` rendered `confidenceScore` from fallback heuristics and lacked explicit trade suggestion disclosures.

---

## 2. ENGINEERING REMEDIATION DETAILS

### 2.1 Incident A — Fail-Closed Rate Limiter & Zero Variable Leakage
1. **Sanitized User-Facing Error Messages:**
   - Modified `src/lib/security/rate-limiter.ts`, `src/app/api/auth/otp/send/route.ts`, `src/lib/auth/otp-service.ts`, and `src/app/login/page.tsx`.
   - Unified all production fail-closed and configuration error messages to:
     `"We're temporarily unable to process this request. Please try again shortly."`
   - Server-side errors are logged using structured JSON with `level: "fatal"` and never leaked to ordinary users or clients.
2. **Cryptographic Entropy Enforcement:**
   - `assertCryptographicKeyQuality` requires minimum 32 bytes (256 bits) of entropy, rejecting blank, short, or predictable secrets.
   - Provided exact production secret generation instructions for Vercel.

### 2.2 Incident B — Step 3 Authentication Interception & Draft Resilience
1. **HTTP 401 Interception:**
   - In `src/components/onboarding/onboarding-wizard.tsx`:
     ```typescript
     if (!response.ok || !result.success) {
       if (response.status === 401 || result.error?.code === "UNAUTHENTICATED") {
         setPendingSubmission(approved);
         setShowAuthModal(true);
         return;
       }
       throw new Error(result.error?.message || result.message || "Unable to save verified profile. Please retry.");
     }
     ```
2. **Reassuring Modal Copy:**
   - Updated the inline phone verification modal copy to:
     `"To issue your official cryptographic sovereign credential: Verify your mobile number to securely save your skill profile. Your information will remain available when you return."`
3. **Continuous Draft Persistence:**
   - Drafts are continuously backed up to `localStorage` under `kaamsetu_onboarding_draft`.
   - Upon successful inline OTP verification, `executeSave(pendingSubmission)` executes automatically without requiring page reloads or navigating away from `/onboarding`.
4. **Geographic Scope & Dispatch Eligibility:**
   - Artisans within Guwahati Urban (`781001-781039`) or Shillong Urban (`793001-793022`) receive `is_dispatch_eligible = true`.
   - Artisans outside these areas with `allowNonDispatchProfile = true` receive `is_dispatch_eligible = false`, preserving their sovereign digital identity while enforcing Class B controlled rollout boundaries.

### 2.3 Incident C — Truthful Disclosures & Honest Badging
1. **Elimination of "AI Confidence":**
   - Removed all calculations of `confidenceScore * 100` and `"AI Confidence"` text from `src/components/onboarding/extraction-editor.tsx`.
2. **Truthful Badging Ribbon:**
   - Added `Self-Declared Testimony` badge (`variant="outline"`).
   - Added `Trade suggestion — review and edit` badge (`variant="outline"`).
   - Added explicit NCO-2015 disclaimer: `"Suggested code based on testimony. Not a formal government certification or NSQF diploma."`
3. **Trust Badge Truthfulness:**
   - In `src/components/identity/trust-badge.tsx`, converted `voice_verified` from `"Voice Verified"` (`variant="verified"`) to `"Voice Attestation"` (`variant="outline"`).

---

## 3. INDEPENDENT VERIFICATION & TEST SUITE

A dedicated automated test suite was created in `test/phase-35-2-production-remediation.test.ts` to prevent any regressions.

```
> kaamsetu-digital-identity-platform@0.1.0 test:phase35.2
> tsx test/phase-35-2-production-remediation.test.ts

▶ Phase 35.2 — Incident A: Rate Limiter Fail-Closed Safety & Zero Variable Leakage
  ✔ should fail-closed safely when RATE_LIMIT_HMAC_SECRET is missing in production
  ✔ should accept high-entropy 256-bit cryptographically secure secrets in production
✔ Phase 35.2 — Incident A: Rate Limiter Fail-Closed Safety & Zero Variable Leakage

▶ Phase 35.2 — Incident B: Worker Onboarding Continuity & Interception Architecture
  ✔ should ensure onboarding wizard intercepts 401 and retains draft without losing data
  ✔ should enforce geographic boundary and dispatch eligibility rules during onboarding
✔ Phase 35.2 — Incident B: Worker Onboarding Continuity & Interception Architecture

▶ Phase 35.2 — Incident C: Absolute Elimination of Fabricated Confidence & Truthful Trade Badging
  ✔ should verify extraction-editor does NOT contain fabricated confidence score or unearned badges
  ✔ should verify trust-badge displays truthful Voice Attestation rather than Voice Verified
  ✔ should verify zero occurrences of fabricated AI confidence across all UI components
✔ Phase 35.2 — Incident C: Absolute Elimination of Fabricated Confidence & Truthful Trade Badging

ℹ tests 7
ℹ suites 3
ℹ pass 7
ℹ fail 0
```

### Full Regression Verification Summary:
- `npm run test:phase35.2`: 7/7 passed.
- `npm run test:phase35.1:addendum`: 15/15 passed (93 atomic assertions).
- `npm run test:phase35.1`: 32/32 passed (73 atomic assertions).
- `npm run verify:db`: 282/282 passed (0 failed).
- `npx tsc --noEmit`: 0 TypeScript errors.
- `npm run lint`: 0 ESLint warnings or errors.
- `npm run build`: 112/112 static pages generated; all API routes compiled cleanly.

---

## 4. VERCEL PRODUCTION DEPLOYMENT & CONFIGURATION RUNBOOK

To activate these fixes on the live deployment `https://kaamsetu-neon.vercel.app`:

### Step 1: Configure Production Environment Variables in Vercel Dashboard
Navigate to **Vercel Dashboard -> Project `kaamsetu-neon` -> Settings -> Environment Variables**:
Add or update the following variables for the **Production** environment:

| Variable Name | Environment | Value / Generation Rule | Purpose |
|---|---|---|---|
| `RATE_LIMIT_HMAC_SECRET` | Production | `SGLYmX2n/TjILPklwmayJRVxZUFyclMU/0wQQYlrV7I=` | 256-bit cryptographically secure secret for hashing rate-limit keys |
| `NEXT_PUBLIC_APP_URL` | Production | `https://kaamsetu-neon.vercel.app` | Canonical production URL for QR code verification and OAuth |
| `NODE_ENV` | Production | `production` | Production environment flag |

*Note on Secret Generation:* A fresh secret can also be generated at any time with:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Step 2: Merge Pull Request or Promote Branch
The remediation branch has been pushed to GitHub:
- **Branch:** `phase-35-2-auth-onboarding-production-remediation`
- **GitHub PR URL:** https://github.com/Mayyank04/kaamsetu/pull/new/phase-35-2-auth-onboarding-production-remediation
- **Commit SHA:** `ddddd4f`

Merge this PR into `main` (or trigger deployment from the branch in the Vercel Deployments tab). Vercel Git integration will immediately build and deploy commit `ddddd4f`.

### Step 3: Production Smoke Tests
Once deployed, verify the live deployment:
1. `GET https://kaamsetu-neon.vercel.app/api/health` — Verify status 200 and commit SHA matches `ddddd4f`.
2. `GET https://kaamsetu-neon.vercel.app/login` — Verify no fatal error banner appears. Enter an Indian mobile number and verify OTP delivery.
3. `GET https://kaamsetu-neon.vercel.app/onboarding` — Complete Voice Testimony, proceed to Step 3, confirm the badges display `"Self-Declared Testimony"` and `"Trade suggestion — review and edit"`, and click Approve. Confirm the inline verification modal opens seamlessly without error.

---

## 5. CONSTITUTIONAL STATUS & CERTIFICATION

- **Permanent Zero-Commission Invariant:** Verified (`platform_commission_amount = 0.00`).
- **Operational Scope:** Strictly enforced to Guwahati Urban and Shillong Urban.
- **Classification Status:** `CLASS_B_CONTROLLED_ROLLOUT` maintained.
