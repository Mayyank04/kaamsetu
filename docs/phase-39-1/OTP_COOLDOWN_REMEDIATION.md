# KAAMSETU — PHASE 39.1 OTP COOLDOWN REMEDIATION
## Architectural Fixes for Rate Limiting, Active Challenge Recovery & State Machines

**Specification:** Phase 39.1 Production Hotfix  
**Repository:** `Mayyank04/kaamsetu`  
**Module:** `src/lib/security/rate-limiter.ts`, `src/lib/auth/otp-service.ts`, `src/lib/auth/use-otp-flow.ts`  

---

## 1. Rate Limiter Mathematical Hardening

### The Flaw
The in-memory rate limiter previously reset `bucket.blockedUntil = now + blockSeconds * 1000` inside `if (bucket.count >= maxAttempts)`. Every failed hit pushed `blockedUntil` another 60 seconds into the future. Furthermore, for single-attempt buckets (`maxAttempts = 1`), `blockedUntil` was undefined on the first attempt, causing state mismatches with PostgreSQL's `check_and_increment_rate_limit` RPC.

### The Remediation
In `src/lib/security/rate-limiter.ts`:
1. **Initial Bucket Initialization:**
```typescript
if (!bucket) {
  bucket = {
    count: 1,
    firstAttemptAt: now,
    lastAttemptAt: now,
    blockedUntil: 1 >= maxAttempts ? now + effectiveBlockSec * 1000 : undefined,
  };
  memoryStore.set(key, bucket);
  return { allowed: true };
}
```
2. **Immutable Block Window:**
```typescript
if (bucket.count >= maxAttempts) {
  if (!bucket.blockedUntil || bucket.blockedUntil <= now) {
    bucket.blockedUntil = now + effectiveBlockSec * 1000;
  }
  bucket.lastAttemptAt = now;
  const remaining = Math.max(1, Math.ceil((bucket.blockedUntil - now) / 1000));
  return {
    allowed: false,
    remainingSeconds: remaining,
    nextAllowedAt: new Date(bucket.blockedUntil).toISOString(),
    reason: `Maximum limit of ${maxAttempts} attempts reached. Try again in ${remaining}s.`,
  };
}
```
3. **Accurate Timestamp Output:**
Every rate limit response provides both `remainingSeconds` (integer seconds) and `nextAllowedAt` (ISO 8601 string) for robust client synchronization.

---

## 2. Active Challenge Recovery on HTTP 429

### The Flaw
When a user hit cooldown on an existing valid OTP challenge, the server rejected with 429 without disclosing whether an active challenge was still valid, locking the user out of verifying the code that had already been issued.

### The Remediation
In `src/lib/auth/otp-service.ts`:
```typescript
const rateLimit = await validateOtpSendRateLimit(formatted, req.clientIp);
if (!rateLimit.allowed) {
  // Check if an active, unconsumed challenge already exists for this phone
  let hasActiveChallenge = false;
  let activeChallengeCode: string | undefined = undefined;

  const phoneHashed = hashRateLimitKey("phone:identity", formatted);
  if (memoryOtpStore.has(phoneHashed)) {
    const memRecord = memoryOtpStore.get(phoneHashed)!;
    if (Date.now() < memRecord.expiresAt && !memRecord.consumedAt) {
      hasActiveChallenge = true;
      if (isSandbox && memRecord.plainOtp) {
        activeChallengeCode = memRecord.plainOtp;
      }
    }
  }

  return {
    success: false,
    message: rateLimit.reason || `Please wait ${rateLimit.remainingSeconds || 60} seconds before requesting a new code.`,
    retryAfterSeconds: rateLimit.remainingSeconds || 60,
    nextAllowedAt: rateLimit.nextAllowedAt,
    hasActiveChallenge,
    isSandbox,
    sandboxCode: activeChallengeCode,
    statusCode: 429,
  };
}
```

---

## 3. Formal OTP State Machine (`useOtpFlow`)

A centralized, reactive React hook was engineered in `src/lib/auth/use-otp-flow.ts` to govern all OTP authentication surfaces.

### State Transitions
```
                ┌──────────────┐
                │     IDLE     │
                └───────┬──────┘
                        │ requestOtp()
                        ▼
                ┌──────────────┐
                │  REQUESTING  │
                └───────┬──────┘
                        │
         ┌──────────────┴──────────────┐
         ▼                             ▼
┌─────────────────┐           ┌─────────────────┐
│    CODE_SENT    │           │  RATE_LIMITED   │
│  (Step 2 Active)│           │  (Step 1 / 2)   │
└────────┬────────┘           └────────┬────────┘
         │ verifyCode()                │ Cooldown Ticker = 0
         ▼                             ▼
┌─────────────────┐           ┌─────────────────┐
│    VERIFYING    │           │      IDLE       │
└────────┬────────┘           └─────────────────┘
         │
         ├─── Success ───► VERIFIED (Executes Onboarding Save / Mint)
         │
         └─── Failure ───► VERIFICATION_FAILED / EXPIRED
```

### Key Capabilities
- **Ticking Delta Calculation:** `remaining = Math.max(0, Math.ceil((targetTimestamp - Date.now()) / 1000))` running on a 1-second interval.
- **SessionStorage Persistence:** Survives modal dismissals, route changes, and component remounts.
- **Auto-Fill & Clipboard Copying:** One-click helpers for sandbox test codes.
- **Atomic Single-In-Flight Protection:** Disables form submissions when `requesting` or `verifying` is active.
