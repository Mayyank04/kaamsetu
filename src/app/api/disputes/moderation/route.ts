import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveReviewModerationAppeal } from "@/lib/disputes/review-integrity-service";

export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(req.url);
    const workerProfileId = searchParams.get("workerProfileId");

    let query = supabase.from("review_moderation_appeals").select("*").order("created_at", { ascending: false });
    if (workerProfileId) {
      query = query.eq("worker_profile_id", workerProfileId);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ appeals: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const body = await req.json();

    const { data, error } = await supabase
      .from("review_moderation_appeals")
      .insert({
        review_id: body.reviewId,
        worker_profile_id: body.workerProfileId,
        contractor_organization_id: body.contractorOrganizationId || null,
        dispute_id: body.disputeId || null,
        original_rating: body.originalRating,
        quarantine_reason: body.quarantineReason,
        submitted_evidence: body.submittedEvidence || [],
        moderation_status: "quarantined",
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, appealId: data.id }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const body = await req.json();

    const result = await resolveReviewModerationAppeal(supabase, body.appealId, {
      moderatorId: body.moderatorId,
      newStatus: body.newStatus,
      resolutionNotes: body.resolutionNotes,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
