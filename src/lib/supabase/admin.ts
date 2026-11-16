import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { ConfigurationError } from "@/lib/errors/app-error";

/**
 * Service role client with elevated permissions.
 * STRICTLY for server-side trusted operations.
 * Fails closed in production if SUPABASE_SERVICE_ROLE_KEY is not configured.
 */
export function createAdminClient() {
  const isProduction = process.env.NODE_ENV === "production";
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceKey && isProduction) {
    throw new ConfigurationError(
      "FATAL SECURITY CONFIGURATION: SUPABASE_SERVICE_ROLE_KEY is required for admin operations in production."
    );
  }

  const effectiveUrl = env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-kaamsetu.supabase.co";
  const effectiveKey = serviceKey || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";
  return createClient(effectiveUrl, effectiveKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
