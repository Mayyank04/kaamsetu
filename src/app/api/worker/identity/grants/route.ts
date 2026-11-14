import { NextRequest } from "next/server";
import { requireWorker } from "@/lib/auth/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { handleApiError, createSuccessResponse } from "@/lib/error/handler";
import {
  createIdentityAccessGrant,
  revokeIdentityAccessGrant,
} from "@/lib/interop/identity-access-service";

export async function GET() {
  try {
    const user = await requireWorker();
    const supabase = await createServerSupabaseClient();

    const { data: wp } = await supabase
      .from("worker_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!wp) {
      return createSuccessResponse({ grants: [] });
    }

    const { data: grants, error } = await supabase
      .from("worker_identity_access_grants")
      .select("*")
      .eq("worker_profile_id", wp.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return createSuccessResponse({ grants: grants || [] });
  } catch (err: any) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireWorker();
    const body = await req.json();

    const supabase = await createServerSupabaseClient();
    const { data: wp } = await supabase
      .from("worker_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!wp) {
      return handleApiError(new Error("Worker profile not found"));
    }

    const result = await createIdentityAccessGrant({
      workerProfileId: wp.id,
      granteeName: body.granteeName || "Prospective Partner",
      granteeType: body.granteeType || "verifier",
      disclosedSections: body.disclosedSections || {
        skills: true,
        experience: true,
        portfolio: false,
        work_history: true,
        credentials: true,
      },
      validityHours: body.validityHours || 72,
    });

    return createSuccessResponse(result);
  } catch (err: any) {
    return handleApiError(err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireWorker();
    const { searchParams } = new URL(req.url);
    const grantId = searchParams.get("id");

    if (!grantId) {
      return handleApiError(new Error("Grant ID is required"));
    }

    const supabase = await createServerSupabaseClient();
    const { data: wp } = await supabase
      .from("worker_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!wp) {
      return handleApiError(new Error("Worker profile not found"));
    }

    const revoked = await revokeIdentityAccessGrant(wp.id, grantId);
    return createSuccessResponse({ revoked });
  } catch (err: any) {
    return handleApiError(err);
  }
}
