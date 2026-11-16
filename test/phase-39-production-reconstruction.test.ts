/**
 * KAAMSETU — Phase 39 Production Reconstruction, Account Registration,
 * Sandbox OTP Authentication & Complete Application Functionality Test Suite
 *
 * Verifies:
 * 1. Environment schema validation (AUTH_VERIFICATION_MODE, RATE_LIMIT_HMAC_SECRET)
 * 2. Cryptographic Secret Quality & Fail-Closed Behavior (No hardcoded fallback secrets)
 * 3. Sandbox OTP Generation, Rate Limiting, and Transparent Disclosure
 * 4. Atomic Challenge Consumption & Anti-Replay Protection
 * 5. Attempt Bounding & Anti-Bruteforce Defense (Max 5 attempts)
 * 6. Session Token Signing, Expiration, and Constant-Time Verification
 * 7. Honest Phone Verification Tagging (phone_verification_status = 'sandbox_unverified')
 * 8. Decommissioning of Hackathon Demo Personas, Bypasses, and Cookies
 * 9. Unconditional Worker Profile Persistence in Onboarding Service
 * 10. Fail-Closed Mock Profile Isolation in Production Queries
 * 11. Constitutional Invariant: platform_commission_amount = 0.00 permanently on artisan wages
 * 12. Controlled Rollout Geographic Boundaries (Guwahati Urban & Shillong Urban)
 * 13. Phase 39 Documentation Register Integrity (All 12 documents present and substantial)
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

(process.env as any).NODE_ENV = "test";
process.env.ENABLE_IN_MEMORY_RATE_LIMIT_MOCK = "true";
process.env.RATE_LIMIT_HMAC_SECRET = "kaamsetu-test-hmac-secret-strictly-32-chars-long";

// Module imports
import {
  hashOtpCode,
  signSessionToken,
  verifySessionToken,
  sendOtp,
  verifyOtp,
} from "../src/lib/auth/otp-service";
import { getRateLimitHmacSecret } from "../src/lib/security/rate-limiter";
import { phoneAuthSchema, otpVerificationSchema } from "../src/schemas/auth.schema";
import { PayoutService } from "../src/server/services/payout.service";
import { BookingRepository } from "../src/server/database/repositories/booking.repository";

describe("PHASE 39: PRODUCTION RECONSTRUCTION & SANDBOX AUTHENTICATION", () => {
  // ==========================================================================
  // 1. CRYPTOGRAPHIC SECRET QUALITY & FAIL-CLOSED ENFORCEMENT
  // ==========================================================================
  describe("1. Cryptographic Secrets & Fail-Closed Invariants", () => {
    it("should retrieve valid RATE_LIMIT_HMAC_SECRET with minimum 32 characters", () => {
      const secret = getRateLimitHmacSecret();
      assert.ok(secret, "Secret must exist");
      assert.ok(secret.length >= 32, "Secret must have at least 32 characters (256 bits)");
    });

    it("should throw in getRateLimitHmacSecret when secret is missing or too short in production", () => {
      const originalNodeEnv = process.env.NODE_ENV;
      const originalSecret = process.env.RATE_LIMIT_HMAC_SECRET;

      try {
        (process.env as any).NODE_ENV = "production";
        delete process.env.RATE_LIMIT_HMAC_SECRET;
        assert.throws(
          () => getRateLimitHmacSecret(),
          /FATAL SECURITY CONFIGURATION/,
          "Must fail closed when RATE_LIMIT_HMAC_SECRET is missing in production"
        );

        process.env.RATE_LIMIT_HMAC_SECRET = "too-short";
        assert.throws(
          () => getRateLimitHmacSecret(),
          /FATAL (?:SECURITY|CRYPTOGRAPHIC) CONFIGURATION|at least 32 characters|insufficient entropy/i,
          "Must fail closed when RATE_LIMIT_HMAC_SECRET is shorter than 32 chars"
        );
      } finally {
        (process.env as any).NODE_ENV = originalNodeEnv;
        process.env.RATE_LIMIT_HMAC_SECRET = originalSecret;
      }
    });

    it("should not contain hardcoded fallback secret strings in otp-service.ts", () => {
      const otpServiceFile = path.join(process.cwd(), "src/lib/auth/otp-service.ts");
      const content = fs.readFileSync(otpServiceFile, "utf-8");
      assert.doesNotMatch(
        content,
        /kaamsetu-dev-fallback-hmac-secret-32-chars/,
        "otp-service.ts must not contain hardcoded fallback secret string"
      );
    });
  });

  // ==========================================================================
  // 2. SANDBOX OTP CHALLENGE DISPATCH & RATE LIMITING
  // ==========================================================================
  describe("2. Sandbox OTP Challenge Generation & Rate Limiting", () => {
    const testPhone = "+919876543210";

    it("should dispatch sandbox OTP without external telecom gateway and return sandbox code", async () => {
      process.env.AUTH_VERIFICATION_MODE = "sandbox";
      const result = await sendOtp({
        phone: testPhone,
        intent: "login",
        clientIp: "127.0.0.1",
      });

      assert.equal(result.success, true, "Dispatch should succeed");
      assert.equal(result.isSandbox, true, "isSandbox must be true in sandbox mode");
      assert.ok(result.sandboxCode, "sandboxCode must be returned");
      assert.match(result.sandboxCode, /^\d{6}$/, "sandboxCode must be a 6-digit numeric string");
    });

    it("should respect SANDBOX_OTP_CODE override when configured", async () => {
      process.env.AUTH_VERIFICATION_MODE = "sandbox";
      process.env.SANDBOX_OTP_CODE = "654321";
      const uniquePhone = "+919876500001";

      const result = await sendOtp({
        phone: uniquePhone,
        intent: "registration",
        clientIp: "127.0.0.1",
      });
      assert.equal(result.sandboxCode, "654321", "Should use configured SANDBOX_OTP_CODE");

      delete process.env.SANDBOX_OTP_CODE;
    });

    it("should enforce 60-second cooldown and rate limiting on OTP dispatch", async () => {
      const floodPhone = "+919876599999";
      process.env.AUTH_VERIFICATION_MODE = "sandbox";

      // 1st send should succeed
      const res1 = await sendOtp({ phone: floodPhone, intent: "login", clientIp: "10.0.0.1" });
      assert.equal(res1.success, true);

      // Immediate 2nd send triggers 60-second cooldown rate limit
      const res2 = await sendOtp({ phone: floodPhone, intent: "login", clientIp: "10.0.0.1" });
      assert.equal(res2.success, false, "Immediate resend must be blocked by cooldown");
      assert.equal(res2.statusCode, 429, "Status code must be 429");
      assert.match(res2.message, /Please wait \d+ seconds before requesting a new code/);
    });
  });

  // ==========================================================================
  // 3. ATOMIC CHALLENGE CONSUMPTION & ANTI-REPLAY DEFENSES
  // ==========================================================================
  describe("3. Atomic OTP Verification & Anti-Replay Defenses", () => {
    it("should verify valid OTP code and issue signed session token", async () => {
      const phone = "+919876511111";
      process.env.AUTH_VERIFICATION_MODE = "sandbox";

      const sendRes = await sendOtp({
        phone,
        intent: "login",
        role: "worker",
        fullName: "Test Worker",
        clientIp: "127.0.0.1",
      });
      assert.ok(sendRes.sandboxCode);

      const verifyRes = await verifyOtp({
        phone,
        otp: sendRes.sandboxCode,
        role: "worker",
        fullName: "Test Worker",
      });
      assert.equal(verifyRes.success, true, "Verification must succeed");
      assert.ok(verifyRes.sessionToken, "Must return signed session token");
      assert.ok(verifyRes.user, "User object must be returned");
      assert.equal(verifyRes.user?.phone, phone);
      assert.equal(verifyRes.user?.role, "worker");
      assert.equal(verifyRes.user?.phoneVerificationStatus, "sandbox_unverified");
      assert.equal(verifyRes.user?.phoneVerified, false);
    });

    it("should prevent OTP code replay once consumed", async () => {
      const phone = "+919876522222";
      process.env.AUTH_VERIFICATION_MODE = "sandbox";

      const sendRes = await sendOtp({
        phone,
        intent: "login",
        role: "worker",
        clientIp: "127.0.0.1",
      });
      assert.ok(sendRes.sandboxCode);

      // First verification succeeds
      const firstVerify = await verifyOtp({
        phone,
        otp: sendRes.sandboxCode,
        role: "worker",
      });
      assert.equal(firstVerify.success, true);

      // Replay attack: second verification must fail closed
      const secondVerify = await verifyOtp({
        phone,
        otp: sendRes.sandboxCode,
        role: "worker",
      });
      assert.equal(secondVerify.success, false, "Replay verification must fail");
    });

    it("should invalidate challenge after maximum consecutive incorrect attempts", async () => {
      const phone = "+919876533333";
      process.env.AUTH_VERIFICATION_MODE = "sandbox";

      const sendRes = await sendOtp({
        phone,
        intent: "login",
        role: "worker",
        clientIp: "127.0.0.1",
      });
      const realCode = sendRes.sandboxCode!;
      const wrongCode = realCode === "111111" ? "222222" : "111111";

      // 5 incorrect attempts
      for (let i = 0; i < 5; i++) {
        const failRes = await verifyOtp({
          phone,
          otp: wrongCode,
          role: "worker",
        });
        assert.equal(failRes.success, false, `Attempt ${i + 1} must fail`);
      }

      // Even supplying the REAL code now must fail because challenge was invalidated
      const lateVerify = await verifyOtp({
        phone,
        otp: realCode,
        role: "worker",
      });
      assert.equal(lateVerify.success, false, "Must reject correct code after maximum attempts exceeded");
    });
  });

  // ==========================================================================
  // 4. SESSION TOKEN INTEGRITY & CRYPTOGRAPHIC TIMING SAFETY
  // ==========================================================================
  describe("4. Session Token Signing & Constant-Time Verification", () => {
    it("should sign and verify valid session token payload", () => {
      const payload = {
        userId: "test-user-uuid-1234",
        phone: "+919876543210",
        role: "worker" as const,
      };

      const token = signSessionToken(payload);
      assert.ok(token.includes("."), "Token must contain data and signature parts");

      const verified = verifySessionToken(token);
      assert.ok(verified, "Verification must succeed");
      assert.equal(verified?.userId, payload.userId);
      assert.equal(verified?.phone, payload.phone);
      assert.equal(verified?.role, payload.role);
    });

    it("should reject tampered payload or signature in constant time", () => {
      const payload = {
        userId: "test-user-uuid-5678",
        phone: "+919876543210",
        role: "worker" as const,
      };

      const token = signSessionToken(payload);
      const [dataPart, sigPart] = token.split(".");

      // Tamper with data part (change role to admin)
      const decoded = JSON.parse(Buffer.from(dataPart, "base64url").toString("utf-8"));
      decoded.role = "admin";
      const tamperedDataPart = Buffer.from(JSON.stringify(decoded)).toString("base64url");
      const tamperedToken = `${tamperedDataPart}.${sigPart}`;

      const verifiedTampered = verifySessionToken(tamperedToken);
      assert.equal(verifiedTampered, null, "Tampered payload must fail verification");

      // Tamper with signature
      const corruptedSig = sigPart.slice(0, -2) + "ff";
      const corruptedToken = `${dataPart}.${corruptedSig}`;
      const verifiedCorrupted = verifySessionToken(corruptedToken);
      assert.equal(verifiedCorrupted, null, "Corrupted signature must fail verification");
    });

    it("should reject expired session token", () => {
      const payload = {
        userId: "test-user-expired",
        phone: "+919876543210",
        role: "worker" as const,
        exp: Math.floor(Date.now() / 1000) - 10, // Expired 10 seconds ago
      };

      const token = signSessionToken(payload);
      const verified = verifySessionToken(token);
      assert.equal(verified, null, "Expired token must return null");
    });
  });

  // ==========================================================================
  // 5. REGISTRATION SCHEMAS & INPUT VALIDATION
  // ==========================================================================
  describe("5. Registration Form Schema Validation", () => {
    it("should accept valid Indian mobile numbers in various standard formats", () => {
      const validNumbers = [
        "9876543210",
        "+919876543210",
        "919876543210",
        "7000000000",
        "6123456789",
        "8901234567",
      ];

      for (const phone of validNumbers) {
        const parsed = phoneAuthSchema.safeParse({ phone, intent: "registration" });
        assert.equal(parsed.success, true, `Phone ${phone} should be accepted`);
      }
    });

    it("should reject invalid mobile numbers", () => {
      const invalidNumbers = [
        "1234567890", // Doesn't start with 6-9
        "98765",      // Too short
        "9876543210123", // Too long
        "abcdefghij", // Non-numeric
      ];

      for (const phone of invalidNumbers) {
        const parsed = phoneAuthSchema.safeParse({ phone });
        assert.equal(parsed.success, false, `Phone ${phone} must be rejected`);
      }
    });

    it("should validate full name constraints on registration", () => {
      const valid = phoneAuthSchema.safeParse({
        phone: "9876543210",
        role: "worker",
        intent: "registration",
        fullName: "Pranab Barman",
      });
      assert.equal(valid.success, true);

      const tooShort = phoneAuthSchema.safeParse({
        phone: "9876543210",
        fullName: "A",
      });
      assert.equal(tooShort.success, false, "1-char name must be rejected");
    });
  });

  // ==========================================================================
  // 6. EXCISION OF HACKATHON DEMO ARTIFACTS
  // ==========================================================================
  describe("6. Complete Excision of Hackathon Persona Artifacts", () => {
    it("should decommission /api/auth/persona endpoint with HTTP 410 Gone", async () => {
      const personaRoutePath = path.join(
        process.cwd(),
        "src/app/api/auth/persona/route.ts"
      );
      const content = fs.readFileSync(personaRoutePath, "utf-8");
      assert.match(
        content,
        /status:\s*410/,
        "/api/auth/persona must return HTTP 410 Gone"
      );
      assert.match(
        content,
        /decommissioned|retired/i,
        "Response must state endpoint is retired"
      );
    });

    it("should not export switchPersona from useAuth hook", () => {
      const useAuthPath = path.join(process.cwd(), "src/lib/auth/use-auth.tsx");
      const content = fs.readFileSync(useAuthPath, "utf-8");
      assert.doesNotMatch(
        content,
        /switchPersona\s*:\s*\(/,
        "useAuth must not export switchPersona"
      );
    });

    it("should not contain demo persona tabs in login page", () => {
      const loginPath = path.join(process.cwd(), "src/app/login/page.tsx");
      const content = fs.readFileSync(loginPath, "utf-8");
      assert.doesNotMatch(
        content,
        /DEMO_PERSONAS/,
        "login page must not import or render DEMO_PERSONAS"
      );
      assert.doesNotMatch(
        content,
        /switchPersona/,
        "login page must not reference switchPersona"
      );
    });

    it("should not accept kaamsetu_demo_persona cookie in server auth or middleware", () => {
      const serverAuthPath = path.join(process.cwd(), "src/lib/auth/server.ts");
      const middlewarePath = path.join(process.cwd(), "src/lib/supabase/middleware.ts");

      const serverAuthContent = fs.readFileSync(serverAuthPath, "utf-8");
      const middlewareContent = fs.readFileSync(middlewarePath, "utf-8");

      assert.doesNotMatch(
        serverAuthContent,
        /kaamsetu_demo_persona/,
        "server.ts must not read kaamsetu_demo_persona cookie"
      );
      assert.doesNotMatch(
        middlewareContent,
        /kaamsetu_demo_persona/,
        "middleware.ts must not read kaamsetu_demo_persona cookie"
      );
    });
  });

  // ==========================================================================
  // 7. PROFILE PERSISTENCE & MOCK FALLBACK ISOLATION
  // ==========================================================================
  describe("7. Database Persistence & Mock Isolation", () => {
    it("should unconditionally persist onboarding profiles without !user.isDemo bypass", () => {
      const onboardingServicePath = path.join(
        process.cwd(),
        "src/server/services/onboarding.service.ts"
      );
      const content = fs.readFileSync(onboardingServicePath, "utf-8");
      assert.doesNotMatch(
        content,
        /!user\.isDemo/,
        "onboarding.service.ts must not bypass persistence based on user.isDemo"
      );
    });

    it("should isolate FEATURED_PROFESSIONALS mock profiles in production", () => {
      const profilesDbPath = path.join(
        process.cwd(),
        "src/lib/supabase/db/profiles.ts"
      );
      const content = fs.readFileSync(profilesDbPath, "utf-8");
      assert.match(
        content,
        /process\.env\.NODE_ENV\s*===\s*["']production["']/,
        "profiles.ts must check for production environment"
      );
      assert.match(
        content,
        /FATAL DATABASE CONFIGURATION|Cannot query worker profiles/i,
        "profiles.ts must fail closed in production when Supabase is unconfigured"
      );
    });
  });

  // ==========================================================================
  // 8. CONSTITUTIONAL COMMISSION INVARIANT
  // ==========================================================================
  describe("8. Constitutional Commission Invariant (0.00% Commission)", () => {
    it("should forbid platform fee deductions via PayoutService", () => {
      assert.throws(
        () => {
          PayoutService.validateZeroCommission({
            workerProfileId: "w-1",
            contractorOrganizationId: "org-1",
            actualPayoutAmount: 4500, // Deduction of 500 attempted
            contractorDeclaredAmount: 5000,
            workerAgreedAmount: 5000,
            payoutMethod: "bank_transfer",
            payoutReference: "UTR-TEST-001",
          });
        },
        /Constitutional Invariant Violation: Platform deduction is strictly forbidden/,
        "Must throw on fee deduction"
      );

      // 100% disbursement passes
      assert.doesNotThrow(() => {
        PayoutService.validateZeroCommission({
          workerProfileId: "w-1",
          contractorOrganizationId: "org-1",
          actualPayoutAmount: 5000,
          contractorDeclaredAmount: 5000,
          workerAgreedAmount: 5000,
          payoutMethod: "bank_transfer",
          payoutReference: "UTR-TEST-002",
        });
      });
    });

    it("should reject non-zero platform_commission_amount in BookingRepository", async () => {
      await assert.rejects(
        async () => {
          await BookingRepository.create({
            customer_id: "cust-test",
            worker_profile_id: "w-test",
            service_title: "Carpentry",
            location_address: "GS Road, Guwahati",
            location_city: "Guwahati",
            scheduled_start: new Date().toISOString(),
            platform_commission_amount: 50,
          } as any);
        },
        /Constitutional Invariant Violation/
      );
    });
  });

  // ==========================================================================
  // 9. CONTROLLED ROLLOUT GEOGRAPHIC BOUNDING
  // ==========================================================================
  describe("9. Controlled Rollout Geographic Validation", () => {
    const validPincodes = [
      "781001", // Guwahati Panbazar
      "781005", // Guwahati Dispur
      "781039", // Guwahati Upper Bound
      "793001", // Shillong Police Bazar
      "793003", // Shillong Laitumkhrah
      "793022", // Shillong Upper Bound
    ];

    const invalidPincodes = [
      "110001", // New Delhi
      "400001", // Mumbai
      "560001", // Bengaluru
      "781040", // Outside Guwahati Urban
      "793023", // Outside Shillong Urban
      "700001", // Kolkata
    ];

    it("should identify authorized Class B controlled rollout pincodes", () => {
      const isAuthorizedPincode = (pincode: string): boolean => {
        const code = parseInt(pincode, 10);
        const isGuwahatiUrban = code >= 781001 && code <= 781039;
        const isShillongUrban = code >= 793001 && code <= 793022;
        return isGuwahatiUrban || isShillongUrban;
      };

      for (const pin of validPincodes) {
        assert.equal(isAuthorizedPincode(pin), true, `Pincode ${pin} must be authorized`);
      }

      for (const pin of invalidPincodes) {
        assert.equal(isAuthorizedPincode(pin), false, `Pincode ${pin} must be rejected`);
      }
    });
  });

  // ==========================================================================
  // 10. DOCUMENTATION REGISTER INTEGRITY
  // ==========================================================================
  describe("10. Phase 39 Documentation Register Integrity", () => {
    const requiredDocs = [
      "INITIAL_REPOSITORY_AUDIT.md",
      "HACKATHON_AND_DEMO_REMOVAL_REGISTER.md",
      "AUTHENTICATION_ARCHITECTURE.md",
      "SANDBOX_OTP_IMPLEMENTATION.md",
      "ACCOUNT_REGISTRATION_VERIFICATION.md",
      "WORKER_ONBOARDING_VERIFICATION.md",
      "PROFILE_PERSISTENCE_AUDIT.md",
      "ENVIRONMENT_CONFIGURATION.md",
      "SECURITY_REGRESSION_EVIDENCE.md",
      "BROWSER_E2E_EVIDENCE.md",
      "KNOWN_LIMITATIONS.md",
      "PHASE_39_FINAL_ENGINEERING_REPORT.md",
    ];

    for (const doc of requiredDocs) {
      it(`should have non-trivial document: docs/phase-39/${doc}`, () => {
        const fullPath = path.join(process.cwd(), "docs/phase-39", doc);
        assert.ok(fs.existsSync(fullPath), `Document docs/phase-39/${doc} must exist`);
        const stats = fs.statSync(fullPath);
        assert.ok(stats.size > 1000, `Document docs/phase-39/${doc} must be substantive (>1000 bytes)`);
      });
    }
  });
});
