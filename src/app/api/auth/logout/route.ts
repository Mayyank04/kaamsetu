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

    response.cookies.delete("kaamsetu_demo_persona");
    response.cookies.delete("kaamsetu_session");

    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error during sign out" },
      { status: 500 }
    );
  }
}
