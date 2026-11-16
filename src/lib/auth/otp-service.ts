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

export interface SendOtpRequest {
  phone: string;
  role?: string;
  fullName?: string;
  intent?: "registration" | "login";
  clientIp?: string;
}

export interface SendOtpResponse {
  success: boolean;
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
}

export interface VerifyOtpResponse {
  success: boolean;
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
  intent: "registration" | "login";
  attempts: number;
  maxAttempts: number;
  expiresAt: number;
  consumedAt?: number;
  createdAt: number;
}

const memoryOtpStore: Map<string, MemoryOtpRecord> =
  (globalThis as any).__kaamsetu_memory_otp_store ||
  ((globalThis as any).__kaamsetu_memory_otp_store = new Map<string, MemoryOtpRecord>());

/**
 * Normalizes an Indian phone number to E.164 (+91XXXXXXXXXX)
 */
export function normalizeIndianPhone(rawPhone: string): { valid: boolean; formatted: string; clean10: string } {
  const digits = rawPhone.replace(/\D/g, "");
  let clean10 = digits;
  if (digits.startsWith("91") && digits.length === 12) {
    clean10 = digits.slice(2);
  } else if (digits.startsWith("0") && digits.length === 11) {
    clean10 = digits.slice(1);
  }
  const valid = /^[6-9]\d{9}$/.test(clean10);
  return {
    valid,
    formatted: `+91${clean10}`,
    clean10,
  };
}

/**
 * Masks phone number for safe display (e.g. +91 98*** **821)
 */
export function maskPhoneNumber(phone: string): string {
  const { formatted, clean10 } = normalizeIndianPhone(phone);
  if (!clean10 || clean10.length < 10) return "+91 ***** *****";
  return `+91 ${clean10.slice(0, 2)}*** ***${clean10.slice(-2)}`;
}

/**
 * Computes an HMAC-SHA256 hash of an OTP code using validated server key.
 * Strictly fails closed if cryptographic key material is missing.
 */
export function hashOtpCode(otp: string): string {
  const secret = getRateLimitHmacSecret();
  return crypto.createHmac("sha256", secret).update(`otp:${otp.trim()}`).digest("hex");
}

/**
 * Signs a session payload for cookie persistence (14-day expiry).
 * Strictly fails closed if cryptographic key material is missing.
 */
export function signSessionToken(payload: { userId: string; phone: string; role: AppRole; exp?: number }): string {
  const secret = getRateLimitHmacSecret();
  const exp = payload.exp ?? Math.floor(Date.now() / 1000) + 14 * 24 * 60 * 60; // 14 days
  const data = JSON.stringify({ ...payload, exp });
  const encoded = Buffer.from(data, "utf8").toString("base64url");
  const signature = crypto.createHmac("sha256", secret).update(encoded).digest("base64url");
  return `${encoded}.${signature}`;
}

/**
 * Verifies a signed session token using constant-time comparison.
 * Strictly fails closed if cryptographic key material is missing.
 */
