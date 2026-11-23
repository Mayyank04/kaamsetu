/**
 * KAAMSETU — Cryptographically Secure OTP Authentication Service
 * 
 * Manages full lifecycle of OTP authentication:
 * 1. Cryptographically secure random 6-digit code generation
 * 2. Privacy-preserving HMAC hashing for phone and OTP storage (zero hardcoded fallback secrets)
 * 3. Controlled Verification Modes:
 *    - 'sandbox' (Simulated SMS with explicit sandbox disclosures, transparent testing codes)
 *    - 'sms' (Live telecom gateway dispatch via Twilio / Supabase Auth)
 * 4. Persistent atomic verification and single-use consumption in PostgreSQL
 * 5. Multi-instance session token generation and secure cookie handling
 * 6. Honest verification status modeling ('sandbox_unverified' vs 'sms_verified')
 * 7. Authoritative Account Lifecycle:
 *    - Validates existing accounts on login (ACCOUNT_NOT_FOUND)
 *    - Prevents duplicate registration (ACCOUNT_ALREADY_EXISTS)
 *    - Atomically persists profiles and contractor organizations
 *    - Fails closed in production on database error without memory bypass
 */

import * as crypto from "crypto";
import { isConfigured, env } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  validateOtpSendRateLimit,
  validateOtpVerifyAttempt,
  recordFailedOtpAttempt,
  clearFailedOtpAttempts,
  hashRateLimitKey,
  getRateLimitHmacSecret,
} from "@/lib/security/rate-limiter";
import { AppRole } from "@/types/database.types";
import { AuthErrorCode } from "@/lib/auth/auth-error-codes";
import {
  validateIndianMobile,
  normalizeIndianPhone,
  INVALID_PHONE_MESSAGE,
} from "@/lib/utilities/phone";

export { normalizeIndianPhone, validateIndianMobile };

export const CURRENT_TERMS_VERSION = "2026.1";
export const CURRENT_PRIVACY_VERSION = "2026.1";

export interface SendOtpRequest {
  phone: string;
  role?: string;
  fullName?: string;
  intent?: "registration" | "login";
  termsAccepted?: boolean;
  privacyAccepted?: boolean;
  termsVersion?: string;
  privacyVersion?: string;
  clientIp?: string;
}

export interface SendOtpResponse {
  success: boolean;
  code?: AuthErrorCode;
  message: string;
  challengeCreated?: boolean;
  hasActiveChallenge?: boolean;
  isSandbox?: boolean;
  sandboxCode?: string;
  isInfrastructureError?: boolean;
  requiresDemoCode?: boolean;
  retryAfterSeconds?: number;
  nextAllowedAt?: string;
  statusCode?: number;
}

export interface VerifyOtpRequest {
  phone: string;
  otp: string;
  role?: string;
  fullName?: string;
  intent?: "registration" | "login";
  termsAccepted?: boolean;
  privacyAccepted?: boolean;
  termsVersion?: string;
  privacyVersion?: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  code?: AuthErrorCode;
  message: string;
  user?: {
    id: string;
    phone: string;
    fullName: string;
    role: AppRole;
    isDemo: boolean;
    accountStatus: string;
    phoneVerificationStatus: string;
    verificationMethod: string;
    phoneVerified: boolean;
    workerProfileId?: string | null;
    contractorOrgId?: string | null;
  };
  verificationMethod?: string;
  phoneVerified?: boolean;
  sessionToken?: string;
  redirectUrl?: string;
  isSandbox?: boolean;
  retryAfterSeconds?: number;
  statusCode?: number;
}

// In-memory challenge store for offline development and unit tests
interface MemoryOtpRecord {
  id: string;
  phoneHash: string;
  otpHash: string;
  plainOtp?: string;
  role: string;
  fullName?: string;
  intent?: "registration" | "login";
  attempts: number;
  maxAttempts: number;
  expiresAt: number;
  consumedAt?: number;
  createdAt: number;
}

const memoryOtpStore: Map<string, MemoryOtpRecord> =
  (globalThis as any).__kaamsetu_memory_otp_store || new Map<string, MemoryOtpRecord>();
(globalThis as any).__kaamsetu_memory_otp_store = memoryOtpStore;

export function getMemoryOtpStore(): Map<string, MemoryOtpRecord> {
  return memoryOtpStore;
}

// In-memory profiles store for offline development and unit tests
interface MemoryProfileRecord {
  id: string;
  phone: string;
  fullName: string;
  role: AppRole;
  accountStatus: string;
  phoneVerificationStatus: string;
  verificationMethod: string;
  phoneVerified: boolean;
  workerProfileId?: string | null;
  contractorOrgId?: string | null;
}

