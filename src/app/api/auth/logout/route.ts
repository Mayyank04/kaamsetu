import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isConfigured } from "@/lib/env";

export async function POST() {
  try {
    if (isConfigured.supabase) {
      try {
        const supabase = await createServerSupabaseClient();
        await supabase.auth.signOut();
      } catch (err) {
        console.warn("Supabase sign out error:", err);
      }
    }

    const response = NextResponse.json({
      success: true,
      message: "Signed out successfully",
      redirectUrl: "/",
    });

    // Clear session cookies cleanly across path "/"
    response.cookies.set("kaamsetu_session", "", {
      path: "/",
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    response.cookies.set("kaamsetu_demo_persona", "", {
      path: "/",
      maxAge: 0,
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error during sign out" },
      { status: 500 }
    );
  }
}
