import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyOtp } from "@/lib/auth/otp-service";

const verifySchema = z.object({
  phone: z.string().min(10),
  otp: z.string().regex(/^\d{6}$/, "Verification code must be exactly 6 digits"),
  role: z.enum(["worker", "contractor", "verifier", "admin", "customer"]).default("worker"),
  fullName: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const data = verifySchema.parse(json);

    const result = await verifyOtp({
      phone: data.phone,
      otp: data.otp,
      role: data.role,
      fullName: data.fullName,
    });

    const response = NextResponse.json(
      {
        success: result.success,
        message: result.message,
        user: result.user,
        redirectUrl: result.redirectUrl,
        isDemo: result.isDemo,
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
    const message = err instanceof z.ZodError 
      ? err.errors[0]?.message || "Invalid verification payload."
      : "Verification failed. Please try again.";

    return NextResponse.json(
      { success: false, message },
      { status: 400 }
    );
  }
}
