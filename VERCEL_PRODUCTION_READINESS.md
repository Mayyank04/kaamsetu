# VERCEL PRODUCTION READINESS REPORT

**Assessment Date:** November 25, 2026  
**Live Deployment Status (`https://kaamsetu-neon.vercel.app`):** Serving `origin/main` commit `725e32c4b348f5befbe403cbcb5b136c4dc82813`  
**Overall Verdict:** **CONDITIONALLY LIVE — REPOSITORY FIXES READY TO DEPLOY; EXTERNAL VERCEL DASHBOARD & SUPABASE ACTIONS REQUIRED**

---

## 1. Current State Summary

1. **What Is Working Live Today (`https://kaamsetu-neon.vercel.app`):**
   - HTTPS (`HTTP/2 200`) with HSTS preload, strict CSP, `X-Frame-Options: DENY`, and `X-Content-Type-Options: nosniff`.
   - Core pages (`/`, `/explore`, `/translate`, `/login`, `/onboarding`, `/how-it-works`, `/about`) serve `200`, protected dashboards (`/dashboard`, `/vendor/dashboard`, `/contractor/dashboard`) enforce `307 -> /login` redirects, and `/api/translate` executes live Gemini translation cleanly.
2. **What Is Still Broken or Blocked Live Until Deployed/Applied:**
   - **Vercel Dashboard & CLI Access Blocked:** Local CLI token returned `403 invalidToken: true` and Chrome remote debugging was unavailable, so direct Vercel Dashboard settings, Preview deployment URLs, and server runtime logs could not be directly mutated or read.
   - **Live `/translate` React #418 & Font `503`s:** Live `kaamsetu-neon.vercel.app` still runs `725e32c` (before this task's commit), so `/translate` currently exhibits React hydration error `#418` and `/robots.txt` + `/sitemap.xml` return `404`. **All three are fixed and verified locally in `phase-51-full-product-transformation`, awaiting merge & deploy authorization.**
   - **Remote Supabase Schema Behind Code:** Live `npm run check:deploy` against `anwppwjlismjyovbyfmb.supabase.co` shows `credential_registry`, `bookings`, `reviews`, `contractor_jobs`, `custom_localities`, 10 extended `worker_profiles` columns, and the Phase 51 `check_and_increment_rate_limit` migration pending on remote Supabase Cloud.
   - **Production Auth Verification Mode:** `/api/auth/health` reports `mode: "sandbox"` on live production (`AUTH_VERIFICATION_MODE=sandbox`).

---

## 2. Rollback & Recovery Strategy

If any new deployment to `https://kaamsetu-neon.vercel.app` degrades production:
1. Check `GET https://kaamsetu-neon.vercel.app/api/health` to confirm exact `commitShort`, `deploymentId`, `vercelEnv`, `region`, and `gitBranch`.
2. In **Vercel Dashboard -> Deployments**, locate the last verified Production deployment (`725e32c4` or newer green release) and use **Instant Rollback** (zero-rebuild pointer switch), documenting the failed `deploymentId` and runtime/build log cause before promoting again.
3. Database migrations (`20261122000001_phase45_complete_production_master_schema.sql`, `20261125000001_phase51_rate_limit_max_attempt_lockout.sql`) are forward-only; never drop tables during rollback.

---

## 3. Exact Remaining Operator Checklist (In Order)

1. **Apply Remote Database Migrations (Supabase SQL Editor for `anwppwjlismjyovbyfmb`):**
   - Run `supabase/migrations/20261122000001_phase45_complete_production_master_schema.sql`
   - Run `supabase/migrations/20261125000001_phase51_rate_limit_max_attempt_lockout.sql`
   - Re-run `npm run check:deploy` until all 10 tables and 10 extended columns report `ONLINE`.
2. **Verify Vercel Project Settings (`vercel.com` -> Project -> Settings):**
   - Authenticate CLI locally (`npx vercel login && npx vercel link`) or inspect in browser.
   - Verify **Git** -> Connected repo `Mayyank04/kaamsetu`, Production Branch = `main`, Preview Deployments enabled.
   - Verify **Build & Deployment** -> Preset `Next.js`, Node.js `22.x`, Root Directory `./` (empty), Install `npm ci`, Build `npm run build`.
   - Verify **Functions / Region** -> `bom1` (Mumbai).
   - Verify **Environment Variables** -> Confirm *"Automatically expose System Environment Variables"* is ON, `NODE_ENV` is NOT manually overridden, and choose `AUTH_VERIFICATION_MODE=production` only after `TWILIO_*` keys are populated.
   - Verify **Supabase Auth -> URL Configuration**: Confirm `Site URL = https://kaamsetu-neon.vercel.app` and wildcard preview/callback redirect URLs (`https://kaamsetu-neon.vercel.app/**`, `https://*.vercel.app/**`).
3. **Commit & Promote Fix Branch (Requires User Authorization):**
   - Commit the verified fixes on `phase-51-full-product-transformation`, merge to `main`, wait for CI + Vercel build green, and verify `GET https://kaamsetu-neon.vercel.app/api/health`, `/robots.txt`, `/sitemap.xml`, and `/translate` (zero React #418 errors).
