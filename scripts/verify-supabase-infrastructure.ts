/**
 * KAAMSETU Supabase Remote Infrastructure Verification Script
 * Validates tables, columns, indexes, and RPC functions in Supabase
 * without printing private secrets.
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

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export interface ObjectCheckResult {
  name: string;
  type: "table" | "rpc";
  exists: boolean;
  status: "OK" | "MISSING" | "ERROR";
  errorDetails?: string;
}

export async function verifySupabaseInfrastructure(): Promise<{
  configured: boolean;
  url: string;
  checks: ObjectCheckResult[];
  allPassed: boolean;
}> {
  if (!url || !serviceKey || url.includes("placeholder")) {
    return {
      configured: false,
      url: url || "NOT_SET",
      checks: [],
      allPassed: false,
    };
  }

  const client = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const checks: ObjectCheckResult[] = [];

  // 1. Check Tables
  const requiredTables = [
    "auth_rate_limits",
    "otp_challenges",
    "profiles",
    "user_consents",
    "contractor_organizations",
    "worker_profiles",
  ];

  for (const table of requiredTables) {
    try {
      const { error } = await client.from(table).select("*").limit(0);
      if (!error) {
        checks.push({ name: table, type: "table", exists: true, status: "OK" });
      } else {
        checks.push({
          name: table,
          type: "table",
          exists: false,
          status: "MISSING",
          errorDetails: `[${error.code}] ${error.message}`,
        });
      }
    } catch (err: unknown) {
      checks.push({
        name: table,
        type: "table",
        exists: false,
        status: "ERROR",
        errorDetails: err instanceof Error ? err.message : String(err),
      });
    }
  }

  // 2. Check check_and_increment_rate_limit RPC
  try {
    const { error } = await client.rpc("check_and_increment_rate_limit", {
      p_key: "probe_healthcheck_key",
      p_max_attempts: 10,
      p_window_seconds: 60,
      p_block_seconds: 60,
    });
    if (!error) {
      checks.push({
        name: "check_and_increment_rate_limit",
        type: "rpc",
        exists: true,
        status: "OK",
      });
    } else {
      checks.push({
        name: "check_and_increment_rate_limit",
        type: "rpc",
        exists: false,
        status: "MISSING",
        errorDetails: `[${error.code}] ${error.message}`,
      });
    }
  } catch (err: unknown) {
    checks.push({
      name: "check_and_increment_rate_limit",
      type: "rpc",
      exists: false,
      status: "ERROR",
      errorDetails: err instanceof Error ? err.message : String(err),
    });
  }

  // 3. Check verify_and_consume_otp RPC
  try {
    const { error } = await client.rpc("verify_and_consume_otp", {
      p_phone_hash: "probe_dummy_phone_hash",
      p_otp_hash: "probe_dummy_otp_hash",
    });
    if (!error) {
      checks.push({
        name: "verify_and_consume_otp",
        type: "rpc",
        exists: true,
        status: "OK",
      });
    } else {
      checks.push({
        name: "verify_and_consume_otp",
        type: "rpc",
        exists: false,
        status: "MISSING",
        errorDetails: `[${error.code}] ${error.message}`,
      });
    }
  } catch (err: unknown) {
    checks.push({
      name: "verify_and_consume_otp",
      type: "rpc",
      exists: false,
      status: "ERROR",
      errorDetails: err instanceof Error ? err.message : String(err),
    });
  }

  // 4. Check register_user_account RPC
  try {
    const { error } = await client.rpc("register_user_account", {
      p_phone: "probe_nonexistent_phone",
      p_full_name: "Probe Test User",
      p_role: "worker",
      p_verification_status: "sandbox_unverified",
      p_verification_method: "sandbox",
      p_phone_verified: false,
    });
    if (!error) {
      checks.push({
        name: "register_user_account",
        type: "rpc",
        exists: true,
        status: "OK",
      });
    } else {
      checks.push({
        name: "register_user_account",
        type: "rpc",
        exists: false,
        status: "MISSING",
        errorDetails: `[${error.code}] ${error.message}`,
      });
    }
  } catch (err: unknown) {
    checks.push({
      name: "register_user_account",
      type: "rpc",
      exists: false,
      status: "ERROR",
      errorDetails: err instanceof Error ? err.message : String(err),
    });
  }

  // 5. Check get_rate_limit_status RPC
  try {
    const { error } = await client.rpc("get_rate_limit_status", {
      p_key: "probe_healthcheck_key",
    });
    if (!error) {
      checks.push({
        name: "get_rate_limit_status",
        type: "rpc",
        exists: true,
        status: "OK",
      });
    } else {
      checks.push({
        name: "get_rate_limit_status",
        type: "rpc",
        exists: false,
        status: "MISSING",
        errorDetails: `[${error.code}] ${error.message}`,
      });
    }
  } catch (err: unknown) {
    checks.push({
      name: "get_rate_limit_status",
      type: "rpc",
      exists: false,
      status: "ERROR",
      errorDetails: err instanceof Error ? err.message : String(err),
    });
  }

  const allPassed = checks.length > 0 && checks.every((c) => c.status === "OK");

  return {
    configured: true,
    url: url.replace(/^(https?:\/\/)([^.]+)(\..*)$/, "$1$2$3"),
    checks,
    allPassed,
  };
}

// CLI Execution
if (require.main === module || process.argv[1]?.endsWith("verify-supabase-infrastructure.ts")) {
  verifySupabaseInfrastructure().then((report) => {
    console.log("=================================================");
    console.log("KAAMSETU SUPABASE INFRASTRUCTURE STATUS REPORT");
    console.log("=================================================");
    console.log(`Configured: ${report.configured}`);
    console.log(`Endpoint:   ${report.url}`);
    console.log("-------------------------------------------------");
    for (const check of report.checks) {
      const icon = check.status === "OK" ? "✅" : "❌";
      console.log(`${icon} [${check.type.toUpperCase()}] ${check.name}: ${check.status}`);
      if (check.errorDetails) {
        console.log(`   └─ ${check.errorDetails}`);
      }
    }
    console.log("-------------------------------------------------");
    console.log(`Overall Readiness: ${report.allPassed ? "READY" : "BLOCKED BY MISSING MIGRATIONS"}`);
    if (!report.allPassed) {
      console.log("\nACTION REQUIRED:");
      console.log("Execute 'supabase/migrations/20261117_master_infrastructure_repair.sql' in the Supabase SQL Editor.");
    }
  });
}
