# KAAMSETU — PHASE 39.3 ENVIRONMENT CONFIGURATION AUDIT
## PRODUCTION ENVIRONMENT VARIABLES & CRYPTOGRAPHIC SECRETS GOVERNANCE

**Audit Target:** Vercel Production & Local Development Environments  
**Schema Definition:** `src/lib/env.ts`  
**Security Standard:** Zero secret exposure, 256-bit entropy verification, fail-closed production checks  
**Date:** 17 November 2026  

---

## 1. Environment Variable Audit Matrix

The following variables are directly referenced by the OTP authentication, rate limiting, and onboarding pipelines:

| Variable Name | Required In Prod | Type | Sensitivity | Verification Status | Purpose & Description |
| :--- | :---: | :---: | :---: | :---: | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | YES | URL | Public | **CONFIGURED & VALIDATED** | Supabase project endpoint (`https://anwppwjlismjyovbyfmb.supabase.co`). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | YES | JWT String | Public / Restricted | **CONFIGURED & VALIDATED** | Anonymous public key for client-side queries subject to RLS. |
| `SUPABASE_SERVICE_ROLE_KEY` | YES | JWT String | **CRITICAL SECRET** | **CONFIGURED & VALIDATED** | Administrative key for server-only operations (stored procedures, challenge verification). Never exposed to browser. |
| `DATABASE_URL` | NO | Postgres URI | Sensitive | **OPTIONAL / NOT IN PROD** | Used exclusively for direct local PostgreSQL test harness execution (`kaamsetu_rls_test`). Serverless functions connect via Supabase HTTPS RPCs. |
| `RATE_LIMIT_HMAC_SECRET` | YES | Hex / Base64 | **CRITICAL SECRET** | **CONFIGURED & VALIDATED** | Server-only 256-bit cryptographic secret for privacy-preserving HMAC-SHA256 rate limit key hashing and session signing. |
| `AUTH_VERIFICATION_MODE` | YES | Enum | Operational | **CONFIGURED (`sandbox`)** | Controls whether OTP challenges use simulated sandbox dispatch (`sandbox`) or live telecom SMS gateways (`sms`). |
| `SANDBOX_OTP_CODE` | NO | 6-Digit String | Operational | **DYNAMIC / OMITTED** | When omitted, sandbox mode dynamically generates random 6-digit PINs (`crypto.randomInt(100000, 999999)`). |
| `CREDENTIAL_SIGNING_KEY` | YES | Hex / Base64 | **CRITICAL SECRET** | **CONFIGURED & VALIDATED** | Cryptographic key for signing W3C-compliant sovereign skill credentials (Ed25519 / HMAC-SHA256). |
| `ENABLE_IN_MEMORY_RATE_LIMIT_MOCK` | NO | Boolean | Development Only | **DEVELOPMENT ONLY** | When `true` in non-production, permits in-memory sliding window fallback. Strictly ignored in production (`NODE_ENV=production`). |
| `ENABLE_DEMO_AUTH` | NO | Boolean | Deprecated | **PERMANENTLY DISABLED** | Hardcoded to `"false"` in `src/lib/env.ts` to prevent demo bypasses in production. |

---

## 2. Key Quality & Cryptographic Strength Verification

All secrets referenced in production are audited against the high-entropy validator in `src/lib/crypto/key-validator.ts`:

1. **Entropy Threshold:** Every production cryptographic key must contain at least 256 bits of entropy (>= 32 bytes).
2. **Anti-Placeholder Guards:** In `src/lib/env.ts`, `validateEnvironmentSafety()` automatically inspects Supabase credentials and key material at startup. If any key contains `"placeholder"`, `"test"`, `"demo"`, or matches known weak defaults, the application immediately throws a fatal exception and halts execution.
3. **Redaction in Logs:** Any logging output touching environment variables or rate limit identifiers passes through `src/lib/security/privacy-logger.ts`, ensuring zero secret leakage to Vercel runtime logs.

---

## 3. Vercel Environment Scope Audit (Production vs. Preview)

| Scope | Supabase URL | Anon Key | Service Role Key | HMAC Secret | Verification Mode |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Vercel Production** | Present | Present | Present | Present | `sandbox` |
| **Vercel Preview** | Present | Present | Present | Present | `sandbox` |
| **Local Development** | Present (`.env.local`) | Present | Present | Present | `sandbox` |

### Audit Findings:
- Variable names across Vercel and local code match **with 100% case-sensitive consistency**.
- Zero secret keys are prefixed with `NEXT_PUBLIC_` unless explicitly designated for browser consumption (e.g., `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
- No new environment variables were introduced in Phase 39.3, avoiding deployment regressions.
