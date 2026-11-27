/**
 * KAAMSETU — PHASE 54: VERIFIED WORKER PHONE IDENTITY, OPTIONAL EMAIL &
 * CATEGORY-BASED PROFESSIONAL DISCOVERY MARKETPLACE TEST SUITE
 *
 * Operational Classification: CLASS_B_CONTROLLED_ROLLOUT (Guwahati Urban & Shillong Urban)
 * Permanent Constitutional Invariant: platform_commission_amount = 0.00
 */

import { describe, test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { NextRequest } from "next/server";

// Category system imports
import {
  MARKETPLACE_CATEGORIES,
  getAllCategories,
  getCategoryBySlug,
  searchCategories,
  getAllSubcategories,
} from "../src/lib/constants/marketplace-categories";

// API route handlers
import { GET as getCategoriesApi } from "../src/app/api/categories/route";
import { GET as getWorkersApi } from "../src/app/api/workers/route";

// Phone verification & auth service
import {
  sendOtp,
  verifyOtp,
  __resetMemoryOtpStore,
} from "../src/lib/auth/otp-service";
import { __resetMemoryRateLimitStore } from "../src/lib/security/rate-limiter";
import { POST as registerRoute, __getLocalFallbackAccounts } from "../src/app/api/auth/register/route";

// Data
import { FEATURED_PROFESSIONALS } from "../src/lib/data/professionals";

function readSrc(relPath: string): string {
  return fs.readFileSync(path.join(process.cwd(), relPath), "utf-8");
}

function randomIndian10(): string {
  const lead = ["6", "7", "8", "9"][Math.floor(Math.random() * 4)];
  const rest = Math.floor(100000000 + Math.random() * 899999999).toString();
  return `${lead}${rest}`;
}

function uniqueIp(): string {
  return `10.${Math.floor(Math.random() * 200 + 1)}.${Math.floor(Math.random() * 200 + 1)}.${Math.floor(Math.random() * 200 + 1)}`;
}

async function getProofForPhone(phone: string, ip: string): Promise<string> {
  const sendRes = await sendOtp({
    phone,
    intent: "registration",
    termsAccepted: true,
    clientIp: ip,
  });
  assert.strictEqual(sendRes.success, true);
  const verRes = await verifyOtp({
    phone,
    otp: sendRes.sandboxCode!,
    intent: "registration",
    deferAccountCreation: true,
    termsAccepted: true,
  });
  assert.strictEqual(verRes.success, true);
  assert.ok(verRes.verificationProof);
  return verRes.verificationProof!;
}

describe("PHASE 54: Category-Based Professional Discovery Marketplace", () => {
  beforeEach(() => {
    __resetMemoryOtpStore();
    __resetMemoryRateLimitStore();
    __getLocalFallbackAccounts().clear();
  });

  // =========================================================================
  // 1. STRUCTURED 12-CATEGORY SYSTEM
  // =========================================================================
  describe("1. Structured Marketplace Category System", () => {
    test("1.1 System defines exactly 12 structured professional service categories", () => {
      const categories = getAllCategories();
      assert.strictEqual(categories.length, 12, "Must contain exactly 12 professional categories");

      const expectedSlugs = [
        "electrical",
        "plumbing",
        "carpentry-furniture",
        "home-repair-maintenance",
        "cleaning-housekeeping",
        "ac-appliance-repair",
        "automotive",
        "beauty-personal-care",
        "tailoring-fashion",
        "construction-labour",
        "transport-delivery",
        "other-skilled-services",
      ];

      expectedSlugs.forEach((slug) => {
        const found = categories.find((c) => c.slug === slug);
        assert.ok(found, `Category slug '${slug}' must be defined`);
        assert.ok(found.title.length > 0, `Category '${slug}' must have a title`);
        assert.ok(found.hindiTitle.length > 0, `Category '${slug}' must have a hindiTitle`);
        assert.ok(found.description.length > 0, `Category '${slug}' must have a description`);
        assert.ok(found.subcategories.length >= 4, `Category '${slug}' must have at least 4 subcategories`);
      });
    });

    test("1.2 getCategoryBySlug retrieves correct category and handles unknown slug safely", () => {
      const elec = getCategoryBySlug("electrical");
      assert.ok(elec);
      assert.strictEqual(elec.title, "Electrical");
      assert.strictEqual(elec.iconName, "Zap");

      const plumb = getCategoryBySlug("plumbing");
      assert.ok(plumb);
      assert.strictEqual(plumb.title, "Plumbing");

      const unknown = getCategoryBySlug("non-existent-category");
      assert.strictEqual(unknown, undefined);
    });

    test("1.3 searchCategories finds categories by title, hindiTitle, keywords, and subcategories", () => {
      // English keyword
      const byEnglish = searchCategories("electrician");
      assert.ok(byEnglish.some((c) => c.slug === "electrical"));

      // Hindi keyword
      const byHindi = searchCategories("नलसाज");
      assert.ok(byHindi.some((c) => c.slug === "plumbing"));

      // Subcategory keyword
      const bySubcategory = searchCategories("solar");
      assert.ok(bySubcategory.some((c) => c.slug === "electrical"));

      // Automotive
      const byAuto = searchCategories("mechanic");
      assert.ok(byAuto.some((c) => c.slug === "automotive"));

      // Empty query returns all
      const all = searchCategories("");
      assert.strictEqual(all.length, 12);
    });

    test("1.4 getAllSubcategories returns flattened list with parent metadata", () => {
      const subcats = getAllSubcategories();
      assert.ok(subcats.length >= 60, "Must have over 60 granular subcategories across 12 categories");
      const pipeSub = subcats.find((s) => s.name === "Pipe Repair & Fitting");
      assert.ok(pipeSub);
      assert.strictEqual(pipeSub.parentCategorySlug, "plumbing");
    });
  });

  // =========================================================================
  // 2. CATEGORY & WORKER API ROUTES
  // =========================================================================
  describe("2. Category and Workers Search API Endpoints", () => {
    test("2.1 GET /api/categories returns all 12 categories with rollout metadata", async () => {
      const req = new NextRequest("http://localhost:3000/api/categories");
      const res = await getCategoriesApi(req);
      assert.strictEqual(res.status, 200);

      const json = await res.json();
      assert.strictEqual(json.success, true);
      assert.strictEqual(json.data.length, 12);
      assert.strictEqual(json.meta.rolloutClassification, "CLASS_B_CONTROLLED_ROLLOUT");
      assert.deepStrictEqual(json.meta.authorizedZones, ["Guwahati Urban", "Shillong Urban"]);
    });

    test("2.2 GET /api/categories?slug=electrical returns single category", async () => {
      const req = new NextRequest("http://localhost:3000/api/categories?slug=electrical");
      const res = await getCategoriesApi(req);
      assert.strictEqual(res.status, 200);

      const json = await res.json();
      assert.strictEqual(json.success, true);
      assert.strictEqual(json.data.slug, "electrical");
      assert.strictEqual(json.data.title, "Electrical");
    });

    test("2.3 GET /api/workers returns published workers matching search query", async () => {
      const req = new NextRequest("http://localhost:3000/api/workers?search=Electrician");
      const res = await getWorkersApi(req);
      assert.strictEqual(res.status, 200);

      const json = await res.json();
      assert.strictEqual(json.success, true);
      assert.ok(Array.isArray(json.data));
      assert.ok(json.data.length > 0, "Should find electricians");
      assert.ok(json.data.some((w: any) => w.headline.toLowerCase().includes("electrician")));
    });

    test("2.4 GET /api/workers?category=plumbing filters for plumbing artisans", async () => {
      const req = new NextRequest("http://localhost:3000/api/workers?category=plumbing");
      const res = await getWorkersApi(req);
      assert.strictEqual(res.status, 200);

      const json = await res.json();
      assert.strictEqual(json.success, true);
      assert.ok(json.data.length > 0);
      assert.ok(json.data.every((w: any) =>
        w.category_slug === "plumbing" ||
        w.headline.toLowerCase().includes("plumb") ||
        w.subTrades?.some((st: string) => st.toLowerCase().includes("plumb") || st.toLowerCase().includes("pipe"))
      ));
    });

    test("2.5 GET /api/workers?phoneStatus=sms_verified filters only verified phone accounts", async () => {
      const req = new NextRequest("http://localhost:3000/api/workers?phoneStatus=sms_verified");
      const res = await getWorkersApi(req);
      assert.strictEqual(res.status, 200);

      const json = await res.json();
      assert.strictEqual(json.success, true);
      assert.ok(json.data.length > 0);
      assert.ok(json.data.every((w: any) => w.phone_verification_status === "sms_verified"));
    });

    test("2.6 GET /api/workers with location filter respects pilot zones", async () => {
      const req = new NextRequest("http://localhost:3000/api/workers?city=Guwahati");
      const res = await getWorkersApi(req);
      assert.strictEqual(res.status, 200);

      const json = await res.json();
      assert.strictEqual(json.success, true);
      assert.ok(json.data.length > 0);
      assert.ok(json.data.every((w: any) => w.city.toLowerCase() === "guwahati"));
    });
  });

  // =========================================================================
  // 3. VERIFIED PHONE BADGE AND DATA INTEGRITY
  // =========================================================================
  describe("3. Verified Phone Identity Badge Semantics", () => {
    test("3.1 VerifiedPhoneBadge source reflects exact database states", () => {
      const badgeSource = readSrc("src/components/ui/verified-phone-badge.tsx");

      // Real carrier verification
      assert.ok(badgeSource.includes("Phone verified"), "Must display 'Phone verified' for real verification");
      assert.ok(badgeSource.includes("sms_verified"), "Must check status === 'sms_verified'");

      // Sandbox verification
      assert.ok(badgeSource.includes("Test verified"), "Must display 'Test verified' for sandbox verification");
      assert.ok(badgeSource.includes("sandbox_verified"), "Must check status === 'sandbox_verified'");

      // Unverified state
      assert.ok(badgeSource.includes("return null"), "Must return null for unverified or invalid states");

      // Non-claim invariants
      assert.ok(!badgeSource.includes("Government verified"), "Must never claim government verified for phone verification");
      assert.ok(!badgeSource.includes("Background checked"), "Must never claim background checked for phone verification");
    });

    test("3.2 Featured professionals contain verified and sandbox phone statuses", () => {
      const hasSms = FEATURED_PROFESSIONALS.some((p: any) => p.phoneVerificationStatus === "sms_verified");
      const hasSandbox = FEATURED_PROFESSIONALS.some((p: any) => p.phoneVerificationStatus === "sandbox_verified");
      const hasGuwahati = FEATURED_PROFESSIONALS.some((p) => p.location.city.toLowerCase() === "guwahati");
      const hasShillong = FEATURED_PROFESSIONALS.some((p) => p.location.city.toLowerCase() === "shillong");

      assert.ok(hasSms, "Must have workers with carrier SMS phone verification");
      assert.ok(hasSandbox, "Must have workers with sandbox test verification");
      assert.ok(hasGuwahati, "Must have verified workers in Guwahati Urban pilot zone");
      assert.ok(hasShillong, "Must have verified workers in Shillong Urban pilot zone");
    });

    test("3.3 ProfessionalCard and ProfileHero integrate VerifiedPhoneBadge", () => {
      const cardSource = readSrc("src/components/identity/professional-card.tsx");
      assert.ok(cardSource.includes("VerifiedPhoneBadge"), "ProfessionalCard must import VerifiedPhoneBadge");
      assert.ok(cardSource.includes("<VerifiedPhoneBadge status={professional.phoneVerificationStatus}"), "ProfessionalCard must render VerifiedPhoneBadge");

      const heroSource = readSrc("src/components/profile/profile-hero.tsx");
      assert.ok(heroSource.includes("VerifiedPhoneBadge"), "ProfileHero must import VerifiedPhoneBadge");
      assert.ok(heroSource.includes("<VerifiedPhoneBadge status={profile.phoneVerificationStatus}"), "ProfileHero must render VerifiedPhoneBadge");
    });
  });

  // =========================================================================
  // 4. FIND PROFESSIONALS PAGE & UI/UX QUALITY
  // =========================================================================
  describe("4. Find Professionals Marketplace Page UI", () => {
    test("4.1 Route /find-professionals exists and follows design governance", () => {
      const pageSource = readSrc("src/app/find-professionals/page.tsx");

      // Anti-slop invariants
      assert.ok(!pageSource.includes("from-purple-"), "Must not use generic purple AI gradients");
      assert.ok(!pageSource.includes("backdrop-blur-md bg-white/5"), "Must not use arbitrary glassmorphism blur circles");
      assert.ok(!pageSource.includes("99.9% Faster"), "Must not display fake ungrounded metrics");

      // Color tokens & visual direction
      assert.ok(pageSource.includes("bg-ivory"), "Must use Warm Ivory canvas background");
      assert.ok(pageSource.includes("text-forest"), "Must use Deep Forest Green typography and anchors");
      assert.ok(pageSource.includes("border-forest"), "Must use tactile hairline borders");

      // Required components
      assert.ok(pageSource.includes("Find the right professional"), "Must include designated marketplace header");
      assert.ok(pageSource.includes("What service do you need? Try electrician, plumber, carpenter..."), "Must include standard search placeholder");
      assert.ok(pageSource.includes("MARKETPLACE_CATEGORIES"), "Must bind to structured marketplace categories");
      assert.ok(pageSource.includes("VerifiedPhoneBadge"), "Must render verified phone badge in search results");
      assert.ok(pageSource.includes("BookingRequestDialog"), "Must integrate real service request dialog");
    });

    test("4.2 Navigation includes visible 'Find Professionals' links", () => {
      const headerSource = readSrc("src/components/layout/institutional-header.tsx");
      assert.ok(headerSource.includes('href: "/find-professionals"'), "Header primary nav must link to /find-professionals");

      const mobileNavSource = readSrc("src/components/layout/mobile-bottom-nav.tsx");
      assert.ok(mobileNavSource.includes('href: "/find-professionals"'), "Mobile bottom nav must link to /find-professionals");

      const homeSource = readSrc("src/app/page.tsx");
      assert.ok(homeSource.includes('href="/find-professionals"'), "Homepage must link to /find-professionals");
    });

    test("4.3 Customer dashboard includes link to Find Professionals", () => {
      const bookingsContainer = readSrc("src/components/customer/customer-bookings-container.tsx");
      assert.ok(bookingsContainer.includes('href="/find-professionals"'), "Customer bookings empty state must link to /find-professionals");
    });
  });

  // =========================================================================
  // 5. REGISTRATION PHONE VERIFICATION & OPTIONAL EMAIL RECOVERY
  // =========================================================================
  describe("5. End-to-End Worker Registration & Identity Invariants", () => {
    test("5.1 Worker can register with phone OTP verification and optional email", async () => {
      const raw10 = randomIndian10();
      const ip = uniqueIp();
      const proof = await getProofForPhone(raw10, ip);
      const email = `bipul.sharma.${Date.now()}.${Math.floor(Math.random() * 1000)}@example.com`;

      // Register with optional email
      const req = new NextRequest("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
        body: JSON.stringify({
          fullName: "Bipul Sharma",
          phone: raw10,
          password: "SecurePassword@123",
          confirmPassword: "SecurePassword@123",
          role: "worker",
          verificationProof: proof,
          email,
          termsAccepted: true,
        }),
      });

      const regRes = await registerRoute(req);
      const regJson = await regRes.json();
      assert.strictEqual(regRes.status, 201, `Registration failed: ${regJson.message}`);
      assert.strictEqual(regJson.success, true);
      assert.strictEqual(regJson.user.phoneVerificationStatus, "sandbox_verified");
      assert.strictEqual(regJson.user.email, email);
      assert.strictEqual(regJson.user.emailVerified, false);
    });

    test("5.2 Worker can register with phone OTP verification without email (null)", async () => {
      const raw10 = randomIndian10();
      const ip = uniqueIp();
      const proof = await getProofForPhone(raw10, ip);

      const req = new NextRequest("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
        body: JSON.stringify({
          fullName: "Anita Das",
          phone: raw10,
          password: "SecurePassword@123",
          confirmPassword: "SecurePassword@123",
          role: "worker",
          verificationProof: proof,
          termsAccepted: true,
        }),
      });

      const regRes = await registerRoute(req);
      const regJson = await regRes.json();
      assert.strictEqual(regRes.status, 201, `Registration failed: ${regJson.message}`);
      assert.strictEqual(regJson.success, true);
      assert.strictEqual(regJson.user.phoneVerificationStatus, "sandbox_verified");
      assert.strictEqual(regJson.user.email, null);
    });

    test("5.3 Duplicate phone registration is securely rejected", async () => {
      const raw10 = randomIndian10();
      const ip = uniqueIp();

      const proof1 = await getProofForPhone(raw10, ip);
      const req1 = new NextRequest("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
        body: JSON.stringify({
          fullName: "Primary User",
          phone: raw10,
          password: "SecurePassword@123",
          confirmPassword: "SecurePassword@123",
          role: "worker",
          verificationProof: proof1,
          termsAccepted: true,
        }),
      });
      const res1 = await registerRoute(req1);
      assert.strictEqual(res1.status, 201);

      // Attempt second registration with same phone
      const req2 = new NextRequest("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": uniqueIp() },
        body: JSON.stringify({
          fullName: "Duplicate Attacker",
          phone: raw10,
          password: "DifferentPassword@123",
          confirmPassword: "DifferentPassword@123",
          role: "customer",
          verificationProof: proof1, // replay attempt
          termsAccepted: true,
        }),
      });
      const res2 = await registerRoute(req2);
      assert.ok(res2.status === 401 || res2.status === 409, `Expected 401 or 409, got ${res2.status}`);
    });
  });
});
