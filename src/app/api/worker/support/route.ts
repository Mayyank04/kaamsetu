import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  requireAuthenticatedUser,
  requireModerator,
  requireOwnedWorkerProfile,
} from "@/lib/auth/server";
import { handleApiError } from "@/lib/error/handler";
import {
  determineSupportPriority,
  computeSupportResolutionMetrics,
  SupportCategory,
} from "@/lib/worker/worker-support-service";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();
    const supabase = createAdminClient();
    const { searchParams } = new URL(req.url);
    const workerProfileId = searchParams.get("workerProfileId");
    const regionCode = searchParams.get("regionCode");

    let scopedWorkerProfileId = workerProfileId;
    if (user.role === "worker") {
      scopedWorkerProfileId = workerProfileId || user.workerProfileId || "";
      await requireOwnedWorkerProfile(scopedWorkerProfileId);
    } else {
      await requireModerator();
    }

    let query = supabase
      .from("worker_support_assignments")
      .select("*")
      .order("created_at", { ascending: false });

    if (scopedWorkerProfileId) {
      query = query.eq("worker_profile_id", scopedWorkerProfileId);
    }
    if (regionCode) {
      query = query.eq("region_code", regionCode);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ supportAssignments: data });
  } catch (err: unknown) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();
    const body = await req.json();
    const { workerProfileId, supportCategory, regionCode, intakeNotes, isWhistleblower } = body;

    if (!workerProfileId || !supportCategory || !regionCode || !intakeNotes) {
      return NextResponse.json(
        { error: "Missing required fields (workerProfileId, supportCategory, regionCode, intakeNotes)" },
        { status: 400 }
      );
    }

    if (user.role === "worker") {
      await requireOwnedWorkerProfile(workerProfileId);
    } else {
      await requireModerator();
    }

    const priority = determineSupportPriority(supportCategory as SupportCategory);

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("worker_support_assignments")
      .insert({
        worker_profile_id: workerProfileId,
        support_category: supportCategory,
        priority: priority,
        region_code: regionCode,
        intake_notes: intakeNotes,
        is_whistleblower: Boolean(isWhistleblower),
        status: "submitted",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ assignment: data }, { status: 201 });
  } catch (err: unknown) {
    return handleApiError(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireModerator();
    const body = await req.json();
    const {
      id,
      status,
      assignedCoordinatorId,
      actionSummary,
      resolutionNotes,
      workerSatisfactionScore,
    } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "id and status are required" }, { status: 400 });
    }

    const updatePayload: Record<string, any> = { status };
    if (assignedCoordinatorId) updatePayload.assigned_coordinator_id = assignedCoordinatorId;
    if (actionSummary) {
      updatePayload.action_summary = actionSummary;
      updatePayload.first_action_at = new Date().toISOString();
    }
    if (resolutionNotes) {
      updatePayload.resolution_notes = resolutionNotes;
      updatePayload.resolved_at = new Date().toISOString();
    }
    if (workerSatisfactionScore !== undefined) {
      updatePayload.worker_satisfaction_score = workerSatisfactionScore;
    }
    if (status === "acknowledged") {
      updatePayload.acknowledged_at = new Date().toISOString();
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("worker_support_assignments")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const metrics = computeSupportResolutionMetrics({
      createdAt: data.created_at,
      acknowledgedAt: data.acknowledged_at,
      firstActionAt: data.first_action_at,
      resolvedAt: data.resolved_at,
    });

    return NextResponse.json({ updatedAssignment: data, metrics });
  } catch (err: unknown) {
    return handleApiError(err);
  }
}
