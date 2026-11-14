/**
 * Distributed, Persistent Rate Limiting for KAAMSETU
 *
 * Protects SMS OTP endpoints against abuse, toll fraud, and brute force attacks.
 * Uses atomic PostgreSQL operations with strict fail-closed security.
 * Privacy-preserving: Raw phone numbers and IP addresses are hashed using SHA-256 before storage.
 */

import * as crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { isConfigured } from "@/lib/env";

export interface RateLimitResult {
  allowed: boolean;
  remainingSeconds?: number;
  reason?: string;
}

// In-memory fallback bucket STRICTLY for offline development and local unit tests.
// IMPOSSIBLE to enable in production.
interface MemoryBucket {
  count: number;
  firstAttemptAt: number;
  lastAttemptAt: number;
  blockedUntil?: number;
}

const memoryStore = new Map<string, MemoryBucket>();

// Helper to hash rate limit keys with salt to preserve user privacy in database logs
export function hashRateLimitKey(prefix: string, identifier: string): string {
  const salt =
    process.env.CREDENTIAL_SIGNING_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "kaamsetu-rate-limit-privacy-salt";
  const digest = crypto
    .createHmac("sha256", salt)
    .update(identifier.trim().toLowerCase())
    .digest("hex")
    .slice(0, 32);
  return `${prefix}:${digest}`;
}

/**
 * Checks and increments a rate limit key atomically in PostgreSQL.
 * If the database is unavailable or fails in production, it FAILS CLOSED.
 */
export async function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowSeconds: number,
  blockSeconds: number
): Promise<RateLimitResult> {
  const isProduction = (process.env.NODE_ENV as string) === "production";

  // 1. Authoritative: Use atomic PostgreSQL stored procedure via admin service role
  if (isConfigured.supabase) {
    try {
      const adminClient = createAdminClient();
      const { data, error } = await adminClient.rpc("check_and_increment_rate_limit", {
        p_key: key,
        p_max_attempts: maxAttempts,
        p_window_seconds: windowSeconds,
        p_block_seconds: blockSeconds,
      });

      if (error) {
        console.error(
          JSON.stringify({
            level: "error",
            component: "RateLimiter",
            action: "check_and_increment_rate_limit",
            keyPrefix: key.split(":")[0],
            message: "Database RPC error during rate check",
            code: error.code,
          })
        );
        // Fail closed on database error
        return {
          allowed: false,
          remainingSeconds: 60,
          reason: "Verification service temporarily unavailable. Please try again shortly.",
        };
      }

      if (data && data.length > 0) {
        const row = data[0];
        return {
          allowed: Boolean(row.allowed),
          remainingSeconds: row.remaining_seconds || 0,
          reason: row.allowed
            ? undefined
            : `Rate limit exceeded. Try again in ${row.remaining_seconds} seconds.`,
        };
      }

      // Malformed or empty RPC response -> Fail closed
      return {
        allowed: false,
        remainingSeconds: 60,
        reason: "Verification service temporarily unavailable. Please try again shortly.",
      };
    } catch (err: unknown) {
      console.error(
        JSON.stringify({
          level: "error",
          component: "RateLimiter",
          action: "checkRateLimit",
          keyPrefix: key.split(":")[0],
          message: err instanceof Error ? err.message : "Unexpected database exception",
        })
      );
      // Fail closed on exception
      return {
        allowed: false,
        remainingSeconds: 60,
        reason: "Verification service temporarily unavailable. Please try again shortly.",
      };
    }
  }

  // 2. Production Invariant: In-memory fallback is strictly FORBIDDEN in production
  if (isProduction) {
    console.error(
      JSON.stringify({
        level: "fatal",
        component: "RateLimiter",
        message: "Supabase not configured in production. Rejecting rate-limited request.",
      })
    );
    return {
      allowed: false,
      remainingSeconds: 300,
      reason: "Security service unavailable. Operations locked in production without database.",
    };
  }

  // 3. Isolated Development Mock: Only enabled when explicitly permitted
  const allowDevMock =
    process.env.NODE_ENV !== "production" &&
    process.env.ENABLE_IN_MEMORY_RATE_LIMIT_MOCK === "true";

  if (!allowDevMock) {
    return {
      allowed: false,
      remainingSeconds: 60,
      reason: "Rate limiting database is required. Enable ENABLE_IN_MEMORY_RATE_LIMIT_MOCK for offline development.",
    };
  }

  const now = Date.now();
  let bucket = memoryStore.get(key);

  if (!bucket) {
    bucket = { count: 1, firstAttemptAt: now, lastAttemptAt: now };
    memoryStore.set(key, bucket);
    return { allowed: true };
  }

  if (bucket.blockedUntil && bucket.blockedUntil > now) {
    const remaining = Math.ceil((bucket.blockedUntil - now) / 1000);
    return {
      allowed: false,
      remainingSeconds: remaining,
      reason: `Too many attempts. Blocked for security. Try again in ${remaining}s.`,
    };
  }

  if (now - bucket.firstAttemptAt > windowSeconds * 1000) {
    bucket.count = 1;
    bucket.firstAttemptAt = now;
    bucket.lastAttemptAt = now;
    bucket.blockedUntil = undefined;
    return { allowed: true };
  }

  if (bucket.count >= maxAttempts) {
    bucket.blockedUntil = now + blockSeconds * 1000;
    bucket.lastAttemptAt = now;
    return {
      allowed: false,
      remainingSeconds: blockSeconds,
      reason: `Maximum limit of ${maxAttempts} attempts reached. Try again in ${blockSeconds}s.`,
    };
  }

  bucket.count += 1;
  bucket.lastAttemptAt = now;
  return { allowed: true };
}

