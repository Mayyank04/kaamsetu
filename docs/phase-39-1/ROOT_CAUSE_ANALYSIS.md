# KAAMSETU — PHASE 39.1 ROOT CAUSE ANALYSIS
## OTP Cooldown Deadlock, Sandbox Verification Lockout & Onboarding Registration Failure

**Classification:** Critical P0 Incident Analysis  
**Repository:** `Mayyank04/kaamsetu`  
**Base Commit:** `b467393`  
**Branch:** `phase-39-1-otp-cooldown-deadlock-hotfix`  
**Operating Boundary:** `CLASS_B_CONTROLLED_ROLLOUT` (Guwahati Urban & Shillong Urban)  
**Constitutional Invariant:** `platform_commission_amount = 0.00` on artisan wages  

---

## 1. Executive Summary & Incident Description

During live testing of the worker onboarding flow at `/onboarding`, users reported that after completing Step 3 (Reviewing skills and trade attestations) and approving their profile, an inline verification modal opened prompting for their Indian mobile number (`+91`). 

Upon entering an Indian mobile number and submitting:
1. The UI instantly rendered an error notice: `Please wait 60 seconds before requesting a new code.`
2. The modal remained locked on Step 1 (phone number entry).
3. The countdown timer was rendered as static text with no live ticking seconds.
4. Clicking "Send Verification Code" repeatedly hit the rate limiter, resetting or holding the cooldown lock.
5. In sandbox mode, no SMS was dispatched, but the sandbox test code was never surfaced in the modal.
6. The user was prevented from transitioning to Step 2 to enter the active verification code that had already been generated on the server.
7. Consequently, the user could not save their profile or mint their sovereign cryptographic credential.

---

## 2. Comprehensive Root Cause Triangulation

Our investigation identified four interlocking architectural and frontend defects:

### Root Cause 1: Frontend State Machine Deadlock & 429 Error Trapping
In `src/components/onboarding/onboarding-wizard.tsx` (and previously `login/page.tsx` and `register/page.tsx`), the flow between Step 1 (phone entry) and Step 2 (OTP entry) was governed by a primitive boolean flag:
```typescript
const [authOtpSent, setAuthOtpSent] = React.useState(false);
```
When `handleSendInlineOtp` was triggered:
```typescript
const res = await fetch("/api/auth/otp/send", { ... });
const data = await res.json();
if (!res.ok || !data.success) {
  throw new Error(data.message || "Failed to transmit verification code.");
}
setAuthOtpSent(true);
```
When an active challenge already existed on the backend (or when the user re-submitted), the backend responded with HTTP `429 Too Many Requests`. The `fetch` call treated HTTP 429 as `!res.ok`, triggering the `catch` block. 
`setAuthOtpSent(true)` was never reached. The user was permanently pinned on Step 1 with a static error string, unable to input the code or view challenge status.

### Root Cause 2: Phase 39 Attribute Incompatibility in Onboarding Wizard
In Phase 39, demo personas were excised and replaced by transparent sandbox mode. `otp-service.ts` was updated to return:
```typescript
{
  success: true,
  isSandbox: true,
  sandboxCode: "829104",
  ...
}
```
However, `onboarding-wizard.tsx` contained legacy code expecting hackathon attributes:
```typescript
if (data.isDemo || data.requiresDemoCode) {
  setAuthDemoHint("Sandbox Mode: Enter code 123456 to verify.");
  setAuthOtp("123456");
}
```
Because `data.isDemo` was false in production, the sandbox test code was never populated, and `authDemoHint` remained null. Users did not receive an SMS (telecom packets are isolated in sandbox mode) and saw no test code in the UI, leading them to re-click "Send Verification Code", immediately hitting the 60-second cooldown lock.

### Root Cause 3: In-Memory Rate Limiter Reset Drift
In `src/lib/security/rate-limiter.ts`:
1. The in-memory rate-limiter bucket did not initialize `blockedUntil` on the first request for buckets with `maxAttempts = 1` (the 60s cooldown bucket).
2. On repeat requests within the block window:
```typescript
if (bucket.count >= maxAttempts) {
  bucket.blockedUntil = now + blockSeconds * 1000;
  ...
}
```
Every time a frustrated user clicked the button, `bucket.blockedUntil` was re-extended by another 60 seconds from `Date.now()`. Repeated clicks trapped the user in an infinite cooldown loop.

### Root Cause 4: Server Blindness to Active Unexpired Challenges
When a client requested an OTP while rate-limited, `/api/auth/otp/send` rejected with HTTP 429 without querying whether an active, unconsumed challenge was already valid for that telephone number.
The server failed to disclose `hasActiveChallenge: true` or the active `sandboxCode`, depriving the client of the information necessary to advance to Step 2 and consume the valid challenge.

---

## 3. Scope of Impact

| Surface | Defect Profile | User Impact | Severity |
| :--- | :--- | :--- | :--- |
| **Worker Onboarding (`/onboarding`)** | Deadlocked on Step 1 on 429; no sandbox code displayed | User could not save profile or mint sovereign card | P0 (Critical) |
| **User Sign In (`/login`)** | 429 pinned on Step 1; no live ticking timer | User locked out for 60 seconds on rapid click | P1 (High) |
| **User Registration (`/auth/register`)** | 429 pinned on Step 1; no auto-advance to Step 2 | User could not complete account creation | P1 (High) |
| **Rate Limiter (`rate-limiter.ts`)** | `blockedUntil` re-extended on repeat requests | Cooldown duration artificially extended | P0 (Critical) |

---

## 4. Remediation Architecture & Invariant Preservation

The complete remediation consists of:
1. **Mathematical Rate Limit Window Immutability:** `blockedUntil` is computed once upon initial block and NEVER re-extended on subsequent re-checks.
2. **Active Challenge Recovery on 429:** When cooldown is hit, `otp-service.ts` checks if an active challenge exists. If so, it returns `hasActiveChallenge: true`, `nextAllowedAt`, and `sandboxCode` (in sandbox mode) alongside HTTP 429.
3. **Formal OTP State Machine (`useOtpFlow` hook):** Encapsulates the states `idle`, `requesting`, `cooldown`, `code_sent`, `verifying`, `verified`, `rate_limited`.
4. **Live Ticking Interval Ticker:** Dynamic, 1-second interval ticker computing exact remaining delta without clock drift.
5. **SessionStorage Persistence:** Preserves countdown and sandbox code across modal closing, tab switching, and remounts.
6. **One-Click Sandbox Test Helpers:** "Auto-fill" and "Copy" buttons allowing instant, frictionless verification in sandbox mode.
7. **Draft Resilience:** Onboarding draft in `localStorage` remains completely isolated from auth modal interactions.
8. **Constitutional Invariant:** Artisan commission remains `0.00%` permanently.
