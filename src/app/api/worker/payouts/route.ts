import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { evaluatePayoutProvenance, computeWorkerIncomeTimeline } from "@/lib/worker/worker-outcome-service";

export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(req.url);
    const workerProfileId = searchParams.get("workerProfileId");

    if (!workerProfileId) {
      return NextResponse.json({ error: "workerProfileId is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("worker_payout_confirmations")
      .select("*")
      .eq("worker_profile_id", workerProfileId)
      .order("payout_date", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const formatted = (data || []).map((r) => ({
      id: r.id,
      paymentRecordId: r.payment_record_id,
      workerProfileId: r.worker_profile_id,
      bookingId: r.booking_id,
      contractorOrganizationId: r.contractor_organization_id,
      contractorDeclaredAmount: Number(r.contractor_declared_amount),
      workerAgreedAmount: Number(r.worker_agreed_amount),
      actualPayoutAmount: Number(r.actual_payout_amount),
      payoutMethod: r.payout_method,
      payoutReference: r.payout_reference,
      payoutDate: r.payout_date,
      workerConfirmationStatus: r.worker_confirmation_status,
      workerConfirmedAt: r.worker_confirmed_at,
      workerDisputedAmount: Number(r.worker_disputed_amount),
      workerNotes: r.worker_notes,
    }));

    const incomeSummary = computeWorkerIncomeTimeline(workerProfileId, formatted);

    return NextResponse.json({ payouts: formatted, incomeSummary });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      paymentRecordId,
      workerProfileId,
      bookingId,
      contractorOrganizationId,
      contractorDeclaredAmount,
      workerAgreedAmount,
      actualPayoutAmount,
      payoutMethod,
      payoutReference,
      payoutDate,
    } = body;

    if (!workerProfileId || contractorDeclaredAmount === undefined || workerAgreedAmount === undefined || actualPayoutAmount === undefined || !payoutMethod) {
      return NextResponse.json({ error: "Missing required payout parameters" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("worker_payout_confirmations")
      .insert({
        payment_record_id: paymentRecordId || null,
        worker_profile_id: workerProfileId,
        booking_id: bookingId || null,
        contractor_organization_id: contractorOrganizationId || null,
        contractor_declared_amount: contractorDeclaredAmount,
        worker_agreed_amount: workerAgreedAmount,
        actual_payout_amount: actualPayoutAmount,
        payout_method: payoutMethod,
        payout_reference: payoutReference || null,
        payout_date: payoutDate || new Date().toISOString(),
        worker_confirmation_status: "pending",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ payoutConfirmation: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { payoutConfirmationId, workerConfirmationStatus, workerDisputedAmount, workerNotes } = body;

    if (!payoutConfirmationId || !workerConfirmationStatus) {
      return NextResponse.json({ error: "payoutConfirmationId and workerConfirmationStatus are required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("worker_payout_confirmations")
      .update({
        worker_confirmation_status: workerConfirmationStatus,
        worker_confirmed_at: new Date().toISOString(),
        worker_disputed_amount: workerDisputedAmount || 0.0,
        worker_notes: workerNotes || null,
      })
      .eq("id", payoutConfirmationId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const evaluation = evaluatePayoutProvenance({
      workerProfileId: data.worker_profile_id,
      contractorDeclaredAmount: Number(data.contractor_declared_amount),
      workerAgreedAmount: Number(data.worker_agreed_amount),
      actualPayoutAmount: Number(data.actual_payout_amount),
      payoutMethod: data.payout_method,
      payoutDate: data.payout_date,
      workerConfirmationStatus: data.worker_confirmation_status,
      workerDisputedAmount: Number(data.worker_disputed_amount),
    });

    return NextResponse.json({ updatedConfirmation: data, provenanceEvaluation: evaluation });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
