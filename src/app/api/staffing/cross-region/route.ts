import { NextRequest } from "next/server";
import { requireAuthenticatedUser, requireContractor, requireWorker } from "@/lib/auth/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { handleApiError, createSuccessResponse } from "@/lib/error/handler";
import {
  createStaffingOffer,
  respondToStaffingOffer,
  getStaffingOffersForWorker,
} from "@/lib/opportunity/cross-region-staffing";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();
    const supabase = await createServerSupabaseClient();

    if (user.role === "worker") {
      const { data: wp } = await supabase
        .from("worker_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!wp) return createSuccessResponse({ offers: [] });
      const offers = await getStaffingOffersForWorker(wp.id);
      return createSuccessResponse({ offers });
    }

    // Contractor viewing their offers
    const organizationId = req.nextUrl.searchParams.get("organizationId");
    if (!organizationId) {
      return handleApiError(new Error("organizationId required for contractor inquiry"));
    }

    const { data: offers, error } = await supabase
      .from("cross_region_project_staffing")
      .select(`
        *,
        worker_profiles:worker_profile_id (
          id,
          user_id,
          city,
          state,
          profiles:user_id (full_name)
        )
      `)
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return createSuccessResponse({ offers: offers || [] });
  } catch (err: any) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireContractor();
    const body = await req.json();

    const offer = await createStaffingOffer({
      organizationId: body.organizationId,
      opportunityId: body.opportunityId || null,
      sourceRegionId: body.sourceRegionId,
      targetRegionId: body.targetRegionId,
      workerProfileId: body.workerProfileId,
      tradeRequired: body.tradeRequired,
      crewRole: body.crewRole,
      durationDays: body.durationDays ? Number(body.durationDays) : 14,
      dailyWage: Number(body.dailyWage),
      travelStipend: body.travelStipend ? Number(body.travelStipend) : 0,
      accommodationProvided: body.accommodationProvided ?? true,
    });

    return createSuccessResponse({
      offer,
      message: "Cross-region staffing offer dispatched for worker consent",
    });
  } catch (err: any) {
    return handleApiError(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireWorker();
    const body = await req.json();

    const supabase = await createServerSupabaseClient();
    const { data: wp } = await supabase
      .from("worker_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!wp) throw new Error("Worker profile not found");

    const updated = await respondToStaffingOffer(
      body.staffingId,
      wp.id,
      Boolean(body.accept)
    );

    return createSuccessResponse({
      offer: updated,
      message: `Staffing offer successfully ${body.accept ? "accepted" : "declined"}`,
    });
  } catch (err: any) {
    return handleApiError(err);
  }
}
