import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  createWorkerDispute,
  transitionDisputeStage,
  DisputeSubmissionInput,
  DisputeStatus,
} from "@/lib/governance/worker-dispute-service";

export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(req.url);
    const workerProfileId = searchParams.get("workerProfileId");
    const status = searchParams.get("status");

    let query = supabase.from("worker_disputes").select("*");

    if (workerProfileId) {
      query = query.eq("worker_profile_id", workerProfileId);
    }
    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      count: data?.length || 0,
      disputes: data || [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = createAdminClient();

    if (body.action === "transition_stage") {
      const { disputeId, targetStage, actorId, note, resolutionSummary, resolvedAmount } = body;
      if (!disputeId || !targetStage) {
        return NextResponse.json(
          { error: "disputeId and targetStage are required for stage transition" },
          { status: 400 }
        );
      }

      const { data: existing, error: fetchErr } = await supabase
        .from("worker_disputes")
        .select("*")
        .eq("id", disputeId)
        .single();

      if (fetchErr || !existing) {
        return NextResponse.json({ error: "Dispute not found" }, { status: 404 });
      }

      const domainDispute = createWorkerDispute({
        disputeId: existing.id,
        workerId: existing.worker_profile_id,
        respondentId: existing.counterparty_name || "unknown",
        reasonCode: (existing.dispute_type as any) || "unpaid_wages",
        description: existing.evidence_notes || "",
        claimedAmount: existing.claimed_amount ? Number(existing.claimed_amount) : undefined,
      });
      domainDispute.status = existing.status as DisputeStatus;

      const transitionResult = transitionDisputeStage({
        dispute: domainDispute,
        targetStage: targetStage as DisputeStatus,
        actorId: actorId || "compliance_reviewer",
        note: note || "State updated via governance API",
        resolutionSummary,
        resolvedAmount,
      });

      if (!transitionResult.allowed) {
        return NextResponse.json(
          { error: transitionResult.reason, code: "INVALID_DISPUTE_TRANSITION" },
          { status: 422 }
        );
      }

      const now = new Date().toISOString();
      const dbUpdates: Record<string, unknown> = {
        status: targetStage,
        updated_at: now,
      };

      if (resolutionSummary) {
        dbUpdates.resolution_summary = resolutionSummary;
        dbUpdates.resolved_at = now;
      }

      const { data: updated, error: updateErr } = await supabase
        .from("worker_disputes")
        .update(dbUpdates)
        .eq("id", disputeId)
        .select("*")
        .single();

      if (updateErr) {
        return NextResponse.json({ error: updateErr.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        action: "stage_transitioned",
        dispute: updated,
      });
    }

    // Default: File new dispute
    const input: DisputeSubmissionInput = {
      workerId: body.workerProfileId || body.workerId,
      respondentId: body.respondentId || body.counterpartyName || "Unspecified Counterparty",
      reasonCode: body.disputeType || body.reasonCode || "unpaid_wages",
      description: body.evidenceNotes || body.description || "Unspecified dispute",
      claimedAmount: body.claimedAmount ? Number(body.claimedAmount) : undefined,
      evidenceAttachments: body.evidenceAttachments,
    };

    const domainDispute = createWorkerDispute(input);

    const { data: inserted, error: insertErr } = await supabase
      .from("worker_disputes")
      .insert({
        id: domainDispute.id.startsWith("disp-") ? undefined : domainDispute.id, // let db generate UUID if prefix
        worker_profile_id: domainDispute.workerId,
        dispute_type: domainDispute.reasonCode,
        counterparty_name: domainDispute.respondentId,
        evidence_notes: domainDispute.description,
        claimed_amount: domainDispute.claimedAmount,
        status: "submitted",
        is_retaliatory_suspected: body.isRetaliatorySuspected ?? false,
      })
      .select("*")
      .single();

    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        success: true,
        action: "dispute_filed",
        dispute: inserted,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
