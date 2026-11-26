#!/usr/bin/env tsx
/**
 * KAAMSETU Production Deployment & Infrastructure Readiness Checker (Phase 52)
 *
 * Verifies required vs optional environment variables without exposing secret values,
 * validates 256-bit cryptographic key quality, tests live Supabase schema cache & RPCs
 * with explicit request timeouts, and exits non-zero whenever required checks fail.
 */

import { validateCryptographicKeyMaterial } from "../lib/crypto/key-validator";

type CheckStatus = "PASS" | "FAIL" | "WARNING" | "NOT CONFIGURED" | "NOT TESTED" | "OPTIONAL";

interface CheckEntry {
  area: string;
  required: boolean;
  status: CheckStatus;
  details: string;
}

const REQUEST_TIMEOUT_MS = 5000;

async function main() {
  const results: CheckEntry[] = [];
  const record = (area: string, required: boolean, status: CheckStatus, details: string) => {
    results.push({ area, required, status, details });
    console.log(`[${status.padEnd(14)}] ${area}: ${details}`);
  };

  console.log("================================================================================");
  console.log("KAAMSETU PRODUCTION DEPLOYMENT & INFRASTRUCTURE READINESS CHECKER");
  console.log("================================================================================\n");

  // 1. Required Core Environment Variables (no partial secret prefix output)
  const requiredEnv = [
    { key: "NEXT_PUBLIC_SUPABASE_URL", label: "Supabase Project URL" },
    { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", label: "Supabase Public Anon Key" },
    { key: "SUPABASE_SERVICE_ROLE_KEY", label: "Supabase Service Role Key" },
    { key: "RATE_LIMIT_HMAC_SECRET", label: "Rate Limit HMAC Secret" },
    { key: "CREDENTIAL_SIGNING_KEY", label: "Credential Signing Secret" },
  ];

  for (const item of requiredEnv) {
    const val = process.env[item.key]?.trim();
    if (!val || val.includes("placeholder")) {
      record(`Env:${item.key}`, true, "FAIL", `${item.label} is missing or placeholder`);
    } else if (item.key.includes("SECRET") || item.key.includes("SIGNING_KEY")) {
      const quality = validateCryptographicKeyMaterial(val, item.key);
      record(
        `Env:${item.key}`,
        true,
        quality.valid ? "PASS" : "FAIL",
        quality.valid ? `${item.label} configured (${quality.byteLength} bytes)` : quality.error || "Insufficient entropy"
      );
    } else {
      record(`Env:${item.key}`, true, "PASS", `${item.label} configured`);
    }
  }

  // Production sandbox bypass safety check
  if (
    process.env.NODE_ENV === "production" &&
    (process.env.AUTH_VERIFICATION_MODE === "sandbox" ||
      process.env.ALLOW_INSECURE_SANDBOX_IN_PRODUCTION === "true")
  ) {
    record("AuthMode:Sandbox", true, "WARNING", "Production environment is set to sandbox auth mode");
  } else {
    record("AuthMode", true, "PASS", `AUTH_VERIFICATION_MODE=${process.env.AUTH_VERIFICATION_MODE || "unset"}`);
  }

  // 2. Optional Integration Environment Checks
  const optionalIntegrations = [
    { keys: ["GEMINI_API_KEY"], label: "Google Gemini AI (Voice/Translation)" },
    { keys: ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_PHONE_NUMBER"], label: "Twilio Live SMS OTP" },
    { keys: ["GOOGLE_TRANSLATE_API_KEY"], label: "Google Cloud Translate" },
    { keys: ["AZURE_TRANSLATOR_KEY", "AZURE_TRANSLATOR_REGION"], label: "Azure Translator" },
    { keys: ["BHASHINI_API_KEY", "BHASHINI_USER_ID"], label: "Bhashini Translation API" },
    { keys: ["DIGILOCKER_CLIENT_ID", "DIGILOCKER_CLIENT_SECRET"], label: "MeitY DigiLocker" },
  ];

  for (const opt of optionalIntegrations) {
    const allPresent = opt.keys.every((k) => {
      const v = process.env[k]?.trim();
      return Boolean(v && !v.includes("placeholder"));
    });
    record(
      `Integration:${opt.label}`,
      false,
      allPresent ? "OPTIONAL" : "NOT CONFIGURED",
      allPresent ? "Credentials configured" : `Unconfigured (${opt.keys.join(", ")})`
    );
  }

  // 3. Live Supabase PostgREST Connectivity, Schema Cache & RPC Probe
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!supabaseUrl || !serviceKey || supabaseUrl.includes("placeholder") || serviceKey.includes("placeholder")) {
    record("Supabase:Connectivity", true, "FAIL", "Missing Supabase credentials; skipped live schema probe");
  } else {
    try {
      const start = Date.now();
      const restRes = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
        },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      const latency = Date.now() - start;

      if (!restRes.ok) {
        record("Supabase:Connectivity", true, "FAIL", `PostgREST returned HTTP ${restRes.status} (${latency}ms)`);
      } else {
        const schema = await restRes.json();
        record("Supabase:Connectivity", true, "PASS", `PostgREST HTTP 200 (${latency}ms)`);

        const definitions = schema.definitions || {};
        const coreTables = [
          "profiles",
          "worker_profiles",
          "occupations",
          "skills",
          "worker_skills",
          "auth_rate_limits",
          "credential_registry",
          "bookings",
          "reviews",
          "contractor_jobs",
          "custom_localities",
        ];

        const missingTables = coreTables.filter((t) => !definitions[t]);
        if (missingTables.length > 0) {
          record(
            "Supabase:Tables",
            true,
            "FAIL",
            `Missing tables in schema cache (${missingTables.length}): ${missingTables.join(", ")}`
          );
        } else {
          record("Supabase:Tables", true, "PASS", `All ${coreTables.length} required tables online`);
        }

        const wpCols = definitions.worker_profiles?.properties || {};
        const extendedCols = [
          "district",
          "locality",
          "profile_type",
          "business_name",
          "vendor_type",
          "stall_type",
          "operating_hours",
          "product_catalog",
          "delivery_available",
          "contact_preference",
        ];
        const missingCols = extendedCols.filter((c) => !wpCols[c]);
        if (missingCols.length > 0) {
          record(
            "Supabase:WorkerColumns",
            true,
            "FAIL",
            `Missing worker_profiles columns (${missingCols.length}): ${missingCols.join(", ")}`
          );
        } else {
          record("Supabase:WorkerColumns", true, "PASS", "All extended worker_profiles columns present");
        }

        // Functional read-only RPC probe (non-destructive)
        const rpcRes = await fetch(`${supabaseUrl}/rest/v1/rpc/get_rate_limit_status`, {
          method: "POST",
          headers: {
            apikey: serviceKey,
            Authorization: `Bearer ${serviceKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ p_key: "deploy-health-probe-noop" }),
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });
        record(
          "Supabase:RPC:get_rate_limit_status",
          true,
          rpcRes.ok ? "PASS" : "FAIL",
          rpcRes.ok ? "RPC callable (HTTP 200)" : `RPC returned HTTP ${rpcRes.status}`
        );
      }
    } catch (err: unknown) {
      record(
        "Supabase:Connectivity",
        true,
        "FAIL",
        `Probe error/timeout: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  // 4. Optional Live Gemini Reachability Check (non-destructive models list)
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  if (geminiKey && !geminiKey.includes("placeholder")) {
    try {
      const gemRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(geminiKey)}`,
        { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) }
      );
      record(
        "Gemini:API",
        false,
        gemRes.ok ? "PASS" : "WARNING",
        gemRes.ok ? "Gemini API reachable (models list HTTP 200)" : `Gemini models endpoint HTTP ${gemRes.status}`
      );
    } catch (err: unknown) {
      record("Gemini:API", false, "WARNING", `Gemini API probe failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  } else {
    record("Gemini:API", false, "NOT CONFIGURED", "GEMINI_API_KEY absent; deterministic translation fallback active");
  }

  // Note: Twilio, RLS policies, and auth end-to-end are NOT TESTED by this fast CLI script
  record("Verification:RLS+AuthJourneys", false, "NOT TESTED", "Run `npm run test:rls && npm run test:phase49:auth` separately");

  const requiredFailures = results.filter((r) => r.required && r.status === "FAIL");
  const warnings = results.filter((r) => r.status === "WARNING");

  console.log("\n================================================================================");
  if (requiredFailures.length > 0) {
    console.log(`VERDICT: NOT READY (${requiredFailures.length} required failure(s), ${warnings.length} warning(s))`);
    console.log("================================================================================");
    process.exitCode = 1;
  } else if (warnings.length > 0) {
    console.log(`VERDICT: CONDITIONAL (${warnings.length} warning(s))`);
    console.log("================================================================================");
  } else {
    console.log("VERDICT: READY (all required environment, schema, and RPC checks passed)");
    console.log("================================================================================");
  }
}

main().catch((err) => {
  console.error("Deployment readiness checker failed:", err instanceof Error ? err.message : String(err));
  process.exitCode = 1;
});
