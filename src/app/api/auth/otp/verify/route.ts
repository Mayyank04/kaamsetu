import { NextRequest, NextResponse } from "next/server";
import { otpVerificationSchema } from "@/schemas/auth.schema";
import { verifyOtp } from "@/lib/auth/otp-service";

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const data = otpVerificationSchema.parse(json);

    const result = await verifyOtp({
      phone: data.phone,
      otp: data.otp,
      role: data.role,
      fullName: data.fullName,
      intent: data.intent,
    });

    const response = NextResponse.json(
      {
        success: result.success,
        message: result.message,
        user: result.user,
        redirectUrl: result.redirectUrl,
        isSandbox: result.isSandbox,
        retryAfterSeconds: result.retryAfterSeconds,
      },
      {
        status: result.statusCode || (result.success ? 200 : 400),
      }
    );

    // Set secure HTTP-only session cookie if verified
    if (result.success && result.sessionToken) {
      response.cookies.set("kaamsetu_session", result.sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 14, // 14 days
        path: "/",
      });
    }

    return response;
  } catch (err: unknown) {
    console.error("[OTP_VERIFY_ROUTE_ERROR]", err);
    return NextResponse.json(
      { success: false, message: "Verification failed. Please check your verification code and try again." },
      { status: 400 }
    );
  }
}
