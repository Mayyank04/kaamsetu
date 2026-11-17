# KAAMSETU — PHASE 39.3 RATE LIMITER ENGINEERING & REPAIR SPECIFICATION
## ATOMIC PERSISTENCE, CONCURRENCY HARDENING & INFRASTRUCTURE INTEGRITY

**Component:** `src/lib/security/rate-limiter.ts` & `src/app/api/auth/otp/send/route.ts`  
**Database Procedure:** `public.check_and_increment_rate_limit`  
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Verification Date:** 17 November 2026  

---

## 1. Eight Core Architectural Requirements

| # | Requirement | Implementation in KAAMSETU | Verification |
| :---: | :--- | :--- | :--- |
| **1** | **Persistent, Atomic Database Implementation** | Backed by `public.auth_rate_limits` table in PostgreSQL and atomic stored procedure `check_and_increment_rate_limit`. | `test:phase39.3` & local database execution |
| **2** | **Phone-Number & IP-Based Multi-Tier Limits** | Three distinct namespaces: `cooldown` (1 req / 60s per phone), `phone:send` (5 reqs / 1 hr per phone), `ip:send` (15 reqs / 1 hr per IP). | Verified in `validateOtpSendRateLimit` |
| **3** | **Race-Condition & Concurrency Defense** | Employs row-level pessimistic locking (`SELECT ... FOR UPDATE`) in PostgreSQL, serializing parallel requests on the same key. | Verified in migration 33 and `test:phase39.2` Scenario 18 |
| **4** | **Accurate Retry Information** | Calculates exact remaining cooldown in seconds and provides ISO 8601 `nextAllowedAt` timestamp alongside standard `Retry-After` HTTP header. | Verified in response headers and test assertions |
| **5** | **Window Non-Extension on Repeated Requests** | Repeated clicks while blocked do **NOT** extend the block duration. The countdown continues decreasing toward the original window expiry. | Verified in `test:phase39.2` Scenario 8 |
| **6** | **Distinguish Infrastructure Failure from Rate Limiting** | Database errors set `isInfrastructureError: true` with canonical code `DATABASE_UNAVAILABLE`. True rate limits set `allowed: false` with code `RATE_LIMITED`. | Verified in `use-otp-flow.ts` and route handler |
| **7** | **Return HTTP 503 for Infrastructure, Never Fabricated 429** | Database/RPC failures return `HTTP 503 Service Unavailable`. HTTP 429 is strictly reserved for legitimate rate-limit policy exhaustion. | Verified in live curl test & unit test Scenario 19 |
| **8** | **No Silent Memory Fallback in Production** | In-memory fallback is strictly gated by `!isProduction && (allowDevMock)`. Production execution fails closed upon database absence. | Verified in `rate-limiter.ts` lines 277-294 |

---

## 2. Multi-Tier Rate Limit Architecture

```
Incoming Request: /api/auth/otp/send (+91 98765 43210, IP: 203.0.113.195)
                                │
                                ▼
         ┌──────────────────────────────────────────────┐
         │ Tier 1: Per-Phone Cooldown (60 Seconds)      │
         │ Key: HMAC-SHA256("cooldown", "9876543210")  │
         │ Max: 1 attempt per 60s window                │
         └──────────────────────┬───────────────────────┘
                                │ Allowed
                                ▼
         ┌──────────────────────────────────────────────┐
         │ Tier 2: Per-Phone Hourly (1 Hour)            │
         │ Key: HMAC-SHA256("phone:send", "9876543210")│
         │ Max: 5 attempts per 3600s window             │
         └──────────────────────┬───────────────────────┘
                                │ Allowed
                                ▼
         ┌──────────────────────────────────────────────┐
         │ Tier 3: Per-IP Toll Fraud Defense (1 Hour)   │
         │ Key: HMAC-SHA256("ip:send", "203.0.113.195")│
         │ Max: 15 attempts per 3600s window            │
         └──────────────────────┬───────────────────────┘
                                │ Allowed
                                ▼
                     Issue Sandbox Challenge
```

---

## 3. Privacy-Preserving Key Hashing

To comply with the Digital Personal Data Protection (DPDP) Act and protect worker privacy, raw phone numbers and client IP addresses are never stored in plaintext within the rate limiting table.

Keys are deterministically hashed using HMAC-SHA256 keyed with the server-only `RATE_LIMIT_HMAC_SECRET`:
```typescript
export function hashRateLimitKey(namespace: RateLimitNamespace, identifier: string): string {
  const secret = getRateLimitHmacSecret();
  const normalized = identifier.trim().toLowerCase();
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(`${namespace}:${normalized}`);
  return `${namespace}:${hmac.digest("hex").slice(0, 32)}`;
}
```
This domain-separated key structure prevents collision across namespaces while ensuring zero unmasked PII is persisted to PostgreSQL tables or logs.

---

## 4. Accurate Error Categorization & Status Code Mapping

```typescript
// Infrastructure Failure (HTTP 503)
if (rateLimit.isInfrastructureError) {
  return {
    success: false,
    code: "DATABASE_UNAVAILABLE",
    isInfrastructureError: true,
    message: "Authentication rate limiter temporarily unavailable. Your profile draft has been saved. Please retry in a moment.",
    retryAfterSeconds: rateLimit.remainingSeconds || 60,
    statusCode: 503,
  };
}

// True Policy Rate Limit (HTTP 429)
if (!rateLimit.allowed) {
  return {
    success: false,
    code: "RATE_LIMITED",
    isInfrastructureError: false,
    message: `Please wait ${rateLimit.remainingSeconds} seconds before requesting a new code.`,
    retryAfterSeconds: rateLimit.remainingSeconds,
    statusCode: 429,
  };
}
```

This strict dichotomy ensures that clients never mistake a database connection error for a user cooldown violation.
