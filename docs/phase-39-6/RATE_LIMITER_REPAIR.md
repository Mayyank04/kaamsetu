# KAAMSETU — PHASE 39.6 RATE LIMITER REPAIR

**Document ID:** `KAAMSETU-39-6-RATE-LIMITER`  
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Status:** `VERIFIED_LOCALLY`

---

## 1. Multi-Tiered Rate Limiting Architecture

The rate limiter enforces three distinct layers of protection:

1. **Phone Cooldown (60 seconds):**
   - Namespace: `cooldown:<hash>`
   - Policy: Max 1 request per 60s window.
   - Violation Status: HTTP 429 `RATE_LIMITED` with `retryAfterSeconds` and `nextAllowedAt`.
2. **Phone Hourly Quota (5 SMS / hour):**
   - Namespace: `phone:send:<hash>:hourly`
   - Policy: Max 5 requests per 3600s window.
   - Violation Status: HTTP 429 `RATE_LIMITED`.
3. **IP Hourly Quota (15 SMS / hour):**
   - Namespace: `ip:send:<hash>`
   - Policy: Max 15 requests per 3600s window (anti-SMS-bombing / toll fraud defense).
   - Violation Status: HTTP 429 `RATE_LIMITED`.
4. **Verification Brute-Force Lockout (5 attempts / 15 minutes):**
   - Namespace: `phone:verify:<hash>`
   - Policy: Max 5 incorrect attempts triggers 900s block.
   - Violation Status: HTTP 429 `OTP_ATTEMPTS_EXCEEDED`.

---

## 2. Fail-Closed Security Guarantees

In production (`NODE_ENV === "production"`):
- `allowDevMock` is strictly `false`.
- If Supabase RPC is unavailable or throws a PostgREST error, the limiter **never** allows the request to bypass authentication.
- Returns HTTP 503 with standardized error code `RATE_LIMIT_INFRASTRUCTURE_UNAVAILABLE`.
- Structured server-side logging captures `correlationId`, `keyPrefix`, and sanitized error codes without leaking plain phone numbers or IP addresses.
