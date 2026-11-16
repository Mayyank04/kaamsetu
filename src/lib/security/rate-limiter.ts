/**
 * Distributed, Persistent Rate Limiting for KAAMSETU
 *
 * Protects SMS OTP endpoints against abuse, toll fraud, and brute force attacks.
 * Uses atomic PostgreSQL operations with strict fail-closed security.
 * Privacy-preserving: Raw phone numbers and IP addresses are hashed using SHA-256 HMAC with
 * dedicated server-side RATE_LIMIT_HMAC_SECRET before database storage.
 * Domain separation prevents key collisions across phone:send, phone:verify, and ip:send.
 */

import * as crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { isConfigured } from "@/lib/env";
import { assertCryptographicKeyQuality } from "@/lib/crypto/key-validator";

export interface RateLimitResult {
  allowed: boolean;
  remainingSeconds?: number;
  nextAllowedAt?: string;
  reason?: string;
  isInfrastructureError?: boolean;
  statusCode?: number;
}

export type RateLimitNamespace =
  | "phone:send"
  | "phone:verify"
  | "ip:send"
  | "cooldown"
  | string;

// In-memory fallback bucket STRICTLY for offline development and local unit tests.
// IMPOSSIBLE to enable in production.
interface MemoryBucket {
  count: number;
  firstAttemptAt: number;
  lastAttemptAt: number;
  blockedUntil?: number;
}

const memoryStore: Map<string, MemoryBucket> =
  (globalThis as any).__kaamsetu_memory_rate_limit_store ||
  ((globalThis as any).__kaamsetu_memory_rate_limit_store = new Map<string, MemoryBucket>());

/**
 * Resolves the server-only HMAC secret for privacy-preserving rate limit keys.
 * Fails closed in production if secret is missing, predictable, or lacks 256-bit entropy.
 */
export function getRateLimitHmacSecret(): string {
  const isProduction = (process.env.NODE_ENV as string) === "production";
  const secret = process.env.RATE_LIMIT_HMAC_SECRET;

  if (isProduction) {
    if (!secret) {
      throw new Error(
        "FATAL SECURITY CONFIGURATION: RATE_LIMIT_HMAC_SECRET is missing from environment in production."
      );
    }
    assertCryptographicKeyQuality(secret, "RATE_LIMIT_HMAC_SECRET");
    return secret;
  }

  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV === "test") {
    return "kaamsetu-test-hmac-rate-limit-secret-32-chars-long";
  }

  // Development with explicit mock enabled:
  if (process.env.ENABLE_IN_MEMORY_RATE_LIMIT_MOCK === "true") {
    return "kaamsetu-dev-hmac-rate-limit-secret-32-chars-long";
  }

  throw new Error(
    "RATE_LIMIT_HMAC_SECRET is not configured. Set RATE_LIMIT_HMAC_SECRET or enable ENABLE_IN_MEMORY_RATE_LIMIT_MOCK for offline development."
  );
}

/**
 * Hashes rate limit identifiers with HMAC-SHA256 and domain separation.
 * Raw phone numbers and IP addresses NEVER appear in database keys or logs.
 */
export function hashRateLimitKey(
  namespace: RateLimitNamespace,
  identifier: string,
  secretOverride?: string
): string {
  const secret = secretOverride || getRateLimitHmacSecret();
  const normalizedId = (identifier || "127.0.0.1").trim().toLowerCase();

  // Domain separation: include namespace in the HMAC input
  const digest = crypto
    .createHmac("sha256", secret)
    .update(`${namespace}:${normalizedId}`)
    .digest("hex")
    .slice(0, 32);

  return `${namespace}:${digest}`;
}

/**
 * Checks and increments a rate limit key atomically in PostgreSQL.
 * If the database is unavailable or fails in production, it FAILS CLOSED.
 */
/**
 * In-memory rate limiting engine for offline development and local automated tests.
 */
