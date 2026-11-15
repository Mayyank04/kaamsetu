import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isConfigured } from "@/lib/env";
import {
  submitWorkerGrievance,
  resolveGrievanceWithRestitution,
} from "@/lib/disputes/grievance-service";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const workerProfileId = searchParams.get("workerProfileId");

  if (!workerProfileId) {
    return NextResponse.json({ error: "Missing workerProfileId" }, { status: 400 });
  }

  if (!isConfigured.supabase) {
    return NextResponse.json({
      success: true,
      grievances: [],
    });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("worker_disputes")
    .select("*")
    .eq("worker_profile_id", workerProfileId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, grievances: data || [] });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.workerProfileId || !body.disputeType || !body.counterpartyName || !body.evidenceNotes) {
      return NextResponse.json(
        { error: "Missing required fields: workerProfileId, disputeType, counterpartyName, evidenceNotes" },
        { status: 400 }
      );
    }

    const grievance = await submitWorkerGrievance({
      workerProfileId: body.workerProfileId,
      disputeType: body.disputeType,
      counterpartyName: body.counterpartyName,
      evidenceNotes: body.evidenceNotes,
      claimedAmount: body.claimedAmount,
      confidentialEvidenceUrls: body.confidentialEvidenceUrls,
      isRetaliatorySuspected: body.isRetaliatorySuspected,
    });

    return NextResponse.json({ success: true, grievance }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.disputeId || !body.reviewerId || !body.resolutionStatus || !body.resolutionSummary) {
      return NextResponse.json(
        { error: "Missing required fields: disputeId, reviewerId, resolutionStatus, resolutionSummary" },
        { status: 400 }
      );
    }

    const resolved = await resolveGrievanceWithRestitution({
      disputeId: body.disputeId,
      reviewerId: body.reviewerId,
      resolutionStatus: body.resolutionStatus,
      resolutionSummary: body.resolutionSummary,
      restitutionUtr: body.restitutionUtr,
    });

    return NextResponse.json({ success: true, dispute: resolved });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
