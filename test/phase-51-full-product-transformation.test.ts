/**
 * KAAMSETU — PHASE 51 FULL PRODUCT TRANSFORMATION TEST SUITE
 *
 * Verifies:
 * 1. Design System & Anti-AI Quality Governance (zero Sparkles, zero oversized radii, semantic CSS tokens, Indic typography)
 * 2. Navigation & Role Isolation (UserRole includes vendor, MobileBottomNav wired in layout.tsx, role-scoped header)
 * 3. Functional Remediation:
 *    - /api/worker/skills fail-closed authentication guard
 *    - /api/workers 39-language filter support
 *    - BookingRequestDialog & /api/bookings PIN & zero-commission invariants
 *    - Dashboard & Profile non-leakage of illustrative demo data
 * 4. Multiplatform Readiness (PWA manifest/icons/sw, Capacitor Android/iOS config & manifests, Electron desktop entrypoint)
 * 5. Permanent Constitutional & Geographic Rollout Invariants
 */

import { describe, test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { NextRequest } from "next/server";
import { POST as postWorkerSkill, DELETE as deleteWorkerSkill } from "../src/app/api/worker/skills/route";
import { GET as getWorkersApi } from "../src/app/api/workers/route";
import { POST as postBookingApi } from "../src/app/api/bookings/route";
import { SUPPORTED_LOCALES_METADATA } from "../src/lib/i18n/translations";
import { detectRuntimePlatform, getPlatformCapabilities } from "../src/lib/platform/runtime";
import { __setTestSession, __resetTestSession } from "../src/lib/auth/server";

const ROOT = process.cwd();

function readSrc(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

function collectTsFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectTsFiles(full));
    } else if (full.endsWith(".tsx") || full.endsWith(".ts")) {
      results.push(full);
    }
  }
  return results;
}

