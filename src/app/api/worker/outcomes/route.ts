import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireInstitution } from "@/lib/auth/server";
import { handleApiError } from "@/lib/error/handler";
import {
  validateFourTierEarnings,
  assertWorkerOutcomePrivacy,
  computeCohortOutcomeComparison,
} from "@/lib/worker/worker-outcome-measurement-service";

export async function GET(req: NextRequest) {
  try {
    await requireInstitution();
    const supabase = createAdminClient();
    const { searchParams } = new URL(req.url);
    const cohortId = searchParams.get("cohortId");

    let query = supabase.from("worker_outcome_cohorts").select("*");
    if (cohortId) {
      query = query.eq("cohort_id", cohortId);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Protect individual earnings privacy in public outputs
    const sanitized = (data || []).map((row) => {
      const {
        worker_reported_monthly_income,
        customer_confirmed_monthly_income,
        payment_record_backed_monthly_income,
        independently_reconciled_monthly_income,
        ...safeData
      } = row;
      return safeData;
    });

    return NextResponse.json({
      success: true,
      records: sanitized,
    });
  } catch (err: unknown) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireInstitution();
    const body = await req.json();
    const tierValidation = validateFourTierEarnings({
      workerReported: body.workerReportedMonthlyIncome ?? null,
      customerConfirmed: body.customerConfirmedMonthlyIncome ?? null,
      paymentBacked: body.paymentRecordBackedMonthlyIncome ?? null,
      independentlyReconciled: body.independentlyReconciledMonthlyIncome ?? null,
    });

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("worker_outcome_cohorts")
      .insert({
        worker_profile_id: body.workerProfileId,
        cohort_id: body.cohortId,
        baseline_period_start: body.baselinePeriodStart,
        baseline_period_end: body.baselinePeriodEnd,
        follow_up_period_start: body.followUpPeriodStart,
        follow_up_period_end: body.followUpPeriodEnd,
        worker_reported_monthly_income: body.workerReportedMonthlyIncome ?? null,
        customer_confirmed_monthly_income: body.customerConfirmedMonthlyIncome ?? null,
        payment_record_backed_monthly_income: body.paymentRecordBackedMonthlyIncome ?? null,
        independently_reconciled_monthly_income: body.independentlyReconciledMonthlyIncome ?? null,
        outcome_tracking_opted_in: body.outcomeTrackingOptedIn ?? true,
        completion_count: body.completionCount || 0,
        repeat_customer_count: body.repeatCustomerCount || 0,
        avg_enquiry_to_booking_hours: body.avgEnquiryToBookingHours ?? null,
        avg_booking_to_completion_hours: body.avgBookingToCompletionHours ?? null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      record: data,
      tierValidation,
    }, { status: 201 });
  } catch (err: unknown) {
    return handleApiError(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireInstitution();
    const body = await req.json();
    if (!body.workerProfileId) {
      return NextResponse.json({ error: "workerProfileId is required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("worker_outcome_cohorts")
      .update({
        outcome_tracking_opted_in: body.outcomeTrackingOptedIn,
        updated_at: new Date().toISOString(),
      })
      .eq("worker_profile_id", body.workerProfileId)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      updatedCount: data?.length || 0,
      outcomeTrackingOptedIn: body.outcomeTrackingOptedIn,
    });
  } catch (err: unknown) {
    return handleApiError(err);
  }
}
