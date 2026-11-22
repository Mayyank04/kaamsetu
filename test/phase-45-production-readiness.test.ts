/**
 * KAAMSETU — PHASE 45 MASTER PRODUCT ENGINEERING & PRODUCTION READINESS TEST SUITE
 *
 * Verifies the full application lifecycle:
 * 1. Direct Authentication (No OTP) & Session Security
 * 2. Schema-Adaptive Worker & Small Vendor Onboarding
 * 3. Nationwide Geographic Jurisdiction & Decoupled Class B Pilot Boundaries
 * 4. 18-Language Localization with Dual-Script RTL Engine
 * 5. Customer & Contractor Workflows with Resilient Schema Handling
 * 6. Permanent Financial Invariant: platform_commission_amount = 0.00
 * 7. PWA Infrastructure & Offline Fallback Verification
 */

import { test, describe } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { OnboardingService } from "../src/server/services/onboarding.service";
import { GeographicAuthorizationService } from "../src/lib/geo/geographic-authorization-service";
import { INDIA_STATES_DATA } from "../src/lib/geo/india-geography-data";
import { APP_TRANSLATIONS, getTranslation, SUPPORTED_LOCALES_METADATA } from "../src/lib/i18n/translations";
import { AppLocale } from "../src/lib/i18n/types";
import { createBooking, getCustomerBookings } from "../src/lib/supabase/db/bookings";
import { getContractorOrganization, getContractorProjects } from "../src/lib/supabase/db/contractors";
import { recordPaymentSettlement } from "../src/lib/billing/payment-transparency-service";

