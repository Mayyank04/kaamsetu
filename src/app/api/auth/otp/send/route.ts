import { NextRequest, NextResponse } from "next/server";
import { phoneAuthSchema } from "@/schemas/auth.schema";
import { sendOtp } from "@/lib/auth/otp-service";

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const data = phoneAuthSchema.parse(json);

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
        message: result.message,
        isSandbox: result.isSandbox,
        sandboxCode: result.sandboxCode,
        requiresDemoCode: result.requiresDemoCode,
        retryAfterSeconds: result.retryAfterSeconds,
      },
      {
        status: result.statusCode || (result.success ? 200 : 400),
        headers: result.retryAfterSeconds
          ? { "Retry-After": String(result.retryAfterSeconds) }
          : undefined,
      }
    );
  } catch (err: unknown) {
    console.error("[OTP_SEND_ROUTE_ERROR]", err);
    return NextResponse.json(
      {
        success: false,
        message: "We're temporarily unable to process this request. Please try again shortly.",
      },
      { status: 500 }
    );
  }
}
