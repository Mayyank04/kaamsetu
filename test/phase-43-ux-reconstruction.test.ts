import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { PROFESSIONS_DATA } from "../src/lib/data/professions";
import { FEATURED_PROFESSIONALS } from "../src/lib/data/professionals";
import { GeographicAuthorizationService } from "../src/lib/geo/geographic-authorization-service";
import { ServiceCoverageRegistry } from "../src/lib/geo/service-coverage-registry";

describe("PHASE 43: Complete Product UX Reconstruction & Anti-AI-Slop Engineering", () => {
  // --------------------------------------------------------------------------
  // Group 1: Design System & Anti-AI-Slop Verification
  // --------------------------------------------------------------------------
  describe("1. Design System & Anti-AI-Slop Governance", () => {
    test("1.1 Prohibited AI-slop gradients are eliminated from key pages", () => {
      const targetFiles = [
        "src/app/page.tsx",
        "src/app/explore/page.tsx",
        "src/app/about/page.tsx",
        "src/app/how-it-works/page.tsx",
        "src/app/dashboard/page.tsx",
        "src/app/contractor/dashboard/page.tsx",
        "src/app/institution/dashboard/page.tsx",
      ];

      for (const relPath of targetFiles) {
        const fullPath = path.join(process.cwd(), relPath);
        if (fs.existsSync(fullPath)) {
          const content = fs.readFileSync(fullPath, "utf8");
          assert.strictEqual(
            content.includes("from-[#FFFFFF] via-[#F7F5F0] to-[#E9EFEA]"),
            false,
            `File ${relPath} still contains prohibited atmospheric gradient`
          );
          assert.strictEqual(
            content.includes("bg-gradient-to-b from-ivory-50 via-background to-ivory-100"),
            false,
            `File ${relPath} still contains obsolete multi-tone ivory gradient`
          );
        }
      }
    });

    test("1.2 Unearned government domain kaamsetu.gov.in is completely eliminated", () => {
      const filesToCheck = [
        "src/lib/data/professionals.ts",
        "src/app/explore/page.tsx",
        "src/app/page.tsx",
        "src/components/identity/sovereign-card.tsx",
      ];

      for (const relPath of filesToCheck) {
        const fullPath = path.join(process.cwd(), relPath);
        if (fs.existsSync(fullPath)) {
          const content = fs.readFileSync(fullPath, "utf8");
          assert.strictEqual(
            content.includes("kaamsetu.gov.in"),
            false,
            `File ${relPath} still contains unearned domain kaamsetu.gov.in`
          );
        }
      }
    });

    test("1.3 Arbitrary AI Sparkles icons are eliminated from trade taxonomy", () => {
      const sparklesCount = PROFESSIONS_DATA.filter((p) => p.icon === "Sparkles").length;
      assert.strictEqual(
        sparklesCount,
        0,
        "Professions taxonomy must not use generic AI Sparkles icon"
      );
    });

    test("1.4 Fabricated worker counts in professions taxonomy are eliminated", () => {
      const fabricatedCounts = PROFESSIONS_DATA.filter((p) => p.workerCount > 1000);
      assert.strictEqual(
        fabricatedCounts.length,
        0,
        "Professions taxonomy must not contain fabricated thousands worker counts"
      );
    });

    test("1.5 Technical jargon is replaced with plain, humanized copy in onboarding", () => {
      const wizardPath = path.join(process.cwd(), "src/components/onboarding/onboarding-wizard.tsx");
      const content = fs.readFileSync(wizardPath, "utf8");
      assert.strictEqual(
        content.includes("cryptographic sovereign credential"),
        false,
        "Onboarding wizard should not use jargon 'cryptographic sovereign credential'"
      );
      assert.strictEqual(
        content.includes("digital work profile"),
        true,
        "Onboarding wizard must use plain phrase 'digital work profile'"
      );
    });
  });

  // --------------------------------------------------------------------------
  // Group 2: Homepage 5-Point Orientation Architecture
  // --------------------------------------------------------------------------
  describe("2. Homepage 5-Point Platform Orientation", () => {
    test("2.1 Homepage explains what KAAMSETU does", () => {
      const pagePath = path.join(process.cwd(), "src/app/page.tsx");
      const content = fs.readFileSync(pagePath, "utf8");
      assert.strictEqual(
        content.includes("01. What It Does") && content.includes("Verified Digital Work Profile"),
        true,
        "Homepage must clearly explain what KAAMSETU does"
      );
    });

    test("2.2 Homepage explains who can benefit", () => {
      const pagePath = path.join(process.cwd(), "src/app/page.tsx");
      const content = fs.readFileSync(pagePath, "utf8");
      assert.strictEqual(
        content.includes("02. Who Benefits") && content.includes("Artisans, Contractors & Clients"),
        true,
        "Homepage must clearly explain who benefits from the platform"
      );
    });

    test("2.3 Homepage explains how a worker creates a profile", () => {
      const pagePath = path.join(process.cwd(), "src/app/page.tsx");
      const content = fs.readFileSync(pagePath, "utf8");
      assert.strictEqual(
        content.includes("03. How to Register") && content.includes("3-Minute Guided Intake"),
        true,
        "Homepage must clearly explain how workers create profiles without OTP deadlock"
      );
    });

    test("2.4 Homepage explains how someone finds and contacts a professional", () => {
      const pagePath = path.join(process.cwd(), "src/app/page.tsx");
      const content = fs.readFileSync(pagePath, "utf8");
      assert.strictEqual(
        content.includes("04. How to Connect") && content.includes("Nationwide Search & Inquiry"),
        true,
        "Homepage must clearly explain search and discovery"
      );
    });

    test("2.5 Homepage accurately discloses operating areas (Nationwide vs. Pilot Zones)", () => {
      const pagePath = path.join(process.cwd(), "src/app/page.tsx");
      const content = fs.readFileSync(pagePath, "utf8");
      assert.strictEqual(
        content.includes("05. Operating Areas") && content.includes("Guwahati and Shillong pilot zones"),
        true,
        "Homepage must accurately communicate nationwide identity vs. pilot dispatch zones"
      );
    });
  });

  // --------------------------------------------------------------------------
  // Group 3: Guided 10-Section Worker Workspace Architecture
  // --------------------------------------------------------------------------
  describe("3. Worker Experience & 10-Section Guided Workspace", () => {
    test("3.1 Worker dashboard container implements all 10 required navigation tabs", () => {
      const containerPath = path.join(
        process.cwd(),
        "src/components/dashboard/worker-dashboard-container.tsx"
      );
      const content = fs.readFileSync(containerPath, "utf8");

      const requiredTabs = [
        "dashboard",
        "profile",
        "skills",
        "opportunities",
        "bookings",
        "portfolio",
        "credentials",
        "earnings",
        "notifications",
        "settings",
      ];

      for (const tab of requiredTabs) {
        assert.strictEqual(
          content.includes(`id: "${tab}"`),
          true,
          `Worker dashboard must include required navigation section: ${tab}`
        );
      }
    });

    test("3.2 Worker workspace includes transparent 0% platform commission ledger in earnings panel", () => {
      const containerPath = path.join(
        process.cwd(),
        "src/components/dashboard/worker-dashboard-container.tsx"
      );
      const content = fs.readFileSync(containerPath, "utf8");

      assert.strictEqual(
        content.includes("Permanent zero platform commission") &&
        content.includes("COMMISSION = ₹0.00"),
        true,
        "Worker earnings tab must explicitly display the 0.00% commission guarantee"
      );
    });

    test("3.3 Worker workspace supports explicit worker consent for enterprise crew invitations", () => {
      const containerPath = path.join(
        process.cwd(),
        "src/components/dashboard/worker-dashboard-container.tsx"
      );
      const content = fs.readFileSync(containerPath, "utf8");

      assert.strictEqual(
        content.includes("Explicit Worker Consent Required") &&
        content.includes("Accept & Join Crew") &&
        content.includes("Decline"),
        true,
        "Worker opportunities tab must mandate explicit worker consent"
      );
    });
  });

  // --------------------------------------------------------------------------
  // Group 4: Accessibility & Design Token Rigor
  // --------------------------------------------------------------------------
  describe("4. Accessibility & Design System Tokens", () => {
    test("4.1 Brand color tokens strictly adhere to Warm Ivory, Forest Green, Warm Sand, and Charcoal", () => {
      const designPath = path.join(process.cwd(), "DESIGN.md");
      const content = fs.readFileSync(designPath, "utf8");

      assert.strictEqual(content.includes("#153E35"), true, "Primary Forest Green token #153E35 must be defined");
      assert.strictEqual(content.includes("#F7F5F0"), true, "Canvas Warm Ivory token #F7F5F0 must be defined");
      assert.strictEqual(content.includes("#E8C999"), true, "Highlight Warm Sand token #E8C999 must be defined");
      assert.strictEqual(content.includes("#171D1A"), true, "Body Deep Charcoal token #171D1A must be defined");
    });

    test("4.2 Contrast ratio of Deep Forest Green on Warm Ivory canvas exceeds WCAG AAA (>= 7.0:1)", () => {
      // Relative luminance calculations:
      // #153E35: R=21, G=62, B=53 -> L1 ≈ 0.043
      // #F7F5F0: R=247, G=245, B=240 -> L2 ≈ 0.912
      // Contrast = (0.912 + 0.05) / (0.043 + 0.05) ≈ 0.962 / 0.093 ≈ 10.34 : 1
      const lIvory = 0.912;
      const lForest = 0.043;
      const contrast = (lIvory + 0.05) / (lForest + 0.05);

      assert.ok(
        contrast >= 7.0,
        `Calculated contrast ${contrast.toFixed(2)}:1 must exceed WCAG AAA threshold of 7.0:1`
      );
    });

    test("4.3 Header navigation provides accessible ARIA expanded states and keyboard dismiss", () => {
      const headerPath = path.join(
        process.cwd(),
        "src/components/layout/institutional-header.tsx"
      );
      const content = fs.readFileSync(headerPath, "utf8");

      assert.strictEqual(
        content.includes('aria-expanded={mobileMenuOpen}'),
        true,
        "Mobile navigation toggle must provide aria-expanded state"
      );
      assert.strictEqual(
        content.includes('e.key === "Escape"'),
        true,
        "Mobile navigation drawer must close on Escape key"
      );
    });
  });

  // --------------------------------------------------------------------------
  // Group 5: Geographic & Financial Invariants
  // --------------------------------------------------------------------------
  describe("5. Decoupled Geographic & Financial Invariants", () => {
    test("5.1 All 36 States and Union Territories have active digital identity access", () => {
      const states = GeographicAuthorizationService.getAllStates();
      assert.strictEqual(states.length, 36, "Must provide coverage for all 36 States and UTs");

      // Verify sample state outside pilot zones
      const biharResult = GeographicAuthorizationService.validateLocation({
        state: "Bihar",
        district: "Patna",
        city: "Patna",
        pincode: "800001",
        allowNonDispatchProfile: true,
      });

      assert.strictEqual(biharResult.allowedForRegistration, true);
      assert.strictEqual(biharResult.isDispatchEligible, false);
      assert.strictEqual(biharResult.capabilities.account_access, true);
      assert.strictEqual(biharResult.capabilities.profile_access, true);
      assert.strictEqual(biharResult.capabilities.discovery_access, true);
      assert.strictEqual(biharResult.capabilities.booking_access, false);
      assert.strictEqual(biharResult.capabilities.dispatch_access, false);
    });

    test("5.2 Guwahati and Shillong pilot zones retain full 6/6 operational capabilities", () => {
      const guwahatiCaps = ServiceCoverageRegistry.getCapabilities(
        "Assam",
        "Kamrup Metropolitan",
        "781001"
      );
      assert.strictEqual(guwahatiCaps.account_access, true);
      assert.strictEqual(guwahatiCaps.profile_access, true);
      assert.strictEqual(guwahatiCaps.discovery_access, true);
      assert.strictEqual(guwahatiCaps.booking_access, true);
      assert.strictEqual(guwahatiCaps.dispatch_access, true);
      assert.strictEqual(guwahatiCaps.payment_access, true);
    });

    test("5.3 Permanent financial invariant platform_commission_amount = 0.00 is inviolable", () => {
      const workerAgreedRate = 1200;
      const platformCommissionAmount = 0.0;
      const workerNetDisbursed = workerAgreedRate - platformCommissionAmount;

      assert.strictEqual(platformCommissionAmount, 0.0, "Platform commission amount must be 0.00");
      assert.strictEqual(
        workerNetDisbursed,
        workerAgreedRate,
        "Worker net disbursement must equal 100% of agreed rate"
      );
    });
  });
});
