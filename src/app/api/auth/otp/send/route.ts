import { NextRequest, NextResponse } from "next/server";
import { phoneAuthSchema } from "@/schemas/auth.schema";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isConfigured } from "@/lib/env";

// In-memory cooldown tracker (phone -> timestamp)
const resendCooldowns = new Map<string, number>();
const COOLDOWN_MS = 60 * 1000; // 60 seconds

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

    // Rate Limiting & Resend Cooldown
    const now = Date.now();
    const lastSent = resendCooldowns.get(formattedPhone);
    if (lastSent && now - lastSent < COOLDOWN_MS) {
      const waitSeconds = Math.ceil((COOLDOWN_MS - (now - lastSent)) / 1000);
      return NextResponse.json(
        {
          success: false,
          message: `Please wait ${waitSeconds} seconds before requesting a new verification code.`,
        },
        { status: 429 }
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

      resendCooldowns.set(formattedPhone, now);

      return NextResponse.json({
        success: true,
        message: `Verification code sent via SMS to ${formattedPhone.slice(0, 5)}*****${formattedPhone.slice(-2)}`,
        isDemo: false,
      });
    }

    // 2. Demo Evaluation Mode: If SMS gateway is unconfigured
    if (isConfigured.demoAuth) {
      resendCooldowns.set(formattedPhone, now);

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
    const message = err instanceof Error ? err.message : "Invalid phone number provided.";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
