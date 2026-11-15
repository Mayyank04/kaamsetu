import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  requireAuthenticatedUser,
  requireContractor,
  requireOwnedWorkerProfile,
  AuthError,
} from "@/lib/auth/server";
import { evaluatePayoutProvenance, computeWorkerIncomeTimeline } from "@/lib/worker/worker-outcome-service";

const createPayoutSchema = z.object({
  paymentRecordId: z.string().optional().nullable(),
  workerProfileId: z.string().min(1, "workerProfileId is required"),
  bookingId: z.string().optional().nullable(),
  contractorOrganizationId: z.string().optional().nullable(),
  contractorDeclaredAmount: z.number().nonnegative("contractorDeclaredAmount must be >= 0"),
  workerAgreedAmount: z.number().nonnegative("workerAgreedAmount must be >= 0"),
  actualPayoutAmount: z.number().nonnegative("actualPayoutAmount must be >= 0"),
  payoutMethod: z.enum(["upi", "bank_transfer", "cash", "direct_debit", "other"]),
  payoutReference: z.string().optional().nullable(),
  payoutDate: z.string().optional().nullable(),
  idempotencyKey: z.string().optional().nullable(),
});

const patchPayoutSchema = z.object({
  payoutConfirmationId: z.string().min(1, "payoutConfirmationId is required"),
  workerConfirmationStatus: z.enum(["pending", "confirmed", "disputed"]),
  workerDisputedAmount: z.number().nonnegative().optional().default(0.0),
  workerNotes: z.string().max(1000).optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();
    const { searchParams } = new URL(req.url);
    const workerProfileId = searchParams.get("workerProfileId");

    if (!workerProfileId) {
      return NextResponse.json({ error: "workerProfileId is required" }, { status: 400 });
    }

    // Role-based authorization & ownership check
    if (user.role === "worker") {
      await requireOwnedWorkerProfile(workerProfileId);
    } else if (user.role !== "contractor" && user.role !== "admin") {
      throw new AuthError("Access denied: You do not have permission to view these payouts.", 403);
    }

    const supabase = createAdminClient();
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
    const status = err.statusCode || (err.name === "AuthError" ? 401 : 500);
    return NextResponse.json({ error: err.message }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireContractor();
    const body = await req.json();
    const parsed = createPayoutSchema.parse(body);

    const supabase = createAdminClient();

    // Idempotency check: if payoutReference is provided, check for existing entry
    if (parsed.payoutReference) {
      const { data: existing } = await supabase
        .from("worker_payout_confirmations")
        .select("id")
        .eq("payout_reference", parsed.payoutReference)
        .maybeSingle();

      if (existing) {
        return NextResponse.json(
          { error: "Duplicate payout reference. Payout already exists." },
          { status: 409 }
        );
      }
    }

    const { data, error } = await supabase
      .from("worker_payout_confirmations")
      .insert({
        payment_record_id: parsed.paymentRecordId || null,
        worker_profile_id: parsed.workerProfileId,
        booking_id: parsed.bookingId || null,
        contractor_organization_id: parsed.contractorOrganizationId || null,
        contractor_declared_amount: parsed.contractorDeclaredAmount,
        worker_agreed_amount: parsed.workerAgreedAmount,
        actual_payout_amount: parsed.actualPayoutAmount,
        payout_method: parsed.payoutMethod,
        payout_reference: parsed.payoutReference || null,
        payout_date: parsed.payoutDate || new Date().toISOString(),
        worker_confirmation_status: "pending",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ payoutConfirmation: data }, { status: 201 });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: err.errors }, { status: 422 });
    }
    const status = err.statusCode || (err.name === "AuthError" ? 403 : 500);
    return NextResponse.json({ error: err.message }, { status });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();
    const body = await req.json();
    const parsed = patchPayoutSchema.parse(body);

    const supabase = createAdminClient();

    // Verify record exists and get owner worker_profile_id
    const { data: existing, error: fetchErr } = await supabase
      .from("worker_payout_confirmations")
      .select("id, worker_profile_id, actual_payout_amount")
      .eq("id", parsed.payoutConfirmationId)
      .single();

    if (fetchErr || !existing) {
      return NextResponse.json({ error: "Payout confirmation record not found." }, { status: 404 });
    }

    // If caller is a worker, enforce ownership of the payout record
    if (user.role === "worker") {
      await requireOwnedWorkerProfile(existing.worker_profile_id);
    } else if (user.role !== "contractor" && user.role !== "admin") {
      throw new AuthError("Access denied: You cannot modify this payout confirmation.", 403);
    }

    // Validate disputed amount cannot exceed payout amount
    if (parsed.workerDisputedAmount > Number(existing.actual_payout_amount)) {
      return NextResponse.json(
        { error: "Disputed amount cannot exceed the actual payout amount." },
        { status: 422 }
      );
    }

    const { data, error } = await supabase
      .from("worker_payout_confirmations")
      .update({
        worker_confirmation_status: parsed.workerConfirmationStatus,
        worker_confirmed_at: new Date().toISOString(),
        worker_disputed_amount: parsed.workerDisputedAmount,
        worker_notes: parsed.workerNotes || null,
      })
      .eq("id", parsed.payoutConfirmationId)
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
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: err.errors }, { status: 422 });
    }
    const status = err.statusCode || (err.name === "AuthError" ? 403 : 500);
    return NextResponse.json({ error: err.message }, { status });
  }
}