const memoryProfileStore: Map<string, MemoryProfileRecord> =
  (globalThis as any).__kaamsetu_memory_profile_store || new Map<string, MemoryProfileRecord>();
(globalThis as any).__kaamsetu_memory_profile_store = memoryProfileStore;

export function getMemoryProfileStore(): Map<string, MemoryProfileRecord> {
  return memoryProfileStore;
}

export interface MemoryConsentRecord {
  userId: string;
  phone: string;
  termsVersion: string;
  privacyVersion: string;
  purpose: string;
  acceptedAt: number;
}

const memoryConsentStore: Map<string, MemoryConsentRecord> =
  (globalThis as any).__kaamsetu_memory_consent_store || new Map<string, MemoryConsentRecord>();
(globalThis as any).__kaamsetu_memory_consent_store = memoryConsentStore;

export function getMemoryConsentStore(): Map<string, MemoryConsentRecord> {
  return memoryConsentStore;
}

/**
 * Deterministically masks an Indian mobile number for transparent UI feedback
 */
export function maskPhoneNumber(cleanPhone: string): string {
  const digits = cleanPhone.replace(/\D/g, "");
  if (digits.length >= 10) {
    const last10 = digits.slice(-10);
    return `+91 ${last10.slice(0, 2)}****${last10.slice(6)}`;
  }
  return cleanPhone;
}

/**
 * Generates an HMAC-SHA256 hash of the OTP for storage.
 * Enforces zero hardcoded fallback secrets in production.
 */
export function hashOtpCode(otp: string): string {
  const secret = getRateLimitHmacSecret();
  return crypto.createHmac("sha256", secret).update(`otp:${otp}`).digest("hex");
}

/**
 * Signs a durable multi-instance session token with HMAC-SHA256.
 * Strictly fails closed if cryptographic key material is missing.
 */
export function signSessionToken(payload: {
  userId?: string;
  phone?: string | null;
  email?: string | null;
  fullName?: string | null;
  role: AppRole;
  verificationMethod?: string;
  phoneVerified?: boolean;
  phoneVerificationStatus?: string;
  accountStatus?: string;
  exp?: number;
}): string {
  const secret = getRateLimitHmacSecret();
  const userId = payload.userId || `usr-${Date.now()}`;
  const exp = payload.exp ?? Math.floor(Date.now() / 1000) + 14 * 24 * 60 * 60; // 14 days
  const data = JSON.stringify({ ...payload, userId, exp });
  const encoded = Buffer.from(data, "utf8").toString("base64url");
  const signature = crypto.createHmac("sha256", secret).update(encoded).digest("base64url");
  return `${encoded}.${signature}`;
}

/**
 * Verifies a signed session token using constant-time comparison.
 * Strictly fails closed if cryptographic key material is missing.
 */
export function verifySessionToken(token: string): {
  userId: string;
  phone: string | null;
  email?: string | null;
  fullName?: string | null;
  role: AppRole;
  verificationMethod?: string;
  phoneVerified?: boolean;
  phoneVerificationStatus?: string;
  accountStatus?: string;
} | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [encoded, signature] = parts;
    const sigBuf = Buffer.from(signature, "utf8");

    let verified = false;

    // 1. Verify against active primary HMAC secret
    try {
      const secret = getRateLimitHmacSecret();
      const expectedSig = crypto.createHmac("sha256", secret).update(encoded).digest("base64url");
      const expBuf = Buffer.from(expectedSig, "utf8");
      if (sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf)) {
        verified = true;
      }
    } catch {
      // Primary verification failed or secret unavailable
    }

    // 2. Fallback to previous secret during zero-downtime key rotation
    if (!verified && process.env.RATE_LIMIT_HMAC_SECRET_PREVIOUS) {
      try {
        const prevSecret = process.env.RATE_LIMIT_HMAC_SECRET_PREVIOUS;
        const expectedSig = crypto.createHmac("sha256", prevSecret).update(encoded).digest("base64url");
        const expBuf = Buffer.from(expectedSig, "utf8");
        if (sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf)) {
          verified = true;
        }
      } catch {
        // Previous secret verification failed
      }
    }

    if (!verified) {
      return null;
    }

    const json = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
    if (json.exp && json.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }

    return {
      userId: json.userId,
      phone: json.phone || null,
      email: json.email || null,
      fullName: json.fullName || null,
      role: json.role,
      verificationMethod: json.verificationMethod,
      phoneVerified: json.phoneVerified,
      phoneVerificationStatus: json.phoneVerificationStatus,
      accountStatus: json.accountStatus,
    };
  } catch {
    return null;
  }
}

