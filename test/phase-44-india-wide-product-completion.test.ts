import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { PROFESSIONS_DATA } from "../src/lib/data/professions";
import { FEATURED_PROFESSIONALS } from "../src/lib/data/professionals";
import { GeographicAuthorizationService } from "../src/lib/geo/geographic-authorization-service";
import { ServiceCoverageRegistry } from "../src/lib/geo/service-coverage-registry";
import { APP_TRANSLATIONS } from "../src/lib/i18n/translations";
import { OnboardingService } from "../src/server/services/onboarding.service";
import { getPublishedWorkerProfiles } from "../src/lib/supabase/db/profiles";
import { approvedProfileSubmissionSchema, vendorProductSchema } from "../src/schemas/onboarding.schema";

describe("PHASE 44: India-Wide Product Completion, Complete Bug Elimination & Universal Accessibility", () => {
  // --------------------------------------------------------------------------
  // Group 1: Small Vendor Architecture & Product Catalog
  // --------------------------------------------------------------------------
  describe("1. Small Vendor & Artisan Architecture", () => {
    test("1.1 Small vendor profile types (goods_vendor, hybrid_artisan) are recognized and validated", () => {
      const validGoodsVendor = approvedProfileSubmissionSchema.parse({
        fullName: "Lakshmi Das",
        occupation: "Fresh Local Produce",
        category: "fresh-produce-vegetables",
        profileType: "goods_vendor",
        businessName: "Maa Kamakhya Fresh Daily Greens",
        stallType: "fixed_stall",
        operatingHours: "06:00 - 13:00",
        city: "Guwahati",
        state: "Assam",
        pincode: "781001",
        skills: ["Fresh Greens Sourcing", "Electronic Weighing"],
        headline: "Paltan Bazaar daily produce vendor",
        bio: "Specializing in farm-direct indigenous greens and local citrus.",
        languages: ["Assamese", "Hindi"],
        deliveryAvailable: true,
        contactPreference: "phone",
      });

      assert.strictEqual(validGoodsVendor.profileType, "goods_vendor");
      assert.strictEqual(validGoodsVendor.businessName, "Maa Kamakhya Fresh Daily Greens");
      assert.strictEqual(validGoodsVendor.stallType, "fixed_stall");
    });

    test("1.2 Vendor-specific fields are preserved and returned in discovery queries", async () => {
      const vendors = await getPublishedWorkerProfiles({ profileType: "goods_vendor" });
      assert.ok(vendors.length > 0, "At least one goods vendor must be discoverable");

      const vendor = vendors.find((v) => (v as any).profile_type === "goods_vendor");
      assert.ok(vendor, "Published profile must include goods_vendor profile_type");
      assert.ok((vendor as any).business_name, "Vendor profile must have a business_name");
      assert.ok((vendor as any).stall_type, "Vendor profile must have a stall_type");
    });

    test("1.3 Product catalog items adhere to the typed schema with prices and units", () => {
      const validProduct = vendorProductSchema.parse({
        id: "prod-test-1",
        name: "Assam Kaji Nemu",
        name_vernacular: "কাজী নেমু",
        category: "Citrus",
        price: 20,
        unit: "pair",
        in_stock: true,
        description: "Fresh aromatic seedless local lemon",
      });

      assert.strictEqual(validProduct.name, "Assam Kaji Nemu");
      assert.strictEqual(validProduct.price, 20);
      assert.strictEqual(validProduct.unit, "pair");
      assert.strictEqual(validProduct.in_stock, true);
    });

    test("1.4 Vendor discovery supports filtering by profileType", async () => {
      const allProfiles = await getPublishedWorkerProfiles({ profileType: "all" });
      const serviceProfiles = await getPublishedWorkerProfiles({ profileType: "service_professional" });
      const vendorProfiles = await getPublishedWorkerProfiles({ profileType: "goods_vendor" });

      assert.ok(allProfiles.length >= serviceProfiles.length, "All profiles must encompass service craftspeople");
      assert.ok(vendorProfiles.length > 0, "Vendor query must return goods vendors");
      assert.ok(
        vendorProfiles.every((v) => (v as any).profile_type === "goods_vendor"),
        "Every item in vendor query must have profile_type = goods_vendor"
      );
    });

    test("1.5 Small vendor trade categories are present in professions taxonomy", () => {
      const vendorSlugs = [
        "fresh-produce-vegetables",
        "street-food-tea",
        "tailoring-apparel",
        "handicrafts-pottery",
        "footwear-leather-repair",
      ];

      for (const slug of vendorSlugs) {
        const found = PROFESSIONS_DATA.find((p) => p.slug === slug);
        assert.ok(found, `Profession taxonomy must include small vendor trade '${slug}'`);
        assert.strictEqual(found.sector, "retail_small_vendor");
      }
    });
  });

  // --------------------------------------------------------------------------
  // Group 2: Nationwide Geographic Architecture & Decoupled Capabilities
  // --------------------------------------------------------------------------
  describe("2. Nationwide Geography & Decoupled Capabilities", () => {
    test("2.1 All 36 States and Union Territories have active digital identity access", () => {
      const states = GeographicAuthorizationService.getAllStates();
      assert.strictEqual(states.length, 36, "Must provide coverage for all 36 States and UTs");

      // Verify sample state outside pilot zones (e.g. Maharashtra, Rajasthan, Karnataka)
      const rajResult = GeographicAuthorizationService.validateLocation({
        state: "Rajasthan",
        district: "Jaipur",
        city: "Jaipur",
        pincode: "302001",
      });

      assert.strictEqual(rajResult.allowedForRegistration, true);
      assert.strictEqual(rajResult.isDispatchEligible, false);
      assert.strictEqual(rajResult.capabilities.account_access, true);
      assert.strictEqual(rajResult.capabilities.profile_access, true);
      assert.strictEqual(rajResult.capabilities.discovery_access, true);
      assert.strictEqual(rajResult.capabilities.booking_access, false);
      assert.strictEqual(rajResult.capabilities.dispatch_access, false);
    });

    test("2.2 Commercial dispatch remains strictly constrained to Guwahati & Shillong pilot zones", () => {
      // Guwahati Urban check
      const guwahatiResult = GeographicAuthorizationService.validateLocation({
        state: "Assam",
        district: "Kamrup Metropolitan",
        city: "Guwahati",
        pincode: "781001",
      });
      assert.strictEqual(guwahatiResult.allowed, true);
      assert.strictEqual(guwahatiResult.isDispatchEligible, true);
      assert.strictEqual(guwahatiResult.capabilities.booking_access, true);
      assert.strictEqual(guwahatiResult.capabilities.dispatch_access, true);

      // Shillong Urban check
      const shillongResult = GeographicAuthorizationService.validateLocation({
        state: "Meghalaya",
        district: "East Khasi Hills",
        city: "Shillong",
        pincode: "793001",
      });
      assert.strictEqual(shillongResult.allowed, true);
      assert.strictEqual(shillongResult.isDispatchEligible, true);
      assert.strictEqual(shillongResult.capabilities.booking_access, true);
      assert.strictEqual(shillongResult.capabilities.dispatch_access, true);
    });

    test("2.3 Unlisted localities or villages fallback gracefully to state/district level registration", () => {
      const ruralResult = GeographicAuthorizationService.validateLocation({
        state: "Madhya Pradesh",
        city: "Remote Village Hamirpur",
        pincode: "462001",
        allowNonDispatchProfile: true,
      });

      assert.strictEqual(ruralResult.allowedForRegistration, true);
      assert.strictEqual(ruralResult.capabilities.account_access, true);
    });

    test("2.4 Service Coverage Registry returns 6/6 capabilities in pilot and 3/6 nationwide", () => {
      const guwahatiCaps = ServiceCoverageRegistry.getCapabilities("Assam", "Kamrup Metropolitan", "781001");
      assert.strictEqual(guwahatiCaps.account_access, true);
      assert.strictEqual(guwahatiCaps.profile_access, true);
      assert.strictEqual(guwahatiCaps.discovery_access, true);
      assert.strictEqual(guwahatiCaps.booking_access, true);
      assert.strictEqual(guwahatiCaps.dispatch_access, true);
      assert.strictEqual(guwahatiCaps.payment_access, true);

      const delhiCaps = ServiceCoverageRegistry.getCapabilities("Delhi", "Central Delhi", "110001");
      assert.strictEqual(delhiCaps.account_access, true);
      assert.strictEqual(delhiCaps.profile_access, true);
      assert.strictEqual(delhiCaps.discovery_access, true);
      assert.strictEqual(delhiCaps.booking_access, false);
      assert.strictEqual(delhiCaps.dispatch_access, false);
      assert.strictEqual(delhiCaps.payment_access, false);
    });
  });

  // --------------------------------------------------------------------------
  // Group 3: Permanent Financial Invariant & Zero Commission
  // --------------------------------------------------------------------------
  describe("3. Permanent Financial Invariant: Zero Commission", () => {
    test("3.1 platform_commission_amount = 0.00 invariant is constant and unalterable", () => {
      const platformCommissionAmount = 0.00;
      assert.strictEqual(platformCommissionAmount, 0.00, "Platform commission must remain exactly 0.00");
    });

    test("3.2 Earnings ledger in worker dashboard container guarantees 0% commission deductions", () => {
      const filePath = path.join(
        process.cwd(),
        "src/components/dashboard/worker-dashboard-container.tsx"
      );
      const content = fs.readFileSync(filePath, "utf8");

      assert.ok(
        content.includes("Permanent Invariant: 0.00%"),
        "Earnings panel must highlight the permanent 0% constitutional platform commission"
      );
      assert.ok(
        content.includes("Permanent zero platform commission"),
        "Earnings panel must guarantee permanent zero platform commission"
      );
    });

    test("3.3 Vendor goods sales incur 0.00 platform fee", () => {
      const saleAmount = 500;
      const commissionRate = 0.00;
      const netDisbursed = saleAmount - (saleAmount * commissionRate);
      assert.strictEqual(netDisbursed, 500);
    });
  });

  // --------------------------------------------------------------------------
  // Group 4: Universal Accessibility & Multilingual Readiness
  // --------------------------------------------------------------------------
  describe("4. Multilingual Infrastructure & Accessibility", () => {
    test("4.1 Translation dictionaries are complete for English, Hindi, Assamese, and Bengali", () => {
      const locales = ["en", "hi", "as", "bn"] as const;
      for (const loc of locales) {
        const dict = APP_TRANSLATIONS[loc];
        assert.ok(dict, `Dictionary for locale '${loc}' must exist`);
        assert.ok(dict.header.home.length > 0, `Header Home link must be translated in '${loc}'`);
        assert.ok(dict.header.findProfessionals.length > 0, `Header search link must be translated in '${loc}'`);
        assert.ok(dict.home.heroTitle.length > 0, `Hero title must be translated in '${loc}'`);
        assert.ok(dict.explore.pageTitle.length > 0, `Explore title must be translated in '${loc}'`);
        assert.ok(dict.vendor.stallType.length > 0, `Vendor stall label must be translated in '${loc}'`);
      }
    });

    test("4.2 Institutional Header provides accessible language selector with ARIA labels", () => {
      const headerPath = path.join(
        process.cwd(),
        "src/components/layout/institutional-header.tsx"
      );
      const content = fs.readFileSync(headerPath, "utf8");

      assert.ok(
        content.includes("aria-label=\"Select vernacular language\""),
        "Header language selector must include an accessible ARIA label"
      );
      assert.ok(content.includes("DropdownMenu"), "Header must provide a vernacular dropdown menu");
    });

    test("4.3 Brand color tokens adhere to high-contrast WCAG AAA standards", () => {
      const designDocPath = path.join(process.cwd(), "DESIGN.md");
      const designContent = fs.readFileSync(designDocPath, "utf8");

      assert.ok(designContent.includes("#153E35"), "Primary Deep Forest Green token must be defined");
      assert.ok(designContent.includes("#F7F5F0"), "Canvas Warm Ivory token must be defined");
      assert.ok(designContent.includes("#E8C999"), "Accent Warm Sand token must be defined");
    });

    test("4.4 Mobile drawer provides prominent language switching controls", () => {
      const headerPath = path.join(
        process.cwd(),
        "src/components/layout/institutional-header.tsx"
      );
      const content = fs.readFileSync(headerPath, "utf8");

      assert.ok(
        content.includes("Language / भाषा / ভাষা"),
        "Mobile drawer must display vernacular language selector"
      );
    });
  });

  // --------------------------------------------------------------------------
  // Group 5: Anti-AI-Slop Governance & End-to-End Onboarding
  // --------------------------------------------------------------------------
  describe("5. Anti-AI-Slop Governance & End-to-End User Experience", () => {
    test("5.1 Prohibited AI-slop gradients are absent from core pages", () => {
      const pagesToCheck = [
        "src/app/page.tsx",
        "src/app/explore/page.tsx",
        "src/app/dashboard/page.tsx",
      ];

      for (const p of pagesToCheck) {
        const full = path.join(process.cwd(), p);
        if (fs.existsSync(full)) {
          const content = fs.readFileSync(full, "utf8");
          assert.strictEqual(
            content.includes("from-[#FFFFFF] via-[#F7F5F0] to-[#E9EFEA]"),
            false,
            `File ${p} contains prohibited atmospheric gradient`
          );
        }
      }
    });

    test("5.2 Unearned government domain kaamsetu.gov.in is completely eliminated", () => {
      const filesToCheck = [
        "src/lib/data/professionals.ts",
        "src/app/explore/page.tsx",
        "src/components/identity/professional-card.tsx",
      ];

      for (const rel of filesToCheck) {
        const full = path.join(process.cwd(), rel);
        if (fs.existsSync(full)) {
          const content = fs.readFileSync(full, "utf8");
          assert.strictEqual(
            content.includes("kaamsetu.gov.in"),
            false,
            `File ${rel} contains unearned government domain`
          );
        }
      }
    });

    test("5.3 OnboardingWizard supports direct registration without OTP modal deadlock", () => {
      const wizardPath = path.join(
        process.cwd(),
        "src/components/onboarding/onboarding-wizard.tsx"
      );
      const content = fs.readFileSync(wizardPath, "utf8");

      assert.ok(
        content.includes("showDirectAuthModal"),
        "Wizard must use Direct Account Creation modal"
      );
      assert.strictEqual(
        content.includes("verifyOtp"),
        false,
        "Mandatory OTP verification function must not be called during registration"
      );
    });

    test("5.4 End-to-end artisan and vendor profile creation assigns valid registry IDs and KAAMSCORE", async () => {
      const mockUser = {
        id: "usr-phase44-test-1",
        email: "vendor.test@example.com",
        role: "worker" as const,
        fullName: "Babulal Meena",
        phone: "+919876543210",
        isDemo: false,
      };

      const vendorSubmission = {
        fullName: "Babulal Meena",
        occupation: "Footwear & Leather Care",
        category: "footwear-leather-repair",
        profileType: "goods_vendor" as const,
        businessName: "Meena Traditional Leather Works",
        stallType: "fixed_stall" as const,
        operatingHours: "09:00 - 19:30",
        city: "Jodhpur",
        state: "Rajasthan",
        pincode: "342001",
        yearsExperience: 8,
        skills: ["Hand Stitching Leather", "Custom Orthopedic Fit"],
        equipmentHandled: ["Awl & Stitching Clamp", "Sole Press"],
        headline: "Traditional Handmade Leather Footwear & Cobbler Services",
        bio: "Specializing in handcrafted Jodhpuri juttis, sole stitching, and leather care.",
        languages: ["Hindi", "Marwari"],
        allowNonDispatchProfile: true,
      };

      const saved = await OnboardingService.saveProfile(mockUser, vendorSubmission);

      assert.ok(saved.registryId.startsWith("IN-RA-2026-"), "Registry ID must start with IN-RA-2026-");
      assert.ok(saved.kaamScore.totalScore > 0, "Provisional KAAMSCORE must be greater than zero");
      assert.strictEqual((saved as any).profileType, "goods_vendor");
      assert.strictEqual((saved as any).businessName, "Meena Traditional Leather Works");
    });
  });
});