/**
 * Validates request for OTP sending.
 * Enforces:
 * 1. Per-Phone Resend Cooldown: 60 seconds minimum interval.
 * 2. Per-Phone Send Limit: Max 5 SMS per 1 hour.
 * 3. Per-IP Limit: Max 15 SMS per 1 hour (anti-SMS-bombing / toll fraud).
 */
export async function validateOtpSendRateLimit(
  phone: string,
  clientIp: string
): Promise<RateLimitResult> {
  const normalizedPhone = phone.replace(/\D/g, "");

  // Check 1: 60-second cooldown per phone (hashed key)
  const cooldownKey = hashRateLimitKey("cooldown", normalizedPhone);
  const cooldown = await checkRateLimit(cooldownKey, 1, 60, 60);
  if (!cooldown.allowed) {
    return {
      allowed: false,
      remainingSeconds: cooldown.remainingSeconds,
      reason: `Please wait ${cooldown.remainingSeconds} seconds before requesting a new code.`,
    };
  }

  // Check 2: Hourly phone limit (max 5 SMS/hr)
  const phoneHourlyKey = hashRateLimitKey("phone:send:hourly", normalizedPhone);
  const phoneHourly = await checkRateLimit(phoneHourlyKey, 5, 3600, 3600);
  if (!phoneHourly.allowed) {
    return {
      allowed: false,
      remainingSeconds: phoneHourly.remainingSeconds,
      reason: "Maximum SMS verification requests reached for this number. Please try again later.",
    };
  }

  // Check 3: Hourly IP limit (max 15 SMS/hr per IP)
  const ipKey = hashRateLimitKey("ip:send:hourly", clientIp);
  const ipHourly = await checkRateLimit(ipKey, 15, 3600, 3600);
  if (!ipHourly.allowed) {
    return {
      allowed: false,
      remainingSeconds: ipHourly.remainingSeconds,
      reason: "Too many verification requests from your network. Please try again later.",
    };
  }

  return { allowed: true };
}

/**
 * Validates verification attempt against persistent brute-force lockouts.
 * Checks persistent database state BEFORE invoking SMS provider verification.
 * Max 5 failed attempts locks out the phone for 15 minutes.
 */
export async function validateOtpVerifyAttempt(phone: string): Promise<RateLimitResult> {
  const normalizedPhone = phone.replace(/\D/g, "");
  const verifyKey = hashRateLimitKey("phone:verify:fail", normalizedPhone);

  if (isConfigured.supabase) {
    try {
      const adminClient = createAdminClient();
      const { data, error } = await adminClient.rpc("get_rate_limit_status", {
        p_key: verifyKey,
      });

      if (!error && data && data.length > 0) {
        const row = data[0];
        if (row.is_blocked) {
          return {
            allowed: false,
            remainingSeconds: row.remaining_seconds || 900,
            reason: `Account temporarily locked due to too many failed attempts. Try again in ${row.remaining_seconds}s.`,
          };
        }
        return { allowed: true };
      }

      if (error) {
        console.error(
          JSON.stringify({
            level: "error",
            component: "RateLimiter",
            action: "validateOtpVerifyAttempt",
            message: "Database error querying verification lockout status",
          })
        );
        // Fail closed in production if security check cannot be verified
        if ((process.env.NODE_ENV as string) === "production") {
          return {
            allowed: false,
            remainingSeconds: 60,
            reason: "Verification service temporarily unavailable. Please try again shortly.",
          };
        }
      }
    } catch (err: unknown) {
      console.error(
        JSON.stringify({
          level: "error",
          component: "RateLimiter",
          action: "validateOtpVerifyAttempt",
          message: err instanceof Error ? err.message : "Exception in lockout check",
        })
      );
      if ((process.env.NODE_ENV as string) === "production") {
        return {
          allowed: false,
          remainingSeconds: 60,
          reason: "Verification service temporarily unavailable. Please try again shortly.",
        };
      }
    }
  }

  // Offline / development mock check
  const bucket = memoryStore.get(verifyKey);
  if (bucket?.blockedUntil && bucket.blockedUntil > Date.now()) {
    const remaining = Math.ceil((bucket.blockedUntil - Date.now()) / 1000);
    return {
      allowed: false,
      remainingSeconds: remaining,
      reason: `Account temporarily locked due to too many failed attempts. Try again in ${remaining}s.`,
    };
  }

  return { allowed: true };
}

/**
 * Records a failed verification attempt persistently in PostgreSQL.
 * 5 failed attempts locks for 900 seconds (15 minutes).
 */
export async function recordFailedOtpAttempt(phone: string): Promise<void> {
  const normalizedPhone = phone.replace(/\D/g, "");
  const verifyKey = hashRateLimitKey("phone:verify:fail", normalizedPhone);
  // 5 failed attempts locks for 900 seconds (15 minutes)
  await checkRateLimit(verifyKey, 5, 900, 900);
}

/**
 * Clears failed attempts persistently upon successful verification.
 */
export async function clearFailedOtpAttempts(phone: string): Promise<void> {
  const normalizedPhone = phone.replace(/\D/g, "");
  const verifyKey = hashRateLimitKey("phone:verify:fail", normalizedPhone);

  if (isConfigured.supabase) {
    try {
      const adminClient = createAdminClient();
      await adminClient.rpc("clear_rate_limit", { p_key: verifyKey });
    } catch (err) {
      console.error(
        JSON.stringify({
          level: "error",
          component: "RateLimiter",
          action: "clearFailedOtpAttempts",
          message: "Failed to clear rate limit in database",
        })
      );
    }
  }

  memoryStore.delete(verifyKey);
}
