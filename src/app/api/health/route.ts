import { env, isConfigured } from "@/lib/env";
import { createSuccessResponse } from "@/lib/error/handler";

export const dynamic = "force-dynamic";

export async function GET() {
  const commitSha = process.env.VERCEL_GIT_COMMIT_SHA || process.env.GIT_COMMIT || "local-build";
  const vercelEnv = process.env.VERCEL_ENV || env.NODE_ENV;
  const authMode = process.env.AUTH_VERIFICATION_MODE || "production";

  return createSuccessResponse({
    status: "healthy",
    platform: "KAAMSETU Sovereign Workforce Identity Platform",
    version: "0.1.0",
    commit: commitSha,
    commitShort: commitSha.slice(0, 7),
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    hosting: {
      provider: process.env.VERCEL ? "vercel" : "self-hosted",
      vercelEnv,
      region: process.env.VERCEL_REGION || "local",
      deploymentId: process.env.VERCEL_DEPLOYMENT_ID || null,
      deploymentUrl: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
      productionUrl: process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : env.NEXT_PUBLIC_APP_URL || "https://kaamsetu-neon.vercel.app",
      gitBranch: process.env.VERCEL_GIT_COMMIT_REF || null,
      gitRepository:
        process.env.VERCEL_GIT_REPO_OWNER && process.env.VERCEL_GIT_REPO_SLUG
          ? `${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}`
          : "Mayyank04/kaamsetu",
      nodeVersion: process.version,
    },
    governance: {
      classification: "CLASS_B_CONTROLLED_ROLLOUT",
      platformCommissionAmount: "0.00",
    },
    services: {
      supabase: {
        configured: isConfigured.supabase,
        url: env.NEXT_PUBLIC_SUPABASE_URL
          ? env.NEXT_PUBLIC_SUPABASE_URL.replace(/https?:\/\//, "").split(".")[0] + ".supabase.co"
          : "unconfigured",
      },
      auth: {
        verificationMode: authMode,
      },
      gemini: {
        configured: isConfigured.gemini,
        model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
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
        signingAlgorithm: "HMAC-SHA256 / Ed25519 (RFC 8785 JCS)",
      },
    },
  });
}
