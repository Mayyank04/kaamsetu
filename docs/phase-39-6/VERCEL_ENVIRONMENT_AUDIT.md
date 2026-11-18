# KAAMSETU — PHASE 39.6 VERCEL ENVIRONMENT AUDIT

**Document ID:** `KAAMSETU-39-6-VERCEL-AUDIT`  
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Target Domain:** `https://kaamsetu-neon.vercel.app`  
**Status:** `VERIFIED LOCALLY ONLY` / `BLOCKED BY CONFIGURATION` (Vercel Production Redeployment Required)

---

## 1. Canonical Variable Scope Audit

| Variable | Local (`.env.local`) | Vercel Production | Exposure | Format & Entropy |
|---|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://anwppwjlismjyovbyfmb.supabase.co` | `https://anwppwjlismjyovbyfmb.supabase.co` | Client & Server | Valid Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Remote anon JWT | Remote anon JWT | Client & Server | Valid JWT format |
| `SUPABASE_SERVICE_ROLE_KEY` | Remote service JWT | Remote service JWT | **Server-Only Secret** | Valid admin JWT |
| `RATE_LIMIT_HMAC_SECRET` | 64-char hex key | 64-char hex key | **Server-Only Secret** | $\ge 256$ bits entropy |
| `AUTH_VERIFICATION_MODE` | `sandbox` | `sandbox` | Server-Only | String: `sandbox` |
| `ENABLE_IN_MEMORY_RATE_LIMIT_MOCK`| `false` (or `true` offline) | `false` | Server-Only | **STRICTLY FORBIDDEN IN PROD** |
| `GEMINI_API_KEY` | Google AI Key | Google AI Key | **Server-Only Secret** | Google AI Studio key |
| `GEMINI_MODEL` | `gemini-2.0-flash` | `gemini-2.0-flash` | Server-Only | Model identifier |

---

## 2. Leakage Verification

- Verified that no secret variables are prefixed with `NEXT_PUBLIC_`.
- Verified that `SUPABASE_SERVICE_ROLE_KEY` and `RATE_LIMIT_HMAC_SECRET` are excluded from all client-side bundles and browser network payloads.
- Verified that `.env.example` has zero real passwords or API keys.
