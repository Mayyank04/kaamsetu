import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { isConfigured } from "@/lib/env";
import {
  requireAuthenticatedUser,
  requireContractor,
  requireOwnedWorkerProfile,
  requireOwnedContractorOrg,
  AuthError,
} from "@/lib/auth/server";
import { evaluatePayoutProvenance, computeWorkerIncomeTimeline } from "@/lib/worker/worker-outcome-service";

const createPayoutSchema = z.object({
  paymentRecordId: z.string().uuid("Invalid paymentRecordId UUID").optional().nullable(),
  workerProfileId: z.string().min(1, "workerProfileId is required"),
  bookingId: z.string().uuid("Invalid bookingId UUID").optional().nullable(),
  contractorOrganizationId: z.string().min(1, "contractorOrganizationId is required"),
  contractorDeclaredAmount: z.number().positive("contractorDeclaredAmount must be > 0").max(10000000, "Amount exceeds permissible limit"),
  workerAgreedAmount: z.number().positive("workerAgreedAmount must be > 0").max(10000000, "Amount exceeds permissible limit"),
  actualPayoutAmount: z.number().positive("actualPayoutAmount must be > 0").max(10000000, "Amount exceeds permissible limit"),
  currency: z.literal("INR").default("INR"),
  payoutMethod: z.enum(["bank_transfer", "upi", "cash_voucher_verified", "direct_debit"]),
  payoutReference: z.string().min(3, "payoutReference must be at least 3 characters").max(100),
  payoutDate: z.string().optional().nullable(),
  idempotencyKey: z.string().min(8, "idempotencyKey must be at least 8 characters").optional().nullable(),
});

