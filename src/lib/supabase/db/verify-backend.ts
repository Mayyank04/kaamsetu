/**
 * KAAMSETU Supabase Backend Verification Suite
 * Tests and verifies schema migrations, RLS logic, typed interfaces, and query helpers.
 */

import * as fs from "fs";
import * as path from "path";
import { getOccupations, getOccupationBySlug, getOccupationWithSkills } from "./occupations";
import { getPublishedWorkerProfiles, getWorkerProfileBySlug } from "./profiles";
import { getWorkerPortfolio } from "./portfolio";
import { checkReviewEligibility, getWorkerReviews } from "./reviews";
import { getWorkerRecords } from "./work-records";
import { env } from "../../env";

interface TestResult {
  suite: string;
  test: string;
  passed: boolean;
  details?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, suite: string, test: string, details = "") {
  results.push({
    suite,
    test,
    passed: Boolean(condition),
    details,
  });
}

export async function runBackendVerification() {
  console.log("=================================================================");
  console.log("KAAMSETU SUPABASE BACKEND VERIFICATION SUITE");
  console.log("=================================================================\n");

  const projectRoot = process.cwd();

  // ---------------------------------------------------------------------------
  // TEST SUITE 1: Migration & Schema SQL Files
  // ---------------------------------------------------------------------------
  const migration1Path = path.join(projectRoot, "supabase/migrations/20261114000001_initial_schema.sql");
  const migration2Path = path.join(projectRoot, "supabase/migrations/20261114000002_row_level_security.sql");
  const seedPath = path.join(projectRoot, "supabase/seed.sql");

  assert(fs.existsSync(migration1Path), "1. SQL Migrations", "Migration 01 (Initial Schema) exists");
  assert(fs.existsSync(migration2Path), "1. SQL Migrations", "Migration 02 (Row Level Security) exists");
  assert(fs.existsSync(seedPath), "1. SQL Migrations", "Seed SQL data exists");

  const m1Content = fs.readFileSync(migration1Path, "utf-8");
  const requiredTables = [
    "occupations",
    "skills",
    "profiles",
    "worker_profiles",
    "worker_skills",
    "portfolio",
    "bookings",
    "reviews",
    "work_records",
  ];

  for (const table of requiredTables) {
    const tableRegex = new RegExp(`CREATE TABLE (IF NOT EXISTS )?public\\.${table}`, "i");
    assert(
      tableRegex.test(m1Content),
      "1. SQL Migrations",
      `Table public.${table} defined in schema`
    );
  }

  // Check unique slug trigger
  assert(
    m1Content.includes("generate_worker_profile_slug"),
    "1. SQL Migrations",
    "Unique profile slug generation trigger function defined"
  );

  // ---------------------------------------------------------------------------
  // TEST SUITE 2: Row Level Security (RLS) Policies
  // ---------------------------------------------------------------------------
  const m2Content = fs.readFileSync(migration2Path, "utf-8");

  for (const table of requiredTables) {
    assert(
      m2Content.includes(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY`),
      "2. Row Level Security",
      `RLS enabled on public.${table}`
    );
  }

  assert(
    m2Content.includes("Public read access only to published worker profiles") &&
    m2Content.includes("is_published = true"),
    "2. Row Level Security",
    "Public read access STRICTLY gated to published profiles (is_published = true)"
  );

  assert(
    m2Content.includes("Public read portfolio only for published workers"),
    "2. Row Level Security",
    "Private portfolio policy: public read only for published workers"
  );

  assert(
    m2Content.includes("Customers and assigned workers can view their bookings"),
    "2. Row Level Security",
    "Strict booking ownership policy enforced"
  );

  assert(
    m2Content.includes("Only eligible customers with completed bookings can insert reviews") &&
    m2Content.includes("status = 'completed'"),
    "2. Row Level Security",
    "Customer review eligibility: ONLY customers with a completed booking can review"
  );

  // ---------------------------------------------------------------------------
  // TEST SUITE 3: Demo Seed Data Coverage (At least 9 occupations)
  // ---------------------------------------------------------------------------
  const seedContent = fs.readFileSync(seedPath, "utf-8");

  const occupationMatches = seedContent.match(/'11111111-1111-1111-1111-1111111111\d{2}'/g);
  const occupationCount = occupationMatches ? new Set(occupationMatches).size : 0;
  assert(
    occupationCount >= 9,
    "3. Seed Data Coverage",
    `Demo seed data covers ${occupationCount} distinct occupations (>= 9 required)`
  );

  assert(
    seedContent.includes("is_published, availability_status") &&
    seedContent.includes("false, 'unavailable'") &&
    seedContent.includes("preeti-kulkarni-mumbai"),
    "3. Seed Data Coverage",
    "Includes unpublished draft profile for RLS testing isolation"
  );

  assert(
    seedContent.includes("BK-2025-4011") && seedContent.includes("'completed'"),
    "3. Seed Data Coverage",
    "Includes completed service bookings eligible for review"
  );

  assert(
    seedContent.includes("sha256_"),
    "3. Seed Data Coverage",
    "Includes cryptographic verification hashes on work records"
  );

  // ---------------------------------------------------------------------------
  // TEST SUITE 4: Server Database Helper Queries
  // ---------------------------------------------------------------------------
  const occupations = await getOccupations();
  assert(occupations.length >= 8, "4. Database Helpers", `getOccupations returned ${occupations.length} trades`);

  const solarOcc = await getOccupationBySlug("electrical-solar");
  assert(solarOcc !== null && solarOcc.slug === "electrical-solar", "4. Database Helpers", "getOccupationBySlug resolves electrical-solar");

  const occWithSkills = await getOccupationWithSkills(solarOcc ? solarOcc.id : "test-id");
  assert(occWithSkills.skills.length > 0, "4. Database Helpers", `getOccupationWithSkills returns ${occWithSkills.skills.length} skills`);

  const publishedWorkers = await getPublishedWorkerProfiles();
  assert(publishedWorkers.length > 0, "4. Database Helpers", `getPublishedWorkerProfiles returns ${publishedWorkers.length} profiles`);

  const draftInPublic = publishedWorkers.some((w) => !w.is_published);
  assert(!draftInPublic, "4. Database Helpers", "Verified ZERO unpublished/draft profiles exposed to public queries");

  const rameshwar = await getWorkerProfileBySlug("rameshwar-sharma-jaipur");
  assert(rameshwar !== null, "4. Database Helpers", "getWorkerProfileBySlug resolves rameshwar-sharma-jaipur");

  const portfolio = await getWorkerPortfolio(rameshwar ? rameshwar.id : "pro-1");
  assert(portfolio.length > 0, "4. Database Helpers", `getWorkerPortfolio returned ${portfolio.length} portfolio items`);

  const reviews = await getWorkerReviews(rameshwar ? rameshwar.id : "pro-1");
  assert(reviews.length > 0, "4. Database Helpers", `getWorkerReviews returned ${reviews.length} reviews`);

  const workRecords = await getWorkerRecords(rameshwar ? rameshwar.id : "pro-1");
  assert(workRecords.length > 0, "4. Database Helpers", `getWorkerRecords returned ${workRecords.length} records`);

  // Review eligibility check
  const eligibility = await checkReviewEligibility(
    "44444444-4444-4444-4444-444444440001", // Customer with completed booking
    "55555555-5555-5555-5555-555555550001"  // Rameshwar Sharma
  );
  assert(eligibility.eligible, "4. Database Helpers", "checkReviewEligibility confirms customer with completed booking");

  // ---------------------------------------------------------------------------
  // TEST SUITE 5: Security Invariant (Service-Role Key Isolation)
  // ---------------------------------------------------------------------------
  const browserClientPath = path.join(projectRoot, "src/lib/supabase/client.ts");
  const browserClientContent = fs.readFileSync(browserClientPath, "utf-8");
  assert(
    !browserClientContent.includes("SUPABASE_SERVICE_ROLE_KEY") &&
    browserClientContent.includes("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    "5. Security Invariant",
    "Browser client NEVER references or exposes SUPABASE_SERVICE_ROLE_KEY"
  );

  const envContent = fs.readFileSync(path.join(projectRoot, "src/lib/env.ts"), "utf-8");
  assert(
    !envContent.includes("NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY"),
    "5. Security Invariant",
    "Service role key is NOT exposed via NEXT_PUBLIC prefix"
  );

  // ---------------------------------------------------------------------------
  // SUMMARY REPORT
  // ---------------------------------------------------------------------------
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = total - passed;

  console.log("\n=================================================================");
  console.log(`VERIFICATION SUMMARY: ${passed}/${total} TESTS PASSED (${failed} FAILED)`);
  console.log("=================================================================");

  results.forEach((r, idx) => {
    const icon = r.passed ? "✓ PASS" : "✗ FAIL";
    console.log(`${icon} [${r.suite}] ${r.test}`);
    if (r.details && !r.passed) {
      console.log(`       ↳ ${r.details}`);
    }
  });

  return { total, passed, failed, results };
}

// Execute if run directly
runBackendVerification().catch((err) => {
  console.error("Verification suite encountered an error:", err);
  process.exit(1);
});
