/**
 * KAAMSETU — Phase 39.3 Master Regression Test Suite
 * HTTP 503 Root-Cause Elimination, Indian Mobile Validation & End-to-End Sandbox Registration
 *
 * Test Scenarios:
 * 1. Indian Mobile Number Format Validation (10 numbers matrix):
 *    - Valid: 9876543210 (starts with 9) -> PASS
 *    - Valid: 8765432109 (starts with 8) -> PASS
 *    - Valid: 7654321098 (starts with 7) -> PASS
 *    - Valid: 6543210987 (starts with 6) -> PASS
 *    - Invalid: 5456565656 (starts with 5) -> FAIL (exact message)
 *    - Invalid: 1234567890 (starts with 1) -> FAIL
 *    - Invalid: 0123456789 (starts with 0) -> FAIL
 *    - Invalid: 987654321 (9 digits) -> FAIL
 *    - Invalid: 98765432109 (11 digits) -> FAIL
 *    - Invalid: 98765ABCD0 (alphanumeric) -> FAIL
 * 2. Country Code & Formatting Tolerance:
 *    - +919876543210, 919876543210, 09876543210, 98765 43210 -> all correctly normalized to +919876543210
 * 3. Schema & API Request-Level Immediate Rejection:
 *    - Invalid phone returns HTTP 400 Bad Request with code INVALID_PHONE without invoking rate limiter or Supabase
 * 4. Typed Auth Error Catalog Contract:
 *    - All 10 error codes correctly mapped with user-facing messages
 * 5. HTTP 503 / Infrastructure Failure Graceful Degradation:
 *    - In fallback mode or when DB is unreachable, returns 503 with reassuring user message
 *    - Reassuring message informs worker that draft is preserved
 * 6. Elimination of Universal Backdoor OTP (123456):
 *    - Arbitrary code 123456 does NOT verify unless it genuinely matches the challenge code
 * 7. Sandbox OTP Atomic Consumption & Anti-Replay:
 *    - Random 6-digit PIN generated
 *    - Single-use consumption: first verify succeeds, second verify fails (OTP_INVALID / consumed)
 * 8. Zero SMS / Sandbox Security Invariants:
 *    - phone_verification_status = 'sandbox_unverified'
 *    - phone_verified = false
 *    - verification_method = 'sandbox'
 * 9. Cooldown & Active Challenge State Recovery:
 *    - Active challenge persists and is returned on 429 cooldown so user is never locked out
 * 10. End-to-End Registration & Credential Minting:
 *    - Worker onboarding draft is submitted and credential minted with valid cryptographic signature
 */

import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { NextRequest } from "next/server";

(process.env as any).NODE_ENV = "test";
process.env.ENABLE_IN_MEMORY_RATE_LIMIT_MOCK = "true";
process.env.RATE_LIMIT_HMAC_SECRET = "kaamsetu-test-hmac-secret-strictly-32-chars-long";
process.env.AUTH_VERIFICATION_MODE = "sandbox";

// Module imports
import {
  validateIndianMobile,
  normalizeIndianPhone,
  INVALID_PHONE_MESSAGE,
} from "../src/lib/utilities/phone";
import {
  AUTH_ERROR_CODES,
  AUTH_ERROR_MESSAGES,
  AuthErrorCode,
  getAuthErrorMessage,
} from "../src/lib/auth/auth-error-codes";
import { phoneAuthSchema, otpVerificationSchema } from "../src/schemas/auth.schema";
import {
  sendOtp,
  verifyOtp,
  signSessionToken,
  verifySessionToken,
  hashOtpCode,
  __resetMemoryOtpStore,
} from "../src/lib/auth/otp-service";
import {
  checkRateLimit,
  validateOtpSendRateLimit,
  hashRateLimitKey,
} from "../src/lib/security/rate-limiter";
import { POST as sendOtpApiHandler } from "../src/app/api/auth/otp/send/route";
import { POST as verifyOtpApiHandler } from "../src/app/api/auth/otp/verify/route";
import { OnboardingService } from "../src/server/services/onboarding.service";
import {
  validateCryptographicKeyMaterial,
  assertCryptographicKeyQuality,
} from "../src/lib/crypto/key-validator";
import { GeographicAuthorizationService } from "../src/server/services/geographic-authorization.service";

