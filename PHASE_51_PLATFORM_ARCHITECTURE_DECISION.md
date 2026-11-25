# PHASE 51 — MULTIPLATFORM ARCHITECTURE DECISION

**Date:** November 25, 2026  
**Repository:** `Mayyank04/kaamsetu`  
**Target Platforms:** Web, Android, iOS, macOS, Windows, Linux  

---

## 1. Decision Summary

KAAMSETU adopts a **Single-Core Shared Web + Native Shell Architecture**:
1. **Shared Core (`src/`):** Next.js 15 + React 19 + TypeScript application holding 100% of business logic, Supabase Auth/RLS integration, `CLASS_B_CONTROLLED_ROLLOUT` geo enforcement, zero-commission financial checks, 39-language i18n dictionaries, universal translator, voice engine, and semantic design tokens.
2. **Web & Installable PWA:** Next.js responsive SSR/SSG web app + upgraded Web App Manifest + Service Worker offline shell (`/offline`) + mobile bottom navigation.
3. **Android & iOS (`capacitor.config.ts`, `mobile/`):** Capacitor native shell connecting to the verified HTTPS production deployment (with bundled offline fallback & splash shell in `mobile/index.html`), native permission manifests (`AndroidManifest.xml`, `Info.plist`) for Microphone, Speech Recognition, Location, Camera/QR, Android hardware back-button routing, `kaamsetu://` deep links, and safe-area inset handling (`env(safe-area-inset-*)`).
4. **macOS, Windows & Linux (`desktop/`):** Context-isolated Electron desktop shell (`desktop/main.cjs`, `desktop/preload.cjs`, `desktop/package.json`) loading the KAAMSETU desktop workspace with application menus, keyboard shortcuts, `kaamsetu://` protocol handling, window bounds persistence, and `electron-builder` targets (`.dmg`, NSIS `.exe`, `.AppImage` / `.deb`).

---

## 2. Architecture Options Evaluated

| Option | Code Reuse | SSR & API Support | Native Capabilities (Mic, Back Button, Tray, Deep Links) | Maintenance Burden | Verdict |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **PWA Only** | 100% | Full Next.js SSR | Limited on iOS (no Play/App Store distribution, weak background/back-button) | Very Low | Necessary for Web, insufficient alone for Store apps & Desktop |
| **Capacitor + Remote Next.js SSR** | 98% (shared `src/`) | Preserves all `/api/*` routes, middleware, SSR Supabase cookies | Full Android/iOS permissions, Adaptive Icon, Splash, Back button, App Store / Play Store packaging | Low | **Selected for Android & iOS** |
| **Separate React Native / Expo Rewrite** | ~25% (must rewrite 40+ UI pages & voice/translation views) | API-only; loses SSR pages | Full native | Very High (6x UI drift risk) | Rejected for Phase 51 — creates duplicate UIs against user directive |
| **Tauri** | ~95% | Needs server or static export | Lightweight binary | Medium (requires Rust toolchain) | Rejected — `rustc` / `cargo` unavailable on build host; Next.js uses dynamic SSR API routes |
| **Electron (Context-Isolated Shell)** | 98% | Full Next.js SSR | macOS `.dmg`, Windows `.exe`, Linux `.AppImage` / `.deb`, native menus, shortcuts, deep links | Low-Medium | **Selected for macOS, Windows & Linux** |

---

## 3. Shared vs. Platform-Specific Responsibilities

### 3.1 Shared Across All 6 Platforms (`src/`)
- Domain validation schemas (`src/schemas/*`), `GeographicAuthorizationService`, `platform_commission_amount = 0.00` enforcement.
- Authentication (`src/lib/auth/*`), API route handlers (`src/app/api/*`), database repositories.
- Design system (`src/app/globals.css`, `tailwind.config.ts`, `src/components/ui/*`).
- 39-language translations (`src/lib/i18n/*`), Universal Translator (`src/lib/translation/*`), Voice Engine (`src/lib/voice/*`).
- Shared runtime detector & native bridge (`src/lib/platform/runtime.ts`).

### 3.2 Platform-Specific Implementations
- **Web / PWA:** Responsive mobile-first layout (`pb-20 md:pb-0`), fixed bottom tab bar (`mobile-bottom-nav.tsx`), installable `manifest.json` with adaptive/maskable SVG icons (`public/icons/`), service worker caching non-sensitive static/offline shells.
- **Android (`mobile/android/` & `capacitor.config.ts`):** `RECORD_AUDIO`, `ACCESS_COARSE_LOCATION`, `INTERNET`, `MODIFY_AUDIO_SETTINGS`, deep-link `<intent-filter>` (`https://kaamsetu-neon.vercel.app`, `kaamsetu://`), hardware back navigation handled via `src/lib/platform/runtime.ts`.
- **iOS (`mobile/ios/` & `capacitor.config.ts`):** `NSMicrophoneUsageDescription`, `NSSpeechRecognitionUsageDescription`, `NSLocationWhenInUseUsageDescription`, Associated Domains + URL scheme `kaamsetu`, viewport `viewportFit: "cover"` + CSS `env(safe-area-inset-top/bottom)`.
- **Desktop (`desktop/`):** `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`, external links opened safely in OS browser via `shell.openExternal` (HTTPS-allowlisted), shortcuts (`Cmd/Ctrl+1..4` navigation, `Cmd/Ctrl+R` reload), offline error page with retry button.

---

## 4. Environment Constraints & Verified Build Blockers

Honest status of SDK availability on the current macOS engineering workstation:
- **Available:** `node`, `npm`, `npx`, `java`, `xcodebuild` (macOS Xcode CLI).
- **Unavailable in current host environment:**
  - Android SDK / `gradle` / `adb` (`not found`) — prevents compiling a signed `.apk` / `.aab` locally.
  - CocoaPods (`pod not found`) and Apple Developer distribution certificates / provisioning profiles — prevents compiling a signed `.ipa` locally.
  - Windows (`NSIS`/Authenticode) & Linux (`dpkg`/`AppImage`) signing/packaging binaries.
- **What IS built & verified:**
  - Complete production Next.js Web + PWA build (`npm run build` + browser verification).
  - Complete Capacitor config, native manifests (`AndroidManifest.xml`, `Info.plist`), and fallback shell (`mobile/index.html`) ready for `npx cap sync` on a provisioned CI runner / SDK machine.
  - Complete Electron desktop entrypoint (`desktop/main.cjs`, `desktop/preload.cjs`, `desktop/package.json`) syntax-checked (`node --check`) and ready for `electron-builder`.
