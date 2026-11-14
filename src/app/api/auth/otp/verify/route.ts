import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isConfigured } from "@/lib/env";
import { DEMO_PERSONAS } from "@/lib/auth/personas";
import { AppRole } from "@/types/database.types";
import {
  validateOtpVerifyAttempt,
  recordFailedOtpAttempt,
  clearFailedOtpAttempts,
} from "@/lib/security/rate-limiter";
import { z } from "zod";

const verifySchema = z.object({
  phone: z.string().min(10),
  otp: z.string().regex(/^\d{6}$/, "Verification code must be exactly 6 digits"),
  role: z.enum(["worker", "contractor", "verifier", "admin"]).default("worker"),
  fullName: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const data = verifySchema.parse(json);

    const rawDigits = data.phone.replace(/\D/g, "");
    const clean10Digits = rawDigits.startsWith("91") && rawDigits.length === 12
      ? rawDigits.slice(2)
      : rawDigits;
    const formattedPhone = `+91${clean10Digits}`;

    // Brute-force lockout protection (5 failed attempts locks for 15 minutes)
    const bruteForceCheck = await validateOtpVerifyAttempt(formattedPhone);
    if (!bruteForceCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: bruteForceCheck.reason || "Too many failed attempts. Account temporarily locked.",
          retryAfterSeconds: bruteForceCheck.remainingSeconds,
        },
        { status: 429 }
      );
    }

    // 1. Production Mode: Verify OTP via Supabase Auth
    if (isConfigured.supabase) {
      const supabase = await createServerSupabaseClient();
      const { data: authData, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: data.otp,
        type: "sms",
      });

      if (error || !authData.user) {
        // Record failed attempt for brute-force tracking
        const failResult = await recordFailedOtpAttempt(formattedPhone);
        return NextResponse.json(
          {
            success: false,
            message: !failResult.allowed && failResult.reason
              ? failResult.reason
              : error?.message || "Invalid or expired verification code.",
            retryAfterSeconds: failResult.allowed ? undefined : failResult.remainingSeconds,
          },
          { status: failResult.allowed ? 400 : 429 }
        );
      }

      // Success: clear brute force counter
      await clearFailedOtpAttempts(formattedPhone);

      // Check or create profile in public.profiles table
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authData.user.id)
        .single();

      let profile = existingProfile;
      if (!profile) {
        const defaultName = data.fullName?.trim() || "Verified User";
        // Enforce safe role assignment: client can never self-assign admin
        const assignedRole: AppRole = data.role === "admin" ? "customer" : (data.role as AppRole);
        const { data: newProfile, error: profileErr } = await supabase
          .from("profiles")
          .insert({
            id: authData.user.id,
            role: assignedRole,
            full_name: defaultName,
            phone: formattedPhone,
            is_verified: true,
          })
          .select("*")
          .single();

        if (profileErr) {
          console.error("Error creating user profile:", profileErr);
        } else {
          profile = newProfile;
        }
      }

      const targetUrl = profile?.role === "worker" ? "/dashboard" : "/customer/bookings";

      return NextResponse.json({
        success: true,
        user: {
          id: authData.user.id,
          phone: formattedPhone,
          fullName: profile?.full_name || "Verified User",
          role: profile?.role || data.role,
          isDemo: false,
        },
        isDemo: false,
        redirectUrl: targetUrl,
        message: "Mobile phone verified successfully.",
      });
    }

    // 2. Demo Evaluation Mode: STRICTLY prohibited in production
    if (isConfigured.demoAuth && process.env.NODE_ENV !== "production") {
      if (data.otp !== "123456") {
        const failResult = await recordFailedOtpAttempt(formattedPhone);
        return NextResponse.json(
          {
            success: false,
            message:
              !failResult.allowed && failResult.reason
                ? failResult.reason
                : "Invalid verification code. In demo evaluation mode, enter sandbox code 123456.",
            retryAfterSeconds: failResult.allowed ? undefined : failResult.remainingSeconds,
          },
          { status: failResult.allowed ? 400 : 429 }
        );
      }

      await clearFailedOtpAttempts(formattedPhone);

      const personaKey = data.role === "worker" ? "worker-electrician" : "customer-contractor";
      const matched = DEMO_PERSONAS.find((p) => p.personaKey === personaKey)!;

      const response = NextResponse.json({
        success: true,
        user: {
          ...matched,
          fullName: data.fullName?.trim() || matched.fullName,
          phone: formattedPhone,
          isDemo: true,
        },
        isDemo: true,
        redirectUrl: matched.targetDashboard,
        message: "Demo verification successful.",
      });

      // Set demo cookie
      response.cookies.set("kaamsetu_demo_persona", personaKey, {
        httpOnly: true,
        secure: (process.env.NODE_ENV as string) === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });

      return response;
    }

    // 3. Fallback: Block unverified logins in production
    return NextResponse.json(
      {
        success: false,
        message: "Verification service unavailable.",
      },
      { status: 503 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Invalid verification payload.";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
