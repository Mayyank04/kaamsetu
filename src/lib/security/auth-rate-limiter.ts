/**
 * KAAMSETU — Direct Authentication Rate Limiter
 * Provides sliding-window rate limiting for registration and login endpoints.
 * Resilient: protects against brute force attacks without crashing on unmigrated RPCs.
 */

import * as crypto from "crypto";

interface RateLimitRecord {
  count: number;
  resetAt: number;
  blockedUntil?: number;
}

// In-memory sliding window cache across invocations within node runtime
const loginAttemptsCache = new Map<string, RateLimitRecord>();
const registrationAttemptsCache = new Map<string, RateLimitRecord>();

// Cleanup stale keys every 10 minutes
if (typeof setInterval !== "undefined") {
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of loginAttemptsCache.entries()) {
      if (record.resetAt < now && (!record.blockedUntil || record.blockedUntil < now)) {
        loginAttemptsCache.delete(key);
      }
    }
    for (const [key, record] of registrationAttemptsCache.entries()) {
      if (record.resetAt < now && (!record.blockedUntil || record.blockedUntil < now)) {
        registrationAttemptsCache.delete(key);
      }
    }
  }, 10 * 60 * 1000);
  if (cleanupInterval.unref) cleanupInterval.unref();
}

export interface RateLimitCheckResult {
  allowed: boolean;
  remainingAttempts: number;
  retryAfterSeconds?: number;
  reason?: string;
}

/**
 * Checks and records a login attempt.
 * Max 5 failed attempts per key per 15-minute window; 15-minute block upon exhaustion.
 */
export function checkLoginRateLimit(identifier: string, ipAddress: string): RateLimitCheckResult {
  const now = Date.now();
  const normalizedKey = `login:${ipAddress}:${identifier.toLowerCase().trim()}`;
  const record = loginAttemptsCache.get(normalizedKey);

  const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
  const MAX_ATTEMPTS = 5;

  if (record) {
    if (record.blockedUntil && record.blockedUntil > now) {
      const retryAfterSeconds = Math.ceil((record.blockedUntil - now) / 1000);
      return {
        allowed: false,
        remainingAttempts: 0,
        retryAfterSeconds,
        reason: `Too many login attempts. Please retry in ${retryAfterSeconds} seconds.`,
      };
    }

    // Reset expired window
    if (record.resetAt <= now) {
      loginAttemptsCache.set(normalizedKey, {
        count: 0,
        resetAt: now + WINDOW_MS,
      });
      return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
    }

    if (record.count >= MAX_ATTEMPTS) {
      record.blockedUntil = now + WINDOW_MS;
      const retryAfterSeconds = Math.ceil(WINDOW_MS / 1000);
      return {
        allowed: false,
        remainingAttempts: 0,
        retryAfterSeconds,
        reason: `Too many login attempts. Please retry in ${retryAfterSeconds} seconds.`,
      };
    }

    return {
      allowed: true,
      remainingAttempts: MAX_ATTEMPTS - record.count,
    };
  }

  // First attempt
  loginAttemptsCache.set(normalizedKey, {
    count: 0,
    resetAt: now + WINDOW_MS,
  });

  return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
}

/**
 * Increments failed attempt count after an invalid password attempt.
 */
export function recordFailedLoginAttempt(identifier: string, ipAddress: string): void {
  const now = Date.now();
  const normalizedKey = `login:${ipAddress}:${identifier.toLowerCase().trim()}`;
  const record = loginAttemptsCache.get(normalizedKey);

  const WINDOW_MS = 15 * 60 * 1000;
  if (record) {
    record.count += 1;
    if (record.count >= 5) {
      record.blockedUntil = now + WINDOW_MS;
    }
  } else {
    loginAttemptsCache.set(normalizedKey, {
      count: 1,
      resetAt: now + WINDOW_MS,
    });
  }
}

/**
 * Clears failed login counter on successful password verification.
 */
export function clearLoginAttempts(identifier: string, ipAddress: string): void {
  const normalizedKey = `login:${ipAddress}:${identifier.toLowerCase().trim()}`;
  loginAttemptsCache.delete(normalizedKey);
}

/**
 * Checks and records a registration attempt.
 * Max 10 account registrations per IP per hour.
 */
export function checkRegistrationRateLimit(ipAddress: string): RateLimitCheckResult {
  const now = Date.now();
  const normalizedKey = `register:${ipAddress}`;
  const record = registrationAttemptsCache.get(normalizedKey);

  const WINDOW_MS = 60 * 60 * 1000; // 1 hour
  const MAX_REGISTRATIONS = 10;

  if (record) {
    if (record.resetAt <= now) {
      registrationAttemptsCache.set(normalizedKey, {
        count: 1,
        resetAt: now + WINDOW_MS,
      });
      return { allowed: true, remainingAttempts: MAX_REGISTRATIONS - 1 };
    }

    if (record.count >= MAX_REGISTRATIONS) {
      const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000);
      return {
        allowed: false,
        remainingAttempts: 0,
        retryAfterSeconds,
        reason: `Registration limit reached for this network. Please retry in ${retryAfterSeconds} seconds.`,
      };
    }

    record.count += 1;
    return {
      allowed: true,
      remainingAttempts: MAX_REGISTRATIONS - record.count,
    };
  }

  registrationAttemptsCache.set(normalizedKey, {
    count: 1,
    resetAt: now + WINDOW_MS,
  });

  return { allowed: true, remainingAttempts: MAX_REGISTRATIONS - 1 };
}
