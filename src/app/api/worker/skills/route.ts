import { NextRequest } from "next/server";
import { z } from "zod";
import { requireWorker, requireOwnedWorkerProfile } from "@/lib/auth/server";
import { handleApiError, createSuccessResponse, AuthorizationError, NotFoundError } from "@/lib/error/handler";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isConfigured } from "@/lib/env";

const createSkillSchema = z.object({
  worker_profile_id: z.string().optional(),
  name: z.string().trim().min(2, "Skill name must be at least 2 characters").max(100),
  category: z.string().trim().max(80).optional().default("Trade Specialization"),
  years_practiced: z.number().int().min(0).max(60).optional().default(1),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireWorker();
    const json = await request.json();
    const data = createSkillSchema.parse(json);

    const targetProfileId = data.worker_profile_id || user.workerProfileId;

    if (!isConfigured.supabase) {
      if (process.env.NODE_ENV === "production") {
        throw new Error("FATAL DATABASE CONFIGURATION: Supabase is unconfigured in production.");
      }
      return createSuccessResponse(
        {
          id: `sk-decl-${Date.now()}`,
          name: data.name,
          category: data.category,
          isPrimary: false,
          verificationType: "self_declared",
          yearsPracticed: data.years_practiced,
          declaredAt: new Date().toISOString().split("T")[0],
        },
        { message: "Self-declared skill saved (development mode)." }
      );
    }

    if (!targetProfileId) {
      throw new NotFoundError("Complete your worker profile onboarding before adding skills.");
    }

    await requireOwnedWorkerProfile(targetProfileId);
    const supabase = await createServerSupabaseClient();

    // Ensure skill catalog row exists or create a custom self-declared entry
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const { data: workerProfile } = await supabase
      .from("worker_profiles")
      .select("occupation_id")
      .eq("id", targetProfileId)
      .single();

    let occupationId = workerProfile?.occupation_id || "11111111-1111-1111-1111-111111111101";

    const { data: existingSkill } = await supabase
      .from("skills")
      .select("id")
      .ilike("name", data.name)
      .maybeSingle();

    let skillId = existingSkill?.id;
    if (!skillId) {
      const { data: createdSkill, error: skillErr } = await supabase
        .from("skills")
        .insert({
          occupation_id: occupationId,
          name: data.name,
          slug: `${slug}-${Date.now()}`,
          category: data.category,
        })
        .select("id")
        .single();

      if (skillErr) throw skillErr;
      skillId = createdSkill.id;
    }

    const { data: linked, error: linkErr } = await supabase
      .from("worker_skills")
      .upsert(
        {
          worker_profile_id: targetProfileId,
          skill_id: skillId,
          verification_type: "self_declared",
          is_primary: false,
          years_practiced: data.years_practiced,
        },
        { onConflict: "worker_profile_id,skill_id" }
      )
      .select("id, created_at")
      .single();

    if (linkErr) throw linkErr;

    return createSuccessResponse(
      {
        id: linked.id,
        name: data.name,
        category: data.category,
        isPrimary: false,
        verificationType: "self_declared",
        yearsPracticed: data.years_practiced,
        declaredAt: linked.created_at.split("T")[0],
      },
      { message: "Self-declared skill saved to your profile." }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireWorker();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      throw new Error("Skill ID is required.");
    }

    if (!isConfigured.supabase) {
      if (process.env.NODE_ENV === "production") {
        throw new Error("FATAL DATABASE CONFIGURATION: Supabase is unconfigured in production.");
      }
      return createSuccessResponse({ id, deleted: true });
    }

    const supabase = await createServerSupabaseClient();
    const { data: existing, error: fetchErr } = await supabase
      .from("worker_skills")
      .select("id, worker_profile_id, worker_profiles!inner(user_id)")
      .eq("id", id)
      .maybeSingle();

    if (fetchErr) throw fetchErr;
    if (!existing) throw new NotFoundError("Skill record not found.");

    const ownerUserId = (existing as unknown as { worker_profiles?: { user_id?: string } })?.worker_profiles?.user_id;
    if (ownerUserId !== user.id) {
      throw new AuthorizationError("You do not have permission to remove this skill.");
    }

    const { error: deleteErr } = await supabase.from("worker_skills").delete().eq("id", id);
    if (deleteErr) throw deleteErr;

    return createSuccessResponse({ id, deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
