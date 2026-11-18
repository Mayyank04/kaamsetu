import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";

interface DependencyCheck {
  name: string;
  type: "table" | "rpc" | "config";
  available: boolean;
}

export async function GET() {
  const checks: DependencyCheck[] = [];

  // 1. Core Server-Side Configuration Verification
  const hasSupabaseUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder"));
  const hasServiceKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY.includes("placeholder"));
  const hasHmacSecret = Boolean(process.env.RATE_LIMIT_HMAC_SECRET && process.env.RATE_LIMIT_HMAC_SECRET.length >= 32);
  const mode = process.env.AUTH_VERIFICATION_MODE || "sandbox";

  checks.push({ name: "supabase_url", type: "config", available: hasSupabaseUrl });
  checks.push({ name: "supabase_service_key", type: "config", available: hasServiceKey });
  checks.push({ name: "rate_limit_hmac_secret", type: "config", available: hasHmacSecret });

  if (!isConfigured.supabase || !hasServiceKey) {
    return NextResponse.json(
      {
        status: "DEGRADED",
        operational: false,
        mode,
        checks,
        error: "Supabase server credentials are not fully configured",
      },
      { status: 503 }
    );
  }

  try {
    const adminClient = createAdminClient();

    // 2. Database Tables Verification
    const tables = ["auth_rate_limits", "otp_challenges", "profiles", "user_consents"];
    for (const table of tables) {
      const { error } = await adminClient.from(table).select("*").limit(0);
      checks.push({
        name: table,
        type: "table",
        available: !error,
      });
    }

    // 3. Database RPC Verification (Check without side-effects)
    const { error: rpcRateErr } = await adminClient.rpc("get_rate_limit_status", {
      p_key: "healthcheck:probe",
    });
    checks.push({
      name: "get_rate_limit_status",
      type: "rpc",
      available: !rpcRateErr,
    });

    const { error: rpcIncErr } = await adminClient.rpc("check_and_increment_rate_limit", {
      p_key: "healthcheck:probe",
      p_max_attempts: 100,
      p_window_seconds: 60,
      p_block_seconds: 60,
    });
    checks.push({
      name: "check_and_increment_rate_limit",
      type: "rpc",
      available: !rpcIncErr,
    });

    const { error: rpcOtpErr } = await adminClient.rpc("verify_and_consume_otp", {
      p_phone_hash: "healthcheck:probe",
      p_otp_hash: "healthcheck:probe",
    });
    checks.push({
      name: "verify_and_consume_otp",
      type: "rpc",
      available: !rpcOtpErr,
    });

    const allPassed = checks.every((c) => c.available);

    return NextResponse.json(
      {
        status: allPassed ? "OPERATIONAL" : "DEGRADED",
        operational: allPassed,
        mode,
        checks,
        timestamp: new Date().toISOString(),
      },
      { status: allPassed ? 200 : 503 }
    );
  } catch (err: unknown) {
    return NextResponse.json(
      {
        status: "DEGRADED",
        operational: false,
        mode,
        checks,
        error: "Database connectivity or runtime exception",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
