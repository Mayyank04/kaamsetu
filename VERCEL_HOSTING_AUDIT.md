# VERCEL HOSTING AUDIT — KAAMSETU

**Audit Date:** November 25, 2026  
**Target Live URL:** `https://kaamsetu-neon.vercel.app`  
**GitHub Repository:** `Mayyank04/kaamsetu`  
**Active Local Branch:** `phase-51-full-product-transformation`  
**Deployed Commit Observed Live:** `725e32c4b348f5befbe403cbcb5b136c4dc82813` (`origin/main`, PR #38 merged `2026-11-25 21:36:35 +0530`)

---

## 1. Access Scope & Blocked Boundaries (Stated Truthfully)

To diagnose the Vercel hosting interface, project settings, and live deployment pipeline, every sanctioned CLI, API, browser, and HTTP path was checked:
1. **Vercel CLI:** `vercel` is not installed globally (`vercel not found`). Invoking `https://api.vercel.com/v2/user` using the cached CLI session in `~/Library/Application Support/com.vercel.cli/auth.json` (team `team_WSBQK1U61nwweXzrQ9KtSr0J`) returned **HTTP `403`** (`{"error":{"code":"forbidden","message":"Not authorized","invalidToken":true}}`).
2. **Vercel Web Dashboard (Browser Automation):** The `browser` subagent could not attach to desktop Chrome because `chrome://inspect/#remote-debugging` (`DevToolsActivePort`) was not enabled on the host browser.
3. **What WAS Directly Inspected:** Complete repository hosting configs, Git remotes/branches (`git fetch origin`), live HTTPS headers & endpoints on `https://kaamsetu-neon.vercel.app`, headless Chrome CDP DOM/console/network inspection against `https://kaamsetu-neon.vercel.app`, and live remote Supabase schema parity via `npm run check:deploy`.

---

## 2. Root Causes Discovered

### 2.1 Cross-Continent Serverless Function Routing (`bom1` Edge -> `iad1` Compute)
- **Evidence:** Live `curl -sSI` probes on `/api/health`, `/api/auth/health`, `/api/workers`, and `/verify/IN-RJ-2026-4029-KS` returned Vercel routing headers:
  `x-vercel-id: bom1::iad1::...`
- **Root Cause:** No `vercel.json` existed in the repository to pin serverless compute to Mumbai (`bom1`). Vercel routed Indian users through the Mumbai CDN edge (`bom1`) and then across continents to default US-East (`iad1`) for SSR and API execution, increasing API and Supabase round-trip latency.

### 2.2 Opaque Deployment Visibility & Lying Static Health Telemetry
- **Evidence:** Live `GET https://kaamsetu-neon.vercel.app/api/health` returned:
  - Hardcoded `"migrationsApplied": "01-09"` and `"tablesCount": 26` regardless of real database state.
  - Only `"environment": "production"` without `VERCEL_ENV` (`production` vs `preview`), `VERCEL_GIT_COMMIT_REF` (branch), `VERCEL_DEPLOYMENT_ID`, `VERCEL_REGION`, or auth verification mode.
- **Root Cause:** Operators could not reliably verify from `/api/health` whether a URL was a Preview or Production deployment, which region served it, which Git branch produced it, or whether schema telemetry was real. Additionally, local `main` branch was still at `636b30e` (Phase 39.3) while `origin/main` was at `725e32c`.

### 2.3 Missing Runtime Pinned Node Engine & GitHub CI Gate
- **Evidence:** The repository had no `vercel.json`, no `.nvmrc`, no `"engines"` field in `package.json`, no `.vercel/project.json`, and no `.github/workflows/` CI checks.
- **Root Cause:** Lockfile install behavior, Node major version (`22.x` LTS vs local `v24.15.0`), and pre-Vercel lint/build failures depended solely on Vercel Dashboard UI state with zero Git-enforced build gates.

### 2.4 Service Worker Caching Dynamic SSR HTML Pages Across Deployments
- **Evidence (`public/sw.js`):** Pre-cached `"/"` on install and cached all HTTP `200` same-origin `GET` responses under static key `"kaamsetu-cache-v1"` without HTTP cache-control rules for `/sw.js`.
- **Root Cause:** When a new commit promotes on Vercel, returning visitors with an active service worker can continue seeing stale SSR HTML fallback or delayed worker updates.

### 2.5 Live Production Runtime, Font & SEO Defects on `kaamsetu-neon.vercel.app`
Observed directly in live headless Chrome CDP & HTTP probes against `https://kaamsetu-neon.vercel.app`:
1. **`/translate` Runtime Exception (`Minified React error #418`):** `UniversalTranslatorWorkspace` initialized `channelStatuses` directly from `playbackController.getStatus()`, reading browser `window.speechSynthesis.getVoices()` on initial client render while SSR returned `[]` — causing a React HTML hydration mismatch (`Uncaught` in CDP).
2. **External Font Stylesheet `503` / `net::ERR_ABORTED`:** `src/app/globals.css` used external CSS `@import url('https://fonts.googleapis.com/...')`, causing Chrome network errors (`503` / `ERR_ABORTED`) on route navigations.
3. **`404` on `/robots.txt` and `/sitemap.xml`:** Both metadata endpoints returned `HTTP/2 404` on `https://kaamsetu-neon.vercel.app`.
4. **`npm run check:deploy` Production Database Drift:** Against `anwppwjlismjyovbyfmb.supabase.co` (the active project reported by `/api/health`):
   - **5 tables `PENDING MIGRATION`:** `credential_registry`, `bookings`, `reviews`, `contractor_jobs`, `custom_localities`.
   - **10 extended `worker_profiles` columns missing:** `district`, `locality`, `profile_type`, `business_name`, `vendor_type`, `stall_type`, `operating_hours`, `product_catalog`, `delivery_available`, `contact_preference`.
   - **`20261125000001_phase51_rate_limit_max_attempt_lockout.sql` not yet applied** remotely.
5. **Production Auth Mode Set to Sandbox:** `GET https://kaamsetu-neon.vercel.app/api/auth/health` reported `"mode": "sandbox"`, indicating `AUTH_VERIFICATION_MODE=sandbox` is currently configured on the Vercel Production environment.
