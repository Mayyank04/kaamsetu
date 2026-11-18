# KAAMSETU — PHASE 40: VERCEL PRODUCTION ENVIRONMENT CONFIGURATION

**Target Domain:** `https://kaamsetu-neon.vercel.app`  
**Hosting Platform:** Vercel Serverless & Edge Network  
**Runtime Compatibility:** Node.js 20+ Serverless Functions & Edge Middleware  
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  

---

## 1. Mandatory Environment Variables

The following environment variables must be configured under **Vercel Project Settings -> Environment Variables** for the Production, Preview, and Development environments.

| Variable Name | Exposure | Required Length | Purpose |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Public (Client & Server) | Valid HTTPS URL | Points to Supabase project `https://anwppwjlismjyovbyfmb.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public (Client & Server) | JWT Token (~200 chars) | PostgREST client queries subject to Row Level Security |
| `SUPABASE_SERVICE_ROLE_KEY` | Private (Server Only) | JWT Token (~219 chars) | Privileged admin operations (admin.createUser, upserts, rate limiting) |
| `RATE_LIMIT_HMAC_SECRET` | Private (Server Only) | >= 32 characters | Cryptographic key for signing and verifying `kaamsetu_session` tokens |
| `NEXT_PUBLIC_APP_URL` | Public (Client & Server) | Valid HTTPS URL | Canonical base URL: `https://kaamsetu-neon.vercel.app` |
| `GEMINI_API_KEY` | Private (Server Only) | AI Studio Key | Powers multimodal onboarding voice and skill extraction |
| `GEMINI_MODEL` | Private (Server Only) | String | Recommended: `gemini-2.5-flash` or `gemini-1.5-flash-latest` |
| `AUTH_VERIFICATION_MODE` | Private (Server Only) | 'sandbox' \| 'sms' | Set to `sandbox` for current release |

---

## 2. Runtime Architecture & Edge Compatibility

KAAMSETU utilizes a hybrid deployment topology on Vercel:

```
           [ Client Browser Request ]
                       │
                       ▼
       ┌───────────────────────────────┐
       │   Vercel Edge Middleware      │  <-- src/middleware.ts
       │   (Edge Runtime / Web Crypto) │      Evaluates Web Crypto subtle.verify
       └───────────────┬───────────────┘
                       │
         ┌─────────────┴─────────────┐
         ▼                           ▼
   [ Next.js SSR / Pages ]    [ API Route Handlers ]  <-- Node.js Serverless
   (Server Components)        (/api/auth/*, /api/worker/*)
```

### 2.1 Edge Middleware Compatibility
- The Edge Middleware (`src/middleware.ts` and `src/lib/supabase/middleware.ts`) runs on the Vercel Edge Runtime (V8 isolates).
- It strictly relies on the standard **Web Crypto API** (`crypto.subtle.importKey`, `crypto.subtle.verify`) and standard `atob` decoding.
- It contains **zero** Node.js native dependencies (`node:crypto`, `node:buffer`, `node:fs`), preventing Edge bundle compilation crashes.

### 2.2 Serverless Route Handlers
- Route Handlers (`src/app/api/**/route.ts`) execute in Node.js 20 Serverless Functions.
- They utilize `createAdminClient()` with `SUPABASE_SERVICE_ROLE_KEY` to interact securely with Supabase Auth and PostgreSQL.

---

## 3. Session & Cookie Specifications

When a user registers or logs in, the server issues a durable session cookie configured as follows:

- **Cookie Name:** `kaamsetu_session`
- **Path:** `/` (Accessible across the entire domain)
- **HttpOnly:** `true` (Protects against cross-site scripting / XSS attacks)
- **Secure:** `true` in production (Transmitted only over HTTPS)
- **SameSite:** `lax` (Permits standard navigation while preventing CSRF)
- **Max-Age:** `1,209,600` seconds (14 days)
- **Payload Format:** `<base64url_json_payload>.<hmac_sha256_signature>`

Additionally, standard Supabase Auth SSR cookies (`sb-*-auth-token`) are refreshed on demand by `@supabase/ssr` to ensure compatibility with client-side Supabase SDK calls.

---

## 4. Vercel Deployment Runbook

1. Merge or deploy branch `phase-40-root-cause-database-repair` to Vercel.
2. Confirm the build logs show:
   ```
   ✓ Compiled successfully
   ✓ Linting and checking validity of types
   ✓ Collecting page data
   ✓ Generating static pages (116/116)
   ```
3. Once deployed, run the preflight verification check against the production domain:
   ```bash
   curl -s https://kaamsetu-neon.vercel.app/api/auth/health | jq .
   ```
4. Verify HTTP 200 OK and `operational: true`.
