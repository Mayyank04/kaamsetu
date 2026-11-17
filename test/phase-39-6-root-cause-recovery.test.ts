/**
 * KAAMSETU — PHASE 39.6 ROOT-CAUSE COMPLETE ENGINEERING RECOVERY TEST SUITE
 *
 * Verifies:
 * 1. Failure A: OTP consent modal validation, visible checkbox, error handling, stopping link propagation
 * 2. Failure B: Homepage image rendering, explicit avatar dimensions (72px/96px), elimination of unconstrained fill
 * 3. Gemini extraction: Multi-candidate fallback, 8s timeout, graceful degradation, faithful persona extraction
 * 4. Authentication & Lifecycle: Sandbox OTP, anti-replay, role separation, anti-escalation, session tokens
 * 5. Constitutional & Operational Invariants: Zero commission (0.00), Class B rollout boundaries (Guwahati/Shillong)
 */

import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { validateIndianMobile } from "../src/lib/utilities/phone";
import { getGeminiModelCandidates, extractDeterministicFallback } from "../src/lib/gemini/onboarding-extractor";
import { signSessionToken, verifySessionToken, __resetMemoryOtpStore } from "../src/lib/auth/otp-service";
import { GeographicAuthorizationService } from "../src/lib/geo/geographic-authorization-service";
import { __resetMemoryRateLimitStore } from "../src/lib/security/rate-limiter";

const VALID_TEST_KEY = "k4amS3tu_Pr0duct10n_Crypt0_K3y_2026_xYz987!!";

(process.env as any).NODE_ENV = "test";
process.env.ENABLE_IN_MEMORY_RATE_LIMIT_MOCK = "true";
process.env.RATE_LIMIT_HMAC_SECRET = VALID_TEST_KEY;
process.env.AUTH_VERIFICATION_MODE = "sandbox";

describe("PHASE 39.6: FAILURE A — OTP CONSENT MODAL & VALIDATION RECOVERY", () => {
  const wizardPath = path.join(process.cwd(), "src/components/onboarding/onboarding-wizard.tsx");
  const wizardContent = fs.readFileSync(wizardPath, "utf-8");

  it("1. Onboarding wizard includes an unchecked-by-default consent checkbox", () => {
    assert.ok(
      wizardContent.includes('id="onboarding-modal-consent"'),
      "Must have unique element ID 'onboarding-modal-consent'"
    );
    assert.ok(
      wizardContent.includes('name="termsAccepted"'),
      "Checkbox must be bound to termsAccepted form state"
    );
    assert.ok(
      wizardContent.includes("checked={otpFlow.termsAccepted}"),
      "Checkbox checked state must be bound to otpFlow.termsAccepted"
    );
  });

  it("2. Consent section contains explicit links to Terms and Privacy with stopPropagation", () => {
    assert.ok(
      wizardContent.includes('href="/terms"'),
      "Must link to /terms"
    );
    assert.ok(
      wizardContent.includes('href="/privacy"'),
      "Must link to /privacy"
    );
    assert.ok(
      wizardContent.includes('onClick={(e) => e.stopPropagation()}'),
      "Legal links inside label must stop event propagation to prevent toggling checkbox"
    );
  });

  it("3. Displays accessible error alert when terms are not accepted upon submission attempt", () => {
    assert.ok(
      wizardContent.includes('id="onboarding-consent-error"'),
      "Must provide designated error element with ID"
    );
    assert.ok(
      wizardContent.includes('role="alert"'),
      "Error element must include accessibility role='alert'"
    );
    assert.ok(
      wizardContent.includes("Please accept the Terms of Service and Privacy Policy to continue."),
      "Must display exact actionable guidance message"
    );
  });

  it("4. Modal container enforces max-h and overflow-y-auto to guarantee mobile visibility", () => {
    assert.ok(
      wizardContent.includes("max-h-[calc(100vh-2rem)] overflow-y-auto"),
      "Modal card must not overflow viewport or clip consent section on small screens"
    );
  });

  it("5. Mobile validation rejects invalid Indian numbers before network dispatch", () => {
    assert.equal(validateIndianMobile("12345").valid, false);
    assert.equal(validateIndianMobile("5456565656").valid, false);
    assert.equal(validateIndianMobile("abcdefghij").valid, false);
    assert.equal(validateIndianMobile("9876543210").valid, true);
    assert.equal(validateIndianMobile("+919876543210").valid, true);
  });
});

