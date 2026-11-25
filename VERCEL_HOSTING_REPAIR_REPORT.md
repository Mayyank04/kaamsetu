# VERCEL HOSTING REPAIR REPORT

**Repair Date:** November 25, 2026  
**Branch:** `phase-51-full-product-transformation`  
**Scope:** Repository-enforced Vercel hosting configuration, deployment observability, caching hygiene, runtime error fixes, and CI workflow.

---

## 1. Fixes Implemented in Repository

| Area | File(s) | Exact Change & Rationale |
| :--- | :--- | :--- |
| **Vercel Project Config** | [vercel.json](file:///Users/mayankgautam/Desktop/stitch_kaamsetu_digital_identity_platform/vercel.json) *(New)* | Set explicit `framework: "nextjs"`, `installCommand: "npm ci"`, `buildCommand: "npm run build"`, single India region `regions: ["bom1"]` (fixes `bom1::iad1::` US-East compute routing), and explicit `Cache-Control` `no-store`/`no-cache` headers on `/sw.js`, `/api/health`, and `/api/auth/health`. |
| **Node.js Runtime Pinning** | [.nvmrc](file:///Users/mayankgautam/Desktop/stitch_kaamsetu_digital_identity_platform/.nvmrc) *(New)*, [package.json](file:///Users/mayankgautam/Desktop/stitch_kaamsetu_digital_identity_platform/package.json) | Pinned Node LTS `22` (`.nvmrc`) and `"engines": { "node": "22.x" }` so Vercel Preview, Production, and CI use consistent runtime semantics. |
| **Deployment Telemetry & Health** | [src/app/api/health/route.ts](file:///Users/mayankgautam/Desktop/stitch_kaamsetu_digital_identity_platform/src/app/api/health/route.ts) | Forced `dynamic = "force-dynamic"`, removed hardcoded fake schema fields (`migrationsApplied: "01-09"`, `tablesCount: 26`), and exposed safe non-secret Vercel system env visibility (`vercelEnv`, `region`, `deploymentId`, `deploymentUrl`, `productionUrl`, `gitBranch`, `gitRepository`, `commitShort`, `nodeVersion`, `auth.verificationMode`, `governance.classification`, `governance.platformCommissionAmount`). |
| **GitHub CI Pre-Deploy Gate** | [.github/workflows/ci.yml](file:///Users/mayankgautam/Desktop/stitch_kaamsetu_digital_identity_platform/.github/workflows/ci.yml) *(New)* | Added GitHub Actions workflow on `main` and `phase-*` branches running `npm ci`, `npm run lint`, and `npm run build` on Node 22 so build regressions surface directly on PRs before Vercel promotion. |
| **Service Worker Cache Isolation** | [public/sw.js](file:///Users/mayankgautam/Desktop/stitch_kaamsetu_digital_identity_platform/public/sw.js) | Upgraded `CACHE_NAME` to `"kaamsetu-shell-v2"`, stopped precaching `"/"` HTML, bypassed SW cache for SSR document navigations (falling back to `/offline` only on network failure), and restricted caching strictly to `/offline`, `/manifest.json`, `/favicon.ico`, `/icons/*`, and `/_next/static/*`. |
| **Self-Hosted Google Fonts** | [src/app/layout.tsx](file:///Users/mayankgautam/Desktop/stitch_kaamsetu_digital_identity_platform/src/app/layout.tsx), [src/app/globals.css](file:///Users/mayankgautam/Desktop/stitch_kaamsetu_digital_identity_platform/src/app/globals.css) | Replaced external `@import url('https://fonts.googleapis.com/...')` (which triggered `503` / `net::ERR_ABORTED` on live production) with build-time `next/font/google` loading (`Plus_Jakarta_Sans`, `Noto_Sans_Devanagari`, `Noto_Sans_Bengali`, `Noto_Sans_Tamil`, `Noto_Sans_Telugu`). |
| **`/translate` Hydration Fix** | [universal-translator-workspace.tsx](file:///Users/mayankgautam/Desktop/stitch_kaamsetu_digital_identity_platform/src/components/translation/universal-translator-workspace.tsx), [audio-channel-bar.tsx](file:///Users/mayankgautam/Desktop/stitch_kaamsetu_digital_identity_platform/src/components/translation/audio-channel-bar.tsx), [translate/page.tsx](file:///Users/mayankgautam/Desktop/stitch_kaamsetu_digital_identity_platform/src/app/translate/page.tsx) | Initialized audio channel state cleanly on SSR before client `useEffect` subscribes to `playbackController` voices, eliminating live React Error #418 hydration crashes on `/translate`, and cleaned residual invalid tokens (`warm-ivory` -> `ivory`, `sand-dark` -> `sand-700`). |
| **SEO / Metadata Routes** | [src/app/robots.ts](file:///Users/mayankgautam/Desktop/stitch_kaamsetu_digital_identity_platform/src/app/robots.ts) *(New)*, [src/app/sitemap.ts](file:///Users/mayankgautam/Desktop/stitch_kaamsetu_digital_identity_platform/src/app/sitemap.ts) *(New)* | Eliminated live HTTP `404`s on `/robots.txt` and `/sitemap.xml` using canonical `NEXT_PUBLIC_APP_URL` / `VERCEL_PROJECT_PRODUCTION_URL`. |
| **Environment Template Hygiene** | [.env.example](file:///Users/mayankgautam/Desktop/stitch_kaamsetu_digital_identity_platform/.env.example) | Removed `NODE_ENV=development` (prevents accidental override inside Vercel env config) and documented all optional translation/speech keys alongside production vs sandbox auth scope rules. |

---

## 2. Items Requiring Direct Dashboard / Remote Execution (Blocked Locally)
Because local Vercel CLI auth returned `403 invalidToken` and desktop Chrome remote debugging was unavailable:
1. Run `vercel login && vercel link` locally to re-authenticate CLI and bind `.vercel` (when ready).
2. In **Vercel Dashboard -> Project Settings -> General / Git / Environment Variables**:
   - Confirm Production Branch = `main` and Node.js Version = `22.x`.
   - Confirm Function Region = Mumbai (`bom1`) matches `vercel.json`.
   - Set `AUTH_VERIFICATION_MODE=production` (only when live SMS provider keys are ready) and confirm `CREDENTIAL_SIGNING_KEY` & `RATE_LIMIT_HMAC_SECRET` meet 256-bit entropy.
   - Verify whether Vercel Dashboard shows any stalled previews or old branches under **Deployments**.
3. Apply pending migrations (`20261122000001_phase45_complete_production_master_schema.sql` and `20261125000001_phase51_rate_limit_max_attempt_lockout.sql`) in Supabase (`anwppwjlismjyovbyfmb.supabase.co`).
4. Merge/push these fixes to `main` (only when authorized) to deploy them live.
