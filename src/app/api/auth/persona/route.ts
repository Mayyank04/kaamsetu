import { NextResponse } from "next/server";

/**
 * DEPRECATED & DECOMMISSIONED: Demo Persona Authentication endpoint.
 * In Phase 39, demo persona authentication was permanently removed.
 * All authentication must proceed through the genuine sandbox or SMS OTP flow.
 */
export async function POST() {
  return NextResponse.json(
    {
      success: false,
      message: "Demo persona authentication has been permanently decommissioned. Please sign in with your mobile number.",
    },
    { status: 410 }
  );
}
