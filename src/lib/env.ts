import { z } from "zod";
import { assertCryptographicKeyQuality } from "./crypto/key-validator";

const envSchema = z.object({
  // Supabase Configuration
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL")
    .optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required")
    .optional(),
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1)
    .optional(),

  // Google Gemini API Configuration
  GEMINI_API_KEY: z
    .string()
    .min(1, "GEMINI_API_KEY is required for voice and skill extraction")
    .optional(),
  GEMINI_MODEL: z
    .string()
    .min(1)
    .optional()
    .default("gemini-3.8-flash"),

  // Authentication Verification Mode: fail-closed 'sms' in production, 'sandbox' in dev/test or when explicitly set
  PHONE_OTP_MODE: z
    .enum(["sandbox", "sms", "real"])
    .optional()
    .default(
      process.env.PHONE_OTP_MODE === "sandbox" || process.env.AUTH_VERIFICATION_MODE === "sandbox"
        ? "sandbox"
        : process.env.NODE_ENV === "production"
        ? "sms"
        : "sandbox"
    ),
  AUTH_VERIFICATION_MODE: z
    .enum(["sandbox", "sms", "real"])
    .default(
      process.env.PHONE_OTP_MODE === "sandbox" || process.env.AUTH_VERIFICATION_MODE === "sandbox"
        ? "sandbox"
        : process.env.NODE_ENV === "production"
        ? "sms"
        : "sandbox"
    ),

  // Optional server-configured sandbox verification code for controlled evaluation
  SANDBOX_OTP_CODE: z.string().optional().default("123456"),

  // Cryptographic Credential Signing
  CREDENTIAL_SIGNING_KEY: z.string().optional(),
  ACTIVE_SIGNING_KEY_VERSION: z.string().default("v1"),
  REVOKED_SIGNING_KEY_VERSIONS: z.string().default(""),

  // Rate Limiting Privacy & Key Material
  RATE_LIMIT_HMAC_SECRET: z.string().optional(),
  RATE_LIMIT_HMAC_SECRET_PREVIOUS: z.string().optional(),
  ENABLE_IN_MEMORY_RATE_LIMIT_MOCK: z.string().optional(),

  // Application
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url()
    .default("http://localhost:3000"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  // Demo Mode Flags (Deprecated & permanently disabled)
  ENABLE_DEMO_AUTH: z.string().optional().default("false"),
  NEXT_PUBLIC_ENABLE_DEMO_AUTH: z.string().optional().default("false"),
});

// Parse process.env with runtime safety
function validateEnv() {
  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GEMINI_MODEL: process.env.GEMINI_MODEL || "gemini-3.8-flash",
    PHONE_OTP_MODE:
      process.env.PHONE_OTP_MODE ||
      process.env.AUTH_VERIFICATION_MODE ||
      (process.env.NODE_ENV === "production" ? "sms" : "sandbox"),
    AUTH_VERIFICATION_MODE:
      process.env.PHONE_OTP_MODE ||
      process.env.AUTH_VERIFICATION_MODE ||
      (process.env.NODE_ENV === "production" ? "sms" : "sandbox"),
    SANDBOX_OTP_CODE: process.env.SANDBOX_OTP_CODE || "123456",
    CREDENTIAL_SIGNING_KEY: process.env.CREDENTIAL_SIGNING_KEY,
    ACTIVE_SIGNING_KEY_VERSION: process.env.ACTIVE_SIGNING_KEY_VERSION,
    REVOKED_SIGNING_KEY_VERSIONS: process.env.REVOKED_SIGNING_KEY_VERSIONS,
    RATE_LIMIT_HMAC_SECRET: process.env.RATE_LIMIT_HMAC_SECRET,
    RATE_LIMIT_HMAC_SECRET_PREVIOUS: process.env.RATE_LIMIT_HMAC_SECRET_PREVIOUS,
    ENABLE_IN_MEMORY_RATE_LIMIT_MOCK: process.env.ENABLE_IN_MEMORY_RATE_LIMIT_MOCK,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NODE_ENV: process.env.NODE_ENV,
    ENABLE_DEMO_AUTH: "false",
    NEXT_PUBLIC_ENABLE_DEMO_AUTH: "false",
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
    // Check that placeholder Supabase credentials are not masquerading as production
    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder") ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.includes("placeholder")
    ) {
      throw new Error(
        "FATAL SECURITY VIOLATION: Placeholder Supabase credentials cannot be used in production."
      );
    }

    // Validate Credential Signing Key Quality
    const activeVersion = process.env.ACTIVE_SIGNING_KEY_VERSION || "v1";
    const signingKey =
      process.env[`CREDENTIAL_SIGNING_KEY_${activeVersion.toUpperCase()}`] ||
      process.env.CREDENTIAL_SIGNING_KEY;
    assertCryptographicKeyQuality(signingKey, `CREDENTIAL_SIGNING_KEY (${activeVersion})`);

    // Validate Rate Limiting HMAC Secret Quality
    const rateLimitSecret = process.env.RATE_LIMIT_HMAC_SECRET;
    assertCryptographicKeyQuality(rateLimitSecret, "RATE_LIMIT_HMAC_SECRET");

    // Validate Payment Gateway Secret Quality if live payments enabled
    if (process.env.ENABLE_LIVE_PAYMENTS === "true") {
      const paymentSecret = process.env.PAYMENT_GATEWAY_SECRET || process.env.RAZORPAY_KEY_SECRET;
      assertCryptographicKeyQuality(paymentSecret, "PAYMENT_GATEWAY_SECRET");
    }

    if (
      process.env.ALLOW_INSECURE_SANDBOX_IN_PRODUCTION === "true" ||
      process.env.ENABLE_DEMO_AUTH === "true" ||
      process.env.NEXT_PUBLIC_ENABLE_DEMO_AUTH === "true"
    ) {
      throw new Error(
        "FATAL SECURITY VIOLATION: Sandbox or demo auth bypass flags cannot be enabled in production."
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
    !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder") &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) &&
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.includes("placeholder"),
  gemini:
    Boolean(process.env.GEMINI_API_KEY) &&
    !process.env.GEMINI_API_KEY?.includes("placeholder"),
  sandboxAuth: env.AUTH_VERIFICATION_MODE === "sandbox",
  demoAuth: false,
  demoAllowed: false,
};
