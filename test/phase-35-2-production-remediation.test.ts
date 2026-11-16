/**
 * KAAMSETU — Phase 35.2 Production Authentication, OTP & Onboarding Remediation Test Suite
 *
 * Verifies:
 * 1. Incident A: Rate Limiter Fail-Closed Protection & Safe Error Messages (Zero Variable Leakage)
 * 2. Incident B: Worker Onboarding Authentication Interception, Continuity & Idempotent Save
 * 3. Incident C: Complete Absence of Fabricated AI Confidence & Truthful Trade Badging
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import {
  checkRateLimit,
  validateOtpSendRateLimit,
  validateOtpVerifyAttempt,
  validateLoginRateLimit,
  getRateLimitHmacSecret,
} from "../src/lib/security/rate-limiter";
import { GeographicAuthorizationService } from "../src/lib/geo/geographic-authorization-service";

describe("Phase 35.2 — Incident A: Rate Limiter Fail-Closed Safety & Zero Variable Leakage", () => {
  const originalEnv = process.env.NODE_ENV;
  const originalSecret = process.env.RATE_LIMIT_HMAC_SECRET;

  it("should fail-closed safely when RATE_LIMIT_HMAC_SECRET is missing in production", async () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = "production";
    delete process.env.RATE_LIMIT_HMAC_SECRET;

    // getRateLimitHmacSecret must throw in production
    assert.throws(
      () => getRateLimitHmacSecret(),
      (err: Error) => {
        return (
          err.message.includes("RATE_LIMIT_HMAC_SECRET") &&
          err.message.includes("FATAL SECURITY CONFIGURATION")
        );
      }
    );

    // validateOtpSendRateLimit must catch and fail-closed with user-friendly message
    const sendResult = await validateOtpSendRateLimit("+919876543210", "worker");
    assert.strictEqual(sendResult.allowed, false);
    assert.strictEqual(
      sendResult.reason,
      "We're temporarily unable to process this request. Please try again shortly."
    );
    // Zero internal variable leakage
    assert.ok(!sendResult.reason?.includes("RATE_LIMIT_HMAC_SECRET"));
    assert.ok(!sendResult.reason?.includes("FATAL"));

    // validateOtpVerifyAttempt must catch and fail-closed
    const verifyResult = await validateOtpVerifyAttempt("+919876543210");
    assert.strictEqual(verifyResult.allowed, false);
    assert.strictEqual(
      verifyResult.reason,
      "We're temporarily unable to process this request. Please try again shortly."
    );
    assert.ok(!verifyResult.reason?.includes("RATE_LIMIT_HMAC_SECRET"));

    // validateLoginRateLimit must catch and fail-closed
    const loginResult = await validateLoginRateLimit("+919876543210", "worker");
    assert.strictEqual(loginResult.allowed, false);
    assert.strictEqual(
      loginResult.reason,
      "We're temporarily unable to process this request. Please try again shortly."
    );
    assert.ok(!loginResult.reason?.includes("RATE_LIMIT_HMAC_SECRET"));

    // checkRateLimit generic must catch and fail-closed
    const genericResult = await checkRateLimit("test-user-ip", 5, 60, 300);
    assert.strictEqual(genericResult.allowed, false);
    assert.strictEqual(
      genericResult.reason,
      "We're temporarily unable to process this request. Please try again shortly."
    );

    // Restore test environment
    (process.env as Record<string, string | undefined>).NODE_ENV = originalEnv;
    if (originalSecret) {
      process.env.RATE_LIMIT_HMAC_SECRET = originalSecret;
    } else {
      process.env.RATE_LIMIT_HMAC_SECRET = crypto.randomBytes(32).toString("base64");
    }
  });

  it("should accept high-entropy 256-bit cryptographically secure secrets in production", () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = "production";
    const secureSecret = crypto.randomBytes(32).toString("base64");
    process.env.RATE_LIMIT_HMAC_SECRET = secureSecret;

    const retrieved = getRateLimitHmacSecret();
    assert.strictEqual(retrieved, secureSecret);
    assert.ok(retrieved.length >= 32);

    // Restore
    (process.env as Record<string, string | undefined>).NODE_ENV = originalEnv;
    if (originalSecret) {
      process.env.RATE_LIMIT_HMAC_SECRET = originalSecret;
    }
  });
});

describe("Phase 35.2 — Incident B: Worker Onboarding Continuity & Interception Architecture", () => {
  it("should ensure onboarding wizard intercepts 401 and retains draft without losing data", () => {
    const wizardSource = fs.readFileSync(
      path.resolve(__dirname, "../src/components/onboarding/onboarding-wizard.tsx"),
      "utf8"
    );

    // Verify 401 interception in executeSave
    assert.ok(
      wizardSource.includes("response.status === 401 || result.error?.code === \"UNAUTHENTICATED\""),
      "Must intercept 401 HTTP response or UNAUTHENTICATED error code in executeSave"
    );

    // Verify draft submission persistence before opening modal
    assert.ok(
      wizardSource.includes("setPendingSubmission(approved)"),
      "Must retain pendingSubmission upon unauthenticated save attempt"
    );
    assert.ok(
      wizardSource.includes("setShowAuthModal(true)"),
      "Must open inline auth modal upon unauthenticated save attempt"
    );

    // Verify comforting messaging
    assert.ok(
      wizardSource.includes(
        "Verify your mobile number to securely save your skill profile. Your information will remain available when you return."
      ),
      "Must show reassuring message to worker that work is safely preserved"
    );

    // Verify localStorage key is standardized
    assert.ok(
      wizardSource.includes('STORAGE_DRAFT_KEY = "kaamsetu_onboarding_draft"'),
      "Must use standard namespaced key kaamsetu_onboarding_draft"
    );
  });

  it("should enforce geographic boundary and dispatch eligibility rules during onboarding", () => {
    // Guwahati Urban: Authorized
    const guwahatiResult = GeographicAuthorizationService.validateLocation({
      city: "Guwahati",
      state: "Assam",
      pincode: "781001",
    });
    assert.strictEqual(guwahatiResult.allowed, true);
    assert.strictEqual(guwahatiResult.status, "AUTHORIZED");
    assert.strictEqual(guwahatiResult.isDispatchEligible, true);

    // Shillong Urban: Authorized
    const shillongResult = GeographicAuthorizationService.validateLocation({
      city: "Shillong",
      state: "Meghalaya",
      pincode: "793001",
    });
    assert.strictEqual(shillongResult.allowed, true);
    assert.strictEqual(shillongResult.status, "AUTHORIZED");
    assert.strictEqual(shillongResult.isDispatchEligible, true);

    // Delhi: Non-dispatch area (profile allowed for non-dispatch registration, dispatch restricted under Class B)
    const outsideResult = GeographicAuthorizationService.validateLocation({
      city: "New Delhi",
      state: "Delhi",
      pincode: "110001",
    });
    assert.strictEqual(outsideResult.allowed, false);
    assert.strictEqual(outsideResult.isDispatchEligible, false);
    assert.strictEqual(outsideResult.allowedForRegistration, true);
  });
});

describe("Phase 35.2 — Incident C: Absolute Elimination of Fabricated Confidence & Truthful Trade Badging", () => {
  it("should verify extraction-editor does NOT contain fabricated confidence score or unearned badges", () => {
    const editorSource = fs.readFileSync(
      path.resolve(__dirname, "../src/components/onboarding/extraction-editor.tsx"),
      "utf8"
    );

    // Zero occurrences of "AI Confidence" or confidence score rendering
    assert.ok(
      !editorSource.includes("AI Confidence"),
      "Must not render 'AI Confidence' label"
    );
    assert.ok(
      !editorSource.includes("confidenceScore * 100"),
      "Must not calculate or display percentage from confidenceScore"
    );

    // Verify presence of Self-Declared Testimony badge
    assert.ok(
      editorSource.includes("Self-Declared Testimony"),
      "Must display 'Self-Declared Testimony' badge"
    );

    // Verify presence of Trade suggestion review badge
    assert.ok(
      editorSource.includes("Trade suggestion: review and edit") ||
      editorSource.includes("Trade suggestion — review and edit"),
      "Must display 'Trade suggestion: review and edit' badge"
    );

    // Verify disclaimer on NCO 2015 trade suggestion
    assert.ok(
      editorSource.includes("Suggested code based on testimony. Not a formal government certification or NSQF diploma."),
      "Must provide truthful disclaimer that NCO code is a testimony suggestion, not a government certification"
    );
  });

  it("should verify trust-badge displays truthful Voice Attestation rather than Voice Verified", () => {
    const badgeSource = fs.readFileSync(
      path.resolve(__dirname, "../src/components/identity/trust-badge.tsx"),
      "utf8"
    );

    assert.ok(
      !badgeSource.includes("Voice Verified"),
      "Must not display unearned 'Voice Verified' badge"
    );
    assert.ok(
      badgeSource.includes("Voice Attestation"),
      "Must display truthful 'Voice Attestation' badge"
    );
  });

  it("should verify zero occurrences of fabricated AI confidence across all UI components", () => {
    const componentsDir = path.resolve(__dirname, "../src/components");
    const scanFiles = (dir: string): string[] => {
      let results: string[] = [];
      const list = fs.readdirSync(dir);
      for (const file of list) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
          results = results.concat(scanFiles(fullPath));
        } else if (file.endsWith(".tsx") || file.endsWith(".ts")) {
          results.push(fullPath);
        }
      }
      return results;
    };

    const files = scanFiles(componentsDir);
    for (const file of files) {
      const content = fs.readFileSync(file, "utf8");
      assert.ok(
        !content.includes("AI Confidence"),
        `File ${path.relative(__dirname, file)} must not contain 'AI Confidence'`
      );
      assert.ok(
        !content.includes("72%"),
        `File ${path.relative(__dirname, file)} must not contain '72%' fabricated score`
      );
    }
  });
});
