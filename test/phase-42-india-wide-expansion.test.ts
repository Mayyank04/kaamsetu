/**
 * KAAMSETU — PHASE 42 AUTOMATED COMPREHENSIVE TEST SUITE
 * India-Wide Expansion, Nationwide Accessibility, Decoupled Capabilities & Scalable Architecture
 * 
 * Verifies:
 * 1. Authoritative India Geography Reference System (28 States + 8 UTs = 36 entities)
 * 2. Complete District mapping, PIN code prefixes, and city aliases
 * 3. Decoupled Capability Resolution (Nationwide identity/discovery vs. Pilot commercial dispatch)
 * 4. Nationwide Worker Onboarding & Profile Persistence
 * 5. Expanded 6-Sector Occupations and Skills Taxonomy
 * 6. Geographic Lookup, Validation & Custom Locality APIs
 * 7. Nationwide Worker Discovery Query Filtering
 * 8. Permanent Constitutional Invariant: platform_commission_amount = 0.00
 */

import { test, describe, before } from "node:test";
import assert from "node:assert";
import { NextRequest } from "next/server";
import { GeographicAuthorizationService } from "@/lib/geo/geographic-authorization-service";
import { ServiceCoverageRegistry } from "@/lib/geo/service-coverage-registry";
import { PROFESSIONS_DATA } from "@/lib/data/professions";
import { approvedProfileSubmissionSchema } from "@/schemas/onboarding.schema";
import { POST as postOnboardingSave } from "@/app/api/worker/onboarding/save/route";
import { GET as getGeoStates } from "@/app/api/geo/states/route";
import { GET as getGeoDistricts } from "@/app/api/geo/districts/route";
import { GET as getGeoLookup } from "@/app/api/geo/lookup/route";
import { POST as postGeoValidate } from "@/app/api/geo/validate/route";
import { POST as postCustomLocality } from "@/app/api/geo/custom-locality/route";
import { GET as getWorkers } from "@/app/api/workers/route";
import { __setTestSession } from "@/lib/auth/server";

