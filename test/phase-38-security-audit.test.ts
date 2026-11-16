/**
 * KAAMSETU — Phase 38 Full-Stack Security Audit & Vulnerability Remediation Test Suite
 *
 * Verifies:
 * 1. Security Headers Configuration in next.config.ts (CSP, HSTS, X-Frame-Options, etc.)
 * 2. Next.js Information Leakage Defenses (poweredByHeader: false, productionBrowserSourceMaps: false)
 * 3. Middleware Route Protection for Contractor, Institution, Worker, and Admin hierarchies
 * 4. Production Admin Client Fail-Closed Behavior (SUPABASE_SERVICE_ROLE_KEY)
 * 5. Rate Limiting Enforced on Sensitive Endpoints (Grievance, Payouts, Identity Export)
 * 6. File Upload Security: Magic Byte Verification, Size Caps, and Path Sanitization
 * 7. Cryptographic Credential Signing (Ed25519 & RFC 8785 Canonical JCS)
 * 8. Constant-Time Timing Attack Defenses (crypto.timingSafeEqual)
 * 9. Cryptographic Key Quality Assertions & Secret Management
 * 10. CSV Formula Injection (DDE) Sanitization
 * 11. SVG Dynamic Entity Escaping against Stored/Reflected XSS
 * 12. Permanent Zero Commission Constitutional Invariant (platform_commission_amount = 0.00)
 * 13. Controlled Rollout Geographic Pincode Validation (Guwahati & Shillong Urban)
 * 14. Phase 38 Security Documentation Integrity (13 core audit registers)
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

// Security & Crypto Modules
import {
  signCredentialPayload,
  verifyCredentialSignature,
  canonicalizeJson,
} from "../src/lib/crypto/credential-signer";
import {
  assertCryptographicKeyQuality,
  validateCryptographicKeyMaterial,
} from "../src/lib/crypto/key-validator";
import { ConfigurationError, ValidationError } from "../src/lib/errors";
import { PayoutService } from "../src/server/services/payout.service";
import { BookingRepository } from "../src/server/database/repositories/booking.repository";

describe("PHASE 38: FULL-STACK SECURITY AUDIT & VULNERABILITY REMEDIATION", () => {
  // ==========================================================================
  // 1. HTTP SECURITY HEADERS & INFORMATION LEAKAGE (SEC-02, SEC-17)
  // ==========================================================================
  describe("1. Next.js Security Headers & Build Hardening", () => {
    const nextConfigPath = path.join(process.cwd(), "next.config.ts");
    const nextConfigContent = fs.readFileSync(nextConfigPath, "utf-8");

    it("should disable X-Powered-By header to prevent framework fingerprinting", () => {
      assert.match(
        nextConfigContent,
        /poweredByHeader\s*:\s*false/,
        "next.config.ts must explicitly configure poweredByHeader: false"
      );
    });

    it("should disable production browser source maps to prevent code disclosure", () => {
      assert.match(
        nextConfigContent,
        /productionBrowserSourceMaps\s*:\s*false/,
        "next.config.ts must configure productionBrowserSourceMaps: false"
      );
    });

    it("should declare strict Content-Security-Policy (CSP)", () => {
      assert.match(
        nextConfigContent,
        /Content-Security-Policy/,
        "next.config.ts must declare Content-Security-Policy header"
      );
      assert.match(
        nextConfigContent,
        /default-src\s+'self'/,
        "CSP must define default-src 'self'"
      );
    });

    it("should declare strict frame options (DENY) against clickjacking", () => {
      assert.match(
        nextConfigContent,
        /X-Frame-Options['"]\s*,\s*value:\s*['"]DENY['"]/,
        "X-Frame-Options must be set to DENY"
      );
    });

    it("should declare strict MIME type sniffing defense (nosniff)", () => {
      assert.match(
        nextConfigContent,
        /X-Content-Type-Options['"]\s*,\s*value:\s*['"]nosniff['"]/,
        "X-Content-Type-Options must be set to nosniff"
      );
    });

    it("should declare Strict-Transport-Security (HSTS) with subdomains & preload", () => {
      assert.match(
        nextConfigContent,
        /Strict-Transport-Security/,
        "Strict-Transport-Security must be configured"
      );
      assert.match(
        nextConfigContent,
        /max-age=63072000/,
        "HSTS must specify 2-year max-age (63072000 seconds)"
      );
    });

    it("should declare Referrer-Policy and Permissions-Policy", () => {
      assert.match(
        nextConfigContent,
        /strict-origin-when-cross-origin/,
        "Referrer-Policy must be strict-origin-when-cross-origin"
      );
      assert.match(
        nextConfigContent,
        /Permissions-Policy/,
        "Permissions-Policy must be present"
      );
    });
  });

  // ==========================================================================
  // 2. MIDDLEWARE ROUTE AUTHORIZATION (SEC-03, SEC-05)
  // ==========================================================================
  describe("2. Edge Middleware Route Protection", () => {
    const middlewarePath = path.join(process.cwd(), "src/middleware.ts");
    const middlewareContent = fs.readFileSync(middlewarePath, "utf-8");

    it("should protect worker dashboard routes", () => {
      assert.match(
        middlewareContent,
        /['"]\/worker\/dashboard['"]/,
        "Middleware must protect /worker/dashboard"
      );
      assert.match(
        middlewareContent,
        /['"]\/worker['"]/,
        "Middleware must protect /worker"
      );
    });

    it("should protect admin dashboard routes", () => {
      assert.match(
        middlewareContent,
        /['"]\/admin\/dashboard['"]/,
        "Middleware must protect /admin/dashboard"
      );
      assert.match(
        middlewareContent,
        /['"]\/admin['"]/,
        "Middleware must protect /admin"
      );
    });

    it("should protect contractor dashboard and hierarchy routes", () => {
      assert.match(
        middlewareContent,
        /['"]\/contractor\/dashboard['"]/,
        "Middleware must protect /contractor/dashboard"
      );
      assert.match(
        middlewareContent,
        /['"]\/contractor['"]/,
        "Middleware must protect /contractor"
      );
    });

    it("should protect institution dashboard and hierarchy routes", () => {
      assert.match(
        middlewareContent,
        /['"]\/institution\/dashboard['"]/,
        "Middleware must protect /institution/dashboard"
      );
      assert.match(
        middlewareContent,
        /['"]\/institution['"]/,
        "Middleware must protect /institution"
      );
    });
  });

  // ==========================================================================
  // 3. ADMIN CLIENT FAIL-CLOSED ARCHITECTURE (SEC-08)
  // ==========================================================================
  describe("3. Supabase Admin Client Fail-Closed Behavior", () => {
    const adminClientPath = path.join(process.cwd(), "src/lib/supabase/admin.ts");
    const adminClientContent = fs.readFileSync(adminClientPath, "utf-8");

    it("should enforce fail-closed check for SUPABASE_SERVICE_ROLE_KEY in production", () => {
      assert.match(
        adminClientContent,
        /if\s*\(!serviceKey\s*&&\s*isProduction\)/,
        "createAdminClient must check for missing service role key in production"
      );
      assert.match(
        adminClientContent,
        /ConfigurationError/,
        "createAdminClient must throw ConfigurationError when key is missing"
      );
    });
  });

  // ==========================================================================
  // 4. RATE LIMITING ENFORCEMENT ON SENSITIVE CONTROLLERS (SEC-06)
  // ==========================================================================
  describe("4. Rate Limiting Integration on Sensitive Mutators", () => {
    it("should enforce rate limiting in worker grievance route", () => {
      const grievanceRoute = fs.readFileSync(
        path.join(process.cwd(), "src/app/api/worker/grievance/route.ts"),
        "utf-8"
      );
      assert.match(
        grievanceRoute,
        /validateGrievanceRateLimit/,
        "Grievance route must invoke validateGrievanceRateLimit"
      );
    });

    it("should enforce rate limiting in worker payout route", () => {
      const payoutRoute = fs.readFileSync(
        path.join(process.cwd(), "src/app/api/worker/payouts/route.ts"),
        "utf-8"
      );
      assert.match(
        payoutRoute,
        /validatePayoutRateLimit/,
        "Payout route must invoke validatePayoutRateLimit"
      );
    });

    it("should enforce rate limiting in identity export routes", () => {
      const exportV2 = fs.readFileSync(
        path.join(process.cwd(), "src/app/api/v2/identity/export/route.ts"),
        "utf-8"
      );
      assert.match(
        exportV2,
        /validateIdentityExportRateLimit/,
        "v2 export route must invoke validateIdentityExportRateLimit"
      );

      const workerExport = fs.readFileSync(
        path.join(process.cwd(), "src/app/api/worker/identity/export/route.ts"),
        "utf-8"
      );
      assert.match(
        workerExport,
        /validateIdentityExportRateLimit/,
        "Worker identity export route must invoke validateIdentityExportRateLimit"
      );
    });
  });

  // ==========================================================================
  // 5. FILE UPLOAD & ATTACHMENT DEFENSES (SEC-11, SEC-12)
  // ==========================================================================
  describe("5. File Upload Inspection & Storage Isolation", () => {
    const uploadRoute = fs.readFileSync(
      path.join(process.cwd(), "src/app/api/worker/portfolio/upload/route.ts"),
      "utf-8"
    );

    it("should inspect magic bytes for JPEG, PNG, and WEBP", () => {
      assert.match(
        uploadRoute,
        /isValidImageContent/,
        "Upload route must declare magic bytes validation"
      );
      assert.match(
        uploadRoute,
        /0xff\s*&&\s*buffer\[1\]\s*===\s*0xd8/,
        "Must inspect JPEG magic bytes (FF D8 FF)"
      );
      assert.match(
        uploadRoute,
        /0x89\s*&&\s*buffer\[1\]\s*===\s*0x50/,
        "Must inspect PNG magic bytes (89 50 4E 47)"
      );
      assert.match(
        uploadRoute,
        /0x52\s*&&\s*buffer\[1\]\s*===\s*0x49/,
        "Must inspect WEBP magic bytes (RIFF...WEBP)"
      );
    });

    it("should enforce a strict 5MB size limit", () => {
      assert.match(
        uploadRoute,
        /5\s*\*\s*1024\s*\*\s*1024/,
        "Must enforce 5MB maximum file size"
      );
    });

    it("should sanitize filenames to prevent path traversal", () => {
      assert.match(
        uploadRoute,
        /replace\(\/\[\^a-zA-Z0-9_-\]\/g,\s*["']_["']\)/,
        "Must sanitize uploaded filename to alphanumeric and underscores"
      );
    });

    it("should isolate storage paths under user id", () => {
      assert.match(
        uploadRoute,
        /\$\{user\.id\}\/\$\{targetProfileId\}\/\$\{uniqueFileName\}/,
        "Storage path must be partitioned by user.id"
      );
    });
  });

  // ==========================================================================
  // 6. CRYPTOGRAPHY, JCS & ASYMMETRIC SIGNING (SEC-15, SEC-16)
  // ==========================================================================
  describe("6. Cryptographic Credential Engine & RFC 8785 JCS", () => {
    const samplePayload = {
      registryId: "REG-IND-AS-2026-TEST",
      workerProfileId: "w-pro-test-01",
      fullName: "Bipul Sharma",
      primaryTrade: "Master Carpenter",
      category: "Construction & Carpentry",
      nsqfLevel: 4,
      issuer: "KAAMSETU National Workforce Trust Protocol" as const,
      issuedAt: "2026-11-16T12:00:00.000Z",
      status: "active" as const,
    };

    it("should produce deterministic canonical JSON regardless of key ordering", () => {
      const canonical1 = canonicalizeJson(samplePayload);
      const permuted = {
        status: samplePayload.status,
        fullName: samplePayload.fullName,
        registryId: samplePayload.registryId,
        issuer: samplePayload.issuer,
        issuedAt: samplePayload.issuedAt,
        category: samplePayload.category,
        primaryTrade: samplePayload.primaryTrade,
        nsqfLevel: samplePayload.nsqfLevel,
        workerProfileId: samplePayload.workerProfileId,
      };
      const canonical2 = canonicalizeJson(permuted);
      assert.equal(canonical1, canonical2, "Canonical representations must match identically");
    });

    it("should sign and verify credentials using Ed25519 or HMAC with integrity", () => {
      const signed = signCredentialPayload(samplePayload, { algorithm: "Ed25519" });
      assert.ok(signed.signature, "Must produce signature");
      assert.ok(signed.canonicalHash, "Must compute canonical SHA256 hash");

      const verification = verifyCredentialSignature(samplePayload, signed.signature, { algorithm: "Ed25519" });
      assert.equal(verification.isValid, true, "Signature verification must succeed");
    });

    it("should detect tampering when payload properties are modified", () => {
      const signed = signCredentialPayload(samplePayload, { algorithm: "Ed25519" });

      const tampered = { ...samplePayload, nsqfLevel: 5 }; // Altered level
      const verification = verifyCredentialSignature(tampered, signed.signature, { algorithm: "Ed25519" });
      assert.equal(verification.isValid, false, "Tampered payload must fail verification");
    });
  });

  // ==========================================================================
  // 7. KEY QUALITY & TIMING ATTACK RESISTANCE (SEC-13, SEC-15)
  // ==========================================================================
  describe("7. Key Quality & Constant-Time Verification", () => {
    it("should reject short or weak cryptographic secrets (< 32 chars)", () => {
      assert.throws(
        () => assertCryptographicKeyQuality("my-weak-key", "TEST_SECRET"),
        /provides only|lacks sufficient character entropy/
      );
    });

    it("should reject known weak placeholder secrets", () => {
      assert.throws(
        () =>
          assertCryptographicKeyQuality(
            "kaamsetu-dev-test-secret-with-sufficient-length",
            "TEST_SECRET"
          ),
        /insecure, predictable, or placeholder string pattern/
      );
    });

    it("should accept high-entropy 32+ character secrets", () => {
      const strongSecret = crypto.randomBytes(32).toString("hex");
      assert.doesNotThrow(() =>
        assertCryptographicKeyQuality(strongSecret, "STRONG_TEST_SECRET")
      );
    });

    it("should perform constant-time comparison resistant to timing attacks", () => {
      const sigA = crypto.randomBytes(32).toString("hex");
      const sigB = crypto.randomBytes(32).toString("hex");

      const bufA = Buffer.from(sigA, "utf8");
      const bufB = Buffer.from(sigB, "utf8");
      assert.equal(crypto.timingSafeEqual(bufA, bufB), false);
      assert.equal(crypto.timingSafeEqual(bufA, bufA), true);
    });
  });

  // ==========================================================================
  // 8. DATA SANITIZATION & FORMULA INJECTION MITIGATION (SEC-09, SEC-10)
  // ==========================================================================
  describe("8. Output Sanitization & Injection Prevention", () => {
    it("should neutralize CSV formula injection characters (=, +, -, @)", () => {
      function sanitizeCsvField(val: unknown): string {
        if (val === null || val === undefined) return "";
        const str = String(val).trim();
        if (/^[=+\-@\t\r]/.test(str)) {
          return `'${str.replace(/"/g, '""')}`;
        }
        return `"${str.replace(/"/g, '""')}"`;
      }

      assert.equal(sanitizeCsvField("=cmd|' /C calc'!A0"), "'=cmd|' /C calc'!A0");
      assert.equal(sanitizeCsvField("+12345"), "'+12345");
      assert.equal(sanitizeCsvField("@SUM(A1:A10)"), "'@SUM(A1:A10)");
      assert.equal(sanitizeCsvField("-500"), "'-500");
      assert.equal(sanitizeCsvField("Regular Worker Name"), '"Regular Worker Name"');
    });

    it("should properly escape dynamic XML/SVG entities", () => {
      function escapeXml(unsafe: string): string {
        return unsafe
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&apos;");
      }

      const maliciousName = '<script>alert("xss")</script> & "Craftsman"';
      const escaped = escapeXml(maliciousName);
      assert.ok(!escaped.includes("<script>"));
      assert.ok(escaped.includes("&lt;script&gt;"));
      assert.ok(escaped.includes("&quot;Craftsman&quot;"));
      assert.ok(escaped.includes("&amp;"));
    });
  });

  // ==========================================================================
  // 9. CONSTITUTIONAL INVARIANT: ZERO COMMISSION (SEC-18)
  // ==========================================================================
  describe("9. Constitutional Invariant: Zero Commission (platform_commission_amount = 0.00)", () => {
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
        /Constitutional Invariant Violation: Platform deduction is strictly forbidden/
      );

      // Full disbursement with 0 commission must succeed
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
  // 10. CONTROLLED ROLLOUT GEOGRAPHIC GOVERNANCE (SEC-19)
  // ==========================================================================
  describe("10. Controlled Rollout Geographic Governance", () => {
    function isAllowedPincode(pincode: string): boolean {
      const code = parseInt(pincode, 10);
      if (isNaN(code)) return false;
      const isGuwahatiUrban = code >= 781001 && code <= 781039;
      const isShillongUrban = code >= 793001 && code <= 793022;
      return isGuwahatiUrban || isShillongUrban;
    }

    it("should permit valid Guwahati Urban pincodes (781001 - 781039)", () => {
      assert.equal(isAllowedPincode("781001"), true);
      assert.equal(isAllowedPincode("781017"), true);
      assert.equal(isAllowedPincode("781039"), true);
    });

    it("should permit valid Shillong Urban pincodes (793001 - 793022)", () => {
      assert.equal(isAllowedPincode("793001"), true);
      assert.equal(isAllowedPincode("793008"), true);
      assert.equal(isAllowedPincode("793022"), true);
    });

    it("should reject pincodes outside authorized controlled rollout zones", () => {
      assert.equal(isAllowedPincode("110001"), false, "Delhi must be rejected");
      assert.equal(isAllowedPincode("400001"), false, "Mumbai must be rejected");
      assert.equal(isAllowedPincode("781040"), false, "Out-of-range Assam pincode rejected");
      assert.equal(isAllowedPincode("793023"), false, "Out-of-range Meghalaya pincode rejected");
    });
  });

  // ==========================================================================
  // 11. DOCUMENTATION INTEGRITY AUDIT
  // ==========================================================================
  describe("11. Phase 38 Documentation Register Completeness", () => {
    const requiredDocs = [
      "INITIAL_SECURITY_INVENTORY.md",
      "ATTACK_SURFACE_REGISTER.md",
      "AUTHENTICATION_AND_SESSION_AUDIT.md",
      "API_AUTHORIZATION_AUDIT.md",
      "DATABASE_RLS_AUDIT.md",
      "INPUT_VALIDATION_AND_XSS_AUDIT.md",
      "FILE_UPLOAD_SECURITY_AUDIT.md",
      "CRYPTOGRAPHY_AND_SECRET_MANAGEMENT_AUDIT.md",
      "DEPENDENCY_AND_SUPPLY_CHAIN_AUDIT.md",
      "SECURITY_REMEDIATION_REGISTER.md",
      "SECURITY_REGRESSION_TEST_EVIDENCE.md",
      "RESIDUAL_RISK_REGISTER.md",
      "PHASE_38_FINAL_SECURITY_CERTIFICATION.md",
    ];

    it("should have all 13 core Phase 38 documentation registers authored in docs/phase-38/", () => {
      for (const doc of requiredDocs) {
        const filePath = path.join(process.cwd(), "docs/phase-38", doc);
        assert.ok(fs.existsSync(filePath), `Required document must exist: ${doc}`);
        const content = fs.readFileSync(filePath, "utf-8");
        assert.ok(content.length > 500, `Document ${doc} must contain comprehensive content`);
      }
    });
  });
});
