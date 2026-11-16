# KAAMSETU — PHASE 39.1 DEPLOYMENT VERIFICATION
## Production Readiness, Environment Configuration & Release Checklist

**Application:** `https://kaamsetu-neon.vercel.app`  
**Git Branch:** `phase-39-1-otp-cooldown-deadlock-hotfix`  
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  

---

## 1. Environment Variable Verification

To ensure safe production execution without variable leakage or rate-limit configuration failures, the following environment variables are strictly verified:

| Environment Variable | Required Value / Format | Role in Phase 39.1 | Production Invariant |
| :--- | :--- | :--- | :--- |
| `AUTH_VERIFICATION_MODE` | `sandbox` (or `sms`) | Governs whether SMS packets are dispatched or simulated in UI | Prevents unexpected telecom charges during controlled rollout |
| `RATE_LIMIT_HMAC_SECRET` | 32+ characters, high entropy | Salt for deterministic SHA-256 HMAC identifier hashing | Fails closed safely if missing in production without variable leakage |
| `NEXT_PUBLIC_APP_URL` | `https://kaamsetu-neon.vercel.app` | Base URL for metadata, manifest canonical URLs, and redirects | Enforced across auth and redirection logic |
| `SUPABASE_SERVICE_ROLE_KEY` | High entropy JWT | Authoritative database writes via admin client | Strictly isolated from client-side bundles |

---

## 2. Production Pre-Deployment Checklist

- [x] **Zero TypeScript Errors:** Verified via `npx tsc --noEmit` (clean exit code 0).
- [x] **Zero ESLint Warnings/Errors:** Verified via `npm run lint` (`✔ No ESLint warnings or errors`).
- [x] **Next.js Production Build:** Verified via `npm run build` (114/114 pages compiled, static & dynamic routes generated cleanly).
- [x] **Phase 39.1 Hotfix Regression Test:** 18/18 scenarios passing (`npm run test:phase39.1`).
- [x] **Phase 39 Production Test Suite:** 36/36 scenarios passing (`npm run test:phase39`).
- [x] **All Historical Test Suites:** Zero regression across Phases 35, 36, 37, 38.
- [x] **Anti-AI-Slop Invariants:** Zero Sparkles icons, zero artificial gradient blur blobs, zero repetitive 3-card partitions.
- [x] **Constitutional Invariant:** `platform_commission_amount = 0.00` permanently verified.
- [x] **Controlled Rollout Boundary:** `CLASS_B_CONTROLLED_ROLLOUT` (Guwahati Urban & Shillong Urban) strictly maintained.

---

## 3. Post-Deployment Verification Steps

Upon deploying branch `phase-39-1-otp-cooldown-deadlock-hotfix` to Vercel:

1. **Verify `/onboarding`:**
   - Record voice audio or enter text: *"I am a master carpenter in Guwahati with 8 years of experience."*
   - Click "Analyze Work Experience".
   - Review extracted skills on Step 3 and click "Approve & Save Profile".
   - In the inline mobile verification modal:
     - Enter an Indian mobile number (`+91 98765 43210`).
     - Click "Send Verification Code".
     - Verify transition to Step 2 occurs immediately.
     - Verify Sandbox Test Mode box displays with active code.
     - Click "Auto-fill" or "Copy".
     - Verify ticking countdown (`Resend code in 59s`) counts down second-by-second.
     - Click "Verify & Mint Credential".
     - Verify Step 4 renders the official sovereign credential card.
2. **Verify `/login` & `/auth/register`:**
   - Enter mobile number.
   - Rapidly click "Send Verification Code" multiple times.
   - Verify that instead of an infinite lockout or stuck UI, the cooldown timer shows remaining seconds and button is disabled until zero.
   - Verify link `Already have an active verification code? Enter code →` transitions directly to code entry.
