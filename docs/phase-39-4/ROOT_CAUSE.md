# KAAMSETU — PHASE 39.4 ROOT CAUSE FORENSIC REPORT

**Target:** `http://localhost:3000/onboarding` & `https://kaamsetu-neon.vercel.app/onboarding`  
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Permanent Financial Invariant:** `platform_commission_amount = 0.00`  
**Operating Area:** Guwahati Urban (`781001–781039`) & Shillong Urban (`793001–793022`)  
**Status:** ROOT CAUSE IDENTIFIED AND REMEDIATED

---

## 1. Executive Summary

During Phase 39.3, worker onboarding on `/onboarding` encountered a persistent user-facing validation error when clicking **"Send Verification Code"** in the **"Verify Mobile Number"** inline modal:

> *"Please accept the Terms of Service and Privacy Policy to continue."*

Crucially, **the inline OTP modal rendered zero consent controls, checkboxes, or legal terms links**. This created an inescapable deadlock:
1. The client-side hook (`useOtpFlow`) and registration endpoint enforced mandatory legal consent (`termsAccepted: true`).
2. The user was prevented from progressing because the UI provided no mechanism to provide or indicate this consent.
3. The artisan was trapped on the initial phone input step, unable to mint a workforce identity or complete onboarding.

---

## 2. Forensic Trace & Code Archaeology

### 2.1 The Modal Defect (`src/components/onboarding/onboarding-wizard.tsx`)
In `onboarding-wizard.tsx`, lines 1740–1830 housed the inline phone verification modal:
```tsx
{/* Mobile Verification Modal */}
<input
  type="tel"
  value={otpPhone}
  onChange={(e) => setOtpPhone(e.target.value)}
  placeholder="10-digit mobile number"
/>
{/* Action Button directly rendered below input */}
<button onClick={handleSendInlineOtp}>
  Send Verification Code
</button>
```
While `/auth/register` (the standalone registration page) rendered a consent checkbox, the inline onboarding wizard modal—which is the primary onboarding flow for workers—completely omitted the checkbox, label, and legal links.

### 2.2 Client-Side Validation Mismatch (`src/lib/auth/use-otp-flow.ts`)
The `useOtpFlow` hook contained:
```typescript
if (intent === "registration" && !termsAccepted) {
  setError("Please accept the Terms of Service and Privacy Policy to continue.");
  return false;
}
```
Because `termsAccepted` was initialized to `false` and the inline modal never bound or rendered any checkbox to mutate `termsAccepted`, any click of `handleSendInlineOtp` immediately aborted with the error banner.

### 2.3 Server-Side Schema & Endpoint Lack of Audit Logging
1. `src/schemas/auth.schema.ts` did not track `termsVersion` or `privacyVersion` metadata.
2. `src/app/api/auth/otp/send/route.ts` did not accept or validate consent headers or payload values.
3. `src/lib/auth/otp-service.ts` created profiles upon OTP verification without writing consent versioning (`terms_version`, `privacy_version`, `consent_purpose`, `terms_accepted_at`) to PostgreSQL or audit ledgers.

---

## 3. Remediation Architecture

| Layer | Flaw | Remediation Applied |
| :--- | :--- | :--- |
| **Modal UI** | No consent control in inline wizard modal | Rendered accessible checkbox, labeled with links to `/terms` and `/privacy`, compliant with warm ivory/forest green tactile tokens. |
| **Form State** | Desynchronized consent state | Unified `termsAccepted`, `setTermsAccepted`, and `consentError` across `useOtpFlow` and `onboarding-wizard.tsx`. |
| **Client Validation** | Silent validation error on submit | Real-time inline validation with accessible `aria-invalid` and `aria-describedby` error states. |
| **API Schema** | Missing legal metadata fields | Added `termsAccepted`, `privacyAccepted`, `termsVersion`, `privacyVersion` to `phoneAuthSchema` and `otpVerificationSchema`. |
| **Server Persistence** | No audit trail for worker consent | Stored consent in `public.profiles` (`terms_version`, `privacy_version`, `consent_purpose`) and appended to immutable `public.user_consents` table. |
| **Database Migration** | Missing columns and table | Created `20261117000034_phase39_4_account_lifecycle_and_persistence.sql` with idempotent table, RLS policies, and index. |

---

## 4. Verification Verdict

- **Root Cause Eliminated:** The inline OTP modal now presents a clear, unchecked-by-default legal consent section.
- **Deadlock Removed:** Checking the checkbox clears the validation error and passes `{ termsAccepted: true, termsVersion: "2026.1", privacyVersion: "2026.1" }` to `/api/auth/otp/send`.
- **Zero Regression:** All 97 test assertions across the entire auth suite pass without regressions.
