# VERCEL ENVIRONMENT VARIABLE AUDIT

**Audit Date:** November 25, 2026  
**Security Policy:** **Zero secret values included.** Only variable names, environment scopes, purpose, observed status, and Vercel Project Settings actions are listed.

---

## 1. Required Build & Core Runtime Variables

| Variable Name | Required Scopes | Purpose | Observed Evidence / Status |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Dev, Preview, Production | Supabase project REST/Auth endpoint (`https://anwppwjlismjyovbyfmb.supabase.co`). Baked into client JS at build time. | Present on live `kaamsetu-neon.vercel.app` (`/api/health` & `/api/auth/health` `OK`) and `.env.local`. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Dev, Preview, Production | Public Supabase client anon key. Baked at build time. | Present in `.env.local`; required for Preview + Production builds. |
| `SUPABASE_SERVICE_ROLE_KEY` | Dev, Preview, Production | Server-only privileged PostgreSQL/RPC client (bypasses RLS strictly in vetted API handlers). **Never prefix with `NEXT_PUBLIC_`.** | Confirmed `OK` in live `/api/auth/health` (`supabase_service_key`) and `.env.local`. |
| `CREDENTIAL_SIGNING_KEY` | Dev, Preview, Production | HMAC-SHA256 / Ed25519 credential signing secret (>=32 random bytes, 256-bit entropy). Now fails closed in production if missing (`credential-signer.ts`). | Validated in `.env.local`. Must be verified present & >=256-bit in Vercel Production & Preview. |
| `RATE_LIMIT_HMAC_SECRET` | Dev, Preview, Production | Privacy-preserving HMAC key hashing for `auth_rate_limits` (>=32 random bytes). | Confirmed `OK` (>=32 chars) in live `/api/auth/health` and `.env.local`. |
| `NEXT_PUBLIC_APP_URL` | Preview, Production | Canonical base URL (`https://kaamsetu-neon.vercel.app`) for `robots.ts`, `sitemap.ts`, and links. | Present in `.env.local`; set per environment or fall back to `VERCEL_PROJECT_PRODUCTION_URL`. |

---

## 2. Authentication, Security & Rollout Governance Variables

| Variable Name | Required Scopes | Purpose | Observed Evidence / Status |
| :--- | :--- | :--- | :--- |
| `AUTH_VERIFICATION_MODE` | Preview (`sandbox`), Production (`production` when SMS ready) | Switches OTP delivery between transparent `sandbox` and live telecom `sms`. | **Attention:** Live `kaamsetu-neon.vercel.app/api/auth/health` currently reports `"mode": "sandbox"`. Switch to `production` in Vercel Production once `TWILIO_*` is configured. |
| `SANDBOX_OTP_CODE` | Dev, Preview only | Fixed sandbox test OTP code. Must stay gated behind sandbox / non-production safeguards. | Do **not** configure insecure production bypasses (`ALLOW_INSECURE_SANDBOX_IN_PRODUCTION` must stay unset/`false`). |
| `ACTIVE_SIGNING_KEY_VERSION` | Optional (default `v1`) | Selects active credential key version (`v1`, `v2`, etc.). Paired with `CREDENTIAL_SIGNING_KEY_<VERSION>`. | Optional key rotation control. |
| `REVOKED_SIGNING_KEY_VERSIONS` | Optional | Comma-separated revoked signing key versions rejected by verifier. | Optional key revocation list. |
| `RATE_LIMIT_HMAC_SECRET_PREVIOUS` | Optional | Enables zero-downtime lockout preservation during `RATE_LIMIT_HMAC_SECRET` rotation. | Optional key rotation helper. |
| `AUTH_SECRET` / `JWT_SECRET` | Preview, Production (if custom JWT/session signing is active) | Fallback/session signing material referenced in server auth checks. | Confirm presence in Vercel Production -> Environment Variables if using custom token overrides beyond Supabase/HMAC secrets. |
| `ENABLE_IN_MEMORY_RATE_LIMIT_MOCK` | Local Dev only (`false` in Prod) | Enables offline dev fallback when DB absent; impossible in production. | Set to `false` / unset on Vercel Production & Preview. |

---

## 3. AI, Translation, Voice & External Integrations

| Variable Name | Required Scopes | Purpose | Observed Evidence / Status |
| :--- | :--- | :--- | :--- |
| `GEMINI_API_KEY` | Dev, Preview, Production | Live multilingual translation, Roman transliteration, English meaning, and onboarding voice extraction. | Configured and verified live on `kaamsetu-neon.vercel.app` (`POST /api/translate` returned `provider: "gemini"`). |
| `GEMINI_MODEL` | Optional (`gemini-2.0-flash`) | Override Gemini model name cleanly without code edits. | Default is `gemini-2.0-flash`. |
| `GOOGLE_TRANSLATE_API_KEY` | Optional | Secondary machine translation backend (gracefully degrades to deterministic corpus if unset). | Unset locally; external providers report unavailable truthfully. |
| `AZURE_TRANSLATOR_KEY` / `AZURE_TRANSLATOR_REGION` | Optional | Azure Translator backend (gracefully cascades when unset). | Unset locally. |
| `AZURE_SPEECH_KEY` / `AZURE_SPEECH_REGION` | Optional | Server-side Azure neural TTS backend for `/api/voice/tts`. | Unset locally; falls back cleanly to browser Web Speech. |
| `BHASHINI_API_KEY` / `BHASHINI_USER_ID` | Optional | Government of India Bhashini Ulca translation API credentials. | Unset locally. |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` | Production (when `AUTH_VERIFICATION_MODE=sms`) | Live SMS OTP gateway credentials. | Required before changing `AUTH_VERIFICATION_MODE` from `sandbox` to `production`. |
| `DIGILOCKER_CLIENT_ID`, `DIGILOCKER_CLIENT_SECRET`, `DIGILOCKER_REDIRECT_URI`, `DIGILOCKER_AUTH_URL`, `DIGILOCKER_TOKEN_URL`, `ENABLE_DIGILOCKER_LIVE` | Optional / Production when live MeitY integration enabled | Live DigiLocker verification callbacks (`DIGILOCKER_REDIRECT_URI` must match `https://kaamsetu-neon.vercel.app/api/auth/digilocker/callback`). | Sandbox/unconfigured unless partner credentials added. |
| `RAZORPAY_KEY_SECRET`, `ENABLE_LIVE_PAYMENTS` | Preview (`false`), Production (`true` only for contractor B2B billing) | Contractor Pro subscription webhook verification & live billing flag (`platform_commission_amount` on worker wages remains permanently `0.00`). | Live `/api/health` shows `billing.mode: "sandbox"`. |

---

## 4. Vercel Hosting Configuration Rules
- **Do NOT add `NODE_ENV` manually** in Vercel Dashboard Environment Variables (Next.js & Vercel inject `NODE_ENV=production` automatically for builds; setting it manually breaks Next build optimizations).
- **Vercel System Variables:** Enable *"Automatically expose System Environment Variables"* in **Vercel Project Settings -> Environment Variables** so `VERCEL_ENV`, `VERCEL_GIT_COMMIT_SHA`, `VERCEL_GIT_COMMIT_REF`, `VERCEL_DEPLOYMENT_ID`, `VERCEL_URL`, `VERCEL_PROJECT_PRODUCTION_URL`, and `VERCEL_REGION` populate `/api/health` accurately.
