/**
 * KAAMSETU — Direct Password Authentication API
 * Provides secure credential validation, rate limiting, and session cookie issuance.
 * Classification: CLASS_B_CONTROLLED_ROLLOUT
 * Permanent Invariant: platform_commission_amount = 0.00
 */

import { NextRequest, NextResponse } from "next/server";
import { directLoginSchema } from "@/schemas/auth.schema";
import { verifyPassword } from "@/lib/auth/password";
import { signSessionToken } from "@/lib/auth/otp-service";
import {
  checkLoginRateLimit,
  recordFailedLoginAttempt,
  clearLoginAttempts,
} from "@/lib/security/auth-rate-limiter";
import { createAdminClient } from "@/lib/supabase/admin";
import { isConfigured } from "@/lib/env";
import { AppRole } from "@/types/database.types";
import { validateIndianMobile } from "@/lib/utilities/phone";
import { __getLocalFallbackAccounts } from "@/app/api/auth/register/route";

export async function POST(request: NextRequest) {
  try {
    // 1. Extract client IP and enforce brute-force rate limiting
    const forwardedFor = request.headers.get("x-forwarded-for");
    const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

    let json: unknown;
    try {
      json = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          code: "INVALID_PAYLOAD",
          message: "Invalid request payload format.",
        },
        { status: 400 }
      );
    }

    const parseResult = directLoginSchema.safeParse(json);
    if (!parseResult.success) {
      const firstIssue = parseResult.error.issues[0];
      return NextResponse.json(
        {
          success: false,
          code: "VALIDATION_ERROR",
          message: firstIssue?.message || "Invalid login credentials format.",
        },
        { status: 400 }
      );
    }

    const { identifier, password, role } = parseResult.data;
    const cleanIdentifier = identifier.trim();

    // Enforce login rate limit
    const rateCheck = checkLoginRateLimit(cleanIdentifier, clientIp);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          code: "TOO_MANY_ATTEMPTS",
          message: rateCheck.reason || "Too many failed login attempts. Please try again later.",
          retryAfterSeconds: rateCheck.retryAfterSeconds,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateCheck.retryAfterSeconds || 900),
          },
        }
      );
    }

    let profile: any = null;

    // 2. Query account from Supabase
    if (isConfigured.supabase) {
      try {
        const adminClient = createAdminClient();

        if (cleanIdentifier.includes("@")) {
          // Look up by email
          const { data, error } = await adminClient
            .from("profiles")
            .select("*")
            .ilike("email", cleanIdentifier.toLowerCase())
            .maybeSingle();

          if (error && (error.code === "PGRST205" || error.message?.includes("schema cache"))) {
            return NextResponse.json(
              {
                success: false,
                code: "DATABASE_MIGRATION_REQUIRED",
                message: "Database schema migration required: table 'public.profiles' does not exist in Supabase. Please execute migration scripts in Supabase SQL Editor.",
              },
              { status: 503 }
            );
          }

          if (!error && data) {
            profile = data;
          }
        } else {
          // Look up by mobile number
          const phoneValidation = validateIndianMobile(cleanIdentifier);
          const lookupPhone = phoneValidation.valid ? phoneValidation.clean10 : cleanIdentifier;

          const { data, error } = await adminClient
            .from("profiles")
            .select("*")
            .eq("phone", lookupPhone)
            .maybeSingle();

          if (error && (error.code === "PGRST205" || error.message?.includes("schema cache"))) {
            return NextResponse.json(
              {
                success: false,
                code: "DATABASE_MIGRATION_REQUIRED",
                message: "Database schema migration required: table 'public.profiles' does not exist in Supabase. Please execute migration scripts in Supabase SQL Editor.",
              },
              { status: 503 }
            );
          }

          if (!error && data) {
            profile = data;
          }
        }
      } catch (dbErr) {
        console.warn("[LOGIN_DB_QUERY_EXCEPTION]", dbErr);
      }
    }

    // Check local fallback accounts if not found in DB (e.g. offline local test)
    if (!profile) {
      const fallbackStore = __getLocalFallbackAccounts();
      profile = fallbackStore.get(cleanIdentifier.toLowerCase());
      if (!profile) {
        // Also search fallback by phone
        for (const account of fallbackStore.values()) {
          if (account.phone === cleanIdentifier || account.email === cleanIdentifier.toLowerCase()) {
            profile = account;
            break;
          }
        }
      }
    }

    // 3. User existence check & password credential validation
    if (!profile || !profile.password_hash || !profile.password_salt) {
      recordFailedLoginAttempt(cleanIdentifier, clientIp);
      return NextResponse.json(
        {
          success: false,
          code: "INVALID_CREDENTIALS",
          message: "Invalid email, mobile number, or password.",
        },
        { status: 401 }
      );
    }

    // Verify password with constant-time scrypt check
    const isValidPassword = verifyPassword(password, profile.password_hash, profile.password_salt);
    if (!isValidPassword) {
      recordFailedLoginAttempt(cleanIdentifier, clientIp);
      return NextResponse.json(
        {
          success: false,
          code: "INVALID_CREDENTIALS",
          message: "Invalid email, mobile number, or password.",
        },
        { status: 401 }
      );
    }

    // 4. Account status check
    if (profile.account_status && profile.account_status !== "active") {
      return NextResponse.json(
        {
          success: false,
          code: "ACCOUNT_INACTIVE",
          message: "Your account is currently inactive. Please contact support.",
        },
        { status: 403 }
      );
    }

    // Clear failed attempts upon successful login
    clearLoginAttempts(cleanIdentifier, clientIp);

    // 5. Issue secure signed session token
    const userRole = (role as AppRole) || (profile.role as AppRole) || "worker";
    const sessionToken = signSessionToken({
      userId: profile.id,
      email: profile.email || null,
      phone: profile.phone || null,
      fullName: profile.full_name || "Verified User",
      role: userRole,
      phoneVerified: Boolean(profile.phone_verified),
      phoneVerificationStatus: profile.phone_verification_status || "not_verified",
      verificationMethod: profile.verification_method || "none",
      accountStatus: profile.account_status || "active",
    });

    // 6. Determine redirect destination
    const redirectUrl =
      userRole === "worker"
        ? "/onboarding"
        : userRole === "contractor"
        ? "/contractor/dashboard"
        : userRole === "institution"
        ? "/institution/dashboard"
        : "/dashboard";

    const response = NextResponse.json(
      {
        success: true,
        message: "Signed in successfully.",
        user: {
          id: profile.id,
          email: profile.email || null,
          fullName: profile.full_name,
          role: userRole,
          phone: profile.phone || null,
          phoneVerified: Boolean(profile.phone_verified),
          phoneVerificationStatus: profile.phone_verification_status || "not_verified",
        },
        redirectUrl,
      },
      { status: 200 }
    );

    // 7. Set secure HttpOnly cookie
    response.cookies.set("kaamsetu_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 14, // 14 days
      path: "/",
    });

    return response;
  } catch (err: unknown) {
    console.error("[LOGIN_FATAL_ERROR]", err);
    return NextResponse.json(
      {
        success: false,
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred during sign in. Please try again.",
      },
      { status: 500 }
    );
  }
}
