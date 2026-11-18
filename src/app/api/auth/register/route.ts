/**
 * KAAMSETU — Direct Account Registration API
 * Removes mandatory OTP verification from registration and worker onboarding.
 * Securely hashes passwords with scrypt, persists user accounts in Supabase,
 * records user consents, and issues secure HTTP-only session cookies.
 * Classification: CLASS_B_CONTROLLED_ROLLOUT
 * Permanent Invariant: platform_commission_amount = 0.00
 */

import { NextRequest, NextResponse } from "next/server";
import { directRegistrationSchema } from "@/schemas/auth.schema";
import { hashPassword, validatePasswordStrength } from "@/lib/auth/password";
import { signSessionToken } from "@/lib/auth/otp-service";
import { checkRegistrationRateLimit } from "@/lib/security/auth-rate-limiter";
import { createAdminClient } from "@/lib/supabase/admin";
import { isConfigured } from "@/lib/env";
import { AppRole } from "@/types/database.types";
import * as crypto from "crypto";

// Resilient memory store for offline/local development testing
const localFallbackAccounts = new Map<string, any>();

export async function POST(request: NextRequest) {
  try {
    // 1. Extract client IP and enforce registration rate limiting
    const forwardedFor = request.headers.get("x-forwarded-for");
    const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

    const rateCheck = checkRegistrationRateLimit(clientIp);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          code: "RATE_LIMIT_EXCEEDED",
          message: rateCheck.reason || "Too many registration attempts. Please try again later.",
          retryAfterSeconds: rateCheck.retryAfterSeconds,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateCheck.retryAfterSeconds || 3600),
          },
        }
      );
    }

    // 2. Parse and validate registration payload
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

    const parseResult = directRegistrationSchema.safeParse(json);
    if (!parseResult.success) {
      const firstIssue = parseResult.error.issues[0];
      return NextResponse.json(
        {
          success: false,
          code: "VALIDATION_ERROR",
          message: firstIssue?.message || "Invalid registration information.",
          field: firstIssue?.path?.join("."),
        },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // 3. Institutional password strength validation
    const strength = validatePasswordStrength(data.password);
    if (!strength.valid) {
      return NextResponse.json(
        {
          success: false,
          code: "WEAK_PASSWORD",
          message: strength.errors[0] || "Password does not meet security requirements.",
          errors: strength.errors,
        },
        { status: 400 }
      );
    }

    // 4. Role Assignment Protection: Never allow client privilege escalation
    const allowedRoles: AppRole[] = ["worker", "contractor", "customer", "institution"];
    if (!allowedRoles.includes(data.role as AppRole)) {
      return NextResponse.json(
        {
          success: false,
          code: "UNAUTHORIZED_ROLE",
          message: "Privileged role self-assignment is strictly forbidden.",
        },
        { status: 403 }
      );
    }

    const assignedRole = data.role as AppRole;
    const cleanEmail = data.email.toLowerCase().trim();
    const cleanPhone = data.phone ? data.phone.trim() : null;

    // 5. Hash password with OWASP-compliant scrypt and random salt
    const { hash, salt } = hashPassword(data.password);
    const userId = crypto.randomUUID();
    const nowIso = new Date().toISOString();

    // 6. Supabase Persistence
    if (isConfigured.supabase) {
      try {
        const adminClient = createAdminClient();

        // Check for duplicate email
        const { data: existingEmail, error: emailLookupErr } = await adminClient
          .from("profiles")
          .select("id")
          .ilike("email", cleanEmail)
          .maybeSingle();

        if (emailLookupErr) {
          if (emailLookupErr.code === "PGRST205" || emailLookupErr.message?.includes("schema cache")) {
            return NextResponse.json(
              {
                success: false,
                code: "DATABASE_MIGRATION_REQUIRED",
                message: "Database schema migration required: table 'public.profiles' does not exist in Supabase. Please execute the migration scripts in the Supabase SQL Editor.",
                details: emailLookupErr.message,
              },
              { status: 503 }
            );
          }
        }

        if (existingEmail) {
          return NextResponse.json(
            {
              success: false,
              code: "ACCOUNT_ALREADY_EXISTS",
              message: "An account with this email address already exists. Please sign in instead.",
            },
            { status: 409 }
          );
        }

        // Check for duplicate phone (if provided)
        if (cleanPhone) {
          const { data: existingPhone, error: phoneLookupErr } = await adminClient
            .from("profiles")
            .select("id")
            .eq("phone", cleanPhone)
            .maybeSingle();

          if (existingPhone) {
            return NextResponse.json(
              {
                success: false,
                code: "PHONE_ALREADY_REGISTERED",
                message: "An account with this mobile number already exists. Please sign in instead.",
              },
              { status: 409 }
            );
          }
        }

        // Insert new profile record
        const { error: insertErr } = await adminClient.from("profiles").insert({
          id: userId,
          email: cleanEmail,
          password_hash: hash,
          password_salt: salt,
          full_name: data.fullName,
          phone: cleanPhone,
          role: assignedRole,
          account_status: "active",
          phone_verification_status: "not_verified",
          verification_method: "none",
          phone_verified: false,
          terms_accepted_at: nowIso,
          privacy_accepted_at: nowIso,
          terms_version: data.termsVersion,
          privacy_version: data.privacyVersion,
          consent_purpose: "workforce_identity_direct_registration",
          created_at: nowIso,
          updated_at: nowIso,
        });

        if (insertErr) {
          console.error("[REGISTER_DB_INSERT_ERROR]", insertErr);
          if (insertErr.code === "PGRST205" || insertErr.message?.includes("schema cache") || insertErr.message?.includes("email") || insertErr.message?.includes("password")) {
            return NextResponse.json(
              {
                success: false,
                code: "DATABASE_MIGRATION_REQUIRED",
                message: "Database schema update required. Please ensure migrations 20261117_master_infrastructure_repair.sql and 20261118_direct_registration_no_otp.sql have been applied in Supabase SQL Editor.",
                details: insertErr.message,
              },
              { status: 503 }
            );
          }
          throw insertErr;
        }

        // Record immutable consent ledger entry
        try {
          await adminClient.from("user_consents").insert([
            {
              user_id: userId,
              consent_type: "terms_of_service",
              consent_version: data.termsVersion,
              consent_purpose: "workforce_identity_direct_registration",
              granted: true,
              granted_at: nowIso,
              context_metadata: { method: "direct_web_registration", ip: clientIp },
            },
            {
              user_id: userId,
              consent_type: "privacy_policy",
              consent_version: data.privacyVersion,
              consent_purpose: "workforce_identity_direct_registration",
              granted: true,
              granted_at: nowIso,
              context_metadata: { method: "direct_web_registration", ip: clientIp },
            },
          ]);
        } catch (consentErr) {
          console.warn("[REGISTER_CONSENT_AUDIT_WARNING]", consentErr);
        }

        // Scaffolding for contractor organizations
        if (assignedRole === "contractor") {
          try {
            await adminClient.from("contractor_organizations").insert({
              id: crypto.randomUUID(),
              owner_id: userId,
              company_name: `${data.fullName} Enterprises`,
              verification_status: "pending",
              created_at: nowIso,
              updated_at: nowIso,
            });
          } catch (contractorErr) {
            console.warn("[REGISTER_CONTRACTOR_SCAFFOLD_WARNING]", contractorErr);
          }
        }
      } catch (dbErr: any) {
        if (process.env.NODE_ENV === "production") {
          console.error("[REGISTER_PRODUCTION_DB_FATAL]", dbErr);
          return NextResponse.json(
            {
              success: false,
              code: "DATABASE_UNAVAILABLE",
              message: "Account creation database temporarily unreachable. Please retry in a moment.",
            },
            { status: 503 }
          );
        }
        // In local/test offline environments, store in memory
        localFallbackAccounts.set(cleanEmail, {
          id: userId,
          email: cleanEmail,
          password_hash: hash,
          password_salt: salt,
          full_name: data.fullName,
          phone: cleanPhone,
          role: assignedRole,
          account_status: "active",
          phone_verification_status: "not_verified",
          verification_method: "none",
          phone_verified: false,
        });
      }
    } else {
      // Local development without Supabase credentials
      localFallbackAccounts.set(cleanEmail, {
        id: userId,
        email: cleanEmail,
        password_hash: hash,
        password_salt: salt,
        full_name: data.fullName,
        phone: cleanPhone,
        role: assignedRole,
        account_status: "active",
        phone_verification_status: "not_verified",
        verification_method: "none",
        phone_verified: false,
      });
    }

    // 7. Issue cryptographically signed session token
    const sessionToken = signSessionToken({
      userId,
      email: cleanEmail,
      phone: cleanPhone,
      fullName: data.fullName,
      role: assignedRole,
      phoneVerified: false,
      phoneVerificationStatus: "not_verified",
      verificationMethod: "none",
      accountStatus: "active",
    });

    // 8. Determine target destination: workers go directly to /onboarding
    const redirectUrl =
      assignedRole === "worker"
        ? "/onboarding"
        : assignedRole === "contractor"
        ? "/contractor/dashboard"
        : assignedRole === "institution"
        ? "/institution/dashboard"
        : "/dashboard";

    const response = NextResponse.json(
      {
        success: true,
        message: "Account created successfully.",
        user: {
          id: userId,
          email: cleanEmail,
          fullName: data.fullName,
          role: assignedRole,
          phone: cleanPhone,
          phoneVerified: false,
          phoneVerificationStatus: "not_verified",
        },
        redirectUrl,
      },
      { status: 201 }
    );

    // 9. Set secure HttpOnly session cookie across path "/"
    response.cookies.set("kaamsetu_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 14, // 14 days
      path: "/",
    });

    return response;
  } catch (err: unknown) {
    console.error("[REGISTER_FATAL_ERROR]", err);
    return NextResponse.json(
      {
        success: false,
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred during account creation. Please try again.",
      },
      { status: 500 }
    );
  }
}

// Export for internal test harness inspection
export function __getLocalFallbackAccounts() {
  return localFallbackAccounts;
}
