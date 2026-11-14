import { NextRequest, NextResponse } from "next/server";
import { phoneAuthSchema } from "@/schemas/auth.schema";

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const data = phoneAuthSchema.parse(json);

    return NextResponse.json({
      success: true,
      message: `OTP sent via sovereign SMS gateway to +91 ${data.phone.slice(-4)}`,
      demoOtp: "123456",
      phone: data.phone,
      role: data.role,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Invalid phone number";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