export function verifySessionToken(token: string): { userId: string; phone: string; role: AppRole } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [encoded, signature] = parts;

    const secret = getRateLimitHmacSecret();
    const expectedSig = crypto.createHmac("sha256", secret).update(encoded).digest("base64url");
    if (!crypto.timingSafeEqual(Buffer.from(signature, "utf8"), Buffer.from(expectedSig, "utf8"))) {
      return null;
    }

    const json = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
    if (json.exp && json.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }

    return {
      userId: json.userId,
      phone: json.phone,
      role: json.role,
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
  const { valid, formatted } = normalizeIndianPhone(req.phone);

  if (!valid) {
    return {
      success: false,
      message: "Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.",
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
        challengeCreated: false,
        hasActiveChallenge: false,
        isInfrastructureError: true,
        message: rateLimit.reason || "Authentication rate limiter temporarily unavailable. Please retry shortly.",
        retryAfterSeconds: rateLimit.remainingSeconds || 60,
        nextAllowedAt: rateLimit.nextAllowedAt,
        statusCode: rateLimit.statusCode || 503,
      };
    }

    const verificationMode = env.AUTH_VERIFICATION_MODE || "sandbox";
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
        challengeCreated: false,
        hasActiveChallenge: true,
        retryAfterSeconds: remSec,
        nextAllowedAt: nextAllowed,
        isSandbox,
        sandboxCode: activeChallengeCode,
        message: `Please wait ${remSec} seconds before requesting a new code.`,
        statusCode: 429,
      };
    }

    return {
      success: false,
      challengeCreated: false,
      hasActiveChallenge: false,
      retryAfterSeconds: remSec,
      nextAllowedAt: nextAllowed,
      isSandbox,
      message: rateLimit.reason || `Please wait ${remSec} seconds before requesting a new code.`,
      statusCode: 429,
    };
  }

  // Determine verification mode: 'sandbox' or 'sms'
  const verificationMode = env.AUTH_VERIFICATION_MODE || "sandbox";
  const isSandbox = verificationMode === "sandbox";

  // Generate 6-digit random code or use server-configured sandbox code
  const configuredSandboxCode = process.env.SANDBOX_OTP_CODE;
  const otpCode = isSandbox && configuredSandboxCode && /^\d{6}$/.test(configuredSandboxCode)
    ? configuredSandboxCode
    : crypto.randomInt(100000, 999999).toString();

  const otpHashed = hashOtpCode(otpCode);
  const phoneHashed = hashRateLimitKey("phone:identity", formatted);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes (300 seconds)
  const intent = req.intent || "login";

  // Persist challenge into PostgreSQL
  if (isConfigured.supabase) {
    try {
      const adminClient = createAdminClient();
      await adminClient.from("otp_challenges").insert({
        phone_hash: phoneHashed,
        otp_hash: otpHashed,
        role: req.role || "worker",
        full_name: req.fullName?.trim() || null,
        intent,
        verification_mode: verificationMode,
        expires_at: expiresAt.toISOString(),
      });
    } catch (err) {
      console.error("[OTP_DB_ERROR] Failed to save challenge to PostgreSQL:", err);
      if (isProduction && !isSandbox) {
        return {
          success: false,
          message: "We're temporarily unable to process this request. Please try again shortly.",
          statusCode: 503,
        };
      }
    }
  }

  // Record in memory store for sandbox / offline / test environments
  memoryOtpStore.set(phoneHashed, {
    id: crypto.randomUUID(),
    phoneHash: phoneHashed,
    otpHash: otpHashed,
    plainOtp: otpCode,
    role: req.role || "worker",
    fullName: req.fullName?.trim(),
    intent,
    attempts: 0,
    maxAttempts: 5,
    expiresAt: expiresAt.getTime(),
    createdAt: Date.now(),
  });

  // =========================================================================
  // 1. SANDBOX VERIFICATION MODE (Simulated SMS, Transparent Testing)
  // =========================================================================
  if (isSandbox) {
    return {
      success: true,
      challengeCreated: true,
      hasActiveChallenge: true,
      message: `Sandbox verification code for ${maskPhoneNumber(formatted)} generated. No SMS will be sent.`,
      isSandbox: true,
      sandboxCode: otpCode,
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
    } catch (err) {
      console.error("[TWILIO_DISPATCH_ERROR]", err);
    }
  }

  // Supabase Auth SMS Provider fallback
  if (isConfigured.supabase) {
    try {
      const supabase = await createServerSupabaseClient();
      const { error } = await supabase.auth.signInWithOtp({ phone: formatted });
      if (!error) {
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
    } catch {
      // Live dispatch failed
    }
  }

  // In SMS mode without working telecom credentials, fail securely
  return {
    success: false,
    message: "SMS gateway unavailable. Please configure AUTH_VERIFICATION_MODE=sandbox for test environments.",
    statusCode: 503,
  };
}

/**
 * Verifies an OTP code and returns authenticated session data
 */
