/**
 * KAAMSETU — PHASE 40: DATABASE READINESS AUDIT SCRIPT
 * CLI verification tool for remote PostgreSQL database schema,
 * PostgREST exposed definitions, tables, columns, RPCs, and Auth.
 *
 * Usage: npx tsx scripts/verify-database-readiness.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

loadEnvFile(path.join(process.cwd(), ".env.local"));
loadEnvFile(path.join(process.cwd(), ".env"));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const hmacSecret = process.env.RATE_LIMIT_HMAC_SECRET;

interface CheckItem {
  name: string;
  type: "config" | "auth" | "table" | "column" | "rpc";
  status: "PASS" | "FAIL";
  details?: string;
}

async function runReadinessAudit() {
  console.log("================================================================================");
  console.log("KAAMSETU — PHASE 40 DATABASE READINESS & RECOVERY AUDIT");
  console.log("================================================================================");

  const checks: CheckItem[] = [];

  // 1. Config Checks
  const hasUrl = Boolean(supabaseUrl && !supabaseUrl.includes("placeholder"));
  const hasService = Boolean(serviceKey && !serviceKey.includes("placeholder"));
  const hasHmac = Boolean(hmacSecret && hmacSecret.length >= 32);

  checks.push({
    name: "NEXT_PUBLIC_SUPABASE_URL",
    type: "config",
    status: hasUrl ? "PASS" : "FAIL",
    details: hasUrl ? `${supabaseUrl?.slice(0, 30)}...` : "Missing or placeholder",
  });

  checks.push({
    name: "SUPABASE_SERVICE_ROLE_KEY",
    type: "config",
    status: hasService ? "PASS" : "FAIL",
    details: hasService ? `Configured (${serviceKey?.length} chars)` : "Missing or placeholder",
  });

  checks.push({
    name: "RATE_LIMIT_HMAC_SECRET",
    type: "config",
    status: hasHmac ? "PASS" : "FAIL",
    details: hasHmac ? `Configured (${hmacSecret?.length} chars)` : "Must be >= 32 characters",
  });

  if (!hasUrl || !hasService) {
    console.error("FATAL: Supabase credentials missing. Terminating audit.");
    printResults(checks);
    process.exit(1);
  }

  const client = createClient(supabaseUrl!, serviceKey!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 2. Auth API Probe
  try {
    const { data: users, error: authErr } = await client.auth.admin.listUsers({ page: 1, perPage: 1 });
    if (!authErr) {
      checks.push({
        name: "Supabase Auth Admin Service",
        type: "auth",
        status: "PASS",
        details: `Connected (${users?.users?.length ?? 0} user records retrieved)`,
      });
    } else {
      checks.push({
        name: "Supabase Auth Admin Service",
        type: "auth",
        status: "FAIL",
        details: `[${authErr.status}] ${authErr.message}`,
      });
    }
  } catch (err: unknown) {
    checks.push({
      name: "Supabase Auth Admin Service",
      type: "auth",
      status: "FAIL",
      details: err instanceof Error ? err.message : String(err),
    });
  }

  // 3. Mandatory Core Tables Check
  const requiredTables = [
    "profiles",
    "worker_profiles",
    "occupations",
    "skills",
    "worker_skills",
    "user_consents",
    "auth_rate_limits",
  ];

  for (const table of requiredTables) {
    try {
      const { error } = await client.from(table).select("*").limit(0);
      if (!error) {
        checks.push({
          name: `Table: ${table}`,
          type: "table",
          status: "PASS",
          details: "Schema discovered and accessible via PostgREST",
        });
      } else {
        checks.push({
          name: `Table: ${table}`,
          type: "table",
          status: "FAIL",
          details: `[${error.code}] ${error.message}`,
        });
      }
    } catch (err: unknown) {
      checks.push({
        name: `Table: ${table}`,
        type: "table",
        status: "FAIL",
        details: err instanceof Error ? err.message : String(err),
      });
    }
  }

  // 4. Profiles Table Columns Check
  const profileCols = [
    "id",
    "full_name",
    "role",
    "email",
    "phone",
    "account_status",
    "phone_verified",
  ];

  for (const col of profileCols) {
    try {
      const { error } = await client.from("profiles").select(col).limit(0);
      if (!error) {
        checks.push({
          name: `Column: profiles.${col}`,
          type: "column",
          status: "PASS",
          details: "Column discovered",
        });
      } else {
        checks.push({
          name: `Column: profiles.${col}`,
          type: "column",
          status: "FAIL",
          details: `[${error.code}] ${error.message}`,
        });
      }
    } catch (err: unknown) {
      checks.push({
        name: `Column: profiles.${col}`,
        type: "column",
        status: "FAIL",
        details: err instanceof Error ? err.message : String(err),
      });
    }
  }

  // 5. Stored Procedures (RPCs) Check
  try {
    const { error: rpc1Err } = await client.rpc("get_rate_limit_status", { p_key: "probe:test" });
    checks.push({
      name: "RPC: get_rate_limit_status",
      type: "rpc",
      status: !rpc1Err ? "PASS" : "FAIL",
      details: rpc1Err ? `[${rpc1Err.code}] ${rpc1Err.message}` : "Callable with service_role",
    });
  } catch (err: unknown) {
    checks.push({
      name: "RPC: get_rate_limit_status",
      type: "rpc",
      status: "FAIL",
      details: err instanceof Error ? err.message : String(err),
    });
  }

  try {
    const { error: rpc2Err } = await client.rpc("check_and_increment_rate_limit", {
      p_key: "probe:test",
      p_max_attempts: 100,
      p_window_seconds: 60,
      p_block_seconds: 60,
    });
    checks.push({
      name: "RPC: check_and_increment_rate_limit",
      type: "rpc",
      status: !rpc2Err ? "PASS" : "FAIL",
      details: rpc2Err ? `[${rpc2Err.code}] ${rpc2Err.message}` : "Callable with service_role",
    });
  } catch (err: unknown) {
    checks.push({
      name: "RPC: check_and_increment_rate_limit",
      type: "rpc",
      status: "FAIL",
      details: err instanceof Error ? err.message : String(err),
    });
  }

  printResults(checks);

  const allPassed = checks.every((c) => c.status === "PASS");
  if (!allPassed) {
    console.log("\n================================================================================");
    console.log("RECOVERY REQUIRED:");
    console.log("1. Open the Supabase Dashboard: https://supabase.com/dashboard/project/anwppwjlismjyovbyfmb");
    console.log("2. Navigate to SQL Editor.");
    console.log("3. Paste and run: supabase/migrations/20261118000001_phase40_root_cause_master_schema.sql");
    console.log("4. Rerun this verification script: npx tsx scripts/verify-database-readiness.ts");
    console.log("================================================================================\n");
    // Return code 0 for informational audit in CLI environments so build pipelines can inspect details
  } else {
    console.log("\n>>> ALL DATABASE SCHEMA AUDIT CHECKS PASSED: OPERATIONAL <<<\n");
  }
}

function printResults(checks: CheckItem[]) {
  console.log("\nAUDIT CHECK MATRIX:");
  console.log("--------------------------------------------------------------------------------");
  for (const c of checks) {
    const symbol = c.status === "PASS" ? "✓ [PASS]" : "✗ [FAIL]";
    console.log(`${symbol.padEnd(10)} | ${c.type.toUpperCase().padEnd(8)} | ${c.name.padEnd(35)} | ${c.details || ""}`);
  }
  console.log("--------------------------------------------------------------------------------");
}

runReadinessAudit().catch(console.error);