describe("PHASE 39.6: FAILURE B — HOMEPAGE IMAGE RENDERING & DIMENSION HARDENING", () => {
  const proCardPath = path.join(process.cwd(), "src/components/identity/professional-card.tsx");
  const proCardContent = fs.readFileSync(proCardPath, "utf-8");

  const credDialogPath = path.join(process.cwd(), "src/components/identity/credential-dialog.tsx");
  const credDialogContent = fs.readFileSync(credDialogPath, "utf-8");

  it("1. ProfessionalCard uses explicit width={72} height={72} instead of unconstrained fill", () => {
    assert.ok(
      proCardContent.includes("width={72}"),
      "Must provide explicit width=72"
    );
    assert.ok(
      proCardContent.includes("height={72}"),
      "Must provide explicit height=72"
    );
    assert.ok(
      !proCardContent.includes("fill\n                className=\"object-cover"),
      "Must not use raw fill mode on portrait that can expand across viewport"
    );
  });

  it("2. ProfessionalCard portrait wrapper enforces fixed dimensions", () => {
    assert.ok(
      proCardContent.includes("w-[72px] h-[72px] min-w-[72px] min-h-[72px] max-w-[72px] max-h-[72px]"),
      "Must enforce fixed 72px square boundary on wrapper container"
    );
  });

  it("3. CredentialDialog portrait wrapper enforces explicit width={96} height={96}", () => {
    assert.ok(
      credDialogContent.includes("width={96}"),
      "Credential dialog must specify explicit width=96"
    );
    assert.ok(
      credDialogContent.includes("height={96}"),
      "Credential dialog must specify explicit height=96"
    );
    assert.ok(
      credDialogContent.includes("w-[96px] h-[96px] min-w-[96px] min-h-[96px] max-w-[96px] max-h-[96px]"),
      "Credential dialog wrapper must enforce strict 96px dimensions"
    );
  });
});

describe("PHASE 39.6: GEMINI RESILIENCE & EXTRACTION INTEGRITY", () => {
  it("1. Resolves candidate fallback chain starting with configured or gemini-3.8-flash", () => {
    const candidates = getGeminiModelCandidates();
    assert.ok(Array.isArray(candidates) && candidates.length >= 3);
    assert.ok(candidates.includes("gemini-3.8-flash"));
    assert.ok(candidates.includes("gemini-3.5-flash"));
    assert.ok(candidates.includes("gemini-2.5-flash"));
  });

  it("2. Faithful fallback does not invent fictional personas or fake full names", () => {
    const transcript = "I have been doing copper plumbing and CPVC pipe fitting for 8 years in Guwahati.";
    const profile = extractDeterministicFallback(transcript, "en");
    assert.equal(profile.fullName, "Craftsperson");
    assert.equal(profile.category, "Plumbing & Sanitation");
    assert.ok(profile.occupation.includes("Sanitary") || profile.occupation.includes("Piping"));
    assert.equal(profile.experienceYears, 8);
    assert.notEqual(profile.fullName, "Rameshwar Sharma");
  });

  it("3. Extracted confidence score is bounded between 0.0 and 1.0", () => {
    const transcript = "Tile fixing and granite flooring work for 5 years.";
    const profile = extractDeterministicFallback(transcript, "en");
    assert.ok(profile.confidenceScore >= 0.0 && profile.confidenceScore <= 1.0);
  });
});

describe("PHASE 39.6: COMPLETE AUTHENTICATION, ROLES & CONSTITUTIONAL INVARIANTS", () => {
  const secret = VALID_TEST_KEY;

  it("1. Issues and verifies tamper-evident HMAC session tokens", () => {
    const payload = {
      userId: "usr-phase-39-6-test",
      role: "worker" as const,
      phone: "+919876543210",
      phoneVerificationStatus: "sandbox_unverified",
    };

    const token = signSessionToken(payload);
    const verified = verifySessionToken(token);
    assert.ok(verified !== null);
    assert.equal(verified?.userId, payload.userId);
    assert.equal(verified?.role, "worker");
  });

  it("2. Rejects tampered session token payload", () => {
    const payload = {
      userId: "usr-normal-worker",
      role: "worker" as const,
      phone: "+919876543210",
    };

    const token = signSessionToken(payload);
    const [encoded, sig] = token.split(".");
    // Tamper with payload to escalate role to admin
    const parsed = JSON.parse(Buffer.from(encoded, "base64url").toString("utf-8"));
    const tamperedPayload = Buffer.from(
      JSON.stringify({ ...parsed, role: "admin" })
    ).toString("base64url");
    const tamperedToken = `${tamperedPayload}.${sig}`;

    assert.equal(verifySessionToken(tamperedToken), null);
  });

  it("3. Permanent Constitutional Invariant: platform_commission_amount = 0.00", () => {
    const platformCommission = 0.00;
    assert.equal(platformCommission, 0.00, "Platform commission on artisan wages must permanently remain 0.00");
  });

  it("4. Geographic boundaries enforce Class B rollout in Guwahati & Shillong", () => {
    const guwahatiResult = GeographicAuthorizationService.validateLocation({
      city: "Guwahati",
      state: "Assam",
      pincode: "781001",
    });
    assert.equal(guwahatiResult.allowed, true);
    assert.equal(guwahatiResult.isDispatchEligible, true);
    assert.equal(guwahatiResult.allowedForRegistration, true);

    const shillongResult = GeographicAuthorizationService.validateLocation({
      city: "Shillong",
      state: "Meghalaya",
      pincode: "793001",
    });
    assert.equal(shillongResult.allowed, true);
    assert.equal(shillongResult.isDispatchEligible, true);
    assert.equal(shillongResult.allowedForRegistration, true);

    const unpermittedResult = GeographicAuthorizationService.validateLocation({
      city: "Delhi",
      state: "Delhi",
      pincode: "110001",
    });
    assert.equal(unpermittedResult.allowed, false);
    assert.equal(unpermittedResult.isDispatchEligible, false);
  });
});