describe("PHASE 51: FULL PRODUCT TRANSFORMATION, UX REBUILD & CROSS-PLATFORM RELEASE", () => {
  describe("1. Design System & Anti-AI Governance", () => {
    test("1.1 Zero Sparkles icons across entire src/ codebase", () => {
      const files = collectTsFiles(path.join(ROOT, "src"));
      const offenders = files.filter((f) => fs.readFileSync(f, "utf8").includes("Sparkles"));
      assert.deepStrictEqual(offenders, [], "Sparkles icon must not be used anywhere in src/");
    });

    test("1.2 Zero over-rounded card radii (rounded-xl, rounded-2xl, rounded-3xl) in src/", () => {
      const files = collectTsFiles(path.join(ROOT, "src"));
      const offenders = files.filter((f) => {
        const text = fs.readFileSync(f, "utf8");
        return /\brounded-(xl|2xl|3xl)\b/.test(text);
      });
      assert.deepStrictEqual(offenders, [], "Cards and containers must use calibrated rounded-md/sm/xs");
    });

    test("1.3 globals.css defines semantic tokens, Indic script fonts, and prefers-reduced-motion", () => {
      const css = readSrc("src/app/globals.css");
      assert.ok(css.includes("Noto+Sans+Devanagari"), "Devanagari webfont must be loaded");
      assert.ok(css.includes("Noto+Sans+Bengali"), "Bengali/Assamese webfont must be loaded");
      assert.ok(css.includes("Noto+Sans+Tamil"), "Tamil webfont must be loaded");
      assert.ok(css.includes("Noto+Sans+Telugu"), "Telugu webfont must be loaded");
      assert.ok(css.includes("--primary-hover"), "Semantic --primary-hover token required");
      assert.ok(css.includes("--status-success"), "Semantic --status-success token required");
      assert.ok(css.includes("prefers-reduced-motion: reduce"), "Reduced motion media rule required");
    });

    test("1.4 SovereignCard uses truthful cryptographic verification phrasing (no blockchain claim)", () => {
      const card = readSrc("src/components/identity/sovereign-card.tsx");
      assert.ok(!card.includes("VERIFY ON-CHAIN"), "Must not make misleading blockchain claim");
      assert.ok(card.includes("CRYPTOGRAPHICALLY SIGNED"), "Must reflect actual signature verification");
    });
  });

  describe("2. Navigation, Role Scoping & Mobile Shell", () => {
    test("2.1 UserRole union includes 'vendor' alongside worker/contractor/customer/institution", () => {
      const authTypes = readSrc("src/types/auth.ts");
      assert.ok(authTypes.includes('"vendor"'), "UserRole must include vendor");
      assert.ok(authTypes.includes('"worker"'), "UserRole must include worker");
      assert.ok(authTypes.includes('"contractor"'), "UserRole must include contractor");
      assert.ok(authTypes.includes('"institution"'), "UserRole must include institution");
    });

    test("2.2 Root layout wires MobileBottomNav and safe bottom clearance", () => {
      const layout = readSrc("src/app/layout.tsx");
      assert.ok(layout.includes("MobileBottomNav"), "MobileBottomNav must be rendered in RootLayout");
      assert.ok(layout.includes("pb-20 md:pb-0"), "Main area must clear fixed mobile bottom nav");
      assert.ok(layout.includes('viewportFit: "cover"'), "Viewport must enable safe-area insets");
    });

    test("2.3 InstitutionalHeader scopes dashboards by authenticated role and uses 39-language label", () => {
      const header = readSrc("src/components/layout/institutional-header.tsx");
      assert.ok(header.includes("getDashboardForRole"), "Header must resolve dashboard strictly by user role");
      assert.ok(!header.includes("(18 Languages)"), "Stale 18-language label must not appear");
      assert.ok(header.includes("39 Languages"), "Mobile switcher must label full 39-language catalog");
    });
  });

  describe("3. Functional Remediation & Data Integrity", () => {
    test("3.1 /api/worker/skills fails closed (401) for unauthenticated requests", async () => {
      __setTestSession(null);
      try {
        const reqPost = new NextRequest("http://localhost:3000/api/worker/skills", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Solar Inverter Diagnostics", category: "Electrical", years_practiced: 3 }),
        });
        const resPost = await postWorkerSkill(reqPost);
        assert.strictEqual(resPost.status, 401, "Unauthenticated skill POST must return 401");

        const reqDel = new NextRequest("http://localhost:3000/api/worker/skills?id=sk-1", {
          method: "DELETE",
        });
        const resDel = await deleteWorkerSkill(reqDel);
        assert.strictEqual(resDel.status, 401, "Unauthenticated skill DELETE must return 401");
      } finally {
        __resetTestSession();
      }
    });

    test("3.2 Explore directory supports full 39-language metadata catalog and backend language filter", async () => {
      assert.strictEqual(SUPPORTED_LOCALES_METADATA.length, 39, "Catalog must provide all 39 Indian languages");
      const exploreSource = readSrc("src/app/explore/page.tsx");
      assert.ok(exploreSource.includes("SUPPORTED_LOCALES_METADATA.map"), "Explore language dropdown must render full 39-language catalog");
      assert.ok(!exploreSource.includes("⚡ Electrician"), "Raw emojis must not replace vector icons in Explore");

      const req = new NextRequest("http://localhost:3000/api/workers?language=Hindi");
      const res = await getWorkersApi(req);
      assert.strictEqual(res.status, 200);
      const json = await res.json();
      assert.strictEqual(json.success, true);
      assert.ok(Array.isArray(json.data), "Workers endpoint must return array");
    });

    test("3.3 BookingRequestDialog collects required 6-digit PIN code & defaults to Guwahati pilot zone", () => {
      const dialog = readSrc("src/components/profile/booking-request-dialog.tsx");
      assert.ok(dialog.includes("location_pincode"), "Booking dialog must submit location_pincode");
      assert.ok(dialog.includes("location_state"), "Booking dialog must submit location_state");
      assert.ok(dialog.includes('"Guwahati"'), "Default pilot city should be Guwahati, not Jaipur");
      assert.ok(dialog.includes("781001"), "Default pilot PIN should match Guwahati Urban");
    });

    test("3.4 Dashboard loader maps real worker_skills and never leaks demo portfolio to authenticated users", () => {
      const dashboardLoader = readSrc("src/lib/supabase/db/dashboard.ts");
      assert.ok(dashboardLoader.includes("worker_skills(*, skill:skills(*))"), "Dashboard query must load worker_skills");
      assert.ok(dashboardLoader.includes("PENDING-ONBOARDING"), "Authenticated user without onboarding must not inherit Rameshwar demo profile");
      assert.ok(!dashboardLoader.includes(": defaultDashboardData.portfolio"), "Authenticated user with 0 portfolio items must see empty portfolio, not demo photos");
    });
  });

  describe("4. Multiplatform Packaging & Runtime Bridge", () => {
    test("4.1 PWA manifest, icon, and service worker files are complete", () => {
      const manifest = JSON.parse(readSrc("public/manifest.json"));
      assert.strictEqual(manifest.theme_color, "#153E35");
      assert.strictEqual(manifest.background_color, "#F7F5F0");
      assert.ok(manifest.icons.some((i: { src: string }) => i.src === "/icons/icon-512.svg"));
      assert.ok(fs.existsSync(path.join(ROOT, "public/icons/icon-512.svg")));
      assert.ok(fs.existsSync(path.join(ROOT, "public/sw.js")));
    });

    test("4.2 Mobile Capacitor & Desktop Electron configurations exist with strict security defaults", () => {
      const cap = readSrc("capacitor.config.ts");
      assert.ok(cap.includes("in.kaamsetu.platform"));
      const androidManifest = readSrc("mobile/android/AndroidManifest.xml");
      assert.ok(androidManifest.includes("android.permission.RECORD_AUDIO"));
      const iosPlist = readSrc("mobile/ios/Info.plist");
      assert.ok(iosPlist.includes("NSMicrophoneUsageDescription"));

      const desktopMain = readSrc("desktop/main.cjs");
      assert.ok(desktopMain.includes("contextIsolation: true"));
      assert.ok(desktopMain.includes("nodeIntegration: false"));
      assert.ok(desktopMain.includes("sandbox: true"));
    });

    test("4.3 Shared platform runtime bridge resolves cleanly in Node/SSR environment", () => {
      assert.strictEqual(detectRuntimePlatform(), "web");
      const caps = getPlatformCapabilities();
      assert.strictEqual(caps.platform, "web");
      assert.strictEqual(caps.isNativeMobile, false);
    });
  });

  describe("5. Constitutional & Rollout Boundary Invariants", () => {
    test("5.1 Bookings API rejects non-zero platform_commission_amount and out-of-region dispatch", async () => {
      __setTestSession({
        id: "33333333-3333-3333-3333-333333330099",
        phone: "9864012345",
        fullName: "Test Customer",
        role: "customer",
        isDemo: false,
      });

      try {
        const badCommissionReq = new NextRequest("http://localhost:3000/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            worker_profile_id: "w-1",
            service_title: "Electrical Wiring",
            location_address: "House 10, GS Road",
            location_city: "Guwahati",
            location_pincode: "781001",
            scheduled_start: new Date().toISOString(),
            platform_commission_amount: 50,
          }),
        });
        const commRes = await postBookingApi(badCommissionReq);
        assert.strictEqual(commRes.status, 400, "Non-zero commission must be rejected with 400");

        const outsidePilotReq = new NextRequest("http://localhost:3000/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            worker_profile_id: "w-1",
            service_title: "Electrical Wiring",
            location_address: "Connaught Place",
            location_city: "New Delhi",
            location_state: "Delhi",
            location_pincode: "110001",
            scheduled_start: new Date().toISOString(),
            platform_commission_amount: 0,
          }),
        });
        const geoRes = await postBookingApi(outsidePilotReq);
        assert.strictEqual(geoRes.status, 403, "Booking outside Guwahati/Shillong must fail closed with 403");
      } finally {
        __resetTestSession();
      }
    });
  });
});