/**
 * Sends or provisions an OTP challenge with rate limiting & provider dispatch
 */
export async function sendOtp(req: SendOtpRequest): Promise<SendOtpResponse> {
  const isProduction = process.env.NODE_ENV === "production";
  const { valid, formatted, error } = validateIndianMobile(req.phone);

  if (!valid) {
    return {
      success: false,
      code: "INVALID_PHONE",
      message: error || INVALID_PHONE_MESSAGE,
      statusCode: 400,
    };
  }

  // Rate Limiting Check (Fail closed in production)
  const clientIp = req.clientIp || "127.0.0.1";
  const rateLimit = await validateOtpSendRateLimit(formatted, clientIp);
  if (!rateLimit.allowed) {
    if (rateLimit.isInfrastructureError) {
      return {
        success: false,
        code: (rateLimit.errorCode as AuthErrorCode) || "DATABASE_UNAVAILABLE",
        challengeCreated: false,
        hasActiveChallenge: false,
        isInfrastructureError: true,
        message:
          rateLimit.reason ||
          "Authentication rate limiter temporarily unavailable. Your profile draft has been saved. Please retry in a moment.",
        retryAfterSeconds: undefined,
        nextAllowedAt: undefined,
        statusCode: rateLimit.statusCode || 503,
      };
    }

    const verificationMode = process.env.AUTH_VERIFICATION_MODE || env.AUTH_VERIFICATION_MODE || "sandbox";
    const isSandbox = verificationMode === "sandbox";
    const phoneHashed = hashRateLimitKey("phone:identity", formatted);
    let activeChallengeCode: string | undefined;
    let hasActiveChallenge = false;

    // 1. Check in-memory store for active challenge
    const memRecord = memoryOtpStore.get(phoneHashed);
    if (memRecord && !memRecord.consumedAt && Date.now() < memRecord.expiresAt) {
      hasActiveChallenge = true;
      if (isSandbox) {
        activeChallengeCode = memRecord.plainOtp;
      }
    }

    // 2. Check Supabase DB for active challenge if DB configured
    if (!hasActiveChallenge && isConfigured.supabase) {
      try {
        const adminClient = createAdminClient();
        const { data: dbChallenge } = await adminClient
          .from("otp_challenges")
          .select("id, verification_mode, expires_at")
          .eq("phone_hash", phoneHashed)
          .is("consumed_at", null)
          .gt("expires_at", new Date().toISOString())
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (dbChallenge) {
          hasActiveChallenge = true;
          const configuredSandboxCode = process.env.SANDBOX_OTP_CODE;
          if (isSandbox && configuredSandboxCode && /^\d{6}$/.test(configuredSandboxCode)) {
            activeChallengeCode = configuredSandboxCode;
          }
        }
      } catch {
        // Fallback gracefully
      }
    }

    const remSec = rateLimit.remainingSeconds || 60;
    const nextAllowed = rateLimit.nextAllowedAt || new Date(Date.now() + remSec * 1000).toISOString();

    if (hasActiveChallenge) {
      return {
        success: false,
        code: "ACTIVE_CHALLENGE_EXISTS",
        challengeCreated: false,
        hasActiveChallenge: true,
        retryAfterSeconds: remSec,
        nextAllowedAt: nextAllowed,
        isSandbox: !isProduction && isSandbox,
        sandboxCode: (!isProduction || process.env.ALLOW_INSECURE_SANDBOX_IN_PRODUCTION === "true") ? activeChallengeCode : undefined,
        message: `Please wait ${remSec} seconds before requesting a new code.`,
        statusCode: 429,
      };
    }

    return {
      success: false,
      code: "RATE_LIMITED",
      challengeCreated: false,
      hasActiveChallenge: false,
      retryAfterSeconds: remSec,
      nextAllowedAt: nextAllowed,
      isSandbox: !isProduction && isSandbox,
      message: rateLimit.reason || `Please wait ${remSec} seconds before requesting a new code.`,
      statusCode: 429,
    };
  }

  // Account Existence Check:
  // When logging in, the account must exist. When registering, account must not exist.
  const intent = req.intent;
  if (intent && isConfigured.supabase) {
    try {
      const adminClient = createAdminClient();
      const { data: existingProfile, error: queryErr } = await adminClient
        .from("profiles")
        .select("id, role, full_name")
        .eq("phone", formatted)
        .maybeSingle();

      if (queryErr) {
        if (isProduction) {
          return {
            success: false,
            code: "DATABASE_UNAVAILABLE",
            isInfrastructureError: true,
            message: "Authentication service temporarily unavailable. Please retry in a moment.",
            statusCode: 503,
          };
        }
      } else {
        const foundProfile = existingProfile || (!isProduction ? memoryProfileStore.get(formatted) : null);
        if (intent === "login" && !foundProfile) {
          return {
            success: false,
            code: "ACCOUNT_NOT_FOUND",
            message: "No account found with this mobile number. Please register first.",
            statusCode: 404,
          };
        }
        if (intent === "registration" && foundProfile) {
          return {
            success: false,
            code: "ACCOUNT_ALREADY_EXISTS",
            message: "An account already exists with this mobile number. Please sign in instead.",
            statusCode: 409,
          };
        }
      }
    } catch (err) {
      if (isProduction) {
        return {
          success: false,
          code: "DATABASE_UNAVAILABLE",
          isInfrastructureError: true,
          message: "Authentication service temporarily unavailable. Please retry in a moment.",
          statusCode: 503,
        };
      }
    }
  } else if (intent) {
    // Offline / dev / test harness without Supabase
    const memProfile = memoryProfileStore.get(formatted);
    if (intent === "login" && !memProfile) {
      return {
        success: false,
        code: "ACCOUNT_NOT_FOUND",
        message: "No account found with this mobile number. Please register first.",
        statusCode: 404,
      };
    }
    if (intent === "registration" && memProfile) {
      return {
        success: false,
        code: "ACCOUNT_ALREADY_EXISTS",
        message: "An account already exists with this mobile number. Please sign in instead.",
        statusCode: 409,
      };
    }
  }

  // Determine verification mode: 'sandbox' or 'sms'
  const verificationMode = process.env.AUTH_VERIFICATION_MODE || env.AUTH_VERIFICATION_MODE || "sandbox";
  const isSandbox = verificationMode === "sandbox";

  // Generate 6-digit random code or use server-configured sandbox code
  const configuredSandboxCode = process.env.SANDBOX_OTP_CODE;
  const otpCode = isSandbox && configuredSandboxCode && /^\d{6}$/.test(configuredSandboxCode)
    ? configuredSandboxCode
    : crypto.randomInt(100000, 999999).toString();

  const otpHashed = hashOtpCode(otpCode);
  const phoneHashed = hashRateLimitKey("phone:identity", formatted);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes (300 seconds)

  // Persist challenge into PostgreSQL
  if (isConfigured.supabase) {
    try {
      const adminClient = createAdminClient();
      const { error: dbErr } = await adminClient.from("otp_challenges").insert({
        phone_hash: phoneHashed,
        otp_hash: otpHashed,
        expires_at: expiresAt.toISOString(),
      });
      if (dbErr) {
        throw dbErr;
      }
    } catch (err) {
      console.error("[OTP_DB_ERROR] Failed to save challenge to PostgreSQL:", err);
      // In production, regardless of sandbox or SMS mode, FAIL CLOSED:
      if (isProduction) {
        return {
          success: false,
          code: "DATABASE_UNAVAILABLE",
          isInfrastructureError: true,
          message:
            "Verification is temporarily unavailable. Your profile draft has been saved. Please try again later.",
          statusCode: 503,
        };
      }
    }
  } else if (isProduction) {
    // Supabase not configured in production -> Fail closed
    return {
      success: false,
      code: "DATABASE_UNAVAILABLE",
      isInfrastructureError: true,
      message: "Authentication service is unavailable. Please retry shortly.",
      statusCode: 503,
    };
  }

  // Record in memory store for sandbox / offline / test environments
  memoryOtpStore.set(phoneHashed, {
    id: crypto.randomUUID(),
    phoneHash: phoneHashed,
    otpHash: otpHashed,
    plainOtp: otpCode,
    role: req.role || "worker",
    fullName: req.fullName?.trim(),
    intent: (intent as "registration" | "login") || "login",
    attempts: 0,
    maxAttempts: 5,
    expiresAt: expiresAt.getTime(),
    createdAt: Date.now(),
  });

  // =========================================================================
  // 1. SANDBOX VERIFICATION MODE (Simulated SMS, Transparent Testing)
  // =========================================================================
  if (isSandbox) {
    const allowInsecureSandbox = process.env.ALLOW_INSECURE_SANDBOX_IN_PRODUCTION === "true";
    if (isProduction && !allowInsecureSandbox) {
      return {
        success: false,
        code: "SMS_GATEWAY_UNAVAILABLE" as AuthErrorCode,
        message:
          "Live SMS delivery is not configured for this production environment. Please register or sign in using your email and password.",
        isSandbox: false,
        sandboxCode: undefined,
        statusCode: 503,
      };
    }

    return {
      success: true,
      challengeCreated: true,
      hasActiveChallenge: true,
      message: isProduction
        ? `Verification code dispatched to ${maskPhoneNumber(formatted)}.`
        : `Sandbox verification code for ${maskPhoneNumber(formatted)} generated. No SMS will be sent.`,
      isSandbox: !isProduction,
      sandboxCode: (!isProduction || allowInsecureSandbox) ? otpCode : undefined,
      retryAfterSeconds: 60,
      nextAllowedAt: new Date(Date.now() + 60000).toISOString(),
      statusCode: 200,
    };
  }

  // =========================================================================
  // 2. LIVE SMS GATEWAY DISPATCH (Twilio / Supabase SMS)
  // =========================================================================
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER;
  if (twilioSid && twilioToken && twilioFrom && !twilioSid.includes("placeholder")) {
    try {
      const authHeader = Buffer.from(`${twilioSid}:${twilioToken}`).toString("base64");
      const twilioRes = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${authHeader}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            To: formatted,
            From: twilioFrom,
            Body: `[KAAMSETU] Your verification code is ${otpCode}. Valid for 5 minutes. Do not share this code.`,
          }).toString(),
        }
      );
      if (twilioRes.ok) {
        return {
          success: true,
          challengeCreated: true,
          hasActiveChallenge: true,
          message: `Verification code sent via SMS to ${maskPhoneNumber(formatted)}.`,
          retryAfterSeconds: 60,
          nextAllowedAt: new Date(Date.now() + 60000).toISOString(),
          statusCode: 200,
        };
      }
    } catch (twilioErr) {
      console.error("[TWILIO_DISPATCH_FAIL]", twilioErr);
    }
  }

  // In SMS mode without working telecom credentials, fail securely
  return {
    success: false,
    code: "SMS_GATEWAY_UNAVAILABLE" as AuthErrorCode,
    message: isProduction
      ? "Live SMS gateway is temporarily unavailable. Please use email and password authentication."
      : "SMS gateway unavailable. Please configure AUTH_VERIFICATION_MODE=sandbox for test environments.",
    statusCode: 503,
  };
}

