import { z } from "zod";

const envSchema = z.object({
  // Supabase Configuration
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL")
    .default("https://placeholder-kaamsetu.supabase.co"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required")
    .default("placeholder-anon-key-kaamsetu-sovereign-trust"),
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1)
    .optional()
    .default("placeholder-service-role-key"),

  // Google Gemini API Configuration
  GEMINI_API_KEY: z
    .string()
    .min(1, "GEMINI_API_KEY is required for voice and skill extraction")
    .optional()
    .default("placeholder-gemini-api-key"),

  // Cryptographic Credential Signing
  CREDENTIAL_SIGNING_KEY: z.string().optional(),
  ACTIVE_SIGNING_KEY_VERSION: z.string().default("v1"),
  REVOKED_SIGNING_KEY_VERSIONS: z.string().default(""),

  // Rate Limiting
  ENABLE_IN_MEMORY_RATE_LIMIT_MOCK: z.string().optional(),

  // Application
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url()
    .default("http://localhost:3000"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  // Demo Mode Flags (explicitly disabled in production unless ENABLE_DEMO_AUTH=true)
  ENABLE_DEMO_AUTH: z
    .string()
    .optional()
    .transform((val) =>
      process.env.NODE_ENV === "production" ? val === "true" : val !== "false"
    ),
  NEXT_PUBLIC_ENABLE_DEMO_AUTH: z
    .string()
    .optional()
    .transform((val) =>
      process.env.NODE_ENV === "production" ? val === "true" : val !== "false"
    ),
});

// Parse process.env with runtime safety
function validateEnv() {
  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    CREDENTIAL_SIGNING_KEY: process.env.CREDENTIAL_SIGNING_KEY,
    ACTIVE_SIGNING_KEY_VERSION: process.env.ACTIVE_SIGNING_KEY_VERSION,
    REVOKED_SIGNING_KEY_VERSIONS: process.env.REVOKED_SIGNING_KEY_VERSIONS,
    ENABLE_IN_MEMORY_RATE_LIMIT_MOCK: process.env.ENABLE_IN_MEMORY_RATE_LIMIT_MOCK,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NODE_ENV: process.env.NODE_ENV,
    ENABLE_DEMO_AUTH: process.env.ENABLE_DEMO_AUTH,
    NEXT_PUBLIC_ENABLE_DEMO_AUTH: process.env.NEXT_PUBLIC_ENABLE_DEMO_AUTH,
  });

  if (!parsed.success) {
    console.error(
      "❌ Invalid environment variables configuration:\n",
      JSON.stringify(parsed.error.format(), null, 2)
    );
    // Don't throw fatal error during build time if placeholders can serve as stubs
    if (process.env.NODE_ENV === "production" && !process.env.NEXT_PHASE) {
      throw new Error("Invalid environment configuration for production.");
    }
  }

  return parsed.success ? parsed.data : envSchema.parse({});
}

export const env = validateEnv();

/**
 * Validates that production environments never have insecure demo flags or stub keys enabled.
 */
export function validateEnvironmentSafety(): void {
  if (process.env.NODE_ENV === "production") {
    if (
      process.env.ENABLE_DEMO_AUTH === "true" ||
      process.env.NEXT_PUBLIC_ENABLE_DEMO_AUTH === "true"
    ) {
      throw new Error(
        "FATAL SECURITY VIOLATION: Demo authentication (ENABLE_DEMO_AUTH) cannot be enabled in production."
      );
    }
    const signingKey = process.env.CREDENTIAL_SIGNING_KEY;
    if (!signingKey || signingKey.length < 32) {
      throw new Error(
        "FATAL SECURITY VIOLATION: CREDENTIAL_SIGNING_KEY must be configured with at least 32 characters (256 bits) in production."
      );
    }
  }
}

/**
 * Helper to check if actual production credentials are wired up
 */
export const isConfigured = {
  supabase:
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder"),
  gemini:
    Boolean(process.env.GEMINI_API_KEY) &&
    !process.env.GEMINI_API_KEY?.includes("placeholder"),
  demoAuth:
    process.env.NODE_ENV === "production" ? false : Boolean(env.ENABLE_DEMO_AUTH),
  demoAllowed:
    process.env.NODE_ENV !== "production" && Boolean(env.ENABLE_DEMO_AUTH),
};