export async function verifyOtp(req: VerifyOtpRequest): Promise<VerifyOtpResponse> {
  const isProduction = process.env.NODE_ENV === "production";
  const { valid, formatted } = normalizeIndianPhone(req.phone);

  if (!valid) {
    return {
      success: false,
      message: "Invalid phone number format.",
      statusCode: 400,
    };
  }

  // Brute-force lockout check
  const lockout = await validateOtpVerifyAttempt(formatted);
  if (!lockout.allowed) {
    return {
      success: false,
      message: lockout.reason || "Too many failed attempts. Account temporarily locked.",
      retryAfterSeconds: lockout.remainingSeconds,
      statusCode: 429,
    };
  }

  const phoneHashed = hashRateLimitKey("phone:identity", formatted);
  const otpHashed = hashOtpCode(req.otp);
  let verified = false;
  let resolvedRole: AppRole = req.role === "contractor" ? "contractor" : "worker";
  let resolvedName = req.fullName?.trim() || "Verified User";
  const isSandbox = (env.AUTH_VERIFICATION_MODE || "sandbox") === "sandbox";

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
            message: "Verification code has expired. Please request a new code.",
            statusCode: 400,
          };
        } else if (res.status_code === "MAX_ATTEMPTS_EXCEEDED") {
          return {
            success: false,
            message: "Maximum verification attempts exceeded. Please request a new code.",
            statusCode: 429,
          };
        }
      }
    } catch (err) {
      console.warn("[OTP_VERIFY_DB_FALLBACK]", err);
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
        message: "Verification code has expired. Please request a new code.",
        statusCode: 400,
      };
    }

    if (memRecord.consumedAt) {
      return {
        success: false,
        message: "Verification code already used. Please request a new code.",
        statusCode: 400,
      };
    }

    if (memRecord.attempts >= memRecord.maxAttempts) {
      return {
        success: false,
        message: "Maximum verification attempts exceeded. Please request a new code.",
        statusCode: 429,
      };
    }

    memRecord.attempts += 1;

    // Verify hash match or plainOtp match in memory record (or standard test code in non-production)
    const matchesCode =
      memRecord.otpHash === otpHashed ||
      memRecord.plainOtp === req.otp.trim() ||
      (!isProduction && req.otp === "123456");

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
    return {
      success: false,
      message: !failResult.allowed && failResult.reason
        ? failResult.reason
        : "Invalid verification code. Please check and try again.",
      retryAfterSeconds: failResult.allowed ? undefined : failResult.remainingSeconds,
      statusCode: failResult.allowed ? 400 : 429,
    };
  }

  // Clear brute force counters on success
  await clearFailedOtpAttempts(formatted);

  // Authoritative Profile & Account Resolution
  let userId = crypto.randomUUID();
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
      const { data: existingProfile } = await adminClient
        .from("profiles")
        .select("*")
        .eq("phone", formatted)
        .maybeSingle();

      if (existingProfile) {
        userId = existingProfile.id;
        resolvedRole = existingProfile.role as AppRole;
        resolvedName = existingProfile.full_name || resolvedName;
      } else {
        // Create new authoritative profile with explicit sandbox vs verified status
        const { data: newProfile } = await adminClient
          .from("profiles")
          .insert({
            id: userId,
            phone: formatted,
            full_name: resolvedName,
            role: resolvedRole,
            is_verified: false,
            account_status: accountStatus,
            phone_verification_status: phoneVerificationStatus,
            verification_method: verificationMethod,
            phone_verified: phoneVerified,
          })
          .select("*")
          .single();

        if (newProfile) {
          userId = newProfile.id;
        }
      }

      // Query worker or contractor organization IDs
      if (resolvedRole === "worker") {
        const { data: worker } = await adminClient
          .from("worker_profiles")
          .select("id")
          .eq("user_id", userId)
          .maybeSingle();
        if (worker) workerProfileId = worker.id;
      } else if (resolvedRole === "contractor") {
        const { data: org } = await adminClient
          .from("contractor_organizations")
          .select("id")
          .eq("owner_id", userId)
          .maybeSingle();
        if (org) contractorOrgId = org.id;
      }
    } catch (err) {
      console.warn("[PROFILE_RESOLUTION_WARN]", err);
    }
  }

  // Generate cryptographically signed session token
  const sessionToken = signSessionToken({
    userId,
    phone: formatted,
    role: resolvedRole,
  });

  const targetDashboard = resolvedRole === "worker" ? "/dashboard" : "/contractor/dashboard";

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
    sessionToken,
    redirectUrl: targetDashboard,
    isSandbox,
    statusCode: 200,
  };
}

/**
 * Resets memory OTP challenges (for test suites)
 */
export function __resetMemoryOtpStore(): void {
  memoryOtpStore.clear();
}
