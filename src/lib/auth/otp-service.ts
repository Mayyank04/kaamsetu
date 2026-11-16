/**
 * KAAMSETU — Cryptographically Secure OTP Authentication Service
 * 
 * Manages full lifecycle of OTP authentication:
 * 1. Cryptographically secure random 6-digit code generation
 * 2. Privacy-preserving HMAC hashing for phone and OTP storage
 * 3. SMS provider dispatch (Real SMS / Sandbox / Dev / Unconfigured)
 * 4. Persistent atomic verification and single-use consumption
 * 5. Multi-instance session token generation and cookie handling
 */

import * as crypto from "crypto";
import { isConfigured } from "@/lib/env";
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
import { DEMO_PERSONAS } from "@/lib/auth/personas";

export interface SendOtpRequest {
  phone: string;
  role?: string;
  fullName?: string;
  clientIp: string;
}

export interface SendOtpResponse {
  success: boolean;
  message: string;
  isDemo?: boolean;
  requiresDemoCode?: boolean;
  retryAfterSeconds?: number;
  statusCode?: number;
}

export interface VerifyOtpRequest {
  phone: string;
  otp: string;
  role?: string;
  fullName?: string;
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
    workerProfileId?: string | null;
    contractorOrgId?: string | null;
  };
  sessionToken?: string;
  redirectUrl?: string;
  isDemo?: boolean;
  retryAfterSeconds?: number;
  statusCode?: number;
}

// In-memory challenge store for offline development and unit tests
interface MemoryOtpRecord {
  id: string;
  phoneHash: string;
  otpHash: string;
  plainOtp?: string; // Stored only in non-production test mode
  role: string;
  fullName?: string;
  attempts: number;
  maxAttempts: number;
  expiresAt: number;
  consumedAt?: number;
  createdAt: number;
}

const memoryOtpStore = new Map<string, MemoryOtpRecord>();

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
 * Computes an HMAC-SHA256 hash of an OTP code
 */
export function hashOtpCode(otp: string): string {
  let secret: string;
  try {
    secret = getRateLimitHmacSecret();
  } catch {
    secret = "kaamsetu-dev-fallback-hmac-secret-32-chars";
  }
  return crypto.createHmac("sha256", secret).update(`otp:${otp.trim()}`).digest("hex");
}

/**
 * Signs a session payload for cookie persistence (14-day expiry)
 */
export function signSessionToken(payload: { userId: string; phone: string; role: AppRole }): string {
  let secret: string;
  try {
    secret = getRateLimitHmacSecret();
  } catch {
    secret = "kaamsetu-dev-fallback-hmac-secret-32-chars";
  }

  const exp = Math.floor(Date.now() / 1000) + 14 * 24 * 60 * 60; // 14 days
  const data = JSON.stringify({ ...payload, exp });
  const encoded = Buffer.from(data, "utf8").toString("base64url");
  const signature = crypto.createHmac("sha256", secret).update(encoded).digest("base64url");
  return `${encoded}.${signature}`;
}

/**
 * Verifies a signed session token
 */
