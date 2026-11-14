import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/lib/env";

/**
 * Creates a client-side Supabase instance for use in Client Components.
 * Uses singleton caching in browser environment.
 */
let clientInstance: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (typeof window !== "undefined" && clientInstance) {
    return clientInstance;
  }

  const client = createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  if (typeof window !== "undefined") {
    clientInstance = client;
  }

  return client;
}
