import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  initiateRegionalDualApproval,
  completeSecondaryApproval,
} from "@/lib/regions/regional-governance-service";

export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(req.url);
    const regionId = searchParams.get("regionId");

    let query = supabase.from("regional_dual_approvals").select("*").order("created_at", { ascending: false });
    if (regionId) {
      query = query.eq("region_id", regionId);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ approvals: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const body = await req.json();

    const result = await initiateRegionalDualApproval(supabase, {
      regionId: body.regionId,
      targetStatus: body.targetStatus,
      primaryApproverId: body.primaryApproverId,
      readinessScore: body.readinessScore,
      hasSignedMou: Boolean(body.hasSignedMou),
      activeIncidentCount: body.activeIncidentCount || 0,
      evidenceReferences: body.evidenceReferences || {},
      decisionReason: body.decisionReason,
      policyVersion: body.policyVersion,
    });

    return NextResponse.json(result, { status: result.success ? 201 : 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const body = await req.json();

    const result = await completeSecondaryApproval(supabase, {
      approvalId: body.approvalId,
      secondaryApproverId: body.secondaryApproverId,
      decision: body.decision,
      rejectionReason: body.rejectionReason,
    });

    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
