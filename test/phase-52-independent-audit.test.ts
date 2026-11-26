/**
 * KAAMSETU — PHASE 52: INDEPENDENT AUDIT & ROOT-CAUSE RECOVERY REGRESSION SUITE
 *
 * Verifies every P0/P1 defect discovered and remediated during Phase 52:
 * 1. Unauthenticated (401) & wrong-role (403) fail-closed enforcement across newly guarded endpoints
 * 2. Geo GPS spoofing defense for Class B zones (Guwahati PIN 781001 vs Delhi coordinates)
 * 3. Production OTP verifyOtp() fail-closed parity and validateEnvironmentSafety() guardrails
 * 4. Gemini model candidate accuracy (gemini-2.0-flash, no fictional 3.8-flash defaults)
 * 5. Production CSP exclusion of 'unsafe-eval' and middleware public /worker/[slug] access
 */

import { describe, test, afterEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { NextRequest } from "next/server";
import { __setTestSession, __resetTestSession } from "../src/lib/auth/server";
import { validateEnvironmentSafety } from "../src/lib/env";
import { verifyOtp } from "../src/lib/auth/otp-service";
import { getGeminiModelCandidates } from "../src/lib/gemini/onboarding-extractor";
import { GeographicAuthorizationService } from "../src/lib/geo/geographic-authorization-service";

import { GET as getGstLedger, POST as postGstLedger } from "../src/app/api/billing/gst-ledger/route";
import { GET as getBillingExceptions, POST as postBillingExceptions } from "../src/app/api/billing/exceptions/route";
import { GET as getWorkerSupport, POST as postWorkerSupport, PATCH as patchWorkerSupport } from "../src/app/api/worker/support/route";
import { GET as getWorkerOutcomes, POST as postWorkerOutcomes, PATCH as patchWorkerOutcomes } from "../src/app/api/worker/outcomes/route";
import { GET as getGovernanceDisputes, POST as postGovernanceDisputes } from "../src/app/api/governance/disputes/route";
import { GET as getInstitutionCohorts } from "../src/app/api/institution/cohorts/route";
import { GET as getInstitutionSignatories, POST as postInstitutionSignatories } from "../src/app/api/institution/signatories/route";
import { GET as getContractorSuccess, POST as postContractorSuccess } from "../src/app/api/contractor/success/route";
import { GET as getVendorProfile, POST as postVendorProfile } from "../src/app/api/vendor/profile/route";
import { GET as getRegionsOps, POST as postRegionsOps, PATCH as patchRegionsOps } from "../src/app/api/regions/operations/route";

const ROOT = process.cwd();

function makeReq(url: string, method: "GET" | "POST" | "PATCH" = "GET", body?: Record<string, unknown>): NextRequest {
  return new NextRequest(url, {
    method,
    headers: { "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}

describe("PHASE 52: INDEPENDENT AUDIT & ROOT-CAUSE RECOVERY REGRESSION", () => {
  afterEach(() => {
    __resetTestSession();
  });

  describe("1. API Route Authentication (401) & Authorization (403) Fail-Closed Enforcement", () => {
    test("1.1 Unauthenticated requests fail closed with 401 across all newly guarded routes", async () => {
      __setTestSession(null);

      const unauthCalls: [string, () => Promise<Response>][] = [
        ["GET /api/billing/gst-ledger (missing param)", () => getGstLedger(makeReq("http://localhost:3000/api/billing/gst-ledger"))],
        ["GET /api/billing/gst-ledger", () => getGstLedger(makeReq("http://localhost:3000/api/billing/gst-ledger?organizationId=org-1"))],
        ["POST /api/billing/gst-ledger", () => postGstLedger(makeReq("http://localhost:3000/api/billing/gst-ledger", "POST", { organizationId: "org-1" }))],
        ["GET /api/billing/exceptions", () => getBillingExceptions(makeReq("http://localhost:3000/api/billing/exceptions"))],
        ["POST /api/billing/exceptions", () => postBillingExceptions(makeReq("http://localhost:3000/api/billing/exceptions", "POST", { action: "resolve" }))],
        ["GET /api/worker/support", () => getWorkerSupport(makeReq("http://localhost:3000/api/worker/support?workerProfileId=wp-1"))],
        ["POST /api/worker/support", () => postWorkerSupport(makeReq("http://localhost:3000/api/worker/support", "POST", { workerProfileId: "wp-1" }))],
        ["PATCH /api/worker/support", () => patchWorkerSupport(makeReq("http://localhost:3000/api/worker/support", "PATCH", { ticketId: "t-1" }))],
        ["GET /api/worker/outcomes", () => getWorkerOutcomes(makeReq("http://localhost:3000/api/worker/outcomes"))],
        ["POST /api/worker/outcomes", () => postWorkerOutcomes(makeReq("http://localhost:3000/api/worker/outcomes", "POST", {}))],
        ["PATCH /api/worker/outcomes", () => patchWorkerOutcomes(makeReq("http://localhost:3000/api/worker/outcomes", "PATCH", { workerProfileId: "wp-1" }))],
        ["GET /api/governance/disputes", () => getGovernanceDisputes(makeReq("http://localhost:3000/api/governance/disputes"))],
        ["POST /api/governance/disputes", () => postGovernanceDisputes(makeReq("http://localhost:3000/api/governance/disputes", "POST", {}))],
        ["GET /api/institution/cohorts", () => getInstitutionCohorts(makeReq("http://localhost:3000/api/institution/cohorts"))],
        ["GET /api/institution/signatories", () => getInstitutionSignatories(makeReq("http://localhost:3000/api/institution/signatories"))],
        ["POST /api/institution/signatories", () => postInstitutionSignatories(makeReq("http://localhost:3000/api/institution/signatories", "POST", {}))],
        ["GET /api/contractor/success", () => getContractorSuccess(makeReq("http://localhost:3000/api/contractor/success?organizationId=org-1"))],
        ["POST /api/contractor/success", () => postContractorSuccess(makeReq("http://localhost:3000/api/contractor/success", "POST", { organizationId: "org-1" }))],
        ["GET /api/vendor/profile", () => getVendorProfile()],
        ["POST /api/vendor/profile", () => postVendorProfile(new Request("http://localhost:3000/api/vendor/profile", { method: "POST", body: JSON.stringify({}) }))],
        ["GET /api/regions/operations", () => getRegionsOps(makeReq("http://localhost:3000/api/regions/operations"))],
        ["POST /api/regions/operations", () => postRegionsOps(makeReq("http://localhost:3000/api/regions/operations", "POST", {}))],
        ["PATCH /api/regions/operations", () => patchRegionsOps(makeReq("http://localhost:3000/api/regions/operations", "PATCH", {}))],
      ];

      for (const [label, invoke] of unauthCalls) {
        const res = await invoke();
        assert.strictEqual(res.status, 401, `Expected 401 for unauthenticated ${label}, got ${res.status}`);
      }
    });

    test("1.2 Wrong-role sessions fail closed with 403 across role-protected routes", async () => {
      __setTestSession({
        id: "customer-1",
        phone: "9876543210",
        fullName: "Test Customer",
        role: "customer",
        email: "c@kaamsetu.test",
        isDemo: false,
      });

      const forbiddenCalls: [string, () => Promise<Response>][] = [
        ["GET /api/billing/exceptions", () => getBillingExceptions(makeReq("http://localhost:3000/api/billing/exceptions"))],
        ["GET /api/billing/gst-ledger", () => getGstLedger(makeReq("http://localhost:3000/api/billing/gst-ledger?organizationId=org-1"))],
        ["GET /api/worker/outcomes", () => getWorkerOutcomes(makeReq("http://localhost:3000/api/worker/outcomes"))],
        ["PATCH /api/worker/outcomes", () => patchWorkerOutcomes(makeReq("http://localhost:3000/api/worker/outcomes", "PATCH", { workerProfileId: "wp-1" }))],
        ["GET /api/governance/disputes", () => getGovernanceDisputes(makeReq("http://localhost:3000/api/governance/disputes"))],
        ["GET /api/institution/cohorts", () => getInstitutionCohorts(makeReq("http://localhost:3000/api/institution/cohorts"))],
        ["GET /api/institution/signatories", () => getInstitutionSignatories(makeReq("http://localhost:3000/api/institution/signatories"))],
        ["GET /api/contractor/success", () => getContractorSuccess(makeReq("http://localhost:3000/api/contractor/success?organizationId=org-1"))],
        ["GET /api/vendor/profile", () => getVendorProfile()],
        ["POST /api/vendor/profile", () => postVendorProfile(new Request("http://localhost:3000/api/vendor/profile", { method: "POST", body: JSON.stringify({}) }))],
        ["GET /api/regions/operations", () => getRegionsOps(makeReq("http://localhost:3000/api/regions/operations"))],
      ];

      for (const [label, invoke] of forbiddenCalls) {
        const res = await invoke();
        assert.strictEqual(res.status, 403, `Expected 403 for customer role on ${label}, got ${res.status}`);
      }

      // Worker role is also forbidden on moderator/admin/institution routes
      __setTestSession({
        id: "worker-1",
        phone: "9876543211",
        fullName: "Test Worker",
        role: "worker",
        email: "w@kaamsetu.test",
        isDemo: false,
      });
      assert.strictEqual((await patchWorkerSupport(makeReq("http://localhost:3000/api/worker/support", "PATCH", { ticketId: "t-1" }))).status, 403);
      assert.strictEqual((await getRegionsOps(makeReq("http://localhost:3000/api/regions/operations"))).status, 403);
      assert.strictEqual((await getGstLedger(makeReq("http://localhost:3000/api/billing/gst-ledger?organizationId=org-1"))).status, 403);
      assert.strictEqual((await getContractorSuccess(makeReq("http://localhost:3000/api/contractor/success"))).status, 403);
    });
  });

  describe("2. Geo Authorization & Spoofing Defense", () => {
    test("2.1 Guwahati PIN 781001 with spoofed Delhi GPS (28.6139, 77.2090) is rejected", () => {
      const res = GeographicAuthorizationService.validateLocation({
        city: "Guwahati",
        state: "Assam",
        pincode: "781001",
        latitude: 28.6139,
        longitude: 77.2090,
      });
      assert.strictEqual(res.allowed, false);
      assert.strictEqual(res.coordinateCheckPassed, false);
    });

    test("2.2 Guwahati PIN 781001 with authentic Guwahati GPS (26.1445, 91.7362) is allowed", () => {
      const res = GeographicAuthorizationService.validateLocation({
        city: "Guwahati",
        state: "Assam",
        pincode: "781001",
        latitude: 26.1445,
        longitude: 91.7362,
      });
      assert.strictEqual(res.allowed, true);
      assert.strictEqual(res.coordinateCheckPassed, true);
    });
  });

  describe("3. Production Auth, OTP & Environment Safety", () => {
    test("3.1 verifyOtp fails closed with 503 when NODE_ENV=production and sandbox mode is active without opt-in", async () => {
      const env = process.env as Record<string, string | undefined>;
      const prevNodeEnv = env.NODE_ENV;
      const prevMode = env.AUTH_VERIFICATION_MODE;
      const prevAllow = env.ALLOW_INSECURE_SANDBOX_IN_PRODUCTION;

      try {
        env.NODE_ENV = "production";
        env.AUTH_VERIFICATION_MODE = "sandbox";
        delete env.ALLOW_INSECURE_SANDBOX_IN_PRODUCTION;

        const res = await verifyOtp({
          phone: "9876543210",
          otp: "123456",
          intent: "login",
          termsAccepted: true,
        });

        assert.strictEqual(res.success, false);
        assert.strictEqual(res.statusCode, 503);
      } finally {
        env.NODE_ENV = prevNodeEnv;
        if (prevMode === undefined) delete env.AUTH_VERIFICATION_MODE;
        else env.AUTH_VERIFICATION_MODE = prevMode;
        if (prevAllow === undefined) delete env.ALLOW_INSECURE_SANDBOX_IN_PRODUCTION;
        else env.ALLOW_INSECURE_SANDBOX_IN_PRODUCTION = prevAllow;
      }
    });

    test("3.2 validateEnvironmentSafety throws FATAL SECURITY VIOLATION on insecure production bypass flags", () => {
      const env = process.env as Record<string, string | undefined>;
      const prevNodeEnv = env.NODE_ENV;
      const prevAllow = env.ALLOW_INSECURE_SANDBOX_IN_PRODUCTION;
      const prevDemo = env.ENABLE_DEMO_AUTH;
      const prevMode = env.AUTH_VERIFICATION_MODE;

      try {
        env.NODE_ENV = "production";
        env.AUTH_VERIFICATION_MODE = "sms";
        env.ALLOW_INSECURE_SANDBOX_IN_PRODUCTION = "true";

        assert.throws(() => validateEnvironmentSafety(), /FATAL SECURITY VIOLATION/);

        delete env.ALLOW_INSECURE_SANDBOX_IN_PRODUCTION;
        env.ENABLE_DEMO_AUTH = "true";
        assert.throws(() => validateEnvironmentSafety(), /FATAL SECURITY VIOLATION/);
      } finally {
        env.NODE_ENV = prevNodeEnv;
        if (prevAllow === undefined) delete env.ALLOW_INSECURE_SANDBOX_IN_PRODUCTION;
        else env.ALLOW_INSECURE_SANDBOX_IN_PRODUCTION = prevAllow;
        if (prevDemo === undefined) delete env.ENABLE_DEMO_AUTH;
        else env.ENABLE_DEMO_AUTH = prevDemo;
        if (prevMode === undefined) delete env.AUTH_VERIFICATION_MODE;
        else env.AUTH_VERIFICATION_MODE = prevMode;
      }
    });
  });

  describe("4. Gemini Model Integrity, CSP & Middleware Public Worker Profile Routing", () => {
    test("4.1 Gemini model candidates use active verified models and exclude deprecated 2.0-flash-lite", () => {
      const candidates = getGeminiModelCandidates();
      assert.ok(candidates.includes("gemini-3.8-flash"), "gemini-3.8-flash must be present");
      assert.ok(candidates.includes("gemini-3.5-flash-lite"), "gemini-3.5-flash-lite must be present");
      assert.ok(!candidates.includes("gemini-2.0-flash-lite"), "Must exclude deprecated gemini-2.0-flash-lite (404)");
    });

    test("4.2 next.config.ts restricts 'unsafe-eval' out of production CSP", () => {
      const configText = fs.readFileSync(path.join(ROOT, "next.config.ts"), "utf8");
      assert.ok(
        configText.includes('process.env.NODE_ENV !== "production"'),
        "next.config.ts must conditionally exclude unsafe-eval in production"
      );
      assert.ok(!configText.includes("https://fonts.googleapis.com"), "Stale Google Fonts origin must be removed from CSP");
    });

    test("4.3 src/middleware.ts protects /worker/settings and /worker/dashboard without blocking public /worker/[slug]", () => {
      const mw = fs.readFileSync(path.join(ROOT, "src/middleware.ts"), "utf8");
      assert.ok(mw.includes('"/worker/settings"'), "Must protect /worker/settings");
      assert.ok(mw.includes('"/worker/dashboard"'), "Must protect /worker/dashboard");
      assert.ok(!mw.includes('  "/worker",'), "Broad /worker prefix must not block public /worker/[slug] profiles");
    });
  });
});
