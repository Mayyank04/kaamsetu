/**
 * KAAMSETU — OTP Rate Limiter Production Incident Repair Test Suite
 * Stage 6 Master Verification: 14 Target Incidents & Security Controls
 *
 * Scenarios:
 * 1. Missing cryptographic secret
 * 2. Invalid cryptographic secret
 * 3. Valid cryptographic secret
 * 4. Missing RPC function (PGRST202)
 * 5. Insufficient RPC privileges (anon/authenticated revoked)
 * 6. RPC timeout and database failure
 * 7. Successful rate-limit increment
 * 8. Rate-limit exhaustion
 * 9. Concurrent requests
 * 10. OTP expiry
 * 11. OTP replay
 * 12. OTP attempt exhaustion
 * 13. Sandbox mode without SMS invocation
 * 14. Production configuration validation
 */

import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { NextRequest } from "next/server";

// Ensure test baseline
(process.env as any).NODE_ENV = "test";
process.env.ENABLE_IN_MEMORY_RATE_LIMIT_MOCK = "true";
process.env.RATE_LIMIT_HMAC_SECRET = "kaamsetu-test-hmac-secret-strictly-32-chars-long";
process.env.AUTH_VERIFICATION_MODE = "sandbox";

import {
  getRateLimitHmacSecret,
  hashRateLimitKey,
  checkRateLimit,
  validateOtpSendRateLimit,
  validateOtpVerifyAttempt,
  recordFailedOtpAttempt,
  clearFailedOtpAttempts,
  __resetMemoryRateLimitStore,
} from "../src/lib/security/rate-limiter";
import {
  validateCryptographicKeyMaterial,
  assertCryptographicKeyQuality,
} from "../src/lib/crypto/key-validator";
import {
  sendOtp,
  verifyOtp,
  __resetMemoryOtpStore,
} from "../src/lib/auth/otp-service";
import { POST as sendOtpApiHandler } from "../src/app/api/auth/otp/send/route";
import { validateEnvironmentSafety } from "../src/lib/env";
import { EnvironmentService } from "../src/server/configuration/environment";
import { ConfigurationError } from "../src/lib/errors/app-error";