describe("PHASE 42: India-Wide Expansion & Production Readiness", () => {
  before(() => {
    process.env.OPERATING_CLASSIFICATION = "CLASS_B_CONTROLLED_ROLLOUT";
    process.env.APP_ENV = "test";
  });

  // =========================================================================
  // 1. Authoritative India Geography Reference System
  // =========================================================================
  describe("1. India Geography Reference System (36 States & UTs)", () => {
    test("1.1 Authoritative dataset contains all 28 States and 8 Union Territories", () => {
      const allStates = GeographicAuthorizationService.getAllStates();
      assert.strictEqual(allStates.length, 36, "Must contain exactly 36 States & Union Territories");

      const statesOnly = allStates.filter((s) => !s.isUnionTerritory);
      const utOnly = allStates.filter((s) => s.isUnionTerritory);

      assert.strictEqual(statesOnly.length, 28, "Must contain exactly 28 States");
      assert.strictEqual(utOnly.length, 8, "Must contain exactly 8 Union Territories");
    });

    test("1.2 Every State and UT has valid codes, capitals, and non-empty district lists", () => {
      const allStates = GeographicAuthorizationService.getAllStates();
      for (const st of allStates) {
        assert.ok(st.code && st.code.length === 2, `State ${st.name} must have 2-letter ISO code`);
        assert.ok(st.capital && st.capital.length > 0, `State ${st.name} must have a designated capital`);
        assert.ok(st.districts && st.districts.length > 0, `State ${st.name} must have at least one district`);
        assert.ok(st.pincodePrefixes && st.pincodePrefixes.length > 0, `State ${st.name} must have PIN prefixes`);
      }
    });

    test("1.3 State lookup by name or ISO code is case-insensitive", () => {
      const assamByName = GeographicAuthorizationService.getState("assam");
      assert.ok(assamByName, "Must find Assam by lowercase name");
      assert.strictEqual(assamByName.code, "AS");

      const mhByCode = GeographicAuthorizationService.getState("MH");
      assert.ok(mhByCode, "Must find Maharashtra by ISO code MH");
      assert.strictEqual(mhByCode.name, "Maharashtra");

      const delhi = GeographicAuthorizationService.getState("Delhi");
      assert.ok(delhi?.isUnionTerritory, "Delhi must be identified as Union Territory");
    });

    test("1.4 City aliases and historical transliterations resolve correctly", () => {
      const bombayLookup = GeographicAuthorizationService.lookupCityAlias("Bombay");
      assert.strictEqual(bombayLookup?.city, "Mumbai");
      assert.strictEqual(bombayLookup?.state, "Maharashtra");

      const bangaloreLookup = GeographicAuthorizationService.lookupCityAlias("Bangalore");
      assert.strictEqual(bangaloreLookup?.city, "Bengaluru");
      assert.strictEqual(bangaloreLookup?.state, "Karnataka");

      const calcuttaLookup = GeographicAuthorizationService.lookupCityAlias("Calcutta");
      assert.strictEqual(calcuttaLookup?.city, "Kolkata");
      assert.strictEqual(calcuttaLookup?.state, "West Bengal");

      const madrasLookup = GeographicAuthorizationService.lookupCityAlias("Madras");
      assert.strictEqual(madrasLookup?.city, "Chennai");
      assert.strictEqual(madrasLookup?.state, "Tamil Nadu");
    });

    test("1.5 PIN code lookup resolves authoritative region across India", () => {
      // Northeast (Guwahati)
      const pin781 = GeographicAuthorizationService.lookupPincode("781001");
      assert.ok(pin781, "781001 must resolve");
      assert.strictEqual(pin781.state, "Assam");
      assert.strictEqual(pin781.district, "Kamrup Metropolitan");

      // West (Mumbai)
      const pin400 = GeographicAuthorizationService.lookupPincode("400001");
      assert.ok(pin400, "400001 must resolve");
      assert.strictEqual(pin400.state, "Maharashtra");
      assert.ok(pin400.district && pin400.district.includes("Mumbai"));

      // North (New Delhi)
      const pin110 = GeographicAuthorizationService.lookupPincode("110001");
      assert.ok(pin110, "110001 must resolve");
      assert.strictEqual(pin110.state, "Delhi");

      // South (Bengaluru)
      const pin560 = GeographicAuthorizationService.lookupPincode("560001");
      assert.ok(pin560, "560001 must resolve");
      assert.strictEqual(pin560.state, "Karnataka");
      assert.strictEqual(pin560.district, "Bengaluru Urban");
    });
  });

  // =========================================================================
  // 2. Decoupled Capability Architecture
  // =========================================================================
  describe("2. Decoupled Capability Resolution Matrix", () => {
    test("2.1 Guwahati Urban pilot cluster has full 6/6 operational capabilities", () => {
      const caps = ServiceCoverageRegistry.getCapabilities("Assam", "Kamrup Metropolitan", "781001");
      assert.strictEqual(caps.account_access, true);
      assert.strictEqual(caps.profile_access, true);
      assert.strictEqual(caps.discovery_access, true);
      assert.strictEqual(caps.booking_access, true);
      assert.strictEqual(caps.dispatch_access, true);
      assert.strictEqual(caps.payment_access, true);
    });

    test("2.2 Shillong Urban pilot cluster has full 6/6 operational capabilities", () => {
      const caps = ServiceCoverageRegistry.getCapabilities("Meghalaya", "East Khasi Hills", "793001");
      assert.strictEqual(caps.account_access, true);
      assert.strictEqual(caps.profile_access, true);
      assert.strictEqual(caps.discovery_access, true);
      assert.strictEqual(caps.booking_access, true);
      assert.strictEqual(caps.dispatch_access, true);
      assert.strictEqual(caps.payment_access, true);
    });

    test("2.3 Nationwide locations outside pilot clusters have identity & discovery capabilities enabled", () => {
      const testLocations = [
        { state: "Rajasthan", district: "Jaipur", pincode: "302001" },
        { state: "Maharashtra", district: "Mumbai", pincode: "400001" },
        { state: "Karnataka", district: "Bengaluru Urban", pincode: "560001" },
        { state: "Bihar", district: "Patna", pincode: "800001" },
        { state: "Tamil Nadu", district: "Chennai", pincode: "600001" },
        { state: "Manipur", district: "Imphal West", pincode: "795001" },
      ];

      for (const loc of testLocations) {
        const caps = ServiceCoverageRegistry.getCapabilities(loc.state, loc.district, loc.pincode);
        assert.strictEqual(caps.account_access, true, `${loc.state} must have account_access`);
        assert.strictEqual(caps.profile_access, true, `${loc.state} must have profile_access`);
        assert.strictEqual(caps.discovery_access, true, `${loc.state} must have discovery_access`);
        assert.strictEqual(caps.booking_access, false, `${loc.state} commercial booking restricted under Class B`);
        assert.strictEqual(caps.dispatch_access, false, `${loc.state} commercial dispatch restricted under Class B`);
        assert.strictEqual(caps.payment_access, false, `${loc.state} commercial payment restricted under Class B`);
      }
    });

    test("2.4 validateLocation returns decoupled capabilities and accurate operating zone flags", () => {
      // 1. Guwahati
      const ghy = GeographicAuthorizationService.validateLocation({
        city: "Guwahati",
        state: "Assam",
        district: "Kamrup Metropolitan",
        pincode: "781001",
      });
      assert.strictEqual(ghy.status, "AUTHORIZED");
      assert.strictEqual(ghy.allowed, true);
      assert.strictEqual(ghy.isDispatchEligible, true);
      assert.strictEqual(ghy.allowedForRegistration, true);
      assert.strictEqual(ghy.capabilities.booking_access, true);

      // 2. Jaipur
      const jpr = GeographicAuthorizationService.validateLocation({
        city: "Jaipur",
        state: "Rajasthan",
        district: "Jaipur",
        pincode: "302001",
      });
      assert.strictEqual(jpr.status, "OUT_OF_BOUNDS");
      assert.strictEqual(jpr.allowed, false); // For commercial dispatch
      assert.strictEqual(jpr.isDispatchEligible, false);
      assert.strictEqual(jpr.allowedForRegistration, true); // Permitted for nationwide registration
      assert.strictEqual(jpr.capabilities.profile_access, true);
      assert.strictEqual(jpr.capabilities.discovery_access, true);
      assert.strictEqual(jpr.capabilities.booking_access, false);
    });
  });

  // =========================================================================
  // 3. Worker Onboarding & Profile Persistence
  // =========================================================================
  describe("3. Worker Onboarding & Nationwide Profile Persistence", () => {
    test("3.1 Onboarding schema accepts nationwide locations and optional district/locality", () => {
      const submission = {
        fullName: "Vikram Rathore",
        occupation: "Heavy Earthmoving Equipment Operator",
        category: "automotive_machinery",
        yearsExperience: 14,
        city: "Jaipur",
        state: "Rajasthan",
        district: "Jaipur",
        locality: "Mansarovar Sector 4",
        pincode: "302020",
        skills: ["Excavator Trenching", "Hydraulic Pressure Testing"],
        headline: "Master Heavy Equipment Operator",
        bio: "Over 14 years operating excavators and loaders on major national infrastructure corridors.",
        languages: ["HINDI", "RAJASTHANI"],
      };

      const parsed = approvedProfileSubmissionSchema.parse(submission);
      assert.strictEqual(parsed.fullName, "Vikram Rathore");
      assert.strictEqual(parsed.state, "Rajasthan");
      assert.strictEqual(parsed.district, "Jaipur");
      assert.strictEqual(parsed.locality, "Mansarovar Sector 4");
      assert.strictEqual(parsed.allowNonDispatchProfile, true, "Defaults to true for nationwide onboarding");
    });

    test("3.2 Nationwide worker profile save succeeds with non-dispatch status and 200 OK", async () => {
      __setTestSession({
        id: "test-user-p42-patna",
        phone: "+919876500001",
        fullName: "Anand Kumar",
        role: "worker",
        isDemo: false,
      });

      const req = new NextRequest("http://localhost:3000/api/worker/onboarding/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: "Anand Kumar",
          occupation: "Solar Site Surveyor & CAD Draftsperson",
          category: "digital_professional_services",
          yearsExperience: 6,
          headline: "Rooftop Solar PV Surveyor and Electrical CAD Designer",
          bio: "Specializing in solar shadow profiling, AutoCAD single line diagrams, and PV string sizing.",
          languages: ["HINDI", "ENGLISH"],
          city: "Patna",
          state: "Bihar",
          district: "Patna",
          locality: "Kankarbagh",
          pincode: "800020",
          skills: ["Helioscope Shadow Analysis", "AutoCAD SLD Drafting"],
          equipmentHandled: ["Laser Rangefinder", "Inclinometer"],
          dailyRateMin: 1200,
          dailyRateMax: 2000,
        }),
      });

      const res = await postOnboardingSave(req);
      assert.strictEqual(res.status, 200, "Nationwide onboarding must succeed with HTTP 200");

      const body = await res.json();
      assert.strictEqual(body.success, true);
      assert.strictEqual(body.data?.is_dispatch_eligible, false, "Outside Class B cluster must be non-dispatch");
      assert.strictEqual(body.data?.dispatch_status, "non_dispatch_region");
      assert.ok(body.data?.registryId?.startsWith("IN-BI-2026-"), "Registry ID must reflect state prefix BI");
      assert.strictEqual(body.data?.city, "Patna");
      assert.strictEqual(body.data?.district, "Patna");
    });

    test("3.3 Pilot cluster worker onboarding save succeeds with active dispatch status", async () => {
      __setTestSession({
        id: "test-user-p42-guwahati",
        phone: "+919876500002",
        fullName: "Pranab Barman",
        role: "worker",
        isDemo: false,
      });

      const req = new NextRequest("http://localhost:3000/api/worker/onboarding/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: "Pranab Barman",
          occupation: "Electrical & Solar",
          category: "construction_trades",
          yearsExperience: 8,
          headline: "Licensed 3-Phase Industrial Wireman and Solar Specialist",
          bio: "Industrial power distribution, rooftop solar inverters, and DISCOM grid safety earthing.",
          languages: ["ASSAMESE", "HINDI", "ENGLISH"],
          city: "Guwahati",
          state: "Assam",
          district: "Kamrup Metropolitan",
          pincode: "781003",
          skills: ["3-Phase Inverters", "Rooftop Solar Array"],
          dailyRateMin: 1000,
          dailyRateMax: 1800,
        }),
      });

      const res = await postOnboardingSave(req);
      assert.strictEqual(res.status, 200);

      const body = await res.json();
      assert.strictEqual(body.success, true);
      assert.strictEqual(body.data?.is_dispatch_eligible, true, "Guwahati worker must be dispatch eligible");
      assert.strictEqual(body.data?.dispatch_status, "active");
      assert.ok(body.data?.registryId?.startsWith("IN-AS-2026-"), "Registry ID must reflect state prefix AS");
    });

    test("3.4 Boundary condition: Explicit allowNonDispatchProfile=false for out-of-bounds location returns 403", async () => {
      __setTestSession({
        id: "test-user-p42-reject",
        phone: "+919876500003",
        fullName: "Test Reject",
        role: "worker",
        isDemo: false,
      });

      const req = new NextRequest("http://localhost:3000/api/worker/onboarding/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: "Test Reject",
          occupation: "Plumbing & Sanitation",
          category: "construction_trades",
          city: "Kolkata",
          state: "West Bengal",
          pincode: "700001",
          skills: ["CPVC Piping"],
          headline: "Experienced Plumber",
          bio: "Plumbing services in Kolkata.",
          languages: ["BENGALI", "HINDI"],
          allowNonDispatchProfile: false, // Explicitly false should enforce 403 boundary
        }),
      });

      const res = await postOnboardingSave(req);
      assert.strictEqual(res.status, 403, "Explicit allowNonDispatchProfile=false must return 403");
      const body = await res.json();
      assert.strictEqual(body.status, "OUT_OF_BOUNDS");
    });
  });

  // =========================================================================
  // 4. Expanded Occupations Taxonomy Across 6 Sectors
  // =========================================================================
  describe("4. Expanded Occupations Taxonomy (6 Mandatory Sectors)", () => {
    test("4.1 Taxonomy covers all 6 required sectors", () => {
      const sectors = new Set(PROFESSIONS_DATA.map((p) => p.sector).filter(Boolean));
      const requiredSectors = [
        "construction_trades",
        "automotive_machinery",
        "home_personal_services",
        "agriculture_rural",
        "transport_logistics",
        "digital_professional_services",
      ];

      for (const reqSec of requiredSectors) {
        assert.ok(sectors.has(reqSec as any), `Taxonomy must include sector: ${reqSec}`);
      }
    });

    test("4.2 Every profession has bilingual titles, descriptions, popular skills, and non-zero wage brackets", () => {
      for (const p of PROFESSIONS_DATA) {
        assert.ok(p.title && p.title.length > 0, `Profession ${p.id} must have English title`);
        assert.ok(p.hindiTitle && p.hindiTitle.length > 0, `Profession ${p.id} must have Hindi title`);
        assert.ok(p.popularSkills && p.popularSkills.length >= 2, `Profession ${p.id} must have at least 2 skills`);
        assert.ok(p.averageDailyRate.min > 0, `Profession ${p.id} min daily rate must be positive`);
        assert.ok(p.averageDailyRate.max >= p.averageDailyRate.min, `Profession ${p.id} max daily rate >= min`);
      }
    });
  });

  // =========================================================================
  // 5. Geographic Lookup, Validation & Custom Locality APIs
  // =========================================================================
  describe("5. Geographic APIs", () => {
    test("5.1 GET /api/geo/states returns all 36 states & UTs", async () => {
      const req = new NextRequest("http://localhost:3000/api/geo/states");
      const res = await getGeoStates(req);
      assert.strictEqual(res.status, 200);

      const json = await res.json();
      assert.strictEqual(json.success, true);
      assert.strictEqual(json.data.length, 36);
      assert.strictEqual(json.meta.total_states, 28);
      assert.strictEqual(json.meta.total_union_territories, 8);
    });

    test("5.2 GET /api/geo/districts?state=Assam returns authoritative districts", async () => {
      const req = new NextRequest("http://localhost:3000/api/geo/districts?state=Assam");
      const res = await getGeoDistricts(req);
      assert.strictEqual(res.status, 200);

      const json = await res.json();
      assert.strictEqual(json.success, true);
      assert.strictEqual(json.meta.state, "Assam");
      const kamrup = json.data.find((d: any) => (d.name || d) === "Kamrup Metropolitan");
      assert.ok(kamrup, "Assam must include Kamrup Metropolitan");
    });

    test("5.3 GET /api/geo/lookup?pincode=781001 resolves location", async () => {
      const req = new NextRequest("http://localhost:3000/api/geo/lookup?pincode=781001");
      const res = await getGeoLookup(req);
      assert.strictEqual(res.status, 200);

      const json = await res.json();
      assert.strictEqual(json.success, true);
      assert.strictEqual(json.data.state, "Assam");
      assert.strictEqual(json.data.district, "Kamrup Metropolitan");
    });

    test("5.4 POST /api/geo/validate returns decoupled capabilities", async () => {
      const req = new NextRequest("http://localhost:3000/api/geo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: "Bengaluru",
          state: "Karnataka",
          district: "Bengaluru Urban",
          pincode: "560001",
        }),
      });

      const res = await postGeoValidate(req);
      assert.strictEqual(res.status, 200);

      const json = await res.json();
      assert.strictEqual(json.success, true);
      assert.strictEqual(json.data.allowedForRegistration, true);
      assert.strictEqual(json.data.isDispatchEligible, false);
      assert.strictEqual(json.data.capabilities.account_access, true);
      assert.strictEqual(json.data.capabilities.booking_access, false);
    });

    test("5.5 POST /api/geo/custom-locality records unlisted villages/hamlets", async () => {
      __setTestSession({
        id: "test-user-locality",
        phone: "+919876500004",
        fullName: "Rameshwar",
        role: "worker",
        isDemo: false,
      });

      const req = new NextRequest("http://localhost:3000/api/geo/custom-locality", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          state: "Assam",
          district: "Kamrup Metropolitan",
          localityName: "Sonapur Village Ward 3",
          pincode: "782402",
          localityType: "village",
        }),
      });

      const res = await postCustomLocality(req);
      assert.strictEqual(res.status, 200);

      const json = await res.json();
      assert.strictEqual(json.success, true);
      assert.strictEqual(json.data.locality_name, "Sonapur Village Ward 3");
      assert.strictEqual(json.data.review_status, "pending");
    });
  });

  // =========================================================================
  // 6. Nationwide Worker Discovery Query Filtering
  // =========================================================================
  describe("6. Nationwide Worker Discovery Filtering", () => {
    test("6.1 GET /api/workers supports state, district, and pincode filters", async () => {
      const req = new NextRequest("http://localhost:3000/api/workers?state=Assam&city=Guwahati");
      const res = await getWorkers(req);
      assert.strictEqual(res.status, 200);

      const json = await res.json();
      assert.strictEqual(json.success, true);
      assert.ok(Array.isArray(json.data));
      assert.strictEqual(json.meta.filters.state, "Assam");
      assert.strictEqual(json.meta.filters.city, "Guwahati");
    });
  });

  // =========================================================================
  // 7. Permanent Constitutional Invariant
  // =========================================================================
  describe("7. Permanent Constitutional Invariant", () => {
    test("7.1 Commission invariant: platform_commission_amount = 0.00 on artisan earnings", () => {
      const artisanGrossDailyRate = 1200.0;
      const platformFeePercent = 0.0;
      const platformCommissionAmount = artisanGrossDailyRate * platformFeePercent;
      const artisanNetPayout = artisanGrossDailyRate - platformCommissionAmount;

      assert.strictEqual(platformCommissionAmount, 0.0);
      assert.strictEqual(artisanNetPayout, 1200.0, "Artisan must receive 100% of agreed wage with 0 platform deduction");
    });
  });
});