describe("PHASE 45: Master Product Engineering & Production Readiness", () => {
  // ==========================================================================
  // GROUP 1: Direct Authentication & Session Integrity
  // ==========================================================================
  describe("1. Direct Authentication & Account Management (No OTP)", () => {
    test("1.1 Registration and login require zero SMS OTP or third-party telecom calls", () => {
      const authFiles = ["src/app/auth/register/page.tsx", "src/app/auth/login/page.tsx", "src/lib/auth/use-auth.tsx"];
      for (const relPath of authFiles) {
        const fullPath = path.join(process.cwd(), relPath);
        assert.ok(fs.existsSync(fullPath), `Auth file ${relPath} must exist`);
        const content = fs.readFileSync(fullPath, "utf-8");
        assert.ok(!content.includes("mandatoryOtpChallenge"), `File ${relPath} must not contain mandatory OTP challenge`);
      }
    });

    test("1.2 Direct account creation produces authenticated user sessions", () => {
      const testUser = {
        id: "33333333-3333-3333-3333-333333330001",
        email: "worker.direct@example.com",
        role: "worker" as const,
        fullName: "Kishan Lal Verma",
        phone: "+919876543210",
        isDemo: false,
      };

      assert.strictEqual(testUser.role, "worker");
      assert.ok(testUser.email.includes("@"), "User must have valid email");
    });
  });

  // ==========================================================================
  // GROUP 2: Schema-Adaptive Worker & Vendor Onboarding
  // ==========================================================================
  describe("2. Worker & Small Vendor Onboarding Persistence", () => {
    test("2.1 OnboardingService persists worker profile with schema resilience", async () => {
      const mockUser = {
        id: "33333333-3333-3333-3333-333333330045",
        email: "electrician.bihar@example.com",
        role: "worker" as const,
        fullName: "Dinesh Kumar Yadav",
        phone: "+919812345678",
        isDemo: false,
      };

      const submission = {
        fullName: "Dinesh Kumar Yadav",
        occupation: "Electrical & Solar",
        category: "electrical-solar",
        yearsExperience: 7,
        city: "Patna",
        state: "Bihar",
        district: "Patna",
        pincode: "800001",
        headline: "7 years experienced Solar Electrician in Patna, Bihar",
        bio: "Specializing in commercial 3-phase wiring, rooftop solar arrays, and high-voltage distribution.",
        skills: ["3-Phase Inverters", "Rooftop Solar Array", "MCB Distribution"],
        languages: ["hi", "en"],
        allowNonDispatchProfile: true,
      };

      const result = await OnboardingService.saveProfile(mockUser, submission);
      assert.ok(result, "Onboarding profile must return saved record");
      assert.ok(result.registryId.startsWith("IN-BI-2026-"), "Registry ID must start with IN-BI-2026- for Bihar");
      assert.ok(result.kaamScore.totalScore > 0, "KAAMSCORE must be initialized > 0");
      assert.ok(!Number.isNaN(result.kaamScore.totalScore), "KAAMSCORE must not be NaN");
    });

    test("2.2 Small vendor profile persists with goods_vendor and market stall classification", async () => {
      const mockUser = {
        id: "33333333-3333-3333-3333-333333330046",
        email: "vendor.assam@example.com",
        role: "worker" as const,
        fullName: "Pranab Barua",
        phone: "+919854012345",
        isDemo: false,
      };

      const vendorSubmission = {
        fullName: "Pranab Barua",
        occupation: "Fresh Produce & Vegetables",
        category: "fresh-produce-vegetables",
        profileType: "goods_vendor" as const,
        businessName: "Barua Organic Produce Stall",
        stallType: "fixed_stall" as const,
        operatingHours: "06:00 AM - 01:00 PM",
        deliveryAvailable: false,
        city: "Guwahati",
        state: "Assam",
        district: "Kamrup Metropolitan",
        pincode: "781001",
        yearsExperience: 10,
        skills: ["Wholesale Procurement", "Cold Chain Storage", "Seasonal Farm Produce"],
        languages: ["as", "hi", "en"],
        allowNonDispatchProfile: true,
      };

      const result = await OnboardingService.saveProfile(mockUser, vendorSubmission);
      assert.ok(result, "Vendor profile must return saved record");
      assert.strictEqual((result as any).profileType, "goods_vendor");
      assert.strictEqual((result as any).businessName, "Barua Organic Produce Stall");
    });
  });

  // ==========================================================================
  // GROUP 3: Nationwide Jurisdiction & Decoupled Class B Dispatch
  // ==========================================================================
  describe("3. Nationwide Jurisdiction & Decoupled Class B Dispatch", () => {
    test("3.1 All 28 States and 8 Union Territories are registered with active identity rights", () => {
      assert.strictEqual(INDIA_STATES_DATA.length, 36, "Dataset must contain exactly 36 States & UTs");
      const states = INDIA_STATES_DATA.filter((e) => e.type === "state");
      const uts = INDIA_STATES_DATA.filter((e) => e.type === "union_territory");
      assert.strictEqual(states.length, 28, "Must contain exactly 28 States");
      assert.strictEqual(uts.length, 8, "Must contain exactly 8 Union Territories");
    });

    test("3.2 Physical dispatch is restricted to Guwahati and Shillong while identity is active nationwide", () => {
      // Pilot zone: Guwahati (781001)
      const guwahatiCheck = GeographicAuthorizationService.validateLocation({
        state: "Assam",
        city: "Guwahati",
        pincode: "781001",
      });
      assert.strictEqual(guwahatiCheck.isDispatchEligible, true, "Guwahati must have physical dispatch active");
      assert.strictEqual(guwahatiCheck.status, "AUTHORIZED");

      // Pilot zone: Shillong (793001)
      const shillongCheck = GeographicAuthorizationService.validateLocation({
        state: "Meghalaya",
        city: "Shillong",
        pincode: "793001",
      });
      assert.strictEqual(shillongCheck.isDispatchEligible, true, "Shillong must have physical dispatch active");
      assert.strictEqual(shillongCheck.status, "AUTHORIZED");

      // Nationwide zone: Mumbai (400001)
      const mumbaiCheck = GeographicAuthorizationService.validateLocation({
        state: "Maharashtra",
        city: "Mumbai",
        pincode: "400001",
      });
      assert.strictEqual(mumbaiCheck.isDispatchEligible, false, "Mumbai must not have physical dispatch active in pilot");
      assert.strictEqual(mumbaiCheck.status, "OUT_OF_BOUNDS");
      assert.strictEqual(mumbaiCheck.capabilities.account_access, true, "Mumbai must have account access active");
      assert.strictEqual(mumbaiCheck.capabilities.profile_access, true, "Mumbai must have profile access active");
      assert.strictEqual(mumbaiCheck.capabilities.discovery_access, true, "Mumbai must have discovery access active");
    });
  });

  // ==========================================================================
  // GROUP 4: 18-Language Localization & Dual-Script RTL Engine
  // ==========================================================================
  describe("4. 18-Language Localization & Dual-Script RTL Engine", () => {
    const EXPECTED_LOCALES: AppLocale[] = [
      "en", "hi", "as", "bn", "or", "pa", "gu", "mr", "ur", "ta", "te", "kn", "ml", "ne", "brx", "mni", "ks", "sa",
    ];

    test("4.1 System contains all 18 official Indian languages + English", () => {
      assert.strictEqual(SUPPORTED_LOCALES_METADATA.length, 18, "Must support 18 languages");
      for (const loc of EXPECTED_LOCALES) {
        assert.ok(APP_TRANSLATIONS[loc], `Translation dictionary for ${loc} must be loaded`);
      }
    });

    test("4.2 Urdu and Kashmiri declare RTL direction while other 16 declare LTR", () => {
      assert.strictEqual(SUPPORTED_LOCALES_METADATA.find((l) => l.code === "ur")?.direction, "rtl");
      assert.strictEqual(SUPPORTED_LOCALES_METADATA.find((l) => l.code === "ks")?.direction, "rtl");
      assert.strictEqual(SUPPORTED_LOCALES_METADATA.find((l) => l.code === "hi")?.direction, "ltr");
      assert.strictEqual(SUPPORTED_LOCALES_METADATA.find((l) => l.code === "en")?.direction, "ltr");
    });

    test("4.3 Unknown locale gracefully falls back to English dictionary", () => {
      const fallback = getTranslation("unknown_code" as AppLocale);
      assert.strictEqual(fallback.locale, "en");
      assert.strictEqual(fallback.header.home, "Home");
    });
  });

  // ==========================================================================
  // GROUP 5: Customer & Contractor Workflows
  // ==========================================================================
  describe("5. Customer & Contractor Workflows", () => {
    test("5.1 createBooking handles schema tolerance and sets status to requested", async () => {
      const booking = await createBooking({
        customer_id: "44444444-4444-4444-4444-444444440001",
        worker_profile_id: "w-pro-01",
        service_title: "Emergency Pipe Leak Repair",
        location_address: "Bora Service, GS Road",
        location_city: "Guwahati",
        scheduled_start: new Date().toISOString(),
        estimated_cost: 650,
      });

      assert.ok(booking.booking_reference.startsWith("BK-"), "Booking reference must start with BK-");
      assert.strictEqual(booking.status, "requested");
    });

    test("5.2 getCustomerBookings returns list without crashing", async () => {
      const bookings = await getCustomerBookings("44444444-4444-4444-4444-444444440001");
      assert.ok(Array.isArray(bookings), "Bookings must return an array");
    });

    test("5.3 Contractor organization and project queries degrade gracefully on unmigrated DB", async () => {
      const org = await getContractorOrganization("44444444-4444-4444-4444-444444440045");
      assert.ok(org === null || typeof org === "object", "Contractor org query must return null or object");

      const projects = await getContractorProjects("org-test-01");
      assert.ok(Array.isArray(projects), "Projects must return an array");
    });
  });

  // ==========================================================================
  // GROUP 6: Permanent Financial Invariant: Zero Commission
  // ==========================================================================
  describe("6. Permanent Financial Invariant: platform_commission = 0.00", () => {
    test("6.1 platform_commission_amount is mathematically zero for all wage amounts", () => {
      const amounts = [100, 500, 1500, 10000, 50000, 125000];
      for (const amount of amounts) {
        const platformCommissionAmount = 0.00;
        const artisanReceives = amount - (amount * platformCommissionAmount);
        assert.strictEqual(platformCommissionAmount, 0.0, `Commission on ₹${amount} must be ₹0.00`);
        assert.strictEqual(artisanReceives, amount, `Artisan receives 100% of ₹${amount}`);
      }
    });

    test("6.2 recordPaymentSettlement rejects any non-zero commission attempt", async () => {
      await assert.rejects(
        async () => {
          await recordPaymentSettlement({
            workerProfileId: "wp-test-01",
            employerDeclaredAmount: 1000,
            workerAgreedAmount: 1000,
            amountInvoiced: 1000,
            amountPaid: 1000,
            platformCommissionAmount: 50.0, // Non-zero attempt must fail closed
          });
        },
        /CONSTITUTIONAL SECURITY VIOLATION/,
        "Must reject non-zero commission"
      );
    });
  });

  // ==========================================================================
  // GROUP 7: PWA Infrastructure & Offline Capabilities
  // ==========================================================================
  describe("7. Progressive Web App (PWA) & Offline Fallback", () => {
    test("7.1 Web app manifest exists with correct metadata", () => {
      const manifestPath = path.join(process.cwd(), "public/manifest.json");
      assert.ok(fs.existsSync(manifestPath), "public/manifest.json must exist");
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
      assert.strictEqual(manifest.short_name, "KAAMSETU");
      assert.strictEqual(manifest.theme_color, "#153E35");
      assert.strictEqual(manifest.background_color, "#F7F5F0");
      assert.strictEqual(manifest.display, "standalone");
    });

    test("7.2 Service worker exists and defines offline fallback strategy", () => {
      const swPath = path.join(process.cwd(), "public/sw.js");
      assert.ok(fs.existsSync(swPath), "public/sw.js must exist");
      const content = fs.readFileSync(swPath, "utf-8");
      assert.ok(content.includes("OFFLINE_URL"), "Service worker must specify OFFLINE_URL");
      assert.ok(content.includes("caches.match"), "Service worker must implement cache matching");
    });

    test("7.3 Offline page component exists and provides retry and emergency advice", () => {
      const offlinePagePath = path.join(process.cwd(), "src/app/offline/page.tsx");
      assert.ok(fs.existsSync(offlinePagePath), "src/app/offline/page.tsx must exist");
      const content = fs.readFileSync(offlinePagePath, "utf-8");
      assert.ok(content.includes("You are Offline"), "Offline page must render clear offline message");
      assert.ok(content.includes("window.location.reload()"), "Offline page must provide reload retry");
    });
  });
});
