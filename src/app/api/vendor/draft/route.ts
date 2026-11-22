import { NextResponse } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isConfigured } from "@/lib/env";

export async function GET() {
  try {
    const { user } = await getAuthenticatedSession();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!isConfigured.supabase) {
      return NextResponse.json({ success: true, draft: null });
    }

    const supabase = await createServerSupabaseClient();
    const { data: draft, error } = await supabase
      .from("vendor_drafts")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      console.warn("[API /api/vendor/draft] Query error:", error.message);
    }

    return NextResponse.json({ success: true, draft: draft || null });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { user } = await getAuthenticatedSession();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const draftStep = body.draftStep || 1;
    const draftPayload = body.draftPayload || body;

    if (!isConfigured.supabase) {
      return NextResponse.json({
        success: true,
        message: "Draft saved locally in demo mode.",
        draftStep,
      });
    }

    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("vendor_drafts")
      .upsert(
        {
          user_id: user.id,
          draft_step: draftStep,
          draft_payload: draftPayload,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )
      .select("id, draft_step, updated_at")
      .maybeSingle();

    if (error) {
      console.warn("[API /api/vendor/draft] Upsert warning:", error.message);
    }

    return NextResponse.json({
      success: true,
      message: "Draft saved successfully.",
      draftId: data?.id,
      draftStep,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const { user } = await getAuthenticatedSession();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (isConfigured.supabase) {
      const supabase = await createServerSupabaseClient();
      await supabase.from("vendor_drafts").delete().eq("user_id", user.id);
    }

    return NextResponse.json({ success: true, message: "Draft cleared successfully." });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
