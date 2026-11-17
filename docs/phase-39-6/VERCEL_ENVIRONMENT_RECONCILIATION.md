# KAAMSETU — PHASE 39.6 VERCEL ENVIRONMENT RECONCILIATION

**Document ID:** `KAAMSETU-39-6-VERCEL-ENV`  
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Target URL:** `https://kaamsetu-neon.vercel.app`  
**Status:** `VERIFIED_LOCALLY` / `BLOCKED_BY_OPERATOR_ACTION` (Vercel Console Sync)

---

## 1. Canonical Variable Scope Matrix

| Environment Variable | Local Dev (`.env.local`) | Vercel Preview | Vercel Production | Visibility | Required Entropy / Format |
|---|---|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://anwppwjlismjyovbyfmb.supabase.co` | `https://anwppwjlismjyovbyfmb.supabase.co` | `https://anwppwjlismjyovbyfmb.supabase.co` | Client-exposed | Valid HTTPS Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Remote anon JWT | Remote anon JWT | Remote anon JWT | Client-exposed | Valid JWT (`eyJ...`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Remote service JWT | Remote service JWT | Remote service JWT | **Server-Only Secret** | Privileged service_role JWT |
| `RATE_LIMIT_HMAC_SECRET` | 64-char hex key | 64-char hex key | 64-char hex key | **Server-Only Secret** | $\ge 256$ bits of random cryptographic entropy |
| `RATE_LIMIT_HMAC_SECRET_PREVIOUS` | Optional | Optional | Optional | **Server-Only Secret** | Secondary key for zero-downtime secret rotation |
| `AUTH_VERIFICATION_MODE` | `sandbox` | `sandbox` | `sandbox` | Server-Only | String: `sandbox` \| `twilio` |
| `ENABLE_IN_MEMORY_RATE_LIMIT_MOCK`| `false` (or `true` if DB offline) | `false` | `false` (**FORBIDDEN IN PRODUCTION**) | Server-Only | Boolean |
| `GEMINI_API_KEY` | Google AI Studio Key | Google AI Studio Key | Google AI Studio Key | **Server-Only Secret** | Valid Google Generative AI key |
| `GEMINI_MODEL` | `gemini-2.0-flash` | `gemini-2.0-flash` | `gemini-2.0-flash` | Server-Only | Model identifier with fallback candidate chain |

---

## 2. Leakage Audit & Rotation Advisory

- **Audit Confirmation:** No server-only secrets carry `NEXT_PUBLIC_` prefixes or appear in browser bundles.
- **Sanitized `.env.example`:** Verified that `.env.example` contains only sanitized placeholder patterns and zero live credentials.
- **Advisory:** If any operator previously entered a real password or private service key into a public environment variable or committed repository file, that credential must be rotated immediately in the Supabase Dashboard (`Settings -> API -> Reset Secret`).

---

## 3. Redeployment Trigger Requirement

Updating environment variables in the Vercel dashboard does not alter existing deployments. A fresh deployment must be triggered from branch `phase-39-6-production-auth-infrastructure-repair` after environment reconciliation.
