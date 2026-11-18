/**
 * KAAMSETU — PHASE 40: DATABASE READINESS & AUTH HEALTH CHECK
 * Evaluates remote PostgreSQL database connectivity, schema integrity,
 * required tables, columns, RPC functions, and configuration.
 *
 * Classification: CLASS_B_CONTROLLED_ROLLOUT
 * Permanent Financial Invariant: platform_commission_amount = 0.00
 */

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";

export type HealthCheckType = "config" | "table" | "column" | "rpc";
export type HealthFailureCategory =
  | "DATABASE_CONNECTION_ERROR"
  | "MISSING_TABLE"
  | "MISSING_COLUMN"
  | "MISSING_RPC"
  | "CONFIG_INCOMPLETE";

export interface DetailedHealthCheck {
  name: string;
  type: HealthCheckType;
  available: boolean;
  status: "OK" | "MISSING" | "ERROR";
  failureCategory?: HealthFailureCategory;
  details?: string;
}

export async function GET() {
  const checks: DetailedHealthCheck[] = [];
  const missingTables: string[] = [];
  const missingColumns: string[] = [];
  const missingRpcs: string[] = [];

  // 1. Core Server-Side Configuration Verification
  const hasSupabaseUrl = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")
  );
  const hasServiceKey = Boolean(
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
      !process.env.SUPABASE_SERVICE_ROLE_KEY.includes("placeholder")
  );
  const hasHmacSecret = Boolean(
    process.env.RATE_LIMIT_HMAC_SECRET && process.env.RATE_LIMIT_HMAC_SECRET.length >= 32
  );
  const mode = process.env.AUTH_VERIFICATION_MODE || "production";

  checks.push({
    name: "supabase_url",
    type: "config",
    available: hasSupabaseUrl,
    status: hasSupabaseUrl ? "OK" : "MISSING",
    failureCategory: hasSupabaseUrl ? undefined : "CONFIG_INCOMPLETE",
  });
  checks.push({
    name: "supabase_service_key",
    type: "config",
    available: hasServiceKey,
    status: hasServiceKey ? "OK" : "MISSING",
    failureCategory: hasServiceKey ? undefined : "CONFIG_INCOMPLETE",
  });
  checks.push({
    name: "rate_limit_hmac_secret",
    type: "config",
    available: hasHmacSecret,
    status: hasHmacSecret ? "OK" : "MISSING",
    failureCategory: hasHmacSecret ? undefined : "CONFIG_INCOMPLETE",
  });

  if (!isConfigured.supabase || !hasServiceKey) {
    return NextResponse.json(
      {
        status: "DEGRADED",
        operational: false,
        code: "CONFIG_INCOMPLETE",
        message: "Supabase server credentials are not fully configured in the environment.",
        mode,
        checks,
        missingTables,
        missingColumns,
        missingRpcs,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }

  try {
    const adminClient = createAdminClient();

    // 2. Database Tables Verification (7 Mandatory Core Tables)
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
        const { error } = await adminClient.from(table).select("*").limit(0);
        if (!error) {
          checks.push({
            name: table,
            type: "table",
            available: true,
            status: "OK",
          });
        } else {
          missingTables.push(table);
          const isMissing =
            error.code === "PGRST205" ||
            error.message?.toLowerCase().includes("schema cache") ||
            error.message?.toLowerCase().includes("does not exist");
          checks.push({
            name: table,
            type: "table",
            available: false,
            status: isMissing ? "MISSING" : "ERROR",
            failureCategory: isMissing ? "MISSING_TABLE" : "DATABASE_CONNECTION_ERROR",
            details: `[${error.code}] ${error.message}`,
          });
        }
      } catch (err: unknown) {
        missingTables.push(table);
        checks.push({
          name: table,
          type: "table",
          available: false,
          status: "ERROR",
          failureCategory: "DATABASE_CONNECTION_ERROR",
          details: err instanceof Error ? err.message : String(err),
        });
      }
    }

    // 3. Profiles Table Columns Verification
    const profileColumns = [
      "id",
      "full_name",
      "role",
      "email",
      "phone",
      "account_status",
      "phone_verified",
    ];

    for (const col of profileColumns) {
      try {
        const { error } = await adminClient.from("profiles").select(col).limit(0);
        if (!error) {
          checks.push({
            name: `profiles.${col}`,
            type: "column",
            available: true,
            status: "OK",
          });
        } else {
          missingColumns.push(`profiles.${col}`);
          const isColMissing =
            error.code === "PGRST204" ||
            error.message?.toLowerCase().includes("could not find the column");
          checks.push({
            name: `profiles.${col}`,
            type: "column",
            available: false,
            status: isColMissing ? "MISSING" : "ERROR",
            failureCategory: isColMissing ? "MISSING_COLUMN" : "MISSING_TABLE",
            details: `[${error.code}] ${error.message}`,
          });
        }
      } catch (err: unknown) {
        missingColumns.push(`profiles.${col}`);
        checks.push({
          name: `profiles.${col}`,
          type: "column",
          available: false,
          status: "ERROR",
          failureCategory: "DATABASE_CONNECTION_ERROR",
          details: err instanceof Error ? err.message : String(err),
        });
      }
    }

    // 4. Stored Procedures (RPCs) Verification
    const { error: rpcRateErr } = await adminClient.rpc("get_rate_limit_status", {
      p_key: "healthcheck:probe",
    });
    const rateStatusOk = !rpcRateErr;
    if (!rateStatusOk) missingRpcs.push("get_rate_limit_status");
    checks.push({
      name: "get_rate_limit_status",
      type: "rpc",
      available: rateStatusOk,
      status: rateStatusOk ? "OK" : "MISSING",
      failureCategory: rateStatusOk ? undefined : "MISSING_RPC",
      details: rpcRateErr ? `[${rpcRateErr.code}] ${rpcRateErr.message}` : undefined,
    });

    const { error: rpcIncErr } = await adminClient.rpc("check_and_increment_rate_limit", {
      p_key: "healthcheck:probe",
      p_max_attempts: 100,
      p_window_seconds: 60,
      p_block_seconds: 60,
    });
    const rateIncOk = !rpcIncErr;
    if (!rateIncOk) missingRpcs.push("check_and_increment_rate_limit");
    checks.push({
      name: "check_and_increment_rate_limit",
      type: "rpc",
      available: rateIncOk,
      status: rateIncOk ? "OK" : "MISSING",
      failureCategory: rateIncOk ? undefined : "MISSING_RPC",
      details: rpcIncErr ? `[${rpcIncErr.code}] ${rpcIncErr.message}` : undefined,
    });

    const allOperational = checks.every((c) => c.available);

    if (!allOperational) {
      return NextResponse.json(
        {
          status: "DEGRADED",
          operational: false,
          code: "SCHEMA_NOT_READY",
          message:
            "Database schema migration required: required tables, columns, or procedures are missing from Supabase. Please apply migration 20261118000001_phase40_root_cause_master_schema.sql in the Supabase Dashboard SQL Editor.",
          action: "EXECUTE_MIGRATION",
          migration: "supabase/migrations/20261118000001_phase40_root_cause_master_schema.sql",
          mode,
          missingTables,
          missingColumns,
          missingRpcs,
          checks,
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        status: "OPERATIONAL",
        operational: true,
        mode,
        checks,
        missingTables: [],
        missingColumns: [],
        missingRpcs: [],
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    return NextResponse.json(
      {
        status: "DEGRADED",
        operational: false,
        code: "DATABASE_CONNECTION_ERROR",
        message: "Failed to establish communication with Supabase database.",
        details: err instanceof Error ? err.message : String(err),
        mode,
        checks,
        missingTables,
        missingColumns,
        missingRpcs,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
