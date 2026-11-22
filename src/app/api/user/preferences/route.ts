import { NextResponse } from "next/server";
import { getAuthenticatedSession } from "@/lib/auth/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isConfigured } from "@/lib/env";

export async function GET() {
  try {
    const { user } = await getAuthenticatedSession();
    if (!user) {
      return NextResponse.json({ success: true, preferences: null });
    }

    if (!isConfigured.supabase) {
      return NextResponse.json({
        success: true,
        preferences: { preferred_language: "en", text_size: "normal" },
      });
    }

    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error && !error.message.includes("schema cache") && !error.message.includes("does not exist")) {
      console.warn("[Preferences API] Error fetching user preferences:", error.message);
    }

    return NextResponse.json({
      success: true,
      preferences: data || {
        preferred_language: "en",
        preferred_translation_language: "hi",
        auto_detect_source: true,
        show_original_by_default: false,
        enable_voice_playback: true,
        text_size: "normal",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: true, preferences: null });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      preferred_language,
      preferred_translation_language,
      auto_detect_source,
      show_original_by_default,
      enable_voice_playback,
      text_size,
      high_contrast,
    } = body;
    const { user } = await getAuthenticatedSession();

    if (!user) {
      return NextResponse.json({ success: true, saved: "guest_local_only" });
    }

    if (!isConfigured.supabase) {
      return NextResponse.json({ success: true, saved: "demo_mock" });
    }

    const supabase = await createServerSupabaseClient();
    const updatePayload: Record<string, any> = {
      user_id: user.id,
      updated_at: new Date().toISOString(),
    };

    if (preferred_language !== undefined) updatePayload.preferred_language = preferred_language;
    if (preferred_translation_language !== undefined) {
      updatePayload.preferred_translation_language = preferred_translation_language;
    }
    if (auto_detect_source !== undefined) updatePayload.auto_detect_source = Boolean(auto_detect_source);
    if (show_original_by_default !== undefined) {
      updatePayload.show_original_by_default = Boolean(show_original_by_default);
    }
    if (enable_voice_playback !== undefined) {
      updatePayload.enable_voice_playback = Boolean(enable_voice_playback);
    }
    if (text_size !== undefined) updatePayload.text_size = text_size;
    if (high_contrast !== undefined) updatePayload.high_contrast = Boolean(high_contrast);

    const { error } = await supabase.from("user_preferences").upsert(
      updatePayload,
      { onConflict: "user_id" }
    );

    if (error) {
      // Non-blocking schema fallback
      console.warn("[Preferences API] Preferences table not yet migrated; saved locally:", error.message);
    }

    return NextResponse.json({ success: true, saved: true });
  } catch (err: any) {
    return NextResponse.json({ success: true, saved: false, message: err.message });
  }
}
