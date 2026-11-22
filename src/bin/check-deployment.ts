#!/usr/bin/env tsx
/**
 * KAAMSETU Production Deployment & Infrastructure Readiness Checker
 * Verifies environment variables, Supabase connectivity, database schema cache,
 * and deployment integrity without leaking sensitive credentials.
 */

async function checkDeployment() {
  console.log("================================================================================");
  console.log("KAAMSETU PHASE 45 — PRODUCTION DEPLOYMENT READINESS CHECK");
  console.log("================================================================================");

  // 1. Environment Variable Audit
  const requiredEnvVars = [
    { key: "NEXT_PUBLIC_SUPABASE_URL", label: "Supabase Project URL" },
    { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", label: "Supabase Public Anon Key" },
    { key: "SUPABASE_SERVICE_ROLE_KEY", label: "Supabase Service Role Key" },
    { key: "GEMINI_API_KEY", label: "Google Gemini API Key" },
    { key: "RATE_LIMIT_HMAC_SECRET", label: "Rate Limiting HMAC Secret" },
    { key: "CREDENTIAL_SIGNING_KEY", label: "Ed25519 Credential Signing Key" },
  ];

  console.log("\n[1] Environment Variables Audit:");
  let envPass = true;
  for (const env of requiredEnvVars) {
    const val = process.env[env.key];
    const isSet = Boolean(val && val.trim().length > 0);
    const masked = isSet ? `${val!.slice(0, 8)}...[REDACTED]` : "[MISSING]";
    console.log(`  • ${env.label} (${env.key}): ${isSet ? "CONFIGURED (" + masked + ")" : "MISSING"}`);
    if (!isSet) envPass = false;
  }

  // 2. Supabase Cloud Connection & PostgREST Inspection
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log("\n[2] Supabase Infrastructure Connectivity:");
  if (!supabaseUrl || !serviceKey) {
    console.log("  ✖ Supabase credentials missing. Cannot probe cloud database.");
    return;
  }

  try {
    const startTime = Date.now();
    const res = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    });
    const latency = Date.now() - startTime;

    if (!res.ok) {
      console.log(`  ✖ Supabase endpoint returned HTTP ${res.status} (${res.statusText}) [${latency}ms]`);
      return;
    }

    const openApiSchema = await res.json();
    console.log(`  ✔ Supabase PostgREST Gateway Online [${latency}ms, HTTP 200]`);

    // 3. Database Schema Cache Inspection
    console.log("\n[3] PostgreSQL Database Table & Schema Cache Audit:");
    const expectedTables = [
      "profiles",
      "worker_profiles",
      "occupations",
      "skills",
      "worker_skills",
      "credential_registry",
      "bookings",
      "reviews",
      "contractor_jobs",
      "custom_localities",
    ];

    const definitions = openApiSchema.definitions || {};
    const missingTables: string[] = [];

    for (const table of expectedTables) {
      const exists = Boolean(definitions[table]);
      const colCount = exists ? Object.keys(definitions[table]?.properties || {}).length : 0;
      console.log(`  • public.${table.padEnd(22)}: ${exists ? `ONLINE (${colCount} columns)` : "PENDING MIGRATION"}`);
      if (!exists) {
        missingTables.push(table);
      }
    }

    // Check extended columns on worker_profiles
    if (definitions.worker_profiles) {
      const cols = definitions.worker_profiles.properties || {};
      const extendedCols = ["district", "locality", "profile_type", "business_name", "vendor_type", "stall_type", "operating_hours", "product_catalog", "delivery_available", "contact_preference"];
      const missingCols = extendedCols.filter((c) => !cols[c]);

      console.log("\n[4] worker_profiles Extended Columns Parity:");
      if (missingCols.length === 0) {
        console.log("  ✔ All extended small-vendor and geographic columns present in schema cache.");
      } else {
        console.log(`  ⚠ Missing extended columns in schema cache: ${missingCols.join(", ")}`);
      }
    }

    if (missingTables.length > 0) {
      console.log("\n[ACTION REQUIRED]: Forward-only migration required for missing tables.");
      console.log("Apply the following migration script in your Supabase SQL Editor:");
      console.log("  → supabase/migrations/20261122000001_phase45_complete_production_master_schema.sql");
    } else {
      console.log("\n✔ Database schema cache is 100% synchronized with application requirements.");
    }

  } catch (err: any) {
    console.log(`  ✖ Failed to connect to Supabase: ${err.message}`);
  }

  console.log("\n================================================================================");
  console.log("DEPLOYMENT READINESS CHECK COMPLETE");
  console.log("================================================================================");
}

checkDeployment().catch((err) => {
  console.error("Check deployment error:", err);
  process.exit(1);
});
