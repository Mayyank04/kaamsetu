import { NextResponse } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth/server";

export async function GET() {
  try {
    const { user, isDemo } = await getAuthenticatedSession();

    if (!user) {
      return NextResponse.json({
        success: true,
        user: null,
        isAuthenticated: false,
        isDemo: false,
      });
    }

    return NextResponse.json({
      success: true,
      user,
      isAuthenticated: true,
      isDemo,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        user: null,
        isAuthenticated: false,
        message: "Failed to resolve session",
      },
      { status: 500 }
    );
  }
}
