import { NextRequest, NextResponse } from "next/server";
import { otpVerificationSchema } from "@/schemas/auth.schema";
import { verifyOtp } from "@/lib/auth/otp-service";
import { INVALID_PHONE_MESSAGE } from "@/lib/utilities/phone";

export async function POST(request: NextRequest) {
  try {
    let json: unknown;
    try {
      json = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          code: "OTP_INVALID",
          message: "Invalid request payload. Please check your verification code.",
        },
        { status: 400 }
      );
    }

    const parseResult = otpVerificationSchema.safeParse(json);
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      const isPhoneIssue = issue?.path?.includes("phone");
      return NextResponse.json(
        {
          success: false,
          code: isPhoneIssue ? "INVALID_PHONE" : "OTP_INVALID",
          message: issue?.message || (isPhoneIssue ? INVALID_PHONE_MESSAGE : "Invalid verification code."),
        },
        { status: 400 }
      );
    }

    const data = parseResult.data;

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
        code: result.code,
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
      {
        success: false,
        code: "INTERNAL_SERVER_ERROR",
        message: "Verification failed. Please check your verification code and try again.",
      },
      { status: 400 }
    );
  }
}
