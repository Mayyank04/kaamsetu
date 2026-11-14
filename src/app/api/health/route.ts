import { NextResponse } from "next/server";
import { env, isConfigured } from "@/lib/env";
import { createSuccessResponse } from "@/lib/error/handler";

export async function GET() {
  return createSuccessResponse({
    status: "healthy",
    platform: "KAAMSETU Sovereign Workforce Identity Platform",
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    services: {
      supabase: {
        configured: isConfigured.supabase,
        url: env.NEXT_PUBLIC_SUPABASE_URL.replace(/https?:\/\//, "").split(".")[0] + ".supabase.co",
      },
      gemini: {
        configured: isConfigured.gemini,
        model: "gemini-2.5-flash",
      },
      identityProtocol: {
        version: "v1.0-sovereign-trust",
        scale: "KAAMSCORE 300-900",
      },
    },
  });
}