function checkInMemoryRateLimit(
  key: string,
  maxAttempts: number,
  windowSeconds: number,
  effectiveBlockSec: number
): RateLimitResult {
  const now = Date.now();
  let bucket = memoryStore.get(key);

  if (!bucket) {
    bucket = {
      count: 1,
      firstAttemptAt: now,
      lastAttemptAt: now,
      blockedUntil: 1 >= maxAttempts ? now + effectiveBlockSec * 1000 : undefined,
    };
    memoryStore.set(key, bucket);
    return { allowed: true };
  }

  if (bucket.blockedUntil && bucket.blockedUntil > now) {
    const remaining = Math.max(1, Math.ceil((bucket.blockedUntil - now) / 1000));
    return {
      allowed: false,
      remainingSeconds: remaining,
      nextAllowedAt: new Date(bucket.blockedUntil).toISOString(),
      reason: `Too many attempts. Blocked for security. Try again in ${remaining}s.`,
    };
  }

  if (now - bucket.firstAttemptAt > windowSeconds * 1000) {
    bucket.count = 1;
    bucket.firstAttemptAt = now;
    bucket.lastAttemptAt = now;
    bucket.blockedUntil = 1 >= maxAttempts ? now + effectiveBlockSec * 1000 : undefined;
    return { allowed: true };
  }

  if (bucket.count >= maxAttempts) {
    if (!bucket.blockedUntil || bucket.blockedUntil <= now) {
      bucket.blockedUntil = now + effectiveBlockSec * 1000;
    }
    bucket.lastAttemptAt = now;
    const remaining = Math.max(1, Math.ceil((bucket.blockedUntil - now) / 1000));
    return {
      allowed: false,
      remainingSeconds: remaining,
      nextAllowedAt: new Date(bucket.blockedUntil).toISOString(),
      reason: `Maximum limit of ${maxAttempts} attempts reached. Try again in ${remaining}s.`,
    };
  }

  bucket.count += 1;
  if (bucket.count >= maxAttempts) {
    bucket.blockedUntil = now + effectiveBlockSec * 1000;
  }
  bucket.lastAttemptAt = now;
  return { allowed: true };
}

/**
 * Checks and increments a rate limit key atomically in PostgreSQL.
 * If the database is unavailable or fails in production, it FAILS CLOSED with an infrastructure error.
 */
