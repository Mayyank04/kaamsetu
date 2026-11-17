/**
 * KAAMSETU — Deployment Preflight Verification Script
 * Validates environment variables, secret entropy, Supabase database contracts,
 * cryptographic keys, and geographic invariants prior to production deployment.
 * 
 * Invariants:
 * - Never prints secret values or keys.
 * - Fails with exit code 1 if required infrastructure is unmigrated or unconfigured.
 */

import * as fs from "fs";
import * as path from "path";
import { verifySupabaseInfrastructure } from "./verify-supabase-infrastructure";
import { GeographicAuthorizationService } from "../src/lib/geo/geographic-authorization-service";
import { hashRateLimitKey } from "../src/lib/security/rate-limiter";

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

interface PreflightCheck {
  category: "ENV" | "CRYPTO" | "DATABASE" | "GEO" | "INVARIANT";
  item: string;
  passed: boolean;
  message: string;
}

export async function runDeploymentPreflight(): Promise<{
  success: boolean;
  checks: PreflightCheck[];
}> {
  const checks: PreflightCheck[] = [];

  // 1. Environment Variables & Secret Entropy Checks
  const requiredEnvVars = [
    { key: "NEXT_PUBLIC_SUPABASE_URL", minLen: 10, isSecret: false },
    { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", minLen: 20, isSecret: true },
    { key: "SUPABASE_SERVICE_ROLE_KEY", minLen: 20, isSecret: true },
    { key: "RATE_LIMIT_HMAC_SECRET", minLen: 32, isSecret: true },
  ];

  for (const envVar of requiredEnvVars) {
    const val = process.env[envVar.key];
    if (!val) {
      checks.push({
        category: "ENV",
        item: envVar.key,
        passed: false,
        message: "Missing from environment configuration",
      });
    } else if (val.includes("placeholder") || val.includes("your-")) {
      checks.push({
        category: "ENV",
        item: envVar.key,
        passed: false,
        message: "Contains unsafe placeholder pattern",
      });
    } else if (val.length < envVar.minLen) {
      checks.push({
        category: "ENV",
        item: envVar.key,
        passed: false,
        message: `Value length (${val.length}) below minimum required (${envVar.minLen}) for cryptographic entropy`,
      });
    } else {
      checks.push({
        category: "ENV",
        item: envVar.key,
        passed: true,
        message: "Configured with valid entropy",
      });
    }
  }

  // 2. Cryptographic Key Hashing & Separation
  try {
    const hash1 = hashRateLimitKey("cooldown", "9876543210");
    const hash2 = hashRateLimitKey("phone:send", "9876543210");
    if (hash1 && hash2 && hash1 !== hash2) {
      checks.push({
        category: "CRYPTO",
        item: "HMAC Domain Separation",
        passed: true,
        message: "Domain separation generates distinct digests for separate namespaces",
      });
    } else {
      checks.push({
        category: "CRYPTO",
        item: "HMAC Domain Separation",
        passed: false,
        message: "Domain separation collision detected",
      });
    }
  } catch (err: unknown) {
    checks.push({
      category: "CRYPTO",
      item: "HMAC Domain Separation",
      passed: false,
      message: err instanceof Error ? err.message : String(err),
    });
  }

  // 3. Geographic Boundary & Controlled Rollout Verification
  try {
    const guwahati = GeographicAuthorizationService.validateLocation({
      city: "Guwahati",
      state: "Assam",
      pincode: "781001",
    });
    const shillong = GeographicAuthorizationService.validateLocation({
      city: "Shillong",
      state: "Meghalaya",
      pincode: "793001",
    });
    const outside = GeographicAuthorizationService.validateLocation({
      city: "Jaipur",
      state: "Rajasthan",
      pincode: "302001",
    });

    const geoPassed = guwahati.allowed && shillong.allowed && !outside.allowed;
    checks.push({
      category: "GEO",
      item: "Class B Controlled Rollout Boundary (Guwahati & Shillong)",
      passed: geoPassed,
      message: geoPassed
        ? "Authorized zones match Class B criteria; non-rollout zones correctly restricted"
        : "Geographic boundary enforcement failed",
    });
  } catch (err: unknown) {
    checks.push({
      category: "GEO",
      item: "Class B Controlled Rollout Boundary (Guwahati & Shillong)",
      passed: false,
      message: err instanceof Error ? err.message : String(err),
    });
  }

  // 4. Remote Supabase Infrastructure Verification
  const dbReport = await verifySupabaseInfrastructure();
  if (!dbReport.configured) {
    checks.push({
      category: "DATABASE",
      item: "Remote Supabase Connection",
      passed: false,
      message: "Supabase URL or Service Role Key not configured",
    });
  } else {
    for (const check of dbReport.checks) {
      checks.push({
        category: "DATABASE",
        item: `${check.type.toUpperCase()}: ${check.name}`,
        passed: check.status === "OK",
        message: check.status === "OK" ? "Verified in remote schema" : (check.errorDetails || "Missing from remote schema"),
      });
    }
  }

  const allPassed = checks.every((c) => c.passed);
  return { success: allPassed, checks };
}

// CLI Execution
if (require.main === module || process.argv[1]?.endsWith("verify-deployment-preflight.ts")) {
  runDeploymentPreflight().then((result) => {
    console.log("================================================================================");
    console.log("KAAMSETU PREFLIGHT DEPLOYMENT AUDIT REPORT");
    console.log("================================================================================");
    
    let failedCount = 0;
    for (const check of result.checks) {
      const icon = check.passed ? "✅" : "❌";
      console.log(`${icon} [${check.category}] ${check.item}: ${check.message}`);
      if (!check.passed) failedCount++;
    }

    console.log("================================================================================");
    if (result.success) {
      console.log("STATUS: PREFLIGHT CERTIFIED — All production contracts and objects verified.");
      process.exit(0);
    } else {
      console.log(`STATUS: BLOCKED — ${failedCount} preflight check(s) failed.`);
      console.log("Remediation: Apply 'supabase/migrations/20261117_master_infrastructure_repair.sql' in Supabase SQL editor.");
      process.exit(1);
    }
  });
}
