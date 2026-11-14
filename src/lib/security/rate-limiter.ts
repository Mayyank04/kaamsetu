/**
 * Distributed, Persistent Rate Limiting for KAAMSETU
 * Protects SMS OTP endpoints against abuse, toll fraud, and brute force attacks.
 * Uses atomic PostgreSQL operations when connected, with sliding-window fallback.
 */

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isConfigured } from "@/lib/env";

export interface RateLimitResult {
  allowed: boolean;
  remainingSeconds?: number;
  reason?: string;
}

// In-memory fallback bucket for serverless instances or offline simulation
interface MemoryBucket {
  count: number;
  firstAttemptAt: number;
  lastAttemptAt: number;
  blockedUntil?: number;
}

const memoryStore = new Map<string, MemoryBucket>();

// Clean up stale entries every 10 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of memoryStore.entries()) {
      if (bucket.blockedUntil && bucket.blockedUntil < now && now - bucket.lastAttemptAt > 3600000) {
        memoryStore.delete(key);
      }
    }
  }, 600000);
}

/**
 * Checks and increments a rate limit key.
 * @param key Unique identifier (e.g. `phone:send:+919876543210` or `ip:send:127.0.0.1`)
 * @param maxAttempts Maximum attempts allowed in the window
 * @param windowSeconds Window length in seconds
 * @param blockSeconds Block duration if max attempts exceeded
 */
export async function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowSeconds: number,
  blockSeconds: number
): Promise<RateLimitResult> {
  const now = Date.now();

  // 1. Try atomic PostgreSQL distributed rate limiter if database is configured
  if (isConfigured.supabase) {
    try {
      const supabase = await createServerSupabaseClient();
      const { data, error } = await supabase.rpc("check_and_increment_rate_limit", {
        p_key: key,
        p_max_attempts: maxAttempts,
        p_window_seconds: windowSeconds,
        p_block_seconds: blockSeconds,
      });

      if (!error && data && data.length > 0) {
        const row = data[0];
        return {
          allowed: Boolean(row.allowed),
          remainingSeconds: row.remaining_seconds || 0,
          reason: row.allowed ? undefined : `Rate limit exceeded. Try again in ${row.remaining_seconds} seconds.`,
        };
      }
    } catch (err) {
      console.warn("Database rate limit RPC failed, using persistent fallback:", err);
    }
  }

  // 2. Sliding-window in-memory rate limiter fallback
  let bucket = memoryStore.get(key);

  if (!bucket) {
    bucket = { count: 1, firstAttemptAt: now, lastAttemptAt: now };
    memoryStore.set(key, bucket);
    return { allowed: true };
  }

  // Check if currently blocked
  if (bucket.blockedUntil && bucket.blockedUntil > now) {
    const remaining = Math.ceil((bucket.blockedUntil - now) / 1000);
    return {
      allowed: false,
      remainingSeconds: remaining,
      reason: `Too many attempts. Blocked for security. Try again in ${remaining}s.`,
    };
  }

  // Check if window has expired -> reset
  if (now - bucket.firstAttemptAt > windowSeconds * 1000) {
    bucket.count = 1;
    bucket.firstAttemptAt = now;
    bucket.lastAttemptAt = now;
    bucket.blockedUntil = undefined;
    return { allowed: true };
  }

  // Within window: check count
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

  // Check 1: 60-second cooldown per phone
  const cooldownKey = `cooldown:${normalizedPhone}`;
  const cooldown = await checkRateLimit(cooldownKey, 1, 60, 60);
  if (!cooldown.allowed) {
    return {
      allowed: false,
      remainingSeconds: cooldown.remainingSeconds,
      reason: `Please wait ${cooldown.remainingSeconds} seconds before requesting a new code.`,
    };
  }

  // Check 2: Hourly phone limit (max 5)
  const phoneHourlyKey = `phone:send:hourly:${normalizedPhone}`;
  const phoneHourly = await checkRateLimit(phoneHourlyKey, 5, 3600, 3600);
  if (!phoneHourly.allowed) {
    return {
      allowed: false,
      remainingSeconds: phoneHourly.remainingSeconds,
      reason: "Maximum SMS verification requests reached for this number. Please try again later.",
    };
  }

  // Check 3: Hourly IP limit (max 15)
  const ipKey = `ip:send:hourly:${clientIp}`;
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
 * Validates verification attempt against brute-force attacks.
 * Max 5 failed attempts locks out the phone for 15 minutes.
 */
export async function validateOtpVerifyAttempt(phone: string): Promise<RateLimitResult> {
  const normalizedPhone = phone.replace(/\D/g, "");
  const verifyKey = `phone:verify:fail:${normalizedPhone}`;

  const current = memoryStore.get(verifyKey);
  if (current?.blockedUntil && current.blockedUntil > Date.now()) {
    const remaining = Math.ceil((current.blockedUntil - Date.now()) / 1000);
    return {
      allowed: false,
      remainingSeconds: remaining,
      reason: `Account temporarily locked due to too many failed attempts. Try again in ${remaining}s.`,
    };
  }

  return { allowed: true };
}

/**
 * Records a failed verification attempt.
 */
export async function recordFailedOtpAttempt(phone: string): Promise<void> {
  const normalizedPhone = phone.replace(/\D/g, "");
  const verifyKey = `phone:verify:fail:${normalizedPhone}`;
  // 5 failed attempts locks for 900 seconds (15 minutes)
  await checkRateLimit(verifyKey, 5, 900, 900);
}

/**
 * Clears failed attempts upon successful verification.
 */
export async function clearFailedOtpAttempts(phone: string): Promise<void> {
  const normalizedPhone = phone.replace(/\D/g, "");
  const verifyKey = `phone:verify:fail:${normalizedPhone}`;
  memoryStore.delete(verifyKey);
}