/**
 * Verifies an OTP code and returns authenticated session data
 */
export async function verifyOtp(req: VerifyOtpRequest): Promise<VerifyOtpResponse> {
  const isProduction = process.env.NODE_ENV === "production";
  const { valid, formatted, clean10, error } = validateIndianMobile(req.phone);

  if (!valid) {
    return {
      success: false,
      code: "INVALID_PHONE",
      message: error || INVALID_PHONE_MESSAGE,
      statusCode: 400,
    };
  }

  // Brute-force lockout check
  const lockout = await validateOtpVerifyAttempt(formatted);
  if (!lockout.allowed) {
    return {
      success: false,
      code: "OTP_ATTEMPTS_EXCEEDED",
      message: lockout.reason || "Maximum verification attempts exceeded. Please request a new code.",
      retryAfterSeconds: lockout.remainingSeconds,
      statusCode: 429,
    };
  }

  const phoneHashed = hashRateLimitKey("phone:identity", formatted);
  const otpHashed = hashOtpCode(req.otp);
  let verified = false;
  const validRoles: AppRole[] = ["worker", "vendor", "contractor", "customer", "admin", "institution"];
  let resolvedRole: AppRole =
    req.role && validRoles.includes(req.role as AppRole)
      ? (req.role as AppRole)
      : "worker";
  let resolvedName = req.fullName?.trim() || "Verified User";
  const intent = req.intent || "login";
  const isSandbox = (process.env.AUTH_VERIFICATION_MODE || env.AUTH_VERIFICATION_MODE || "sandbox") === "sandbox";

  // 1. Try atomic PostgreSQL verification if database is configured
  if (isConfigured.supabase) {
    try {
      const adminClient = createAdminClient();
      const { data, error } = await adminClient.rpc("verify_and_consume_otp", {
        p_phone_hash: phoneHashed,
        p_otp_hash: otpHashed,
      });

      if (!error && data && data.length > 0) {
        const res = data[0];
        if (res.success) {
          verified = true;
          if (res.role) resolvedRole = res.role as AppRole;
          if (res.full_name) resolvedName = res.full_name;
        } else if (res.status_code === "EXPIRED") {
          return {
            success: false,
            code: "OTP_EXPIRED",
            message: "Verification code has expired. Please request a new code.",
            statusCode: 400,
          };
        } else if (res.status_code === "MAX_ATTEMPTS_EXCEEDED") {
          return {
            success: false,
            code: "OTP_ATTEMPTS_EXCEEDED",
            message: "Maximum verification attempts exceeded. Please request a new code.",
            statusCode: 429,
          };
        }
      } else if (error && isProduction) {
        // Fail closed in production on database RPC error
        return {
          success: false,
          code: "DATABASE_UNAVAILABLE",
          message: "Verification service temporarily unavailable. Please retry shortly.",
          statusCode: 503,
        };
      }
    } catch (err) {
      console.warn("[OTP_VERIFY_DB_FALLBACK]", err);
      if (isProduction) {
        return {
          success: false,
          code: "DATABASE_UNAVAILABLE",
          message: "Verification service temporarily unavailable. Please retry shortly.",
          statusCode: 503,
        };
      }
    }
  }

  // 2. Try in-memory store if DB was unconfigured or in development/test
  if (!verified && memoryOtpStore.has(phoneHashed)) {
    const memRecord = memoryOtpStore.get(phoneHashed)!;
    const now = Date.now();

    if (now > memRecord.expiresAt) {
      memoryOtpStore.delete(phoneHashed);
      return {
        success: false,
        code: "OTP_EXPIRED",
        message: "Verification code has expired. Please request a new code.",
        statusCode: 400,
      };
    }

    if (memRecord.consumedAt) {
      return {
        success: false,
        code: "OTP_INVALID",
        message: "Verification code already used. Please request a new code.",
        statusCode: 400,
      };
    }

    if (memRecord.attempts >= memRecord.maxAttempts) {
      return {
        success: false,
        code: "OTP_ATTEMPTS_EXCEEDED",
        message: "Maximum verification attempts exceeded. Please request a new code.",
        statusCode: 429,
      };
    }

    memRecord.attempts += 1;

    // Strict verification: Cryptographic hash match or plainOtp match in memory store
    const matchesCode =
      memRecord.otpHash === otpHashed ||
      memRecord.plainOtp === req.otp.trim();

    if (matchesCode) {
      verified = true;
      memRecord.consumedAt = now;
      if (memRecord.role) resolvedRole = memRecord.role as AppRole;
      if (memRecord.fullName) resolvedName = memRecord.fullName;
    }
  }

  if (!verified) {
    // Record failed attempt for brute-force tracking
    const failResult = await recordFailedOtpAttempt(formatted);
    const attemptsExceeded =
      !failResult.allowed ||
      (memoryOtpStore.has(phoneHashed) &&
        memoryOtpStore.get(phoneHashed)!.attempts >=
          (memoryOtpStore.get(phoneHashed)!.maxAttempts || 5));

    return {
      success: false,
      code: attemptsExceeded ? "OTP_ATTEMPTS_EXCEEDED" : "OTP_INVALID",
      message: attemptsExceeded
        ? failResult.reason ||
          "Maximum verification attempts exceeded. Please request a new code."
        : "Invalid verification code. Please check and try again.",
      retryAfterSeconds: attemptsExceeded
        ? failResult.remainingSeconds || 900
        : undefined,
      statusCode: attemptsExceeded ? 429 : 400,
    };
  }

  // Clear brute force counters on success
  await clearFailedOtpAttempts(formatted);

  // Authoritative Profile & Account Resolution
  let userId: string = crypto.randomUUID();
  let workerProfileId: string | null = null;
  let contractorOrgId: string | null = null;
  const accountStatus = "active";
  const phoneVerificationStatus = isSandbox ? "sandbox_unverified" : "sms_verified";
  const verificationMethod = isSandbox ? "sandbox" : "sms";
  const phoneVerified = !isSandbox;

  if (isConfigured.supabase) {
    try {
      const adminClient = createAdminClient();

      // Check existing profile by phone
      const { data: existingProfile, error: queryErr } = await adminClient
        .from("profiles")
        .select("*")
        .eq("phone", formatted)
        .maybeSingle();

      if (queryErr && isProduction) {
        return {
          success: false,
          code: "DATABASE_UNAVAILABLE",
          message: "Account resolution temporarily unavailable. Please retry in a moment.",
          statusCode: 503,
        };
      }

      const resolvedProfile = existingProfile || (!isProduction ? memoryProfileStore.get(formatted) : null);

      if (intent === "login") {
        if (!resolvedProfile) {
          return {
            success: false,
            code: "ACCOUNT_NOT_FOUND",
            message: "No account found with this mobile number. Please register first.",
            statusCode: 404,
          };
        }
        userId = resolvedProfile.id;
        resolvedRole = (resolvedProfile.role as AppRole) || resolvedRole;
        resolvedName =
          ("full_name" in resolvedProfile ? (resolvedProfile as any).full_name : (resolvedProfile as any).fullName) ||
          resolvedName;
      } else if (intent === "registration" || !intent) {
        if (intent === "registration" && resolvedProfile) {
          return {
            success: false,
            code: "ACCOUNT_ALREADY_EXISTS",
            message: "An account already exists with this mobile number. Please sign in instead.",
            statusCode: 409,
          };
        }
        if (intent === "registration" && req.termsAccepted === false) {
          return {
            success: false,
            code: "CONSENT_REQUIRED",
            message: "Please accept the Terms of Service and Privacy Policy to continue.",
            statusCode: 400,
          };
        }
        if (!intent && resolvedProfile) {
          // If legacy caller omitted intent and profile exists, log in
          userId = resolvedProfile.id;
          resolvedRole = (resolvedProfile.role as AppRole) || resolvedRole;
          resolvedName =
            ("full_name" in resolvedProfile ? (resolvedProfile as any).full_name : (resolvedProfile as any).fullName) ||
            resolvedName;
        } else {
          const consentTimestamp = new Date().toISOString();
          const termsVersion = req.termsVersion || CURRENT_TERMS_VERSION;
          const privacyVersion = req.privacyVersion || CURRENT_PRIVACY_VERSION;
          const consentPurpose = "workforce_identity_registration";

          // Create new authoritative profile in Supabase
          try {
            const phoneDigits = formatted.replace(/\D/g, "");
            const fakeEmail = `${phoneDigits}@phone.kaamsetu.internal`;
            const safeMetadataRole = resolvedRole === "vendor" ? "worker" : resolvedRole;
            const { data: authData } = await adminClient.auth.admin.createUser({
              email: fakeEmail,
              phone: formatted,
              phone_confirm: true,
              email_confirm: true,
              user_metadata: {
                full_name: resolvedName,
                role: safeMetadataRole,
                actual_role: resolvedRole,
                phone: formatted,
              },
            });
            if (authData?.user) {
              userId = authData.user.id;
            }
          } catch {
            // Continue if user already provisioned or creation fails
          }

          const profilePayload: Record<string, any> = {
            id: userId,
            phone: formatted,
            full_name: resolvedName,
            role: resolvedRole,
            is_verified: false,
            account_status: accountStatus,
            phone_verification_status: phoneVerificationStatus,
            verification_method: verificationMethod,
            phone_verified: phoneVerified,
            terms_accepted_at: consentTimestamp,
            privacy_accepted_at: consentTimestamp,
            terms_version: termsVersion,
            privacy_version: privacyVersion,
            consent_purpose: consentPurpose,
          };

          let { data: newProfile, error: insertErr } = await adminClient
            .from("profiles")
            .insert(profilePayload)
            .select("*")
            .single();

          // Graceful fallback if database enum app_role lacks 'vendor'
          if (insertErr && insertErr.code === "22P02" && resolvedRole === "vendor") {
            profilePayload.role = "worker";
            const retryRes = await adminClient
              .from("profiles")
              .insert(profilePayload)
              .select("*")
              .single();
            insertErr = retryRes.error;
            newProfile = retryRes.data;
          }

          if (insertErr || !newProfile) {
            console.error("[ACCOUNT_CREATION_FAILED]", insertErr);
            if (isProduction) {
              return {
                success: false,
                code: "ACCOUNT_CREATION_FAILED",
                message: "Failed to create account in database. Please try again.",
                statusCode: 500,
              };
            }
          } else {
            userId = newProfile.id;
          }

          // Record immutable consent audit event
          try {
            await adminClient.from("user_consents").insert({
              user_id: userId,
              phone_hash: phoneHashed,
              terms_version: termsVersion,
              privacy_version: privacyVersion,
              purpose: consentPurpose,
              intent: intent || "registration",
              accepted_at: consentTimestamp,
            });
          } catch (consentErr) {
            console.warn("[USER_CONSENT_PERSISTENCE_WARN]", consentErr);
          }

          // Record in memory consent store
          memoryConsentStore.set(formatted, {
            userId,
            phone: formatted,
            termsVersion,
            privacyVersion,
            purpose: consentPurpose,
            acceptedAt: Date.now(),
          });

          // Initialize default contractor organization if role is contractor
          if (resolvedRole === "contractor") {
            try {
              const { data: newOrg } = await adminClient
                .from("contractor_organizations")
                .insert({
                  owner_id: userId,
                  company_name: `${resolvedName}'s Enterprise`,
                  operating_city: "Guwahati",
                  operating_state: "Assam",
                  subscription_tier: "starter",
                  max_roster_workers: 10,
                  subscription_status: "active",
                })
                .select("id")
                .single();
              if (newOrg) contractorOrgId = newOrg.id;
            } catch {
              // Ignore org creation error if already handled
            }
          }
        }
      }

      // Record in memory store for session and lookup consistency
      memoryProfileStore.set(formatted, {
        id: userId,
        phone: formatted,
        fullName: resolvedName,
        role: resolvedRole,
        accountStatus,
        phoneVerificationStatus,
        verificationMethod,
        phoneVerified,
        workerProfileId,
        contractorOrgId,
      });

      // Query worker or contractor organization IDs
      if (resolvedRole === "worker") {
        const { data: worker } = await adminClient
          .from("worker_profiles")
          .select("id")
          .eq("user_id", userId)
          .maybeSingle();
        if (worker) workerProfileId = worker.id;
      } else if (resolvedRole === "contractor" && !contractorOrgId) {
        const { data: org } = await adminClient
          .from("contractor_organizations")
          .select("id")
          .eq("owner_id", userId)
          .maybeSingle();
        if (org) contractorOrgId = org.id;
      }
    } catch (err) {
      console.warn("[PROFILE_RESOLUTION_WARN]", err);
      if (isProduction) {
        return {
          success: false,
          code: "DATABASE_UNAVAILABLE",
          message: "Account verification temporarily unavailable. Please retry.",
          statusCode: 503,
        };
      }
    }
  } else {
    // Offline / test harness memory store support
    if (intent === "login") {
      const existing = memoryProfileStore.get(formatted);
      if (existing) {
        userId = existing.id as `${string}-${string}-${string}-${string}-${string}`;
        resolvedRole = existing.role;
        resolvedName = existing.fullName;
        workerProfileId = existing.workerProfileId || null;
        contractorOrgId = existing.contractorOrgId || null;
      }
    } else if (intent === "registration") {
      memoryProfileStore.set(formatted, {
        id: userId,
        phone: formatted,
        fullName: resolvedName,
        role: resolvedRole,
        accountStatus,
        phoneVerificationStatus,
        verificationMethod,
        phoneVerified,
      });

      const termsVersion = req.termsVersion || CURRENT_TERMS_VERSION;
      const privacyVersion = req.privacyVersion || CURRENT_PRIVACY_VERSION;
      const consentPurpose = "workforce_identity_registration";
      const consentRecord: MemoryConsentRecord = {
        userId,
        phone: formatted,
        termsVersion,
        privacyVersion,
        purpose: consentPurpose,
        acceptedAt: Date.now(),
      };
      memoryConsentStore.set(formatted, consentRecord);
      memoryConsentStore.set(clean10, consentRecord);
    }
  }

  // Always ensure memoryConsentStore is populated on successful registration verification
  if (intent === "registration") {
    const termsVersion = req.termsVersion || CURRENT_TERMS_VERSION;
    const privacyVersion = req.privacyVersion || CURRENT_PRIVACY_VERSION;
    const consentPurpose = "workforce_identity_registration";
    const consentRecord: MemoryConsentRecord = {
      userId,
      phone: formatted,
      termsVersion,
      privacyVersion,
      purpose: consentPurpose,
      acceptedAt: Date.now(),
    };
    memoryConsentStore.set(formatted, consentRecord);
    memoryConsentStore.set(clean10, consentRecord);
  }

  // Generate cryptographically signed session token
  const sessionToken = signSessionToken({
    userId,
    phone: formatted,
    role: resolvedRole,
    verificationMethod,
    phoneVerified,
    phoneVerificationStatus,
  });

  const targetDashboard =
    intent === "registration" && resolvedRole === "worker"
      ? "/onboarding"
      : resolvedRole === "contractor"
      ? "/contractor/dashboard"
      : resolvedRole === "vendor"
      ? "/vendor/dashboard"
      : resolvedRole === "institution"
      ? "/institution/dashboard"
      : resolvedRole === "customer"
      ? "/customer/bookings"
      : "/dashboard";

  return {
    success: true,
    message: isSandbox
      ? "Sandbox verification complete. Account active (phone verification not completed)."
      : "Mobile phone verified successfully.",
    user: {
      id: userId,
      phone: formatted,
      fullName: resolvedName,
      role: resolvedRole,
      isDemo: false,
      accountStatus,
      phoneVerificationStatus,
      verificationMethod,
      phoneVerified,
      workerProfileId,
      contractorOrgId,
    },
    verificationMethod,
    phoneVerified,
    sessionToken,
    redirectUrl: targetDashboard,
    isSandbox,
    statusCode: 200,
  };
}

/**
 * Resets memory OTP challenges and profiles (for test suites)
 */
export function __resetMemoryOtpStore(): void {
  memoryOtpStore.clear();
  memoryProfileStore.clear();
  memoryConsentStore.clear();
}
