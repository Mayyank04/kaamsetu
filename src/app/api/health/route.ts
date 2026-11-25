import { env, isConfigured } from "@/lib/env";
import { createSuccessResponse } from "@/lib/error/handler";

export async function GET() {
  return createSuccessResponse({
    status: "healthy",
    platform: "KAAMSETU Sovereign Workforce Identity Platform",
    version: "0.1.0",
    commit: process.env.VERCEL_GIT_COMMIT_SHA || process.env.GIT_COMMIT || "local-build",
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    services: {
      supabase: {
        configured: isConfigured.supabase,
        url: env.NEXT_PUBLIC_SUPABASE_URL
          ? env.NEXT_PUBLIC_SUPABASE_URL.replace(/https?:\/\//, "").split(".")[0] + ".supabase.co"
          : "unconfigured",
      },
      gemini: {
        configured: isConfigured.gemini,
        model: "gemini-2.0-flash",
      },
      billing: {
        configured: true,
        mode: process.env.ENABLE_LIVE_PAYMENTS === "true" ? "live" : "sandbox",
        currency: "INR",
        taxTreatment: "18% GST compliant",
      },
      identityProtocol: {
        version: "v1.0-sovereign-trust",
        scale: "KAAMSCORE 300-900",
        signingAlgorithm: "HMAC-SHA256 (RFC 8785 JCS)",
      },
      schema: {
        migrationsApplied: "01-09",
        tablesCount: 26,
      },
    },
  });
}