export function verifySessionToken(token: string): { userId: string; phone: string; role: AppRole } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [encoded, signature] = parts;

    let secret: string;
    try {
      secret = getRateLimitHmacSecret();
    } catch {
      secret = "kaamsetu-dev-fallback-hmac-secret-32-chars";
    }

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
 * Sends a cryptographically secure OTP with rate limiting & provider dispatch
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
  const rateLimit = await validateOtpSendRateLimit(formatted, req.clientIp);
  if (!rateLimit.allowed) {
    return {
      success: false,
      message: rateLimit.reason || "Too many verification requests. Please try again later.",
      retryAfterSeconds: rateLimit.remainingSeconds,
      statusCode: 429,
    };
  }

  // Generate 6-digit random code
  const otpCode = crypto.randomInt(100000, 999999).toString();
  const otpHashed = hashOtpCode(otpCode);
  const phoneHashed = hashRateLimitKey("phone:identity", formatted);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Persist challenge
  if (isConfigured.supabase) {
    try {
      const adminClient = createAdminClient();
      await adminClient.from("otp_challenges").insert({
        phone_hash: phoneHashed,
        otp_hash: otpHashed,
        role: req.role || "worker",
        full_name: req.fullName?.trim() || null,
        expires_at: expiresAt.toISOString(),
      });
    } catch (err) {
      console.error("[OTP_DB_ERROR] Failed to save challenge to PostgreSQL:", err);
      // If DB error in production, fail closed
      if (isProduction) {
        return {
          success: false,
          message: "We're temporarily unable to process this request. Please try again shortly.",
          statusCode: 503,
        };
      }
    }
  }

  // Also record in memory for local fallback / non-DB environments
  memoryOtpStore.set(phoneHashed, {
    id: crypto.randomUUID(),
    phoneHash: phoneHashed,
    otpHash: otpHashed,
    plainOtp: !isProduction ? otpCode : undefined,
    role: req.role || "worker",
    fullName: req.fullName?.trim(),
    attempts: 0,
    maxAttempts: 5,
    expiresAt: expiresAt.getTime(),
    createdAt: Date.now(),
  });

  // SMS Provider Dispatch Logic
  // 1. Check if Twilio is configured
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
            Body: `[KAAMSETU] Your verification code is ${otpCode}. Valid for 10 minutes. Do not share this code.`,
          }).toString(),
        }
      );
      if (twilioRes.ok) {
        return {
          success: true,
          message: `Verification code sent via SMS to ${maskPhoneNumber(formatted)}.`,
          statusCode: 200,
        };
      }
    } catch (err) {
      console.error("[TWILIO_DISPATCH_ERROR]", err);
    }
  }

  // 2. Check if Supabase Auth SMS Provider is configured
  if (isConfigured.supabase) {
    try {
      const supabase = await createServerSupabaseClient();
      const { error } = await supabase.auth.signInWithOtp({ phone: formatted });
      if (!error) {
        return {
          success: true,
          message: `Verification code sent via SMS to ${maskPhoneNumber(formatted)}.`,
          statusCode: 200,
        };
      }
    } catch {
      // Fall through to sandbox / development handling
    }
  }

  // 3. Demo / Development Mode
  if (!isProduction && isConfigured.demoAuth) {
    console.info(`[DEMO_OTP_DISPATCH] Mobile: ${formatted} | OTP: ${otpCode}`);
    return {
      success: true,
      message: `[Development Sandbox] Code dispatched for ${maskPhoneNumber(formatted)}. Sandbox code: ${otpCode} (or standard demo: 123456).`,
      isDemo: true,
      requiresDemoCode: true,
      statusCode: 200,
    };
  }

  // 4. Production without configured SMS gateway -> Safe operational error
  if (isProduction) {
    return {
      success: false,
      message: "We're temporarily unable to process this request. Please try again shortly.",
      statusCode: 503,
    };
  }

  // Default fallback for test / local
  return {
    success: true,
    message: `Verification code dispatched to ${maskPhoneNumber(formatted)}.`,
    isDemo: true,
    statusCode: 200,
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
  let resolvedName = req.fullName?.trim() || "Verified Artisan";

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

  // 2. Try in-memory store if DB was unconfigured or in development
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

    // Check OTP hash or demo 123456 code in non-production
    const matchesCode =
      memRecord.otpHash === otpHashed ||
      (!isProduction && req.otp === "123456") ||
      (!isProduction && memRecord.plainOtp === req.otp);

    if (matchesCode) {
      verified = true;
      memRecord.consumedAt = now;
      if (memRecord.role) resolvedRole = memRecord.role as AppRole;
      if (memRecord.fullName) resolvedName = memRecord.fullName;
    }
  }

  // 3. Fallback demo acceptance ONLY in non-production if demoAuth is active
  if (!verified && !isProduction && isConfigured.demoAuth && req.otp === "123456") {
    verified = true;
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
        // Create new authoritative profile
        const { data: newProfile } = await adminClient
          .from("profiles")
          .insert({
            id: userId,
            phone: formatted,
            full_name: resolvedName,
            role: resolvedRole,
            is_verified: true,
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

  // Generate signed session token
  const sessionToken = signSessionToken({
    userId,
    phone: formatted,
    role: resolvedRole,
  });

  const targetDashboard = resolvedRole === "worker" ? "/dashboard" : "/contractor/dashboard";

  return {
    success: true,
    message: "Mobile phone verified successfully.",
    user: {
      id: userId,
      phone: formatted,
      fullName: resolvedName,
      role: resolvedRole,
      isDemo: false,
      workerProfileId,
      contractorOrgId,
    },
    sessionToken,
    redirectUrl: targetDashboard,
    isDemo: false,
    statusCode: 200,
  };
}

/**
 * Resets memory OTP challenges (for test suites)
 */
export function __resetMemoryOtpStore(): void {
  memoryOtpStore.clear();
}
