# KAAMSETU — PHASE 39.3 RATE LIMITER ENGINEERING & REPAIR SPECIFICATION
## ATOMIC PERSISTENCE, CONCURRENCY HARDENING & INFRASTRUCTURE INTEGRITY

**Component:** `src/lib/security/rate-limiter.ts` & `src/app/api/auth/otp/send/route.ts`  
**Database Procedure:** `public.check_and_increment_rate_limit`  
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT` (Guwahati Urban: 781001–781039, Shillong Urban: 793001–793022)  
**Constitutional Invariant:** `platform_commission_amount = 0.00` on artisan wages  
**Verification Date:** 17 November 2026  

---

## 1. Executive Overview

Phase 39.3 eliminates the production rate-limiter failure on `/api/auth/otp/send` by replacing fragile in-memory or unmigrated database dependencies with an atomic, row-locked PostgreSQL stored procedure.

### Core Problems Remediated
1. **Unmigrated Remote Database:** Production Supabase lacked `public.check_and_increment_rate_limit`, returning `PGRST202`.
2. **False Cooldown Trap:** HTTP 503 infrastructure errors previously returned `remainingSeconds: 60`, which triggered a client-side countdown timer in `use-otp-flow.ts` and locked the user out even though no rate limit had been reached.
3. **Cryptographic Key Failures:** Missing or low-entropy HMAC secrets in Vercel production threw unhandled exceptions during rate-limit key hashing.

---

## 2. Multi-Tier Rate Limit Policy & Time Windows

The rate limiter enforces three distinct, non-overlapping tiers:

| Tier | Namespace | Scope | Max Attempts | Window Duration | Block Duration | Security Purpose |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| **Tier 1: Cooldown** | `cooldown` | Per Phone | 1 | 60 seconds | 60 seconds | Prevents rapid spamming of SMS/sandbox requests |
| **Tier 2: Phone Hourly** | `phone:send` | Per Phone | 5 | 3600 seconds (1 hr) | 3600 seconds | Prevents single-number abuse and telecom budget exhaustion |
| **Tier 3: IP Hourly** | `ip:send` | Per Client IP | 15 | 3600 seconds (1 hr) | 3600 seconds | Prevents distributed botting and toll fraud from shared IPs |

---

## 3. Atomic Locking Mechanism & Race-Condition Prevention

To guarantee concurrency safety under high load:

1. **Table Structure (`public.auth_rate_limits`):**
   ```sql
   CREATE TABLE IF NOT EXISTS public.auth_rate_limits (
       key TEXT PRIMARY KEY,
       count INTEGER NOT NULL DEFAULT 1,
       first_attempt_at TIMESTAMPTZ NOT NULL DEFAULT now(),
       last_attempt_at TIMESTAMPTZ NOT NULL DEFAULT now(),
       blocked_until TIMESTAMPTZ,
       created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
       updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
   );
   ```

2. **Atomic Row-Level Pessimistic Locking (`FOR UPDATE`):**
   Within `check_and_increment_rate_limit`, requests acquire a row lock:
   ```sql
   -- Concurrency-safe initialization
   INSERT INTO public.auth_rate_limits (key, count, first_attempt_at, last_attempt_at, blocked_until, updated_at)
   VALUES (p_key, 0, v_now, v_now, NULL, v_now)
   ON CONFLICT (key) DO NOTHING;

   -- Atomic row-level lock for serialization
   SELECT * INTO v_record 
   FROM public.auth_rate_limits 
   WHERE key = p_key 
   FOR UPDATE;
   ```
   Parallel requests for the same key are serialized at the PostgreSQL transaction engine level. There are zero race windows between checking the count and incrementing it.

3. **Window Non-Extension on Repeated Attempts:**
   When a blocked user continues to send requests, the existing `blocked_until` is returned without resetting or extending the block timestamp:
   ```sql
   IF v_record.blocked_until IS NOT NULL AND v_record.blocked_until > v_now THEN
       RETURN QUERY SELECT false, v_record.count, EXTRACT(EPOCH FROM (v_record.blocked_until - v_now))::INT;
       RETURN;
   END IF;
   ```

---

## 4. Stored Procedure Signature & Return Contract

```sql
FUNCTION public.check_and_increment_rate_limit(
    p_key TEXT,
    p_max_attempts INT,
    p_window_seconds INT,
    p_block_seconds INT
)
RETURNS TABLE (
    allowed BOOLEAN,
    current_count INT,
    remaining_seconds INT
)
```

- `allowed`: `TRUE` if request is within thresholds and permitted; `FALSE` if rate-limited.
- `current_count`: Integer attempt count for the active window.
- `remaining_seconds`: Exact integer seconds remaining until expiry or block release. `0` when `allowed = TRUE`.

---

## 5. Privacy-Preserving HMAC-SHA256 Key Derivation

To comply with the Digital Personal Data Protection (DPDP) Act, raw phone numbers and IP addresses are **never** stored in database tables or logs.

```typescript
export function hashRateLimitKey(namespace: RateLimitNamespace, identifier: string): string {
  const secret = getRateLimitHmacSecret();
  const normalized = identifier.trim().toLowerCase();
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(`${namespace}:${normalized}`);
  return `${namespace}:${hmac.digest("hex").slice(0, 32)}`;
}
```

- **Domain Separation:** Prepending `${namespace}:` ensures the same phone number produces completely distinct hashes across the `cooldown` and `phone:send` namespaces.
- **Irreversibility:** Without the 256-bit server-side secret, the stored 32-character hex keys cannot be reversed to identify the worker.

---

## 6. Fail-Closed Mechanics & Non-Fabrication of Cooldown on HTTP 503

In production (`NODE_ENV === "production"`), the rate limiter strictly fails closed:

1. **No Silent In-Memory Fallback:** If Supabase is unreachable or returns `PGRST202`, the system rejects the request with HTTP 503 rather than allowing an unmetered bypass.
2. **Elimination of False Cooldown Traps:**
   On database or cryptographic failure, `checkRateLimit` returns:
   ```typescript
   return {
     allowed: false,
     remainingSeconds: undefined, // CRITICAL: NEVER FABRICATE 60 SECONDS
     nextAllowedAt: undefined,
     isInfrastructureError: true,
     errorCode: isCryptoError ? "AUTH_CONFIGURATION_ERROR" : "DATABASE_UNAVAILABLE",
   };
   ```
3. **Route Handler Mapping:**
   `/api/auth/otp/send` returns:
   - Status: `HTTP 503 Service Unavailable`
   - Body:
     ```json
     {
       "success": false,
       "error": {
         "code": "DATABASE_UNAVAILABLE",
         "message": "Authentication rate limiter temporarily unavailable. Your profile draft has been saved. Please retry in a moment.",
         "isInfrastructureError": true
       }
     }
     ```
   - Headers: Omission of `Retry-After` header.
4. **Client State Recovery (`use-otp-flow.ts`):**
   ```typescript
   if (result.isInfrastructureError) {
     setCooldownSeconds(0); // Reset timer immediately; do not trap user
     setCanResend(true);
   }
   ```
