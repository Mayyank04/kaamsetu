import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/server";
import { handleApiError } from "@/lib/error/handler";
import {
  validateInstitutionalStageTransition,
  evaluateInstitutionProductionReadiness,
  InstitutionalLifecycleRecord,
  InstitutionalOnboardingStage,
} from "@/lib/institution/institutional-onboarding-service";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const supabase = createAdminClient();
    const { searchParams } = new URL(req.url);
    const institutionId = searchParams.get("institutionId");

    let query = supabase
      .from("institutional_onboarding_lifecycle")
      .select("*")
      .order("updated_at", { ascending: false });

    if (institutionId) {
      query = query.eq("institution_id", institutionId);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ onboardingRecords: data });
  } catch (err: unknown) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const {
      institutionId,
      stage,
      stageStatus,
      completedStages,
      mouReference,
      mouSignedAt,
      technicalIntegrationVerified,
      sandboxTestPassed,
      securitySignoffBy,
      authorizedSignatoryName,
      authorizedSignatoryDesignation,
      blockers,
    } = body;

    if (!institutionId) {
      return NextResponse.json({ error: "institutionId is required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("institutional_onboarding_lifecycle")
      .insert({
        institution_id: institutionId,
        stage: stage || "initial_application",
        stage_status: stageStatus || "in_progress",
        completed_stages: completedStages || [],
        mou_reference: mouReference || null,
        mou_signed_at: mouSignedAt || null,
        technical_integration_verified: Boolean(technicalIntegrationVerified),
        sandbox_test_passed: Boolean(sandboxTestPassed),
        security_signoff_by: securitySignoffBy || null,
        authorized_signatory_name: authorizedSignatoryName || null,
        authorized_signatory_designation: authorizedSignatoryDesignation || null,
        blockers: blockers || [],
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ onboardingRecord: data }, { status: 201 });
  } catch (err: unknown) {
    return handleApiError(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { id, targetStage, updateData } = body;

    if (!id || !targetStage) {
      return NextResponse.json({ error: "id and targetStage are required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: current, error: fetchErr } = await supabase
      .from("institutional_onboarding_lifecycle")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchErr) {
      return NextResponse.json({ error: fetchErr.message }, { status: 500 });
    }

    const currentRecord: InstitutionalLifecycleRecord = {
      id: current.id,
      institutionId: current.institution_id,
      stage: current.stage as InstitutionalOnboardingStage,
      stageStatus: current.stage_status,
      completedStages: current.completed_stages || [],
      mouReference: current.mou_reference,
      mouSignedAt: current.mou_signed_at,
      technicalIntegrationVerified: current.technical_integration_verified,
      sandboxTestPassed: current.sandbox_test_passed,
      securitySignoffBy: current.security_signoff_by,
      authorizedSignatoryName: current.authorized_signatory_name,
      authorizedSignatoryDesignation: current.authorized_signatory_designation,
      blockers: current.blockers || [],
      ...updateData,
    };

    const transitionCheck = validateInstitutionalStageTransition(currentRecord, targetStage);
    if (!transitionCheck.canTransition) {
      return NextResponse.json(
        { error: "Invalid stage transition", blockingReasons: transitionCheck.blockingReasons },
        { status: 422 }
      );
    }

    const completed = Array.from(new Set([...(current.completed_stages || []), current.stage]));
    const { data: updated, error: updateErr } = await supabase
      .from("institutional_onboarding_lifecycle")
      .update({
        stage: targetStage,
        completed_stages: completed,
        updated_at: new Date().toISOString(),
        ...(updateData || {}),
      })
      .eq("id", id)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    const readiness = evaluateInstitutionProductionReadiness(currentRecord);

    return NextResponse.json({ updatedRecord: updated, productionReadiness: readiness });
  } catch (err: unknown) {
    return handleApiError(err);
  }
}
