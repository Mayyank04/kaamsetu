# KAAMSETU — PHASE 39.5 VERCEL ENVIRONMENT AUDIT

**Target:** `https://kaamsetu-neon.vercel.app`  
**Status:** IMPLEMENTED NOT VERIFIED (PENDING LIVE VERCEL RUNTIME DEPLOYMENT)

---

## 1. Environment Variables Audit Matrix

| Variable | Scope | Requirement | Status |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Production & Preview | Valid Supabase project URL | CONFIGURED |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production & Preview | Public client anon key | CONFIGURED |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only | Elevated privileges for admin RPCs | CONFIGURED |
| `RATE_LIMIT_HMAC_SECRET` | Server-only | 256-bit cryptographically secure key | CONFIGURED |
| `RATE_LIMIT_HMAC_SECRET_PREVIOUS` | Server-only | Optional previous key for zero-downtime rotation | READY |
| `AUTH_VERIFICATION_MODE` | Server-only | `"sandbox"` (default) or `"sms"` | CONFIGURED (`sandbox`) |
| `GEMINI_API_KEY` | Server-only | Google AI Studio API key | CONFIGURED |
| `GEMINI_MODEL` | Server-only | Priority model name (default: `gemini-3.8-flash`) | CONFIGURED |

---

## 2. Insecure Fallback & Leakage Elimination

- No raw secrets are prefixed with `NEXT_PUBLIC_`.
- Rate limiter HMAC secret enforces 256-bit character diversity; placeholder values (`"secret"`, `"password"`, `"12345"`) are rejected at startup.
- Production environment fail-closed checks prevent unauthenticated mock bypasses.
