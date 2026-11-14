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

  // Application
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url()
    .default("http://localhost:3000"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

// Parse process.env with runtime safety
function validateEnv() {
  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NODE_ENV: process.env.NODE_ENV,
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
 * Helper to check if actual production credentials are wired up
 */
export const isConfigured = {
  supabase:
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder"),
  gemini:
    Boolean(process.env.GEMINI_API_KEY) &&
    !process.env.GEMINI_API_KEY?.includes("placeholder"),
};
