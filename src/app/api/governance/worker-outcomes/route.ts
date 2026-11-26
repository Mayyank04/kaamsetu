import { requireAdmin } from "@/lib/auth/server";
import { handleApiError } from "@/lib/error/handler";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  buildWorkerOutcomeMilestone,
  validateMilestoneProgression,
  aggregateWorkerOutcomes,
  WorkerMilestoneInput,
  MilestoneStep,
  WorkerOutcomeMilestoneRecord,
} from "@/lib/governance/worker-outcome-service";

export async function GET(req: NextRequest) {
  try { await requireAdmin(); } catch (authError) { return handleApiError(authError); }
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(req.url);
    const workerId = searchParams.get("workerId");
    const opportunityId = searchParams.get("opportunityId");

    let query = supabase.from("worker_outcome_milestones").select("*");

    if (workerId) {
      query = query.eq("worker_id", workerId);
    }
    if (opportunityId) {
      query = query.eq("opportunity_id", opportunityId);
    }

    const { data, error } = await query.order("milestone_timestamp", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const rows = data || [];
    const records: WorkerOutcomeMilestoneRecord[] = rows.map((r) => ({
      id: r.id,
      workerId: r.worker_id,
      opportunityId: r.opportunity_id,
      milestoneStep: r.milestone_step as MilestoneStep,
      agreedWageAmount: r.agreed_wage_amount,
      paidWageAmount: r.paid_wage_amount,
      platformCommissionAmount: r.platform_commission_amount,
      provenanceState: r.provenance_state,
      paymentEvidenceRef: r.payment_evidence_ref,
      paymentEvidenceHash: r.payment_evidence_hash,
      disputeReason: r.dispute_reason,
      milestoneTimestamp: r.milestone_timestamp,
      metadata: r.metadata || {},
    }));

    let aggregation = null;
    if (workerId) {
      aggregation = aggregateWorkerOutcomes(workerId, records);
    }

    return NextResponse.json({
      success: true,
      count: records.length,
      records,
      aggregation,
      invariants: {
        constitutionalZeroCommissionEnforced: true,
        platformCommissionRate: "0.00%",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try { await requireAdmin(); } catch (authError) { return handleApiError(authError); }
  try {
    const body: WorkerMilestoneInput = await req.json();

    if (!body.workerId || !body.milestoneStep || !body.provenanceState) {
      return NextResponse.json(
        { error: "workerId, milestoneStep, and provenanceState are required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Fetch existing milestones for this opportunity or worker if opportunityId present
    if (body.opportunityId) {
      const { data: existing } = await supabase
        .from("worker_outcome_milestones")
        .select("milestone_step")
        .eq("worker_id", body.workerId)
        .eq("opportunity_id", body.opportunityId);

      const existingSteps = (existing || []).map((e) => e.milestone_step as MilestoneStep);
      const validation = validateMilestoneProgression(existingSteps, body.milestoneStep);
      if (!validation.allowed) {
        return NextResponse.json(
          { error: validation.violationReason, code: "INVALID_MILESTONE_PROGRESSION" },
          { status: 422 }
        );
      }
    }

    const milestone = buildWorkerOutcomeMilestone(body);

    const { error: insertError } = await supabase.from("worker_outcome_milestones").insert({
      id: milestone.id,
      worker_id: milestone.workerId,
      opportunity_id: milestone.opportunityId,
      milestone_step: milestone.milestoneStep,
      agreed_wage_amount: milestone.agreedWageAmount,
      paid_wage_amount: milestone.paidWageAmount,
      platform_commission_amount: 0.0, // Strictly enforced 0 commission
      provenance_state: milestone.provenanceState,
      payment_evidence_ref: milestone.paymentEvidenceRef,
      payment_evidence_hash: milestone.paymentEvidenceHash,
      dispute_reason: milestone.disputeReason,
      milestone_timestamp: milestone.milestoneTimestamp,
      metadata: milestone.metadata,
    });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        success: true,
        milestone,
        invariants: {
          constitutionalZeroCommissionEnforced: true,
          platformCommissionRate: "0.00%",
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
