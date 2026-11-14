import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * Service role client with elevated permissions.
 * STRICTLY for server-side trusted operations.
 */
export function createAdminClient() {
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
