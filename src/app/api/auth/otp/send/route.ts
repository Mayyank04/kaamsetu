import { NextRequest, NextResponse } from "next/server";
import { phoneAuthSchema } from "@/schemas/auth.schema";
import { sendOtp } from "@/lib/auth/otp-service";
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
          code: "INVALID_PHONE",
          message: INVALID_PHONE_MESSAGE,
        },
        { status: 400 }
      );
    }

    const parseResult = phoneAuthSchema.safeParse(json);
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      return NextResponse.json(
        {
          success: false,
          code: "INVALID_PHONE",
          challengeCreated: false,
          hasActiveChallenge: false,
          message: issue?.message || INVALID_PHONE_MESSAGE,
        },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    const result = await sendOtp({
      phone: data.phone,
      role: data.role,
      fullName: data.fullName,
      intent: data.intent,
      clientIp,
    });

    return NextResponse.json(
      {
        success: result.success,
        code: result.code,
        challengeCreated: result.challengeCreated,
        hasActiveChallenge: result.hasActiveChallenge,
        message: result.message,
        isSandbox: result.isSandbox,
        sandboxCode: result.sandboxCode,
        isInfrastructureError: result.isInfrastructureError,
        requiresDemoCode: result.requiresDemoCode,
        retryAfterSeconds: result.isInfrastructureError ? undefined : result.retryAfterSeconds,
        nextAllowedAt: result.isInfrastructureError ? undefined : result.nextAllowedAt,
      },
      {
        status: result.statusCode || (result.success ? 200 : 400),
        headers: !result.isInfrastructureError && result.retryAfterSeconds
          ? { "Retry-After": String(result.retryAfterSeconds) }
          : undefined,
      }
    );
  } catch (err: unknown) {
    console.error("[OTP_SEND_ROUTE_ERROR]", err);
    return NextResponse.json(
      {
        success: false,
        code: "INTERNAL_SERVER_ERROR",
        message:
          "We're temporarily unable to process this request. Please try again shortly.",
      },
      { status: 500 }
    );
  }
}
