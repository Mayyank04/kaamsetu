# PHASE 51 — DEPLOYMENT & PACKAGING RUNBOOK

**Date:** November 25, 2026  
**Target Branch:** `phase-51-full-product-transformation`  
**Mandatory Order:** Database Migration -> Web Production Build -> Wrapper Packaging (CI/SDK Hosts)

---

## 1. Pre-Deployment Environment & Security Checklist

1. Confirm the following production secrets exist in Vercel / environment config and pass 256-bit entropy checks (`validateCryptographicKeyMaterial`):
   - `CREDENTIAL_SIGNING_KEY` (and rotated `CREDENTIAL_SIGNING_KEY_V2` if `ACTIVE_SIGNING_KEY_VERSION=v2`)
   - `RATE_LIMIT_HMAC_SECRET`
   - `NEXT_PUBLIC_SUPABASE_URL` & `SUPABASE_SERVICE_ROLE_KEY`
   - `GEMINI_API_KEY` (for live translation fallback & transliteration/meaning)
2. Ensure `PERMITTED_OPERATING_REGIONS` enforces `CLASS_B_CONTROLLED_ROLLOUT` (Guwahati Urban `781001–781039` and Shillong Urban `793001–793022`) and `platform_commission_amount = 0.00`.

---

## 2. Step 1 — Apply Database Migration (Before Deploying App Code)

Apply the Phase 51 rate-limit lockout alignment migration to your target Supabase PostgreSQL instance:

```bash
psql "$DATABASE_URL" -f supabase/migrations/20261125000001_phase51_rate_limit_max_attempt_lockout.sql
```

Verify RPC behavior locally before production rollout:

```bash
npm run test:crypto && npm run test:ratelimit && npm run test:rls
```

---

## 3. Step 2 — Verify & Deploy Web / PWA Build

```bash
npm run lint
npm run build
npm run test:phase51
npm run test:phase50.4 && npm run test:phase50.3 && npm run test:phase50.1 && npm run test:phase50
npm run test:phase49:auth && npm run test:phase49:translation
```

Start and smoke-check `/api/health`, `/`, `/explore`, `/translate`, `/login`, and `/onboarding` before promoting production DNS.

---

## 4. Step 3 — Packaging Native & Desktop Wrappers (Provisioned Hosts Only)

### Android & iOS (Requires Android SDK/`gradle` for Android; Xcode + `pod` on macOS for iOS)
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios @capacitor/app @capacitor/share
npx cap add android && npx cap add ios
npx cap sync
# Copy mobile/android/AndroidManifest.xml rules & mobile/ios/Info.plist usage strings, then open native IDEs:
npx cap open android
npx cap open ios
```

### Desktop (`macOS`, `Windows`, `Linux` via Electron)
```bash
cd desktop
npm install
npm run dist:mac    # requires macOS signing identity for public notarized DMG
npm run dist:win    # run on Windows host/CI for NSIS installer
npm run dist:linux  # run on Linux host/CI for AppImage / deb
```

---

## 5. Rollback Procedure
- **Web Rollback:** Re-promote previous Vercel production deployment (`8018c61` / `9945ae8` baseline).
- **Database Migration Rollback:** `check_and_increment_rate_limit` only tightens `blocked_until` when `count = max_attempts`; if reverting, restore the prior `CREATE OR REPLACE FUNCTION` definition from `supabase/migrations/20261117_master_infrastructure_repair.sql`.
