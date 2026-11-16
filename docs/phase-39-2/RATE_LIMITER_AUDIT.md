# KAAMSETU — PHASE 39.2 RATE LIMITER SECURITY & RELIABILITY AUDIT

**Target Module:** `src/lib/security/rate-limiter.ts`  
**Security Standard:** OWASP Top 10 API Security (API4:2023 Unrestricted Resource Consumption)  
**Resilience Standard:** Graceful Degradation & Non-Blocking Fallback  
**Auditor:** Application Security & Systems Reliability Engineering  

---

## 1. Scope & Vulnerability Background

The rate limiter in `src/lib/security/rate-limiter.ts` governs brute-force prevention, SMS cost protection, and API availability across KAAMSETU's authentication and onboarding routes.

In previous phases, the rate limiter exhibited two critical flaws:
1. **False Rate Limit Masking:** In non-production and staging environments where the Supabase RPC `check_and_increment_rate_limit` was missing from the database schema cache (`PGRST202`), the rate limiter threw an internal exception and defaulted to returning `{ allowed: false, remainingSeconds: 60 }`. This falsely told users they were rate limited when no request had ever been made.
2. **Global Cooldown Message Overwrite:** Line 320 in `rate-limiter.ts` unconditionally overwrote all rate limiter rejection reasons with `"Please wait 60 seconds before requesting a new code"`, discarding error contexts and preventing proper infrastructure alerting.

---

## 2. Forensic Code Audit & Remediation

### 2.1 Remediation of `checkRateLimit` (Lines 180–235)
```typescript
// src/lib/security/rate-limiter.ts
export async function checkRateLimit(
  config: RateLimitConfig,
  key: string
): Promise<RateLimitResult> {
  const allowDevMock =
    (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") ||
    process.env.ENABLE_IN_MEMORY_RATE_LIMIT_MOCK === "true";

  // Prioritize in-memory storage for test/development or when explicitly enabled
  if (allowDevMock && !isConfigured.supabase) {
    return checkInMemoryRateLimit(config, key);
  }

  // Attempt database RPC check
  try {
    const { data, error } = await supabase.rpc("check_and_increment_rate_limit", {
      p_key: key,
      p_max_requests: config.maxRequests,
      p_window_seconds: config.windowSeconds,
    });

    if (error) {
      // In development or test, if the RPC is missing (PGRST202), fall back to in-memory store
      if (allowDevMock && error.code === "PGRST202") {
        console.warn(`[RateLimiter] Database RPC not found (PGRST202). Falling back to in-memory store.`);
        return checkInMemoryRateLimit(config, key);
      }
      throw error;
    }

    return {
      allowed: data.allowed,
      remainingSeconds: data.remaining_seconds,
      resetTime: new Date(data.reset_time),
      currentRequests: data.current_requests,
    };
  } catch (error: any) {
    // If running in development/test, fallback to in-memory store rather than blocking
    if (allowDevMock) {
      console.warn(`[RateLimiter] Database rate limit failed. Using dev fallback.`);
      return checkInMemoryRateLimit(config, key);
    }

    // In production: record infrastructure error explicitly, never fake a cooldown
    console.error("[RateLimiter] Production database rate check error:", error);
    return {
      allowed: false,
      isInfrastructureError: true,
      statusCode: 503,
      remainingSeconds: 0,
      resetTime: new Date(),
      error: "Authentication infrastructure temporarily unavailable.",
    };
  }
}
```

### 2.2 Preservation of Infrastructure Error in `validateOtpSendRateLimit`
In `validateOtpSendRateLimit`, we now inspect `phoneLimit.isInfrastructureError`:
```typescript
export async function validateOtpSendRateLimit(
  phone: string,
  ip: string
): Promise<{ allowed: boolean; reason?: string; retryAfterSeconds?: number; isInfrastructureError?: boolean; statusCode?: number }> {
  const normalizedPhone = phone.replace(/\D/g, "").slice(-10);

  // 1. Check IP hourly burst
  const ipLimit = await checkRateLimit(RATE_LIMIT_CONFIGS.otp_ip_hourly, `ip:${ip}`);
  if (ipLimit.isInfrastructureError) {
    return {
      allowed: false,
      isInfrastructureError: true,
      statusCode: 503,
      reason: "Authentication infrastructure unavailable.",
    };
  }
  if (!ipLimit.allowed) {
    return {
      allowed: false,
      retryAfterSeconds: ipLimit.remainingSeconds || 3600,
      reason: "Hourly request limit reached from this IP address.",
    };
  }

  // 2. Check Phone 60s cooldown
  const phoneLimit = await checkRateLimit(RATE_LIMIT_CONFIGS.otp_send_cooldown, `phone:${normalizedPhone}`);
  if (phoneLimit.isInfrastructureError) {
    return {
      allowed: false,
      isInfrastructureError: true,
      statusCode: 503,
      reason: "Authentication infrastructure unavailable.",
    };
  }
  if (!phoneLimit.allowed) {
    const remaining = phoneLimit.remainingSeconds || 60;
    return {
      allowed: false,
      retryAfterSeconds: remaining,
      reason: `Please wait ${remaining} seconds before requesting a new code.`,
    };
  }

  return { allowed: true };
}
```

---

## 3. Rate Limit Configuration Matrix

| Policy Key | Target Scope | Max Requests | Window (Seconds) | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `otp_send_cooldown` | Per Phone Number | 1 request | 60 seconds | Prevents SMS flooding & race conditions |
| `otp_ip_hourly` | Per IP Address | 25 requests | 3600 seconds (1h) | Mitigates automated bot scanning |
| `otp_phone_hourly` | Per Phone Number | 5 requests | 3600 seconds (1h) | Protects user phones from spam |
| `otp_verify_attempt` | Per Phone + IP | 5 attempts | 600 seconds (10m) | Blocks PIN brute-forcing |

---

## 4. Verification Evidence

1. **RPC Missing Graceful Fallback:** Tested in `test/phase-39-2-runtime-otp-recovery.test.ts` (Scenario 1 & 2). When the RPC is unavailable in non-production, the in-memory limiter successfully registers and increments limits without raising errors.
2. **Infrastructure Error Propagation:** Tested in Scenario 2. If a database error occurs in production, `isInfrastructureError: true` is returned with status 503.
3. **Sliding Window Accuracy:** Cooldown countdown correctly decreases from 60 to 0 on subsequent calls, verified via live CDP evaluation in headless Chrome.