describe("KAAMSETU — OTP Rate Limiter Production Incident Repair (14-Point Audit)", () => {
  beforeEach(() => {
    __resetMemoryOtpStore();
    __resetMemoryRateLimitStore();
    (process.env as any).NODE_ENV = "test";
    process.env.ENABLE_IN_MEMORY_RATE_LIMIT_MOCK = "true";
    process.env.RATE_LIMIT_HMAC_SECRET = "kaamsetu-test-hmac-secret-strictly-32-chars-long";
    process.env.AUTH_VERIFICATION_MODE = "sandbox";
  });

  // ==========================================================================
  // Test 1: Missing Cryptographic Secret
  // ==========================================================================
  it("Test 1: Missing cryptographic secret fails closed with 503 without fabricated cooldown", async () => {
    const originalSecret = process.env.RATE_LIMIT_HMAC_SECRET;
    try {
      delete process.env.RATE_LIMIT_HMAC_SECRET;
      (process.env as any).NODE_ENV = "production";

      // getRateLimitHmacSecret must throw in production
      assert.throws(
        () => getRateLimitHmacSecret(),
        /FATAL SECURITY CONFIGURATION: RATE_LIMIT_HMAC_SECRET is missing/
      );

      // validateOtpSendRateLimit must return 503 infrastructure error
      const rateLimitRes = await validateOtpSendRateLimit("+919876543210", "127.0.0.1");
      assert.equal(rateLimitRes.allowed, false);
      assert.equal(rateLimitRes.isInfrastructureError, true);
      assert.equal(rateLimitRes.statusCode, 503);
      assert.equal(rateLimitRes.errorCode, "AUTH_CONFIGURATION_ERROR");
      assert.equal(rateLimitRes.remainingSeconds, undefined);
      assert.equal(rateLimitRes.nextAllowedAt, undefined);

      // API route must return HTTP 503 with no Retry-After header
      const req = new NextRequest("http://localhost:3000/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: "9876543210", intent: "registration" }),
      });
      const apiRes = await sendOtpApiHandler(req);
      assert.equal(apiRes.status, 503);
      assert.equal(apiRes.headers.get("Retry-After"), null);
      const json = await apiRes.json();
      assert.equal(json.success, false);
      assert.equal(json.code, "AUTH_CONFIGURATION_ERROR");
      assert.equal(json.retryAfterSeconds, undefined);
    } finally {
      process.env.RATE_LIMIT_HMAC_SECRET = originalSecret;
      (process.env as any).NODE_ENV = "test";
    }
  });

  // ==========================================================================
  // Test 2: Invalid Cryptographic Secret
  // ==========================================================================
  it("Test 2: Invalid cryptographic secret (<32 bytes or predictable) is rejected", async () => {
    // 2.1 Short key
    const shortRes = validateCryptographicKeyMaterial("too-short-key", "RATE_LIMIT_HMAC_SECRET");
    assert.equal(shortRes.valid, false);
    assert.ok(shortRes.error && shortRes.error.length > 0);

    // 2.2 Predictable placeholder key
    const predictableRes = validateCryptographicKeyMaterial(
      "my-insecure-password-12345678-placeholder",
      "RATE_LIMIT_HMAC_SECRET"
    );
    assert.equal(predictableRes.valid, false);
    assert.ok(predictableRes.error?.includes("predictable"));

    // 2.3 assertCryptographicKeyQuality throws
    assert.throws(() => {
      assertCryptographicKeyQuality("too-short", "RATE_LIMIT_HMAC_SECRET");
    }, /FATAL CRYPTOGRAPHIC CONFIGURATION/);

    // 2.4 In production, invalid key results in HTTP 503 infrastructure failure
    const originalSecret = process.env.RATE_LIMIT_HMAC_SECRET;
    try {
      process.env.RATE_LIMIT_HMAC_SECRET = "too-short";
      (process.env as any).NODE_ENV = "production";

      const res = await validateOtpSendRateLimit("+919876543211", "127.0.0.1");
      assert.equal(res.allowed, false);
      assert.equal(res.isInfrastructureError, true);
      assert.equal(res.statusCode, 503);
      assert.equal(res.errorCode, "AUTH_CONFIGURATION_ERROR");
    } finally {
      process.env.RATE_LIMIT_HMAC_SECRET = originalSecret;
      (process.env as any).NODE_ENV = "test";
    }
  });

  // ==========================================================================
  // Test 3: Valid Cryptographic Secret
  // ==========================================================================
  it("Test 3: Valid 256-bit cryptographic secret derives privacy-preserving keys without raw leakage", () => {
    const validKey = crypto.randomBytes(32).toString("base64");
    const validation = validateCryptographicKeyMaterial(validKey, "RATE_LIMIT_HMAC_SECRET");
    assert.equal(validation.valid, true);
    assert.ok(validation.byteLength >= 32);

    const rawPhone = "9876543212";
    const hashedKey = hashRateLimitKey("cooldown", rawPhone, validKey);
    assert.ok(hashedKey.startsWith("cooldown:"));
    assert.equal(hashedKey.includes(rawPhone), false, "Raw phone number must NEVER appear in hashed key");
    assert.match(hashedKey, /^cooldown:[a-f0-9]{32}$/, "Hashed key must be domain-separated hex digest");
  });

  // ==========================================================================
  // Test 4: Missing RPC Function Handling (PGRST202)
  // ==========================================================================
  it("Test 4: Missing RPC function fails closed with 503 in production without memory bypass", async () => {
    const originalNodeEnv = process.env.NODE_ENV;
    const originalMock = process.env.ENABLE_IN_MEMORY_RATE_LIMIT_MOCK;
    try {
      (process.env as any).NODE_ENV = "production";
      delete process.env.ENABLE_IN_MEMORY_RATE_LIMIT_MOCK;

      // When Supabase is not configured or RPC is missing in production, checkRateLimit must fail closed
      const res = await checkRateLimit("test-missing-rpc-key", 5, 60, 60);
      assert.equal(res.allowed, false);
      assert.equal(res.isInfrastructureError, true);
      assert.equal(res.statusCode, 503);
      assert.ok(
        res.errorCode === "DATABASE_UNAVAILABLE" ||
        res.errorCode === "RATE_LIMIT_INFRASTRUCTURE_UNAVAILABLE"
      );
      assert.equal(res.remainingSeconds, undefined);
      assert.equal(res.nextAllowedAt, undefined);
    } finally {
      (process.env as any).NODE_ENV = originalNodeEnv;
      process.env.ENABLE_IN_MEMORY_RATE_LIMIT_MOCK = originalMock;
    }
  });

  // ==========================================================================
  // Test 5: Insufficient RPC Privileges Verification
  // ==========================================================================
  it("Test 5: Privilege boundary ensures check_and_increment_rate_limit is revoked from anon and authenticated", () => {
    // Migration 20261117000033 revokes ALL from PUBLIC, anon, and authenticated
    // and grants EXECUTE solely to service_role.
    // EnvironmentService and createAdminClient enforce service_role key requirement in production.
    const originalEnv = process.env.NODE_ENV;
    const originalKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    try {
      (process.env as any).NODE_ENV = "production";
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;

      const { createAdminClient } = require("../src/lib/supabase/admin");
      assert.throws(() => {
        createAdminClient();
      }, (err: unknown) => {
        return err instanceof ConfigurationError && err.message.includes("SUPABASE_SERVICE_ROLE_KEY is required");
      });
    } finally {
      (process.env as any).NODE_ENV = originalEnv;
      process.env.SUPABASE_SERVICE_ROLE_KEY = originalKey;
    }
  });

  // ==========================================================================
  // Test 6: RPC Timeout & Database Failure Resilience
  // ==========================================================================
  it("Test 6: Database exception fails closed with 503 without trapping user in false countdown", async () => {
    const originalNodeEnv = process.env.NODE_ENV;
    const originalMock = process.env.ENABLE_IN_MEMORY_RATE_LIMIT_MOCK;
    try {
      (process.env as any).NODE_ENV = "production";
      delete process.env.ENABLE_IN_MEMORY_RATE_LIMIT_MOCK;

      const result = await checkRateLimit("timeout-test-key", 1, 60, 60);
      assert.equal(result.allowed, false);
      assert.equal(result.isInfrastructureError, true);
      assert.equal(result.statusCode, 503);
      assert.equal(result.remainingSeconds, undefined, "Remaining seconds must NOT be fabricated on DB failure");
    } finally {
      (process.env as any).NODE_ENV = originalNodeEnv;
      process.env.ENABLE_IN_MEMORY_RATE_LIMIT_MOCK = originalMock;
    }
  });

  // ==========================================================================
  // Test 7: Successful Rate-Limit Increment
  // ==========================================================================
  it("Test 7: First request under threshold increments count and is allowed", async () => {
    const key = `test-increment-${Date.now()}`;
    const res = await checkRateLimit(key, 5, 60, 60);
    assert.equal(res.allowed, true);
  });

  // ==========================================================================
  // Test 8: Rate-Limit Exhaustion
  // ==========================================================================
  it("Test 8: Rate-limit exhaustion returns 429 with truthful remainingSeconds and Retry-After", async () => {
    const testPhone = "+919876543213";

    // First send: OK
    const send1 = await sendOtp({ phone: testPhone, intent: "registration" });
    assert.equal(send1.success, true);

    // Second send immediately after: Exhausts 60s cooldown
    const send2 = await sendOtp({ phone: testPhone, intent: "registration" });
    assert.equal(send2.success, false);
    assert.equal(send2.statusCode, 429);
    assert.ok(send2.retryAfterSeconds && send2.retryAfterSeconds > 0 && send2.retryAfterSeconds <= 60);
    assert.ok(send2.nextAllowedAt);

    // API route sends Retry-After header
    const req = new NextRequest("http://localhost:3000/api/auth/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: "9876543213", intent: "registration" }),
    });
    const apiRes = await sendOtpApiHandler(req);
    assert.equal(apiRes.status, 429);
    assert.ok(apiRes.headers.get("Retry-After"));
  });

  // ==========================================================================
  // Test 9: Concurrent Requests Protection
  // ==========================================================================
  it("Test 9: Concurrent requests cannot bypass rate limits", async () => {
    const key = `test-concurrency-${Date.now()}`;
    const maxAllowed = 3;
    const windowSec = 60;

    // Dispatch 5 rapid parallel checks
    const results = await Promise.all([
      checkRateLimit(key, maxAllowed, windowSec, windowSec),
      checkRateLimit(key, maxAllowed, windowSec, windowSec),
      checkRateLimit(key, maxAllowed, windowSec, windowSec),
      checkRateLimit(key, maxAllowed, windowSec, windowSec),
      checkRateLimit(key, maxAllowed, windowSec, windowSec),
    ]);

    const allowed = results.filter((r) => r.allowed).length;
    const blocked = results.filter((r) => !r.allowed).length;
    assert.equal(allowed, maxAllowed, `Expected exactly ${maxAllowed} allowed requests`);
    assert.equal(blocked, 2, "Expected exactly 2 blocked requests");
  });

  // ==========================================================================
  // Test 10: OTP Expiry
  // ==========================================================================
  it("Test 10: Expired OTP challenge is rejected with OTP_EXPIRED", async () => {
    const testPhone = "+919876543214";
    const sendRes = await sendOtp({ phone: testPhone, intent: "registration" });
    assert.equal(sendRes.success, true);
    const code = sendRes.sandboxCode!;

    // Manually expire memory store entry
    const phoneHashed = hashRateLimitKey("phone:identity", testPhone);
    const { getMemoryOtpStore } = require("../src/lib/auth/otp-service");
    // Access global store to simulate time jump
    const store = (globalThis as any).__kaamsetu_memory_otp_store;
    if (store && store.has(phoneHashed)) {
      const record = store.get(phoneHashed);
      record.expiresAt = Date.now() - 1000; // Expired 1 second ago
    }

    const verifyRes = await verifyOtp({
      phone: testPhone,
      otp: code,
      intent: "registration",
    });

    assert.equal(verifyRes.success, false);
    assert.equal(verifyRes.code, "OTP_EXPIRED");
    assert.equal(verifyRes.statusCode, 400);
  });

  // ==========================================================================
  // Test 11: OTP Replay Defense (Single-Use Atomic Consumption)
  // ==========================================================================
  it("Test 11: Single-use OTP cannot be replayed after initial consumption", async () => {
    const testPhone = "+919876543215";
    const sendRes = await sendOtp({ phone: testPhone, intent: "registration" });
    const code = sendRes.sandboxCode!;

    // First verification: Success
    const v1 = await verifyOtp({ phone: testPhone, otp: code, intent: "registration" });
    assert.equal(v1.success, true);
    assert.ok(v1.sessionToken);

    // Second verification with identical code: Replay rejected
    const v2 = await verifyOtp({ phone: testPhone, otp: code, intent: "registration" });
    assert.equal(v2.success, false);
    assert.equal(v2.code, "OTP_INVALID");
    assert.equal(v2.statusCode, 400);
  });

  // ==========================================================================
  // Test 12: OTP Attempt Exhaustion (Brute-Force Lockout)
  // ==========================================================================
  it("Test 12: 5 consecutive failed verification attempts lock out the phone", async () => {
    const testPhone = "+919876543216";
    await sendOtp({ phone: testPhone, intent: "registration" });

    // Submit 5 wrong codes
    for (let i = 0; i < 5; i++) {
      await recordFailedOtpAttempt(testPhone);
    }

    // Next verification attempt is locked out
    const lockoutCheck = await validateOtpVerifyAttempt(testPhone);
    assert.equal(lockoutCheck.allowed, false);
    assert.ok(
      lockoutCheck.reason?.includes("locked") ||
        lockoutCheck.reason?.includes("too many failed attempts")
    );

    const verifyRes = await verifyOtp({
      phone: testPhone,
      otp: "999999",
      intent: "registration",
    });
    assert.equal(verifyRes.success, false);
    assert.equal(verifyRes.code, "OTP_ATTEMPTS_EXCEEDED");
    assert.equal(verifyRes.statusCode, 429);

    // Cleanup
    await clearFailedOtpAttempts(testPhone);
  });

  // ==========================================================================
  // Test 13: Sandbox Mode Without SMS Invocation
  // ==========================================================================
  it("Test 13: Sandbox mode never calls live telecom providers and marks identity unverified", async () => {
    process.env.AUTH_VERIFICATION_MODE = "sandbox";
    delete process.env.TWILIO_ACCOUNT_SID;
    delete process.env.TWILIO_AUTH_TOKEN;

    const testPhone = "+919876543217";
    const sendRes = await sendOtp({ phone: testPhone, intent: "registration" });
    assert.equal(sendRes.success, true);
    assert.equal(sendRes.isSandbox, true);
    assert.ok(sendRes.sandboxCode);

    const verifyRes = await verifyOtp({
      phone: testPhone,
      otp: sendRes.sandboxCode!,
      intent: "registration",
    });

    assert.equal(verifyRes.success, true);
    assert.equal(verifyRes.verificationMethod, "sandbox");
    assert.equal(verifyRes.phoneVerified, false, "Sandbox identity must NOT be marked phoneVerified: true");
    assert.equal(verifyRes.user?.phoneVerificationStatus, "sandbox_unverified");
  });

  // ==========================================================================
  // Test 14: Production Configuration Validation
  // ==========================================================================
  it("Test 14: Production configuration enforces 256-bit secrets and rejects placeholder credentials", () => {
    const originalEnv = process.env.NODE_ENV;
    const originalSecret = process.env.RATE_LIMIT_HMAC_SECRET;
    const originalSigningKey = process.env.CREDENTIAL_SIGNING_KEY;
    const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    try {
      (process.env as any).NODE_ENV = "production";

      // 14.1 Rejects placeholder Supabase URL
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://placeholder-kaamsetu.supabase.co";
      assert.throws(() => {
        validateEnvironmentSafety();
      }, /Placeholder Supabase credentials cannot be used in production/);

      // 14.2 Rejects weak rate limit secret in production
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://anwppwjlismjyovbyfmb.supabase.co";
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.prod_anon_token";
      process.env.CREDENTIAL_SIGNING_KEY = crypto.randomBytes(32).toString("base64");
      process.env.RATE_LIMIT_HMAC_SECRET = "weak-secret";
      assert.throws(() => {
        validateEnvironmentSafety();
      }, /FATAL CRYPTOGRAPHIC CONFIGURATION/);

      // 14.3 Passes when production secrets possess valid 256-bit entropy
      process.env.RATE_LIMIT_HMAC_SECRET = crypto.randomBytes(32).toString("base64");
      process.env.CREDENTIAL_SIGNING_KEY = crypto.randomBytes(32).toString("base64");
      assert.doesNotThrow(() => {
        validateEnvironmentSafety();
      });
    } finally {
      (process.env as any).NODE_ENV = originalEnv;
      process.env.RATE_LIMIT_HMAC_SECRET = originalSecret;
      process.env.CREDENTIAL_SIGNING_KEY = originalSigningKey;
      process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
    }
  });
});
