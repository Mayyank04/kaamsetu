/**
 * KAAMSETU — Centralized Server Environment Configuration
 * Validates server-only secrets vs public client variables.
 * Enforces fail-closed security barriers in production.
 */

import { z } from "zod";
import { ConfigurationError } from "@/lib/errors/app-error";

const serverEnvSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // Public Configuration (Safe to expose to client)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().default("https://placeholder-kaamsetu.supabase.co"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).default("placeholder-anon-key"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_ENABLE_DEMO_AUTH: z.string().optional(),

  // Server-Only Secrets (Never expose to browser)
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  DATABASE_URL: z.string().optional(),
  RATE_LIMIT_HMAC_SECRET: z.string().optional(),
  CREDENTIAL_SIGNING_KEY: z.string().optional(),
  ED25519_ISSUER_PRIVATE_KEY_PEM: z.string().optional(),
  ED25519_ISSUER_PUBLIC_KEY_PEM: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),

  // Operational Invariants
  PLATFORM_COMMISSION_AMOUNT: z.string().default("0.00"),
  OPERATING_CLASSIFICATION: z.string().default("CLASS_B_CONTROLLED_ROLLOUT"),
  PERMITTED_OPERATING_REGIONS: z.string().default(
    "Guwahati Urban (Kamrup Metro, Assam),Shillong Urban (East Khasi Hills, Meghalaya)"
  ),
});

export type ServerEnvironment = z.infer<typeof serverEnvSchema>;

export class EnvironmentService {
  private config: ServerEnvironment;

  constructor(customEnv?: Record<string, string | undefined>) {
    this.config = this.loadConfig(customEnv);
  }

  private loadConfig(customEnv?: Record<string, string | undefined>): ServerEnvironment {
    const envSource = customEnv || process.env;
    const parsed = serverEnvSchema.safeParse(envSource);
    if (!parsed.success) {
      const isProduction = envSource.NODE_ENV === "production";
      if (isProduction) {
        throw new ConfigurationError("Fatal server configuration error. Service cannot initialize.");
      }
    }
    return parsed.success ? parsed.data : (envSource as unknown as ServerEnvironment);
  }

  /**
   * Returns validated server environment configuration
   */
  public get(): ServerEnvironment {
    return this.config;
  }

  /**
   * Checks whether the current runtime environment is production
   */
  public isProduction(): boolean {
    return this.config.NODE_ENV === "production";
  }

  /**
   * Retrieves RATE_LIMIT_HMAC_SECRET with fail-closed production enforcement
   */
  public getRateLimitSecret(): string {
    const isProduction = this.config.NODE_ENV === "production";
    const secret = this.config.RATE_LIMIT_HMAC_SECRET;

    if (!secret || secret.trim().length === 0) {
      if (isProduction) {
        throw new ConfigurationError(
          "FATAL SECURITY CONFIGURATION: RATE_LIMIT_HMAC_SECRET is missing from environment in production."
        );
      }
      return "kaamsetu-dev-rate-limit-secret-key-32chars-minimum-fallback";
    }

    return secret;
  }
}

export const envService = new EnvironmentService();
