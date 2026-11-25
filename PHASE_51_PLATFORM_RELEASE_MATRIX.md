# PHASE 51 — CROSS-PLATFORM RELEASE MATRIX

**Date:** November 25, 2026  
**Shared Core:** Next.js `15.5.29` + React `19` + TypeScript (`src/`)

---

## 1. Platform Support & Artifact Matrix

| Platform | Runtime Wrapper / Artifact | Key Implemented Files | Verification Status | Current Host Blockers (Truthful) |
| :--- | :--- | :--- | :--- | :--- |
| **Web (Desktop & Mobile Browser)** | Next.js SSR + App Router (`124` routes) | [layout.tsx](file:///Users/mayankgautam/Desktop/stitch_kaamsetu_digital_identity_platform/src/app/layout.tsx), [globals.css](file:///Users/mayankgautam/Desktop/stitch_kaamsetu_digital_identity_platform/src/app/globals.css), [mobile-bottom-nav.tsx](file:///Users/mayankgautam/Desktop/stitch_kaamsetu_digital_identity_platform/src/components/layout/mobile-bottom-nav.tsx) | **Built & Visually Verified** (`npm run build`, CDP screenshots at `320`, `390`, `768`, `1440`px) | None for local/CI build; remote release awaits DB migration + Vercel deploy authorization |
| **PWA (Android Chrome / iOS Safari Add-to-Home)** | Web App Manifest + Service Worker | [manifest.json](file:///Users/mayankgautam/Desktop/stitch_kaamsetu_digital_identity_platform/public/manifest.json), [icon-512.svg](file:///Users/mayankgautam/Desktop/stitch_kaamsetu_digital_identity_platform/public/icons/icon-512.svg), [runtime.ts](file:///Users/mayankgautam/Desktop/stitch_kaamsetu_digital_identity_platform/src/lib/platform/runtime.ts), [platform-runtime-bridge.tsx](file:///Users/mayankgautam/Desktop/stitch_kaamsetu_digital_identity_platform/src/components/pwa/platform-runtime-bridge.tsx) | **Verified** (`test:phase51` test 4.1 & 4.3 pass; manifest icons & shortcuts validated) | None for PWA installation over HTTPS |
| **Android App** | Capacitor shell (`in.kaamsetu.platform`) | [capacitor.config.ts](file:///Users/mayankgautam/Desktop/stitch_kaamsetu_digital_identity_platform/capacitor.config.ts), [AndroidManifest.xml](file:///Users/mayankgautam/Desktop/stitch_kaamsetu_digital_identity_platform/mobile/android/AndroidManifest.xml), [index.html](file:///Users/mayankgautam/Desktop/stitch_kaamsetu_digital_identity_platform/mobile/index.html) | **Config & Bridge Verified** (`test:phase51` test 4.2 & 4.3 pass) | **`gradle` and `adb` not installed** on this macOS host; `@capacitor/*` packages & Play Store keystore needed for `.apk`/`.aab` compile |
| **iOS App** | Capacitor shell (`in.kaamsetu.platform`) | [capacitor.config.ts](file:///Users/mayankgautam/Desktop/stitch_kaamsetu_digital_identity_platform/capacitor.config.ts), [Info.plist](file:///Users/mayankgautam/Desktop/stitch_kaamsetu_digital_identity_platform/mobile/ios/Info.plist), [index.html](file:///Users/mayankgautam/Desktop/stitch_kaamsetu_digital_identity_platform/mobile/index.html) | **Config & Permissions Verified** (`viewportFit: "cover"`, `safe-area-*`, mic/speech/location Info.plist keys) | **CocoaPods (`pod`) not installed** and Apple Developer Distribution Cert / Provisioning Profile absent (`xcodebuild` CLI present) |
| **macOS Desktop** | Electron context-isolated shell (`desktop/`) | [main.cjs](file:///Users/mayankgautam/Desktop/stitch_kaamsetu_digital_identity_platform/desktop/main.cjs), [preload.cjs](file:///Users/mayankgautam/Desktop/stitch_kaamsetu_digital_identity_platform/desktop/preload.cjs), [package.json](file:///Users/mayankgautam/Desktop/stitch_kaamsetu_digital_identity_platform/desktop/package.json) | **Syntax & Security Flags Verified** (`node --check` exit 0; `sandbox: true`, `contextIsolation: true`) | `desktop/node_modules` (`electron` / `electron-builder`) not installed and Apple Notarization credentials absent |
| **Windows Desktop** | Electron NSIS target (`desktop/package.json`) | [desktop/package.json](file:///Users/mayankgautam/Desktop/stitch_kaamsetu_digital_identity_platform/desktop/package.json) | **Config Validated** | Windows CI runner / NSIS toolchain & Authenticode cert required for `.exe` |
| **Linux Desktop** | Electron AppImage / Deb targets | [desktop/package.json](file:///Users/mayankgautam/Desktop/stitch_kaamsetu_digital_identity_platform/desktop/package.json) | **Config Validated** | Linux build runner required for `.AppImage` / `.deb` |

---

## 2. Host Toolchain Audit (Observed via `which`)
- **Present:** `node` (`v24.15.0`), `npm`, `npx`, `java`, `/usr/bin/xcodebuild`, `/Applications/Google Chrome.app`
- **Absent:** `gradle`, `adb`, `pod`, `rustc`, `cargo`, `rg`
