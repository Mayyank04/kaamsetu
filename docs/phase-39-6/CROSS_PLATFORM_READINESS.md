# KAAMSETU — PHASE 39.6 CROSS-PLATFORM READINESS & RESPONSIVE ARCHITECTURE

**Document ID:** `KAAMSETU-39-6-CROSS-PLATFORM`  
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Status:** `VERIFIED_LOCALLY`

---

## 1. Viewport & Device Support

The web application is engineered and verified across all target viewports:

- **Desktop & Large Displays:** 1440×900, 1280×800.
- **Tablets:** 768×1024 (iPad Air, Android tablets).
- **Mobile Handsets:** 390×844 (iPhone 14/15/16), 360×800 (Android modern), 320×568 (compact).

---

## 2. Hardened Responsive Controls

1. **Avatar Portrait Constraints:**
   - In [src/components/identity/professional-card.tsx](file:///Users/mayankgautam/Desktop/stitch_kaamsetu_digital_identity_platform/src/components/identity/professional-card.tsx): Enforced explicit `width={72} height={72}` with fixed square boundaries (`w-[72px] h-[72px] min-w-[72px] min-h-[72px] max-w-[72px] max-h-[72px]`), preventing image expansion across viewport.
   - In [src/components/identity/credential-dialog.tsx](file:///Users/mayankgautam/Desktop/stitch_kaamsetu_digital_identity_platform/src/components/identity/credential-dialog.tsx): Enforced explicit `width={96} height={96}` fixed container.
2. **Modal Viewport Clamping:**
   - Onboarding modal enforces `max-h-[calc(100vh-2rem)] overflow-y-auto` to guarantee the consent checkbox and action buttons remain reachable on mobile viewports without clipping.
3. **Touch Targets:**
   - Minimum interactive dimensions $\ge 44\text{px} \times 44\text{px}$ across all buttons, inputs, and close triggers.
4. **Browser Compatibility:**
   - Chrome, Safari (WebKit), Firefox, and Edge verified without browser-specific CSS anomalies.

---

## 3. PWA & Native Architecture Assessment

- **PWA Status:** Installable web manifest and service worker caching configured for static assets only. Sensitive authenticated API endpoints (`/api/auth/*`, `/api/worker/*`) are explicitly excluded from service worker caching.
- **Native Client Roadmap:** Currently operating as a responsive Progressive Web Application. No native Android (`.apk`/`.aab`) or iOS (`.ipa`) binaries exist in this repository. A unified REST API contract (`/api/v1/interop/*`, `/api/auth/*`) is maintained to power future native client builds without architectural rewrites.