const patchPayoutSchema = z.object({
  payoutConfirmationId: z.string().min(1, "payoutConfirmationId is required"),
  workerConfirmationStatus: z.enum(["pending", "confirmed_received", "disputed_amount", "disputed_unpaid"]),
  workerDisputedAmount: z.number().nonnegative("workerDisputedAmount must be >= 0").default(0.0),
  workerNotes: z.string().max(1000, "workerNotes cannot exceed 1000 characters").optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();
    const { searchParams } = new URL(req.url);
    const workerProfileId = searchParams.get("workerProfileId");
    const contractorOrgId = searchParams.get("contractorOrgId");

    // Pagination bounds
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "50", 10), 1), 100);
    const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10), 0);

    const supabase = createAdminClient();

    let query = supabase.from("worker_payout_confirmations").select("*", { count: "exact" });

    if (user.role === "worker") {
      // Workers may strictly only access their own payouts
      const targetWorkerId = workerProfileId || user.workerProfileId;
      if (!targetWorkerId) {
        return NextResponse.json({ error: "workerProfileId is required" }, { status: 400 });
      }
      await requireOwnedWorkerProfile(targetWorkerId);
      query = query.eq("worker_profile_id", targetWorkerId);

      if (!isConfigured.supabase) {
        const demoPayouts = [
          {
            id: "payout-mock-01",
            workerProfileId: targetWorkerId,
            contractorDeclaredAmount: 1850.0,
            workerAgreedAmount: 1850.0,
            actualPayoutAmount: 1850.0,
            currency: "INR",
            payoutMethod: "bank_transfer",
            payoutReference: "REF-VERIFIED-01",
            payoutDate: new Date().toISOString(),
            workerConfirmationStatus: "confirmed_received",
            workerConfirmedAt: new Date().toISOString(),
            workerDisputedAmount: 0.0,
          },
        ];
        return NextResponse.json({
          payouts: demoPayouts,
          totalCount: 1,
          limit,
          offset,
          incomeSummary: computeWorkerIncomeTimeline(targetWorkerId, demoPayouts as any),
        });
      }
    } else if (user.role === "contractor") {
      // Contractors may strictly only access payouts for organizations they own
      const targetOrgId = contractorOrgId || user.contractorOrgId;
      if (!targetOrgId) {
        return NextResponse.json({ error: "contractorOrgId is required for contractor payout queries" }, { status: 400 });
      }
      await requireOwnedContractorOrg(targetOrgId);
      query = query.eq("contractor_organization_id", targetOrgId);

      // If contractor specifies a worker, verify the worker belongs to their roster or bookings
      if (workerProfileId) {
        if (!user.isDemo) {
          const { data: member } = await supabase
            .from("contractor_workforce")
            .select("id")
            .eq("organization_id", targetOrgId)
            .eq("worker_profile_id", workerProfileId)
            .maybeSingle();

          if (!member) {
            return NextResponse.json(
              { error: "Forbidden: Worker is not part of this contractor's authorized workforce roster." },
              { status: 403 }
            );
          }
        }
        query = query.eq("worker_profile_id", workerProfileId);
      }
    } else if (user.role === "admin") {
      // Explicit admin path: can filter by worker or contractor
      if (workerProfileId) {
        query = query.eq("worker_profile_id", workerProfileId);
      }
      if (contractorOrgId) {
        query = query.eq("contractor_organization_id", contractorOrgId);
      }
    } else {
      throw new AuthError("Access denied: You do not have permission to view payout records.", 403);
    }

    const { data, count, error } = await query
      .order("payout_date", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Mask sensitive financial fields if accessed across administrative boundaries
    const formatted = (data || []).map((r) => ({
      id: r.id,
      paymentRecordId: r.payment_record_id,
      workerProfileId: r.worker_profile_id,
      bookingId: r.booking_id,
      contractorOrganizationId: r.contractor_organization_id,
      contractorDeclaredAmount: Number(r.contractor_declared_amount),
      workerAgreedAmount: Number(r.worker_agreed_amount),
      actualPayoutAmount: Number(r.actual_payout_amount),
      currency: "INR",
      payoutMethod: r.payout_method,
      payoutReference: user.role === "worker" || user.role === "admin" ? r.payout_reference : "REDACTED",
      payoutDate: r.payout_date,
      workerConfirmationStatus: r.worker_confirmation_status,
      workerConfirmedAt: r.worker_confirmed_at,
      workerDisputedAmount: Number(r.worker_disputed_amount || 0),
      workerNotes: r.worker_notes,
    }));

    const incomeSummary = workerProfileId ? computeWorkerIncomeTimeline(workerProfileId, formatted) : null;

    return NextResponse.json({
      payouts: formatted,
      totalCount: count || formatted.length,
      limit,
      offset,
      incomeSummary,
    });
  } catch (err: any) {
    const status = err.statusCode || (err.name === "AuthError" ? 401 : 500);
    return NextResponse.json({ error: err.message }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireContractor();
    const body = await req.json().catch(() => ({}));
    const parsed = createPayoutSchema.parse(body);

    const supabase = createAdminClient();

    // 1. Verify contractor ownership of the contractor organization
    await requireOwnedContractorOrg(parsed.contractorOrganizationId);

    // 2. In non-demo, verify worker belongs to contractor's roster or booking
    if (!user.isDemo) {
      if (parsed.bookingId) {
        const { data: booking, error: bErr } = await supabase
          .from("bookings")
          .select("id, worker_profile_id, status")
          .eq("id", parsed.bookingId)
          .single();

        if (bErr || !booking) {
          return NextResponse.json({ error: "Associated booking not found." }, { status: 404 });
        }
        if (booking.worker_profile_id !== parsed.workerProfileId) {
          return NextResponse.json(
            { error: "Forbidden: Worker ID does not match the worker assigned to this booking." },
            { status: 403 }
          );
        }
      } else {
        const { data: rosterMember } = await supabase
          .from("contractor_workforce")
          .select("id")
          .eq("organization_id", parsed.contractorOrganizationId)
          .eq("worker_profile_id", parsed.workerProfileId)
          .maybeSingle();

        if (!rosterMember && user.role !== "admin") {
          return NextResponse.json(
            { error: "Forbidden: Worker does not belong to this contractor organization's roster." },
            { status: 403 }
          );
        }
      }
    }

    // 3. Strict Idempotency Check: prevent duplicate payout processing
    if (parsed.payoutReference) {
      const { data: existingRef } = await supabase
        .from("worker_payout_confirmations")
        .select("id")
        .eq("payout_reference", parsed.payoutReference)
        .maybeSingle();

      if (existingRef) {
        return NextResponse.json(
          { error: "Duplicate payout reference. Payout already exists.", payoutId: existingRef.id },
          { status: 409 }
        );
      }
    }

    // 4. Insert new payout record
    if (!isConfigured.supabase) {
      return NextResponse.json({
        payoutConfirmation: {
          id: `payout-${Date.now()}`,
          payment_record_id: parsed.paymentRecordId || null,
          worker_profile_id: parsed.workerProfileId,
          booking_id: parsed.bookingId || null,
          contractor_organization_id: parsed.contractorOrganizationId,
          contractor_declared_amount: parsed.contractorDeclaredAmount,
          worker_agreed_amount: parsed.workerAgreedAmount,
          actual_payout_amount: parsed.actualPayoutAmount,
          payout_method: parsed.payoutMethod,
          payout_reference: parsed.payoutReference,
          payout_date: parsed.payoutDate || new Date().toISOString(),
          worker_confirmation_status: "pending",
        }
      }, { status: 201 });
    }

    const { data, error } = await supabase
      .from("worker_payout_confirmations")
      .insert({
        payment_record_id: parsed.paymentRecordId || null,
        worker_profile_id: parsed.workerProfileId,
        booking_id: parsed.bookingId || null,
        contractor_organization_id: parsed.contractorOrganizationId,
        contractor_declared_amount: parsed.contractorDeclaredAmount,
        worker_agreed_amount: parsed.workerAgreedAmount,
        actual_payout_amount: parsed.actualPayoutAmount,
        payout_method: parsed.payoutMethod,
        payout_reference: parsed.payoutReference,
        payout_date: parsed.payoutDate || new Date().toISOString(),
        worker_confirmation_status: "pending",
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "Duplicate payout submission rejected by uniqueness constraint." }, { status: 409 });
      }
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
    const body = await req.json().catch(() => ({}));
    const parsed = patchPayoutSchema.parse(body);

    const supabase = createAdminClient();

    // 1. Verify target payout record exists
    let existing = {
      id: parsed.payoutConfirmationId,
      worker_profile_id: user.workerProfileId || "w-pro-A",
      contractor_organization_id: user.contractorOrgId || "org-contractor-A",
      actual_payout_amount: 1850.0,
      worker_confirmation_status: parsed.payoutConfirmationId.includes("finalized") ? "confirmed_received" : "pending",
    };

    if (isConfigured.supabase) {
      const { data, error: fetchErr } = await supabase
        .from("worker_payout_confirmations")
        .select("id, worker_profile_id, contractor_organization_id, actual_payout_amount, worker_confirmation_status")
        .eq("id", parsed.payoutConfirmationId)
        .single();

      if (fetchErr || !data) {
        return NextResponse.json({ error: "Payout confirmation record not found." }, { status: 404 });
      }
      existing = data;
    }

    // 2. Immutability protection: Cannot modify settled/finalized worker entitlements
    if (existing.worker_confirmation_status === "confirmed_received" && user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Finalized and confirmed worker payouts cannot be modified." },
        { status: 409 }
      );
    }

    // 3. Role-based ownership check
    if (user.role === "worker") {
      // Workers may dispute only their own payouts
      await requireOwnedWorkerProfile(existing.worker_profile_id);
    } else if (user.role === "contractor") {
      // Contractors may only modify payouts for their own organization
      await requireOwnedContractorOrg(existing.contractor_organization_id);
      // Contractors cannot file worker disputes
      if (parsed.workerConfirmationStatus.startsWith("disputed")) {
        return NextResponse.json(
          { error: "Forbidden: Contractors cannot file disputes on behalf of workers." },
          { status: 403 }
        );
      }
    } else if (user.role !== "admin") {
      throw new AuthError("Access denied: You cannot modify this payout confirmation.", 403);
    }

    // 4. Validate disputed amount cannot exceed actual payout amount
    if (parsed.workerDisputedAmount > Number(existing.actual_payout_amount)) {
      return NextResponse.json(
        { error: "Disputed amount cannot exceed the actual payout amount." },
        { status: 422 }
      );
    }

    // 5. Update confirmation status
    if (!isConfigured.supabase) {
      return NextResponse.json({
        updatedConfirmation: {
          ...existing,
          worker_confirmation_status: parsed.workerConfirmationStatus,
          worker_confirmed_at: new Date().toISOString(),
          worker_disputed_amount: parsed.workerDisputedAmount,
          worker_notes: parsed.workerNotes || null,
        },
        provenanceEvaluation: {
          workerProfileId: existing.worker_profile_id,
          provenanceScore: 100,
          isDisputed: parsed.workerConfirmationStatus.startsWith("disputed"),
        },
      });
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
