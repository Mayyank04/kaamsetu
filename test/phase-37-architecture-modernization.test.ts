/**
 * KAAMSETU — Phase 37 Architecture Modernization, Service Layer & Technical Debt Elimination Test Suite
 *
 * Verifies:
 * 1. Centralized Typed Error Hierarchy & Standard ApiResponse Envelopes
 * 2. Backward Compatibility Error Bridges (src/lib/error/handler.ts & app-error.ts)
 * 3. Centralized Indian Phone Normalization, Validation, and Privacy Masking
 * 4. Structured JSON Logger with Sensitive Field & PII Redaction
 * 5. Server Environment Service & Production Fail-Closed Behavior
 * 6. Constitutional Invariant Enforcement (platform_commission_amount = 0.00) in Repositories & Services
 * 7. Domain Service Operations (Worker Identity, Credentials, Geofencing, Grievance, Contractor Billing)
 * 8. Feature Layer Modules & Exports (src/features/)
 * 9. Phase 37 Architectural Documentation Integrity
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

// Errors
import {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  ExternalServiceError,
  DatabaseError,
  ConfigurationError,
  createSuccessResponse,
  handleApiError,
} from "../src/lib/errors";

// Backward Compatibility Bridge
import {
  AppError as LegacyAppError,
  handleApiError as legacyHandleApiError,
  createSuccessResponse as legacyCreateSuccessResponse,
} from "../src/lib/error/handler";

// Utilities
import {
  normalizeIndianPhone,
  isValidIndianPhone,
  maskPhoneNumber,
  formatIndianPhoneDisplay,
} from "../src/lib/utilities/phone";

// Logging
import { StructuredLogger } from "../src/server/logging/logger";

// Configuration
import { EnvironmentService } from "../src/server/configuration/environment";

// Repositories & Services
import { BookingRepository } from "../src/server/database/repositories/booking.repository";
import { PayoutService } from "../src/server/services/payout.service";
import { WorkerIdentityService } from "../src/server/services/worker-identity.service";
import { CredentialService } from "../src/server/services/credential.service";
import { GeographicAuthorizationService } from "../src/server/services/geographic-authorization.service";
import { GrievanceService } from "../src/server/services/grievance.service";
import { ContractorService } from "../src/server/services/contractor.service";

// Feature Modules
import * as ContractorsFeature from "../src/features/contractors";
import * as BookingsFeature from "../src/features/bookings";
import * as OnboardingFeature from "../src/features/onboarding";
import * as WorkerIdentityFeature from "../src/features/worker-identity";
import * as AuthFeature from "../src/features/authentication";

describe("Phase 37 — Section 1: Centralized Typed Error System & ApiResponse Envelopes", () => {
  it("should have all error classes properly subclassing AppError with correct status codes", () => {
    const validation = new ValidationError("Invalid field", { field: "city" });
    assert.strictEqual(validation instanceof AppError, true);
    assert.strictEqual(validation.statusCode, 400);
    assert.strictEqual(validation.code, "VALIDATION_ERROR");
    assert.deepStrictEqual(validation.details, { field: "city" });

    const auth = new AuthenticationError();
    assert.strictEqual(auth.statusCode, 401);
    assert.strictEqual(auth.code, "UNAUTHENTICATED");

    const forbidden = new AuthorizationError();
    assert.strictEqual(forbidden.statusCode, 403);
    assert.strictEqual(forbidden.code, "FORBIDDEN");

    const notFound = new NotFoundError("Worker", "w-101");
    assert.strictEqual(notFound.statusCode, 404);
    assert.strictEqual(notFound.code, "NOT_FOUND");
    assert.strictEqual(notFound.message.includes("w-101"), true);

    const conflict = new ConflictError("Resource already exists");
    assert.strictEqual(conflict.statusCode, 409);
    assert.strictEqual(conflict.code, "CONFLICT");

    const rateLimit = new RateLimitError();
    assert.strictEqual(rateLimit.statusCode, 429);
    assert.strictEqual(rateLimit.code, "RATE_LIMIT_EXCEEDED");

    const external = new ExternalServiceError("DigiLocker");
    assert.strictEqual(external.statusCode, 502);
    assert.strictEqual(external.code, "DIGILOCKER_GATEWAY_ERROR");

    const dbErr = new DatabaseError("Connection timeout");
    assert.strictEqual(dbErr.statusCode, 500);
    assert.strictEqual(dbErr.code, "DATABASE_ERROR");

    const configErr = new ConfigurationError("RATE_LIMIT_HMAC_SECRET missing");
    assert.strictEqual(configErr.statusCode, 500);
    assert.strictEqual(configErr.code, "CONFIGURATION_ERROR");
  });

  it("should construct valid success response envelopes", async () => {
    const payload = { id: "w-pro-01", name: "Rameshwar Sharma" };
    const res = createSuccessResponse(payload, { message: "Profile loaded" }, 200);

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.deepStrictEqual(body.data, payload);
    assert.strictEqual(body.metadata.message, "Profile loaded");
    assert.ok(body.metadata.requestId.startsWith("req_"));
    assert.ok(Date.parse(body.metadata.timestamp) > 0);
  });

  it("should format errors into structured API error envelopes via handleApiError", async () => {
    const err = new ValidationError("Invalid PIN code", { pin: "000000" });
    const res = handleApiError(err);

    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error.code, "VALIDATION_ERROR");
    assert.strictEqual(body.error.message, "Invalid PIN code");
    assert.deepStrictEqual(body.error.details, { pin: "000000" });
    assert.ok(body.error.requestId.startsWith("req_"));
  });

  it("should maintain 100% backward compatibility via src/lib/error/handler.ts re-export bridge", async () => {
    const err = new LegacyAppError("Legacy error", 400, "BAD_REQUEST");
    const res = legacyHandleApiError(err);
    assert.strictEqual(res.status, 400);

    const successRes = legacyCreateSuccessResponse({ test: true });
    assert.strictEqual(successRes.status, 200);
    const body = await successRes.json();
    assert.strictEqual(body.success, true);
  });
});

describe("Phase 37 — Section 2: Indian Phone Normalization & Privacy Masking", () => {
  it("should normalize diverse Indian phone formats into canonical +91 and 10-digit strings", () => {
    const testCases = [
      { input: "+91 98765-43210", expectedClean: "9876543210", expectedFormatted: "+919876543210" },
      { input: "9876543210", expectedClean: "9876543210", expectedFormatted: "+919876543210" },
      { input: "09876543210", expectedClean: "9876543210", expectedFormatted: "+919876543210" },
      { input: "+919876543210", expectedClean: "9876543210", expectedFormatted: "+919876543210" },
      { input: "+91 98765 43210", expectedClean: "9876543210", expectedFormatted: "+919876543210" },
    ];

    for (const tc of testCases) {
      const res = normalizeIndianPhone(tc.input);
      assert.strictEqual(res.clean10, tc.expectedClean);
      assert.strictEqual(res.formatted, tc.expectedFormatted);
    }
  });

  it("should validate valid mobile carrier prefixes (6, 7, 8, 9) and reject invalid numbers", () => {
    assert.strictEqual(isValidIndianPhone("9876543210"), true);
    assert.strictEqual(isValidIndianPhone("8123456789"), true);
    assert.strictEqual(isValidIndianPhone("7012345678"), true);
    assert.strictEqual(isValidIndianPhone("6301234567"), true);

    // Invalid: leading 5, too short, letters
    assert.strictEqual(isValidIndianPhone("5123456789"), false);
    assert.strictEqual(isValidIndianPhone("98765"), false);
    assert.strictEqual(isValidIndianPhone("abcdefghij"), false);
  });

  it("should correctly mask Indian phone numbers for public privacy", () => {
    assert.strictEqual(maskPhoneNumber("+91 98765-43210"), "+91 98*** ***10");
    assert.strictEqual(maskPhoneNumber("9876543210"), "+91 98*** ***10");
  });

  it("should format 10-digit phone for clean UI display", () => {
    assert.strictEqual(formatIndianPhoneDisplay("9876543210"), "+91 98765 43210");
  });
});

describe("Phase 37 — Section 3: Structured Logging & Sensitive Key Redaction", () => {
  it("should automatically redact sensitive keys from log output", () => {
    const sensitiveData = {
      user_id: "u-123",
      token: "secret_jwt_token_value",
      otp: "654321",
      aadhaar: "1234 5678 9012",
      password: "SuperSecretPassword123!",
      private_key: "BEGIN PRIVATE KEY...",
      trade: "Electrician",
    };

    const sanitized = StructuredLogger.sanitize(sensitiveData) as Record<string, unknown>;
    assert.strictEqual(sanitized.user_id, "u-123");
    assert.strictEqual(sanitized.trade, "Electrician");
    assert.strictEqual(sanitized.token, "[REDACTED]");
    assert.strictEqual(sanitized.otp, "[REDACTED]");
    assert.strictEqual(sanitized.aadhaar, "[REDACTED]");
    assert.strictEqual(sanitized.password, "[REDACTED]");
    assert.strictEqual(sanitized.private_key, "[REDACTED]");
  });
});

describe("Phase 37 — Section 4: Fail-Closed Environment Service", () => {
  it("should fail closed in production when RATE_LIMIT_HMAC_SECRET is missing", () => {
    const envService = new EnvironmentService({
      NODE_ENV: "production",
      // RATE_LIMIT_HMAC_SECRET omitted
    });

    assert.throws(
      () => {
        envService.getRateLimitSecret();
      },
      (err: unknown) => {
        return err instanceof ConfigurationError && err.message.includes("RATE_LIMIT_HMAC_SECRET");
      }
    );
  });

  it("should provide safe development fallback when not in production", () => {
    const envService = new EnvironmentService({
      NODE_ENV: "development",
    });

    const secret = envService.getRateLimitSecret();
    assert.ok(secret.length >= 32);
  });
});

describe("Phase 37 — Section 5: Permanent Constitutional Invariant (platform_commission = 0.00)", () => {
  it("BookingRepository.create should reject any non-zero platform_commission_amount", async () => {
    await assert.rejects(
      async () => {
        await BookingRepository.create({
          customer_id: "c-1",
          worker_profile_id: "w-1",
          service_title: "Electrical Wiring",
          location_address: "GS Road, Guwahati",
          location_city: "Guwahati",
          scheduled_start: new Date().toISOString(),
          // Violation attempt
          platform_commission_amount: 150.0,
        } as any);
      },
      (err: unknown) => {
        return err instanceof ValidationError && err.message.includes("platform_commission_amount");
      }
    );
  });

  it("PayoutService.validateZeroCommission should reject wage deductions where actualPayout < declaredAmount", () => {
    // Valid payout: 100% disbursed
    assert.doesNotThrow(() => {
      PayoutService.validateZeroCommission({
        workerProfileId: "w-1",
        contractorOrganizationId: "org-1",
        actualPayoutAmount: 4500,
        contractorDeclaredAmount: 4500,
        workerAgreedAmount: 4500,
        payoutMethod: "bank_transfer",
        payoutReference: "UTR-2026-9999",
      });
    });

    // Invariant violation: deduction attempted
    assert.throws(
      () => {
        PayoutService.validateZeroCommission({
          workerProfileId: "w-1",
          contractorOrganizationId: "org-1",
          actualPayoutAmount: 4000, // 500 deducted
          contractorDeclaredAmount: 4500,
          workerAgreedAmount: 4500,
          payoutMethod: "bank_transfer",
          payoutReference: "UTR-2026-9999",
        });
      },
      (err: unknown) => {
        return err instanceof ValidationError && err.message.includes("Constitutional Invariant Violation");
      }
    );
  });
});

describe("Phase 37 — Section 6: Domain Service Layer Operations", () => {
  it("WorkerIdentityService should compute authentic evidence-backed KaamScore", () => {
    const breakdown = WorkerIdentityService.evaluateScore({
      hasVoiceAttestation: true,
      workerConfirmedVoice: true,
      yearsExperience: 8,
      verifiedSkillsCount: 3,
      completedBookingsCount: 12,
      peerEndorsementsCount: 2,
      officialGovVerified: false,
    });

    assert.ok(breakdown.totalScore > 0);
    assert.ok(breakdown.totalScore <= breakdown.maxPossibleScore);
    assert.strictEqual(typeof breakdown.tier, "string");
    assert.ok(breakdown.dimensions.length >= 5);
  });

  it("CredentialService should sign and verify canonical Ed25519 credentials", () => {
    const payload = {
      registryId: "IN-AS-2026-7890-KS",
      workerProfileId: "w-pro-test-01",
      fullName: "Pranab Gogoi",
      primaryTrade: "Solar Grid Technician",
      category: "Renewable Energy",
      nsqfLevel: 4,
      issuer: "KAAMSETU National Workforce Trust Protocol" as const,
      issuedAt: new Date().toISOString(),
      status: "active" as const,
    };

    const signed = CredentialService.signCredential(payload);
    assert.strictEqual(signed.algorithm, "Ed25519");
    assert.ok(signed.signature.length > 64);
    assert.ok(signed.canonicalHash.length === 64);

    const verification = CredentialService.verifyCredential(payload, signed.signature);
    assert.strictEqual(verification.isValid, true);
    assert.strictEqual(verification.status, "active");
  });

  it("GeographicAuthorizationService should enforce Class B rollout boundaries", () => {
    // Permitted: Guwahati Urban
    const guwahati = GeographicAuthorizationService.validateLocation({
      city: "Guwahati",
      state: "Assam",
      pincode: "781005",
    });
    assert.strictEqual(guwahati.allowed, true);
    assert.strictEqual(guwahati.district, "Kamrup Metropolitan");

    // Permitted: Shillong Urban
    const shillong = GeographicAuthorizationService.validateLocation({
      city: "Shillong",
      state: "Meghalaya",
      pincode: "793001",
    });
    assert.strictEqual(shillong.allowed, true);
    assert.strictEqual(shillong.district, "East Khasi Hills");

    // Rejected: Mumbai (Out of bounds)
    const mumbai = GeographicAuthorizationService.validateLocation({
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
    });
    assert.strictEqual(mumbai.allowed, false);
    assert.strictEqual(mumbai.status, "OUT_OF_BOUNDS");
  });

  it("GrievanceService should quarantine retaliatory reviews within 14 days of an active dispute", () => {
    const quarantined = GrievanceService.evaluateRetaliatoryReview({
      reviewRating: 1,
      hasActiveDisputeWithReviewer: true,
      daysSinceDisputeOpened: 5,
    });
    assert.strictEqual(quarantined.shouldQuarantine, true);
    assert.ok(quarantined.quarantineReason?.includes("quarantined"));

    const normalReview = GrievanceService.evaluateRetaliatoryReview({
      reviewRating: 5,
      hasActiveDisputeWithReviewer: false,
      daysSinceDisputeOpened: 0,
    });
    assert.strictEqual(normalReview.shouldQuarantine, false);
  });

  it("ContractorService should calculate subscription billing with 18% GST", () => {
    const proBreakdown = ContractorService.getBillingBreakdown("pro", "monthly");
    assert.strictEqual(proBreakdown.tier, "pro");
    assert.strictEqual(proBreakdown.gstRate, 0.18);
    assert.strictEqual(
      proBreakdown.totalAmount,
      Math.round((proBreakdown.taxableAmount + proBreakdown.gstAmount) * 100) / 100
    );
  });
});

describe("Phase 37 — Section 7: Feature Layer Organization (src/features/)", () => {
  it("Contractors feature should export billing calculator and contractor service", () => {
    assert.strictEqual(typeof ContractorsFeature.calculateBillingBreakdown, "function");
    assert.strictEqual(typeof ContractorsFeature.ContractorService, "function");
    assert.ok(ContractorsFeature.PRICING_PLANS.pro);
  });

  it("Bookings feature should export booking service and booking repository", () => {
    assert.strictEqual(typeof BookingsFeature.BookingService, "function");
    assert.strictEqual(typeof BookingsFeature.BookingRepository, "function");
  });

  it("Onboarding feature should export onboarding service and submission schema", () => {
    assert.strictEqual(typeof OnboardingFeature.OnboardingService, "function");
    assert.strictEqual(typeof OnboardingFeature.approvedProfileSubmissionSchema, "object");
  });

  it("Worker Identity feature should export worker identity service and worker repository", () => {
    assert.strictEqual(typeof WorkerIdentityFeature.WorkerIdentityService, "function");
    assert.strictEqual(typeof WorkerIdentityFeature.WorkerRepository, "function");
  });

  it("Authentication feature should export auth session and OTP helpers", () => {
    assert.strictEqual(typeof AuthFeature.requireAuth, "function");
    assert.strictEqual(typeof AuthFeature.requireUserRole, "function");
  });
});

describe("Phase 37 — Section 8: Technical Documentation Completeness", () => {
  const rootDir = process.cwd();

  it("should have root ARCHITECTURE.md and CONTRIBUTING.md", () => {
    assert.strictEqual(fs.existsSync(path.join(rootDir, "ARCHITECTURE.md")), true);
    assert.strictEqual(fs.existsSync(path.join(rootDir, "CONTRIBUTING.md")), true);
  });

  it("should have all 10 Phase 37 technical specification documents in docs/phase-37/", () => {
    const requiredDocs = [
      "INITIAL_ARCHITECTURE_AUDIT.md",
      "TARGET_ARCHITECTURE.md",
      "ENVIRONMENT_CONFIGURATION.md",
      "ERROR_HANDLING_GUIDE.md",
      "REFACTORING_REGISTER.md",
      "DEAD_CODE_AND_DUPLICATION_REGISTER.md",
      "API_ARCHITECTURE.md",
      "STATE_MANAGEMENT_GUIDE.md",
      "TESTING_STRATEGY.md",
      "FINAL_ARCHITECTURE_CERTIFICATION.md",
    ];

    for (const doc of requiredDocs) {
      const docPath = path.join(rootDir, "docs/phase-37", doc);
      assert.strictEqual(fs.existsSync(docPath), true, `Missing required documentation: ${doc}`);
      const content = fs.readFileSync(docPath, "utf-8");
      assert.ok(content.length > 500, `Documentation file ${doc} must not be a placeholder`);
    }
  });
});
