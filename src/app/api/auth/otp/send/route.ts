import { NextRequest, NextResponse } from "next/server";
import { phoneAuthSchema } from "@/schemas/auth.schema";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isConfigured } from "@/lib/env";
import { validateOtpSendRateLimit } from "@/lib/security/rate-limiter";

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const data = phoneAuthSchema.parse(json);

    // Normalize phone to E.164 (+91XXXXXXXXXX)
    const rawDigits = data.phone.replace(/\D/g, "");
    const clean10Digits = rawDigits.startsWith("91") && rawDigits.length === 12
      ? rawDigits.slice(2)
      : rawDigits;
    const formattedPhone = `+91${clean10Digits}`;

    // Extract client IP address for per-IP abuse prevention
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    // Distributed Rate Limiting & Cooldown Enforcement
    const rateLimit = await validateOtpSendRateLimit(formattedPhone, clientIp);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: rateLimit.reason || "Too many verification requests. Please try again later.",
          retryAfterSeconds: rateLimit.remainingSeconds,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.remainingSeconds || 60),
          },
        }
      );
    }

    // 1. Production Mode: Send real OTP via Supabase Auth SMS Provider
    if (isConfigured.supabase) {
      const supabase = await createServerSupabaseClient();
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (error) {
        return NextResponse.json(
          {
            success: false,
            message: error.message || "Failed to transmit SMS verification code.",
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `Verification code sent via SMS to ${formattedPhone.slice(0, 5)}*****${formattedPhone.slice(-2)}`,
        isDemo: false,
      });
    }

    // 2. Demo Evaluation Mode: If SMS gateway is unconfigured and demoAuth is enabled
    // Note: Demo authentication is STRICTLY forbidden in production
    if (isConfigured.demoAuth && process.env.NODE_ENV !== "production") {
      return NextResponse.json({
        success: true,
        message: "SMS Provider Unconfigured: Running in simulated hackathon mode.",
        isDemo: true,
        requiresDemoCode: true,
      });
    }

    // 3. In production with no Supabase credentials
    return NextResponse.json(
      {
        success: false,
        message: "SMS verification gateway is currently unavailable. Please contact system administrator.",
      },
      { status: 503 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Invalid phone number payload.";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
