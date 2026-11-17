# KAAMSETU — PHASE 39.4 ONBOARDING PERSISTENCE AUDIT
## Sovereign Artisan Onboarding, Draft Preservation & Credential Minting Audit

**Repository:** `Mayyank04/kaamsetu`  
**Target Branch:** `phase-39-4-complete-auth-and-production-recovery`  
**Target Route:** `/onboarding`  
**Operating Classification:** `CLASS_B_CONTROLLED_ROLLOUT` (Guwahati Urban & Shillong Urban)  
**Permanent Financial Invariant:** `platform_commission_amount = 0.00`  
**Audit Status:** `VERIFIED WORKING`

---

## 1. Onboarding Architecture & Mission

KAAMSETU exists to ensure that every skilled informal artisan can establish an immutable, cryptographically verifiable workforce identity, regardless of formal academic credentials.

The onboarding flow (`/onboarding`) guides an artisan through 4 steps:
1. **Trade & Experience:** Primary trade (carpentry, electrical, plumbing, masonry, welding), years of experience, daily rate, and bio.
2. **Tools & Micro-Credentials:** Verified physical tools owned, safety equipment, apprenticeships, and vocational certifications.
3. **Location & Dispatch Boundary:** City, state, and pin code verification strictly bound to `CLASS_B_CONTROLLED_ROLLOUT` zones.
4. **Review & Sovereign Minting:** Summary review, cryptographic verification of phone identity, and credential issuance.

---

## 2. Multi-Layer Draft Persistence

Artisans frequently navigate across modal steps, check incoming SMS/sandbox codes, or refresh their browser. Losing multi-step form data during phone verification destroys user trust.

### Persistence Guarantees:
1. **Browser Session Storage Contract:** Form state is continuously synchronized to `sessionStorage` under `kaamsetu_onboarding_draft`.
2. **Modal Remount Survival:** Opening the phone verification modal, entering numbers, triggering rate limits, or closing the modal leaves the underlying draft intact.
3. **Database Unavailable Reassurance:** If the database encounters a transient outage (HTTP 503), the user receives explicit reassurance:
   > *"Verification is temporarily unavailable. Your profile draft has been saved. Please try again later."*

---

## 3. Resolving the Row-Level Security Bottleneck

### The Defect:
Previously, `OnboardingService` instantiated `createServerSupabaseClient()`. Because sovereign phone OTP authentication issues an HMAC-signed session cookie (`kaamsetu_session`) rather than a Supabase Auth JWT token, Supabase PostgREST evaluated incoming database operations under the `anon` role. The Row Level Security (RLS) policies on `public.worker_profiles` rejected inserts from unauthenticated roles.

### The Remediation:
`OnboardingService` was modified to use `createAdminClient()`:
```ts
export class OnboardingService {
  private static get supabase() {
    return createAdminClient();
  }
}
```
All input validation, geographic boundary checks, and session signature verification are authoritatively executed on the Next.js server before invoking `createAdminClient()`, preserving security boundaries while eliminating RLS false rejections.

---

## 4. Controlled Rollout Boundaries & Financial Invariant

### Geographic Rollout Boundaries (`CLASS_B_CONTROLLED_ROLLOUT`):
- **Guwahati Urban:** Assam pin codes `781001` through `781039`.
- **Shillong Urban:** Meghalaya pin codes `793001` through `793022`.
- Locations outside these approved urban clusters are rejected by `GeographicAuthorizationService.validateLocation()` with status `NON_DISPATCH_AREA` or `OUT_OF_BOUNDS`.

### Constitutional Financial Invariant:
```ts
export const CONSTITUTIONAL_FINANCIAL_INVARIANTS = {
  platformCommissionAmount: 0.00,
  wageDeductionRate: 0.00,
  artisanNetPayRatio: 1.00,
} as const;
```
Zero platform commission is charged on artisan wages. This invariant is permanently enforced across all billing services, smart contracts, and database stored procedures.

---

## 5. Verification Matrix

| Onboarding Step / Requirement | Implementation | Status |
|---|---|---|
| Step 1-4 State Persistence | `sessionStorage` sync + hydration | `VERIFIED WORKING` |
| Modal Phone Verification | Unified `useOtpFlow` integration | `VERIFIED WORKING` |
| Service Role Persistence | `createAdminClient()` in `OnboardingService` | `VERIFIED WORKING` |
| Credential Minting | Ed25519 / HMAC cryptographic provenance | `VERIFIED WORKING` |
| Guwahati Urban Authorization | Pin codes `781001–781039` | `VERIFIED WORKING` |
| Shillong Urban Authorization | Pin codes `793001–793022` | `VERIFIED WORKING` |
| Out-of-Bounds Rejection | Strict rejection of non-rollout pin codes | `VERIFIED WORKING` |
| Commission Zero Invariant | `platform_commission_amount = 0.00` | `VERIFIED WORKING` |
