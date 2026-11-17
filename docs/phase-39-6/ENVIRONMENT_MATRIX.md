# KAAMSETU — PHASE 39.6 ENVIRONMENT MATRIX

**Operating Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Permanent Financial Invariant:** `platform_commission_amount = 0.00` on artisan wages  
**Rollout Boundaries:** Guwahati Urban (`781001–781039`), Shillong Urban (`793001–793022`)

---

## 1. Canonical Variable Scope & Environment Mapping

| Variable Name | Local Development (`.env.local`) | Vercel Preview | Vercel Production | Secret / Public | Minimum Entropy / Format |
|---|---|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Configured remote URL | Remote Supabase URL | Remote Supabase URL | Public Client | `https://<ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Remote anon key | Remote anon key | Remote anon key | Public Client | JWT format (`eyJ...`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Remote service key | Remote service key | Remote service key | **Private Server-Only** | Privileged JWT with admin role |
| `RATE_LIMIT_HMAC_SECRET` | 32+ character hex/base64 | 32+ character hex/base64 | 32+ character hex/base64 | **Private Server-Only** | 256-bit cryptographically secure key |
| `RATE_LIMIT_HMAC_SECRET_PREVIOUS`| Optional | Optional | Optional (during rotation) | **Private Server-Only** | 256-bit key for zero-downtime rotation |
| `AUTH_VERIFICATION_MODE` | `sandbox` | `sandbox` | `sandbox` (or `twilio`) | Private Server-Only | String: `sandbox` \| `twilio` |
| `ENABLE_IN_MEMORY_RATE_LIMIT_MOCK`| `false` (or `true` if DB offline)| `false` (FORBIDDEN) | `false` (STRICTLY FORBIDDEN) | Private Server-Only | Boolean |
| `GEMINI_API_KEY` | Valid Google AI key | Valid Google AI key | Valid Google AI key | **Private Server-Only** | Google AI Studio Key |
| `GEMINI_MODEL` | `gemini-2.0-flash` | `gemini-2.0-flash` | `gemini-2.0-flash` | Private Server-Only | Model identifier with fallback chain |

---

## 2. In-Memory Mock Isolation & Production Guarantees

1. **`ENABLE_IN_MEMORY_RATE_LIMIT_MOCK`**:
   - In production (`process.env.NODE_ENV === "production"`), the mock in-memory rate limiter is **structurally prohibited**. Even if an operator accidentally configures `ENABLE_IN_MEMORY_RATE_LIMIT_MOCK=true` in Vercel, `rate-limiter.ts` explicitly enforces `isProduction = true` and fails closed with HTTP 503 `RATE_LIMIT_INFRASTRUCTURE_UNAVAILABLE`.
2. **Predictable Key Protection**:
   - Hardcoded HMAC secrets like `default-secret` or predictable tokens fail validation via `assertCryptographicKeyQuality` in production.
3. **No Credential Leakage**:
   - `SUPABASE_SERVICE_ROLE_KEY` and `RATE_LIMIT_HMAC_SECRET` are never referenced in client-side code, never prefixed with `NEXT_PUBLIC_`, and never printed in server logs.