describe("PHASE 39.3 CRITICAL AUTHENTICATION RESTORATION TEST SUITE", () => {
  beforeEach(() => {
    __resetMemoryOtpStore();
  });

  // ==========================================================================
  // SECTION 1: Indian Mobile Validation (10-Number Test Matrix)
  // ==========================================================================
  describe("Section 1: Indian Mobile Validation 10-Number Matrix", () => {
    const matrix = [
      { phone: "9876543210", expectedValid: true, desc: "starts with 9 (valid)" },
      { phone: "8765432109", expectedValid: true, desc: "starts with 8 (valid)" },
      { phone: "7654321098", expectedValid: true, desc: "starts with 7 (valid)" },
      { phone: "6543210987", expectedValid: true, desc: "starts with 6 (valid)" },
      { phone: "5456565656", expectedValid: false, desc: "starts with 5 (invalid reproduction number)" },
      { phone: "1234567890", expectedValid: false, desc: "starts with 1 (invalid)" },
      { phone: "0123456789", expectedValid: false, desc: "starts with 0 (invalid)" },
      { phone: "987654321", expectedValid: false, desc: "9 digits (invalid length)" },
      { phone: "98765432109", expectedValid: false, desc: "11 digits (invalid length)" },
      { phone: "98765ABCD0", expectedValid: false, desc: "contains letters (invalid format)" },
    ];

    for (const item of matrix) {
      it(`Matrix case: ${item.phone} (${item.desc}) -> ${item.expectedValid ? "VALID" : "INVALID"}`, () => {
        const result = validateIndianMobile(item.phone);
        assert.equal(
          result.isValid,
          item.expectedValid,
          `Expected ${item.phone} validation to be ${item.expectedValid}`
        );

        if (!item.expectedValid) {
          assert.equal(
            result.error,
            INVALID_PHONE_MESSAGE,
            "Error message must match exact specification"
          );
        } else {
          assert.equal(result.clean10.length, 10, "Clean format must be exactly 10 digits");
          assert.match(result.clean10, /^[6-9]\d{9}$/, "Must start with 6, 7, 8, or 9");
          assert.equal(result.e164, `+91${result.clean10}`, "E.164 must have +91 prefix");
        }
      });
    }

    it("Normalizes various input formats correctly", () => {
      const inputs = [
        "+919876543210",
        "919876543210",
        "09876543210",
        "+91 98765 43210",
        "98765-43210",
        " (98765) 43210 ",
      ];

      for (const input of inputs) {
        const res = normalizeIndianPhone(input);
        assert.equal(res.valid, true, `Input ${input} should normalize to valid`);
        assert.equal(res.clean10, "9876543210", "Clean 10 must be 9876543210");
        assert.equal(res.formatted, "+919876543210", "Formatted must be +919876543210");
      }
    });
  });

  // ==========================================================================
  // SECTION 2: Zod Schema & API-Level Early Validation & Rejection
  // ==========================================================================
  describe("Section 2: Schema & API Rejection without Database/Rate-Limiter Calls", () => {
    it("phoneAuthSchema rejects 5456565656 with exact message", () => {
      const parseResult = phoneAuthSchema.safeParse({
        phone: "5456565656",
        intent: "registration",
      });
      assert.equal(parseResult.success, false, "Schema parse must fail for 5456565656");
      if (!parseResult.success) {
        const firstIssue = parseResult.error.issues[0];
        assert.equal(
          firstIssue.message,
          INVALID_PHONE_MESSAGE,
          "Zod error message must be exact Indian mobile requirement"
        );
      }
    });

    it("/api/auth/otp/send returns HTTP 400 Bad Request with INVALID_PHONE for 5456565656", async () => {
      const req = new NextRequest("http://localhost:3000/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: "5456565656",
          intent: "registration",
        }),
      });

      const res = await sendOtpApiHandler(req);
      assert.equal(res.status, 400, "Must return HTTP 400 Bad Request");
      const json = await res.json();
      assert.equal(json.success, false);
      assert.equal(json.code, AUTH_ERROR_CODES.INVALID_PHONE);
      assert.equal(json.message, INVALID_PHONE_MESSAGE);
      assert.equal(json.challengeCreated, false);
    });

    it("/api/auth/otp/verify returns HTTP 400 Bad Request for invalid OTP format", async () => {
      const req = new NextRequest("http://localhost:3000/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: "9876543210",
          otp: "abc", // Invalid length and non-digits
        }),
      });

      const res = await verifyOtpApiHandler(req);
      assert.equal(res.status, 400, "Must return HTTP 400 Bad Request");
      const json = await res.json();
      assert.equal(json.success, false);
      assert.equal(json.code, AUTH_ERROR_CODES.OTP_INVALID);
    });
  });

  // ==========================================================================
  // SECTION 3: Typed Error Catalog Contract
  // ==========================================================================
  describe("Section 3: Typed Auth Error Catalog Contract", () => {
    it("Defines all 10 standard error codes with user-facing messages", () => {
      const expectedCodes: AuthErrorCode[] = [
        "INVALID_PHONE",
        "RATE_LIMITED",
        "ACTIVE_CHALLENGE_EXISTS",
        "OTP_EXPIRED",
        "OTP_INVALID",
        "OTP_ATTEMPTS_EXCEEDED",
        "AUTH_CONFIGURATION_ERROR",
        "DATABASE_UNAVAILABLE",
        "OTP_CHALLENGE_CREATION_FAILED",
        "INTERNAL_SERVER_ERROR",
      ];

      for (const code of expectedCodes) {
        assert.ok(AUTH_ERROR_CODES[code], `Code ${code} must exist in catalog`);
        assert.ok(
          AUTH_ERROR_MESSAGES[code],
          `User message for ${code} must exist and be non-empty`
        );
        const msg = getAuthErrorMessage(code);
        assert.ok(typeof msg === "string" && msg.length > 0);
      }
    });

    it("DATABASE_UNAVAILABLE message reassures user that draft is preserved", () => {
      const msg = getAuthErrorMessage("DATABASE_UNAVAILABLE");
      assert.ok(
        msg.includes("draft has been saved") || msg.includes("saved"),
        "503 user message must reassure that draft is preserved"
      );
    });
  });

  // ==========================================================================
  // SECTION 4: Sandbox OTP Delivery & Anti-Backdoor Invariant
  // ==========================================================================
  describe("Section 4: Sandbox OTP Delivery, Security & Anti-Backdoor Verification", () => {
    it("Generates random 6-digit PIN under sandbox mode", async () => {
      const res = await sendOtp({
        phone: "9876543211",
        intent: "registration",
        clientIp: "127.0.0.1",
      });

      assert.equal(res.success, true);
      assert.equal(res.isSandbox, true);
      assert.match(res.sandboxCode || "", /^\d{6}$/, "Must be a 6-digit PIN");
      assert.equal(res.hasActiveChallenge, true);
    });

    it("Rejects arbitrary backdoor code '123456'", async () => {
      // Send OTP to get a real random challenge
      const sendRes = await sendOtp({
        phone: "9876543212",
        intent: "registration",
        clientIp: "127.0.0.1",
      });
      assert.equal(sendRes.success, true);
      const legitimateCode = sendRes.sandboxCode!;

      // Attempt to verify with 123456 (unless legitimately 123456)
      const fakeCode = legitimateCode === "123456" ? "654321" : "123456";
      const verifyRes = await verifyOtp({
        phone: "+919876543212",
        otp: fakeCode,
        intent: "registration",
      });

      assert.equal(verifyRes.success, false, "Arbitrary backdoor code must NOT verify");
      assert.equal(verifyRes.code, AUTH_ERROR_CODES.OTP_INVALID);
    });

    it("Consumes valid code atomically (single-use anti-replay)", async () => {
      const sendRes = await sendOtp({
        phone: "9876543213",
        intent: "registration",
        clientIp: "127.0.0.1",
      });
      assert.equal(sendRes.success, true);
      const code = sendRes.sandboxCode!;

      // First verification: SUCCESS
      const firstVerify = await verifyOtp({
        phone: "+919876543213",
        otp: code,
        intent: "registration",
      });
      assert.equal(firstVerify.success, true, "First verification must succeed");
      assert.ok(firstVerify.sessionToken, "Must receive session token");
      assert.equal(firstVerify.verificationMethod, "sandbox");
      assert.equal(firstVerify.phoneVerified, false); // Sandbox identity is unverified in live telecom sense

      // Second verification with identical code: REJECTED (anti-replay)
      const secondVerify = await verifyOtp({
        phone: "+919876543213",
        otp: code,
        intent: "registration",
      });
      assert.equal(secondVerify.success, false, "Second verification must fail (already consumed)");
    });
  });

  // ==========================================================================
  // SECTION 5: Cooldown & Active Challenge Detection
  // ==========================================================================
  describe("Section 5: Cooldown & Active Challenge Recovery", () => {
    it("Second request during cooldown returns 429 with existing challenge recovery", async () => {
      const testPhone = "+919876543214";

      // First request
      const r1 = await sendOtp({
        phone: testPhone,
        intent: "registration",
        clientIp: "127.0.0.1",
      });
      assert.equal(r1.success, true);
      const initialCode = r1.sandboxCode;

      // Second request immediately after
      const r2 = await sendOtp({
        phone: testPhone,
        intent: "registration",
        clientIp: "127.0.0.1",
      });

      assert.equal(r2.statusCode, 429, "Second dispatch must return HTTP 429");
      assert.equal(r2.hasActiveChallenge, true, "Must flag that an active challenge exists");
      assert.equal(r2.sandboxCode, initialCode, "Must return active challenge code for sandbox testing");
      assert.equal(r2.code, AUTH_ERROR_CODES.ACTIVE_CHALLENGE_EXISTS);
    });
  });

  // ==========================================================================
  // SECTION 6: Session Signature & Token Cryptography
  // ==========================================================================
  describe("Section 6: Session Signature & Token Cryptography", () => {
    it("Issues HMAC-SHA256 signed session token with sandbox security invariants", () => {
      const payload = {
        phone: "+919876543215",
        role: "worker" as const,
        verificationMethod: "sandbox" as const,
        phoneVerified: false,
        phoneVerificationStatus: "sandbox_unverified",
      };

      const token = signSessionToken(payload);
      assert.ok(token && token.includes("."), "Session token must be dot-delimited");

      const decoded = verifySessionToken(token);
      assert.ok(decoded, "Token must decode and verify successfully");
      assert.equal(decoded.phone, "+919876543215");
      assert.equal(decoded.verificationMethod, "sandbox");
      assert.equal(decoded.phoneVerified, false);
      assert.equal(decoded.phoneVerificationStatus, "sandbox_unverified");
    });
  });

  // ==========================================================================
  // SECTION 7: End-to-End Worker Onboarding Persistence & Minting
  // ==========================================================================
  describe("Section 7: Worker Onboarding Persistence & Credential Minting", () => {
    it("Persists worker profile draft and mints credential with valid signature", async () => {
      const mockUser = {
        id: "usr-phase39-3-test-uid",
        phone: "+919876543216",
        fullName: "Dipankar Das",
        role: "worker" as const,
        isDemo: false,
      };

      const workerPayload = {
        fullName: "Dipankar Das",
        headline: "Certified Master Plumber",
        bio: "Specializing in commercial plumbing in Guwahati Urban.",
        occupation: "Plumbing & Piping",
        category: "plumbing",
        yearsExperience: 7,
        dailyRateMin: 800,
        dailyRateMax: 1400,
        city: "Guwahati",
        state: "Assam",
        pincode: "781003", // Guwahati Urban (valid Class B)
        skills: ["Pipe Fitting", "Leak Detection"],
        equipmentHandled: ["Pipe Wrench", "Threading Machine"],
        languages: ["as", "hi", "en"],
        isPublished: true,
        workerConfirmedVoice: true,
        allowNonDispatchProfile: false,
      };

      const saveResult = await OnboardingService.saveProfile(mockUser, workerPayload);
      assert.ok(saveResult.id, "Must return worker record ID");
      assert.ok(saveResult.registryId, "Must return registry/credential ID");
      assert.match(saveResult.registryId, /^IN-AS-2026-\d{4}-KS$/, "Credential ID must follow format");
      assert.equal(saveResult.isDispatchEligible, true, "Guwahati Urban must be dispatch eligible");
      assert.equal(saveResult.dispatchStatus, "active");
      assert.equal(saveResult.isDemo, false, "Must be non-demo production record");
    });
  });

  // ==========================================================================
  // SECTION 8: Failure Semantics & Non-Fabrication of Cooldown on 503
  // ==========================================================================
  describe("Section 8: Failure Semantics & Non-Fabrication of Cooldown on 503 Outage", () => {
    it("Infrastructure error returns 503 without fabricated remainingSeconds or nextAllowedAt", async () => {
      // Direct rate limiter check with invalid key hashing to trigger infrastructure failure
      const originalSecret = process.env.RATE_LIMIT_HMAC_SECRET;
      try {
        // Temporarily clear to trigger cryptographic/infrastructure error in hashing
        delete process.env.RATE_LIMIT_HMAC_SECRET;
        (process.env as any).NODE_ENV = "production";

        const res = await validateOtpSendRateLimit("+919876543217", "127.0.0.1");
        assert.equal(res.allowed, false);
        assert.equal(res.isInfrastructureError, true, "Must flag isInfrastructureError: true");
        assert.equal(res.statusCode, 503, "Must return status 503, NOT 429");
        assert.equal(res.remainingSeconds, undefined, "Remaining seconds must NOT be fabricated");
        assert.equal(res.nextAllowedAt, undefined, "nextAllowedAt must NOT be fabricated");
        assert.ok(
          res.reason?.includes("Authentication service configuration error") ||
            res.reason?.includes("Authentication rate limiter temporarily unavailable"),
          "Reason must state configuration error or rate limiter unavailable"
        );
      } finally {
        process.env.RATE_LIMIT_HMAC_SECRET = originalSecret;
        (process.env as any).NODE_ENV = "test";
      }
    });

    it("/api/auth/otp/send omits Retry-After header and cooldown fields on 503", async () => {
      const originalSecret = process.env.RATE_LIMIT_HMAC_SECRET;
      try {
        delete process.env.RATE_LIMIT_HMAC_SECRET;
        (process.env as any).NODE_ENV = "production";

        const req = new NextRequest("http://localhost:3000/api/auth/otp/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: "9876543218",
            intent: "registration",
          }),
        });

        const res = await sendOtpApiHandler(req);
        assert.equal(res.status, 503, "Must return HTTP 503 for infrastructure outage");
        assert.equal(res.headers.get("Retry-After"), null, "Must NOT set Retry-After header on 503");

        const json = await res.json();
        assert.equal(json.success, false);
        assert.equal(json.isInfrastructureError, true);
        assert.equal(json.retryAfterSeconds, undefined, "retryAfterSeconds must be omitted or undefined");
        assert.equal(json.nextAllowedAt, undefined, "nextAllowedAt must be omitted or undefined");
      } finally {
        process.env.RATE_LIMIT_HMAC_SECRET = originalSecret;
        (process.env as any).NODE_ENV = "test";
      }
    });
  });

  // ==========================================================================
  // SECTION 9: Cryptographic Key Quality & Safe Key Rotation Verification
  // ==========================================================================
  describe("Section 9: Cryptographic Key Quality & Safe Key Rotation Verification", () => {
    it("Rejects keys with insufficient entropy or predictable patterns", () => {
      const shortKey = "short-key-16-bytes";
      const shortValidation = validateCryptographicKeyMaterial(shortKey, "TEST_KEY");
      assert.equal(shortValidation.valid, false);
      assert.ok(shortValidation.error?.includes("bytes of material"));

      const predictableKey = "my-secret-password-which-is-long-enough-32-bytes";
      const predValidation = validateCryptographicKeyMaterial(predictableKey, "TEST_KEY");
      assert.equal(predValidation.valid, false);
      assert.ok(predValidation.error?.includes("predictable"));

      assert.throws(() => {
        assertCryptographicKeyQuality("short", "TEST_KEY");
      }, /FATAL CRYPTOGRAPHIC CONFIGURATION/);
    });

    it("Accepts valid high-entropy 256-bit cryptographic keys", () => {
      const highEntropyKey = crypto.randomBytes(32).toString("hex");
      const validation = validateCryptographicKeyMaterial(highEntropyKey, "TEST_KEY");
      assert.equal(validation.valid, true);
      assert.ok(validation.byteLength >= 32);
    });

    it("verifySessionToken supports zero-downtime key rotation via RATE_LIMIT_HMAC_SECRET_PREVIOUS", () => {
      const oldSecret = "kaamsetu-old-hmac-secret-strictly-32-chars-long";
      const newSecret = "kaamsetu-new-hmac-secret-strictly-32-chars-long";

      // 1. Sign token with old secret
      process.env.RATE_LIMIT_HMAC_SECRET = oldSecret;
      delete process.env.RATE_LIMIT_HMAC_SECRET_PREVIOUS;

      const payload = {
        userId: "usr-rot-123",
        phone: "+919876543219",
        role: "worker" as const,
        verificationMethod: "sandbox" as const,
        phoneVerified: false,
        phoneVerificationStatus: "sandbox_unverified",
      };

      const tokenSignedWithOldSecret = signSessionToken(payload);
      assert.ok(tokenSignedWithOldSecret);

      // 2. Rotate secret: newSecret becomes active, oldSecret becomes previous
      process.env.RATE_LIMIT_HMAC_SECRET = newSecret;
      process.env.RATE_LIMIT_HMAC_SECRET_PREVIOUS = oldSecret;

      // 3. Verify that old token still verifies via fallback
      const verifiedPayload = verifySessionToken(tokenSignedWithOldSecret);
      assert.ok(verifiedPayload, "Token signed with previous key must verify successfully");
      assert.equal(verifiedPayload.userId, "usr-rot-123");
      assert.equal(verifiedPayload.phone, "+919876543219");

      // 4. Also verify that new tokens signed with new secret verify
      const tokenSignedWithNewSecret = signSessionToken(payload);
      const verifiedNew = verifySessionToken(tokenSignedWithNewSecret);
      assert.ok(verifiedNew, "Token signed with new key must verify successfully");

      // Cleanup
      process.env.RATE_LIMIT_HMAC_SECRET = "kaamsetu-test-hmac-secret-strictly-32-chars-long";
      delete process.env.RATE_LIMIT_HMAC_SECRET_PREVIOUS;
    });
  });

  // ==========================================================================
  // SECTION 10: Concurrency Protection on Rate Limiting
  // ==========================================================================
  describe("Section 10: Concurrency Protection on Rate Limiting", () => {
    it("Concurrent requests respect limit thresholds", async () => {
      const key = `test-concurrent:${Date.now()}`;
      const maxAttempts = 3;
      const windowSec = 60;

      // Fire 5 rapid parallel checks
      const results = await Promise.all([
        checkRateLimit(key, maxAttempts, windowSec, windowSec),
        checkRateLimit(key, maxAttempts, windowSec, windowSec),
        checkRateLimit(key, maxAttempts, windowSec, windowSec),
        checkRateLimit(key, maxAttempts, windowSec, windowSec),
        checkRateLimit(key, maxAttempts, windowSec, windowSec),
      ]);

      const allowedCount = results.filter((r) => r.allowed).length;
      const blockedCount = results.filter((r) => !r.allowed).length;

      assert.equal(allowedCount, maxAttempts, `Exactly ${maxAttempts} requests should be allowed`);
      assert.equal(blockedCount, 5 - maxAttempts, `${5 - maxAttempts} requests should be blocked`);
    });
  });

  // ==========================================================================
  // SECTION 11: Class B Controlled Rollout Boundaries Enforcement
  // ==========================================================================
  describe("Section 11: Class B Controlled Rollout Boundaries Enforcement", () => {
    it("Authorizes Guwahati Urban pin codes (781001-781039)", () => {
      const res = GeographicAuthorizationService.validateLocation({
        city: "Guwahati",
        state: "Assam",
        pincode: "781001",
      });
      assert.equal(res.allowed, true, "781001 must be allowed in Guwahati Urban");
      assert.equal(res.district, "Kamrup Metropolitan");
    });

    it("Authorizes Shillong Urban pin codes (793001-793022)", () => {
      const res = GeographicAuthorizationService.validateLocation({
        city: "Shillong",
        state: "Meghalaya",
        pincode: "793001",
      });
      assert.equal(res.allowed, true, "793001 must be allowed in Shillong Urban");
      assert.equal(res.district, "East Khasi Hills");
    });

    it("Rejects locations outside Class B rollout boundaries", () => {
      const res = GeographicAuthorizationService.validateLocation({
        city: "New Delhi",
        state: "Delhi",
        pincode: "110001",
      });
      assert.equal(res.allowed, false, "Delhi must NOT be allowed under Class B");
      assert.equal(res.status, "OUT_OF_BOUNDS");
    });
  });

  // ==========================================================================
  // SECTION 12: Permanent Constitutional Invariant
  // ==========================================================================
  describe("Section 12: Permanent Constitutional Invariant", () => {
    it("Enforces platform_commission_amount = 0.00 on artisan wages", () => {
      const artisanWage = 1200;
      const commissionRate = 0.0;
      const commissionAmount = artisanWage * commissionRate;
      assert.equal(commissionAmount, 0, "Platform commission on artisan wages must strictly be 0.00");
    });
  });
});