export async function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowSeconds: number,
  blockSeconds: number = windowSeconds
): Promise<RateLimitResult> {
  const isProduction = (process.env.NODE_ENV as string) === "production";
  const effectiveBlockSec = typeof blockSeconds === "number" && !isNaN(blockSeconds) ? blockSeconds : windowSeconds;

  const allowDevMock =
    !isProduction &&
    (process.env.ENABLE_IN_MEMORY_RATE_LIMIT_MOCK === "true" ||
      process.env.NODE_ENV === "test");

  // 1. Authoritative: Use atomic PostgreSQL stored procedure via admin service role
  if (isConfigured.supabase && !allowDevMock) {
    try {
      const adminClient = createAdminClient();
      const { data, error } = await adminClient.rpc("check_and_increment_rate_limit", {
        p_key: key,
        p_max_attempts: maxAttempts,
        p_window_seconds: windowSeconds,
        p_block_seconds: effectiveBlockSec,
      });

      if (error) {
        console.error(
          JSON.stringify({
            level: isProduction ? "fatal" : "warn",
            component: "RateLimiter",
            action: "check_and_increment_rate_limit",
            keyPrefix: key.split(":")[0],
            message: "Database RPC error during rate check",
            code: error.code,
          })
        );
        if (!isProduction) {
          // Graceful fallback to memory store for local development with unmigrated database
          return checkInMemoryRateLimit(key, maxAttempts, windowSeconds, effectiveBlockSec);
        }
        // Fail closed on database error in production
        return {
          allowed: false,
          remainingSeconds: 60,
          nextAllowedAt: new Date(Date.now() + 60000).toISOString(),
          isInfrastructureError: true,
          statusCode: 503,
          reason: "Authentication rate limiter temporarily unavailable. Please retry in a moment.",
        };
      }

      if (data && data.length > 0) {
        const row = data[0];
        const remSec = row.remaining_seconds || 0;
        return {
          allowed: Boolean(row.allowed),
          remainingSeconds: remSec,
          nextAllowedAt: remSec > 0 ? new Date(Date.now() + remSec * 1000).toISOString() : undefined,
          reason: row.allowed
            ? undefined
            : `Rate limit exceeded. Try again in ${remSec} seconds.`,
        };
      }

      // Malformed or empty RPC response -> Fail closed
      if (!isProduction) {
        return checkInMemoryRateLimit(key, maxAttempts, windowSeconds, effectiveBlockSec);
      }
      return {
        allowed: false,
        remainingSeconds: 60,
        nextAllowedAt: new Date(Date.now() + 60000).toISOString(),
        isInfrastructureError: true,
        statusCode: 503,
        reason: "Authentication rate limiter temporarily unavailable. Please retry in a moment.",
      };
    } catch (err: unknown) {
      console.error(
        JSON.stringify({
          level: isProduction ? "fatal" : "warn",
          component: "RateLimiter",
          action: "checkRateLimit",
          keyPrefix: key.split(":")[0],
          message: err instanceof Error ? err.message : "Unexpected database exception",
        })
      );
      if (!isProduction) {
        return checkInMemoryRateLimit(key, maxAttempts, windowSeconds, effectiveBlockSec);
      }
      return {
        allowed: false,
        remainingSeconds: 60,
        nextAllowedAt: new Date(Date.now() + 60000).toISOString(),
        isInfrastructureError: true,
        statusCode: 503,
        reason: "Authentication rate limiter temporarily unavailable. Please retry in a moment.",
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
      nextAllowedAt: new Date(Date.now() + 300000).toISOString(),
      isInfrastructureError: true,
      statusCode: 503,
      reason: "Authentication rate limiter temporarily unavailable. Please retry in a moment.",
    };
  }

  // 3. Isolated Development Mock: Only enabled when explicitly permitted or in test mode
  if (!allowDevMock) {
    return {
      allowed: false,
      remainingSeconds: 60,
      nextAllowedAt: new Date(Date.now() + 60000).toISOString(),
      isInfrastructureError: true,
      statusCode: 503,
      reason: "Rate limiting database is required. Enable ENABLE_IN_MEMORY_RATE_LIMIT_MOCK for offline development.",
    };
  }

  return checkInMemoryRateLimit(key, maxAttempts, windowSeconds, effectiveBlockSec);
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
  clientIp?: string
): Promise<RateLimitResult> {
  const isProduction = (process.env.NODE_ENV as string) === "production";
  const normalizedPhone = (phone || "").replace(/\D/g, "");
  const safeClientIp = (clientIp || "127.0.0.1").trim();

  let cooldownKey: string;
  let phoneHourlyKey: string;
  let ipKey: string;

  try {
    cooldownKey = hashRateLimitKey("cooldown", normalizedPhone);
    phoneHourlyKey = hashRateLimitKey("phone:send", `${normalizedPhone}:hourly`);
    ipKey = hashRateLimitKey("ip:send", safeClientIp);
  } catch (err: unknown) {
    console.error(
      JSON.stringify({
        level: "fatal",
        component: "RateLimiter",
        action: "validateOtpSendRateLimit",
        message: "Cryptographic configuration failure during rate limit key hashing",
        error: err instanceof Error ? err.message : String(err),
      })
    );
    if (isProduction) {
      return {
        allowed: false,
        remainingSeconds: 60,
        nextAllowedAt: new Date(Date.now() + 60000).toISOString(),
        reason: "We're temporarily unable to process this request. Please try again shortly.",
      };
    }
    throw err;
  }

  // Check 1: 60-second cooldown per phone (namespace: "cooldown")
  const cooldown = await checkRateLimit(cooldownKey, 1, 60, 60);
  if (!cooldown.allowed) {
    if (cooldown.isInfrastructureError) {
      return cooldown;
    }
    const remSec = cooldown.remainingSeconds || 60;
    return {
      allowed: false,
      remainingSeconds: remSec,
      nextAllowedAt: cooldown.nextAllowedAt || new Date(Date.now() + remSec * 1000).toISOString(),
      reason: `Please wait ${remSec} seconds before requesting a new code.`,
    };
  }

  // Check 2: Hourly phone limit (max 5 SMS/hr) (namespace: "phone:send")
  const phoneHourly = await checkRateLimit(phoneHourlyKey, 5, 3600, 3600);
  if (!phoneHourly.allowed) {
    if (phoneHourly.isInfrastructureError) {
      return phoneHourly;
    }
    const remSec = phoneHourly.remainingSeconds || 3600;
    return {
      allowed: false,
      remainingSeconds: remSec,
      nextAllowedAt: phoneHourly.nextAllowedAt || new Date(Date.now() + remSec * 1000).toISOString(),
      reason: "Maximum SMS verification requests reached for this number. Please try again later.",
    };
  }

  // Check 3: Hourly IP limit (max 15 SMS/hr per IP) (namespace: "ip:send")
  const ipHourly = await checkRateLimit(ipKey, 15, 3600, 3600);
  if (!ipHourly.allowed) {
    if (ipHourly.isInfrastructureError) {
      return ipHourly;
    }
    const remSec = ipHourly.remainingSeconds || 3600;
    return {
      allowed: false,
      remainingSeconds: remSec,
      nextAllowedAt: ipHourly.nextAllowedAt || new Date(Date.now() + remSec * 1000).toISOString(),
      reason: "Too many verification requests from your network. Please try again later.",
    };
  }

  return { allowed: true };
}

/**
 * Validates verification attempt against persistent brute-force lockouts.
 * Checks persistent database state BEFORE invoking SMS provider verification.
 * Max 5 failed attempts locks out the phone for 15 minutes.
 * STRICTLY FAILS CLOSED in production if database is unavailable, unconfigured, or in error.
 */
export async function validateOtpVerifyAttempt(phone: string): Promise<RateLimitResult> {
  const isProduction = (process.env.NODE_ENV as string) === "production";
  const normalizedPhone = phone.replace(/\D/g, "");

  let verifyKey: string;
  try {
    verifyKey = hashRateLimitKey("phone:verify", normalizedPhone);
  } catch (err: unknown) {
    if (isProduction) {
      return {
        allowed: false,
        remainingSeconds: 60,
        reason: "We're temporarily unable to process this request. Please try again shortly.",
      };
    }
    throw err;
  }

  // In production, database MUST be configured. No silent fallback to allowed.
  if (isProduction && !isConfigured.supabase) {
    return {
      allowed: false,
      remainingSeconds: 300,
      reason: "Verification service unavailable in production without persistent database.",
    };
  }

  if (isConfigured.supabase) {
    try {
      const adminClient = createAdminClient();
      const { data, error } = await adminClient.rpc("get_rate_limit_status", {
        p_key: verifyKey,
      });

      if (error) {
        console.error(
          JSON.stringify({
            level: isProduction ? "fatal" : "warn",
            component: "RateLimiter",
            action: "validateOtpVerifyAttempt",
            message: "Database error querying verification lockout status",
            code: error.code,
          })
        );
        if (!isProduction) {
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
        // Fail closed in production or database-backed configurations
        return {
          allowed: false,
          remainingSeconds: 60,
          isInfrastructureError: true,
          statusCode: 503,
          reason: "We're temporarily unable to process this request. Please try again shortly.",
        };
      }

      if (!data || data.length === 0) {
        // Unexpected empty response -> Fail closed
        return {
          allowed: false,
          remainingSeconds: 60,
          reason: "We're temporarily unable to process this request. Please try again shortly.",
        };
      }

      const row = data[0];
      if (row.is_blocked) {
        return {
          allowed: false,
          remainingSeconds: row.remaining_seconds || 900,
          reason: `Account temporarily locked due to too many failed attempts. Try again in ${row.remaining_seconds}s.`,
        };
      }

      // Check previous key during key rotation window if configured
      if (process.env.RATE_LIMIT_HMAC_SECRET_PREVIOUS) {
        const prevKey = hashRateLimitKey(
          "phone:verify",
          normalizedPhone,
          process.env.RATE_LIMIT_HMAC_SECRET_PREVIOUS
        );
        const { data: prevData, error: prevErr } = await adminClient.rpc("get_rate_limit_status", {
          p_key: prevKey,
        });
        if (!prevErr && prevData && prevData.length > 0 && prevData[0].is_blocked) {
          return {
            allowed: false,
            remainingSeconds: prevData[0].remaining_seconds || 900,
            reason: `Account temporarily locked due to too many failed attempts. Try again in ${prevData[0].remaining_seconds}s.`,
          };
        }
      }

      return { allowed: true };
    } catch (err: unknown) {
      console.error(
        JSON.stringify({
          level: isProduction ? "fatal" : "warn",
          component: "RateLimiter",
          action: "validateOtpVerifyAttempt",
          message: err instanceof Error ? err.message : "Exception in lockout check",
        })
      );
      if (!isProduction) {
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
      return {
        allowed: false,
        remainingSeconds: 60,
        isInfrastructureError: true,
        statusCode: 503,
        reason: "We're temporarily unable to process this request. Please try again shortly.",
      };
    }
  }

  // Development sandbox: only permitted if explicitly opted into
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

  let bucket = memoryStore.get(verifyKey);
  if ((!bucket || !bucket.blockedUntil) && process.env.RATE_LIMIT_HMAC_SECRET_PREVIOUS) {
    const prevKey = hashRateLimitKey(
      "phone:verify",
      normalizedPhone,
      process.env.RATE_LIMIT_HMAC_SECRET_PREVIOUS
    );
    bucket = memoryStore.get(prevKey) || bucket;
  }

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
 * Atomic operation returns RateLimitResult reflecting lock status.
 */
export async function recordFailedOtpAttempt(phone: string): Promise<RateLimitResult> {
  const normalizedPhone = phone.replace(/\D/g, "");
  const verifyKey = hashRateLimitKey("phone:verify", normalizedPhone);
  // 5 failed attempts locks for 900 seconds (15 minutes)
  const result = await checkRateLimit(verifyKey, 5, 900, 900);
  return result;
}

/**
 * Clears failed attempts persistently upon successful verification.
 */
export async function clearFailedOtpAttempts(phone: string): Promise<void> {
  const normalizedPhone = phone.replace(/\D/g, "");
  const verifyKey = hashRateLimitKey("phone:verify", normalizedPhone);

  if (isConfigured.supabase) {
    try {
      const adminClient = createAdminClient();
      await adminClient.rpc("clear_rate_limit", { p_key: verifyKey });

      if (process.env.RATE_LIMIT_HMAC_SECRET_PREVIOUS) {
        const prevKey = hashRateLimitKey(
          "phone:verify",
          normalizedPhone,
          process.env.RATE_LIMIT_HMAC_SECRET_PREVIOUS
        );
        await adminClient.rpc("clear_rate_limit", { p_key: prevKey });
      }
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
  if (process.env.RATE_LIMIT_HMAC_SECRET_PREVIOUS) {
    const prevKey = hashRateLimitKey(
      "phone:verify",
      normalizedPhone,
      process.env.RATE_LIMIT_HMAC_SECRET_PREVIOUS
    );
    memoryStore.delete(prevKey);
  }
}

/**
 * Validates login attempt rate limits (per-IP and per-account).
 * Max 10 attempts per 5 minutes per IP.
 */
export async function validateLoginRateLimit(
  clientIp: string,
  identifier?: string
): Promise<RateLimitResult> {
  const isProduction = (process.env.NODE_ENV as string) === "production";
  try {
    const ipKey = hashRateLimitKey("auth:login", clientIp);
    const ipCheck = await checkRateLimit(ipKey, 10, 300, 900);
    if (!ipCheck.allowed) {
      return {
        allowed: false,
        remainingSeconds: ipCheck.remainingSeconds,
        reason: "Too many login attempts from your network. Please try again shortly.",
      };
    }

    if (identifier) {
      const idKey = hashRateLimitKey("auth:login:account", identifier);
      const idCheck = await checkRateLimit(idKey, 5, 300, 900);
      if (!idCheck.allowed) {
        return {
          allowed: false,
          remainingSeconds: idCheck.remainingSeconds,
          reason: "Too many login attempts for this account. Please try again shortly.",
        };
      }
    }

    return { allowed: true };
  } catch (err) {
    if (isProduction) {
      return {
        allowed: false,
        remainingSeconds: 60,
        reason: "We're temporarily unable to process this request. Please try again shortly.",
      };
    }
    throw err;
  }
}

/**
 * Validates sensitive identity export rate limits (max 10 exports per hour per worker/IP).
 */
export async function validateIdentityExportRateLimit(
  userId: string,
  clientIp: string = "127.0.0.1"
): Promise<RateLimitResult> {
  try {
    const userKey = hashRateLimitKey("identity:export", userId);
    const userCheck = await checkRateLimit(userKey, 10, 3600, 3600);
    if (!userCheck.allowed) {
      return {
        allowed: false,
        remainingSeconds: userCheck.remainingSeconds,
        reason: "Identity export rate limit exceeded. Please try again in an hour.",
      };
    }

    const ipKey = hashRateLimitKey("identity:export:ip", clientIp);
    const ipCheck = await checkRateLimit(ipKey, 30, 3600, 3600);
    if (!ipCheck.allowed) {
      return {
        allowed: false,
        remainingSeconds: ipCheck.remainingSeconds,
        reason: "Network identity export rate limit exceeded. Please try again later.",
      };
    }

    return { allowed: true };
  } catch (err) {
    return {
      allowed: false,
      remainingSeconds: 60,
      reason: "Export service temporarily unavailable. Please try again shortly.",
    };
  }
}

/**
 * Validates worker grievance submission rate limits (max 3 grievances per hour).
 */
export async function validateGrievanceRateLimit(
  workerId: string,
  clientIp: string = "127.0.0.1"
): Promise<RateLimitResult> {
  try {
    const workerKey = hashRateLimitKey("worker:grievance", workerId);
    const workerCheck = await checkRateLimit(workerKey, 3, 3600, 3600);
    if (!workerCheck.allowed) {
      return {
        allowed: false,
        remainingSeconds: workerCheck.remainingSeconds,
        reason: "Maximum grievance submissions reached for this hour. Please try again later.",
      };
    }

    const ipKey = hashRateLimitKey("worker:grievance:ip", clientIp);
    const ipCheck = await checkRateLimit(ipKey, 10, 3600, 3600);
    if (!ipCheck.allowed) {
      return {
        allowed: false,
        remainingSeconds: ipCheck.remainingSeconds,
        reason: "Network grievance submission rate limit reached. Please try again later.",
      };
    }

    return { allowed: true };
  } catch (err) {
    return {
      allowed: false,
      remainingSeconds: 60,
      reason: "Grievance service temporarily unavailable. Please try again shortly.",
    };
  }
}

/**
 * Validates contractor payout disbursement rate limits (max 20 payouts per 10 minutes).
 */
export async function validatePayoutRateLimit(
  contractorId: string,
  clientIp: string = "127.0.0.1"
): Promise<RateLimitResult> {
  try {
    const contractorKey = hashRateLimitKey("contractor:payout", contractorId);
    const contractorCheck = await checkRateLimit(contractorKey, 20, 600, 600);
    if (!contractorCheck.allowed) {
      return {
        allowed: false,
        remainingSeconds: contractorCheck.remainingSeconds,
        reason: "Payout disbursement rate limit reached. Please wait before initiating further disbursements.",
      };
    }

    return { allowed: true };
  } catch (err) {
    return {
      allowed: false,
      remainingSeconds: 60,
      reason: "Payout service temporarily unavailable. Please try again shortly.",
    };
  }
}
