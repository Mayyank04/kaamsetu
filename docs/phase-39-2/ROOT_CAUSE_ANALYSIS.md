# KAAMSETU — PHASE 39.2 COMPREHENSIVE ROOT CAUSE ANALYSIS (RCA)

**Incident Classification:** Critical Service Interruption / User Registration Deadlock  
**Target Flow:** Worker Mobile Verification & Sovereign Onboarding (`/onboarding`)  
**Root Cause Category:** Remote Database Missing RPC + Fail-Closed Masking + Webpack Module Isolation  
**Date of Root Cause Remediation:** 17 November 2026  

---

## 1. Problem Statement

On 16 November 2026 at 11:05 PM, an artisan user attempting to onboard on KAAMSETU experienced an immediate deadlock on mobile verification:
1. Entering any valid Indian mobile number (even one never previously entered) produced a red error:
   `Please wait 60 seconds before requesting a new code.`
2. The primary button remained disabled or locked on `Send Verification Code`.
3. No active timer or countdown was displayed to inform the user when they could proceed.
4. No challenge was recorded, leaving the worker stranded on the initial step.

---

## 2. Five Whys Deep-Dive Analysis

### Why 1: Why did the UI display "Please wait 60 seconds before requesting a new code" immediately on the first attempt?
Because the backend API endpoint `/api/auth/otp/send` responded with `status: 429` (or `400`) and the string `"Please wait 60 seconds before requesting a new code."`

### Why 2: Why did `/api/auth/otp/send` report a rate limit cooldown for a mobile number that had never made a request?
Because in `src/lib/security/rate-limiter.ts`, the rate limiter invoked a remote Supabase RPC named `check_and_increment_rate_limit`. The remote database project (`anwppwjlismjyovbyfmb`) did not have this stored procedure defined, returning PostgREST error:
`PGRST202: Could not find the function public.check_and_increment_rate_limit in the schema cache`.

### Why 3: Why did a database error (RPC missing) result in a 60-second client rate limit error rather than an infrastructure alert?
Because `checkRateLimit` caught the error and implemented a crude "fail closed" policy:
```typescript
// DEFECTIVE IMPLEMENTATION IN PREVIOUS REVISIONS:
catch (error) {
  console.error("Database RPC error during rate check:", error);
  return {
    allowed: false,
    remainingSeconds: 60,
    resetTime: new Date(Date.now() + 60000),
    error: "Database rate limit check failed",
  };
}
```
Furthermore, at line 320 in `rate-limiter.ts`, the wrapper function `validateOtpSendRateLimit` checked `if (!phoneLimit.allowed)` and unconditionally assigned:
```typescript
reason: `Please wait ${phoneLimit.remainingSeconds || 60} seconds before requesting a new code.`
```
This converted an internal database configuration failure into a fabricated user rate-limit violation.

### Why 4: Why was this not caught in Phase 39.1 unit tests?
Because Phase 39.1 tests ran in a standalone mock environment where `supabase.rpc` was stubbed with a simulated counter. In the real running development and staging environment where `NEXT_PUBLIC_SUPABASE_URL` was configured, `isConfigured.supabase` evaluated to `true`, bypassing the dev fallback and calling the non-existent remote RPC.

### Why 5: Why did the client stay locked with "Send Verification Code" without showing countdown or recovery?
Because `useOtpFlow` and `onboarding-wizard.tsx` failed to decouple infrastructure errors from true cooldown states. When `challengeCreated: false` was returned with a 60s cooldown, the UI didn't have an active challenge to display, but the button text stayed stuck on `Send Verification Code` while disabled, leaving the user with no path forward.

---

## 3. Secondary Root Causes

### 3.1 Webpack Module Scope Separation in Dev Mode
In Next.js, API route handlers and server components are compiled into isolated modules. Storing OTP challenges in a file-scoped `const memoryOtpStore = new Map()` meant `/api/auth/otp/send` and `/api/auth/otp/verify` operated on independent Maps. Even if an OTP was generated, verification would immediately fail with `400: No active challenge found`.

### 3.2 React Form Event Bubbling in Automated Testing
When tests or automated scripts interacted with `<input type="tel">` by directly setting `input.value = "..."`, React's synthetic event system did not trigger `onChange`. This left `otpFlow.phone` empty, causing synthetic form submissions to trigger client-side validation errors before reaching the network.

---

## 4. Corrective & Preventative Architecture (Phase 39.2)

1. **RPC Resiliency & Graceful Non-Production Fallback:**
   In `src/lib/security/rate-limiter.ts`, `checkRateLimit` explicitly catches `PGRST202` and falls back to an in-memory sliding window when not in production. In production environments, infrastructure failures return `isInfrastructureError: true` (HTTP 503), preventing fake cooldown errors.
2. **Explicit Error Categorization:**
   Infrastructure errors (`statusCode: 503`, `isInfrastructureError: true`) are strictly separated from rate limits (`statusCode: 429`).
3. **Global This Storage Binding:**
   Both `memoryStore` (rate limits) and `memoryOtpStore` (OTP challenges) are attached to `globalThis` to preserve shared state across Next.js dev bundles.
4. **State Machine UI Recovery:**
   If a user encounters a 429 rate limit but an active challenge exists, the client receives `hasActiveChallenge: true` and the active `sandboxCode`, transitioning the UI to the OTP entry screen with a button that says `Enter Existing Code`.
