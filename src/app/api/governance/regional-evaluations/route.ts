import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  evaluateDistrictReadiness,
  validateMetricHierarchy,
  DistrictMetricBreakdown,
  MandatoryQualitativeGates,
} from "@/lib/regional/regional-operations-service";

export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(req.url);
    const regionCode = searchParams.get("regionCode");

    let query = supabase.from("regional_market_evaluations").select("*");
    if (regionCode) {
      query = query.eq("region_code", regionCode);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      count: data?.length || 0,
      evaluations: data || [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      regionCode,
      regionName,
      districtName,
      stepsCompleted14,
      fourteenStepScorePercent,
      qualitativeGates,
      metrics,
      evaluatorIdentity,
      limitationsNotes,
    } = body;

    if (!regionCode || !regionName || !districtName || metrics === undefined || qualitativeGates === undefined) {
      return NextResponse.json(
        { error: "regionCode, regionName, districtName, qualitativeGates, and metrics are required" },
        { status: 400 }
      );
    }

    // Enforce metric hierarchy
    const validation = validateMetricHierarchy(metrics as DistrictMetricBreakdown);
    if (!validation.valid) {
      return NextResponse.json(
        { error: "Metric hierarchy violation", violations: validation.violations },
        { status: 422 }
      );
    }

    // Determine 14-step score
    const steps = stepsCompleted14 !== undefined
      ? Number(stepsCompleted14)
      : fourteenStepScorePercent !== undefined
      ? Math.round((Number(fourteenStepScorePercent) / 100) * 14)
      : 0;

    // Evaluate district readiness enforcing anti-override invariant
    const evaluation = evaluateDistrictReadiness({
      regionCode,
      regionName,
      districtName,
      stepsCompleted14: steps,
      qualitativeGates: qualitativeGates as MandatoryQualitativeGates,
      metrics: metrics as DistrictMetricBreakdown,
      evaluatorIdentity: evaluatorIdentity || "SYSTEM-EVALUATOR",
      limitationsNotes: limitationsNotes || undefined,
    });

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("regional_market_evaluations")
      .insert({
        region_code: evaluation.regionCode,
        region_name: evaluation.regionName,
        district_name: evaluation.districtName,
        registered_workers_count: evaluation.metrics.registeredWorkers,
        consenting_workers_count: evaluation.metrics.consentingWorkers,
        discoverable_workers_count: evaluation.metrics.discoverableWorkers,
        available_workers_count: evaluation.metrics.availableWorkers,
        customer_enquiries_count: evaluation.metrics.enquiries,
        confirmed_bookings_count: evaluation.metrics.bookings,
        completed_jobs_count: evaluation.metrics.completedJobs,
        confirmed_outcomes_count: evaluation.metrics.confirmedOutcomes,
        paid_work_count: evaluation.metrics.paidWork,
        mandatory_gates_satisfied: Object.values(evaluation.qualitativeGates).every(Boolean),
        fourteen_step_score_pct: evaluation.fourteenStepScorePercent,
        operational_status: evaluation.operationalStatus,
        launch_approved: evaluation.isLaunchApproved,
        evidence_sha256: evaluation.evidenceSha256,
        evaluator_identity: evaluation.evaluatorIdentity,
        limitations_notes: evaluation.limitationsNotes,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      evaluation,
      record: data,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
