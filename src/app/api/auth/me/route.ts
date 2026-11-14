import { NextRequest, NextResponse } from "next/server";
import { DEMO_PERSONAS } from "@/lib/auth/personas";
import { UserProfile } from "@/types/auth";

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("kaamsetu_session")?.value;

    if (!sessionCookie) {
      // Default fallback demo user if no session cookie exists
      return NextResponse.json({
        success: true,
        user: DEMO_PERSONAS[0],
        isAuthenticated: true,
        isDemo: true,
      });
    }

    try {
      const parsedUser = JSON.parse(sessionCookie) as UserProfile;
      return NextResponse.json({
        success: true,
        user: parsedUser,
        isAuthenticated: true,
        isDemo: true,
      });
    } catch {
      return NextResponse.json({
        success: true,
        user: DEMO_PERSONAS[0],
        isAuthenticated: true,
      });
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error resolving session" },
      { status: 500 }
    );
  }
}
