import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin, AuthError } from "@/lib/auth/server";
import {
  buildCommercialTransaction,
  transitionSettlementState,
  reconcileSettlementLedger,
  CommercialTransactionInput,
  SettlementState,
  CommercialTransactionRecord,
} from "@/lib/governance/commercial-settlement-service";

const transitionStateSchema = z.object({
  action: z.literal("transition_state"),
  transactionId: z.string().uuid("Invalid transactionId UUID"),
  ledgerType: z.enum(["worker_wage", "b2b_gst"]),
  targetState: z.enum([
    "payment_initiated",
    "payment_gateway_confirmed",
    "merchant_settlement_pending",
    "merchant_settlement_completed",
    "reconciliation_exception",
    "refund",
  ]),
  merchantBankReference: z.string().nullable().optional(),
  notes: z.string().max(500).optional(),
});

export async function GET(req: NextRequest) {
  try {
    // Financial settlement reports require administrator privileges
    await requireAdmin();

    const supabase = createAdminClient();

    // Query both payment_records_ledger (worker wages) and financial_gst_ledger (B2B SaaS)
    const { data: wageRecords } = await supabase
      .from("payment_records_ledger")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: gstRecords } = await supabase
      .from("financial_gst_ledger")
      .select("*")
      .order("created_at", { ascending: false });

    const transactions: CommercialTransactionRecord[] = [];

    // Map wage records (0.00% commission permanent invariant)
    if (wageRecords) {
      for (const w of wageRecords) {
        const tx = buildCommercialTransaction({
          transactionId: w.id,
          stream: "worker_wage_transfer",
          tenantId: w.worker_profile_id || "worker-pool",
          description: `Direct wage disbursement for booking ${w.booking_id || "direct"}`,
          grossAmount: Number(w.amount_paid || w.worker_agreed_amount || 0),
          isSimulated: false,
          gatewayReference: w.payment_evidence_ref || undefined,
        });
        tx.platformCommissionAmount = 0.0;
        tx.platformCommissionRate = 0.0;
        // Direct bank settlement is preserved as null when unconfirmed by live bank clearing feed
        tx.merchantBankReference = null;
        if (w.resolution_status === "settled") {
          tx.state = "merchant_settlement_completed";
        } else if (w.resolution_status === "disputed") {
          tx.state = "reconciliation_exception";
        } else {
          tx.state = "merchant_settlement_pending";
        }
        transactions.push(tx);
      }
    }

    // Map B2B GST records
    if (gstRecords) {
      for (const g of gstRecords) {
        const tx = buildCommercialTransaction({
          transactionId: g.id,
          stream: "enterprise_saas_subscription",
          tenantId: g.organization_id || "enterprise-tenant",
          description: `Enterprise platform service invoice ${g.invoice_number}`,
          grossAmount: Number(g.grand_total || 0),
          isSimulated: false,
          gstRate: Number(g.gst_rate || 0.18),
        });
        if (g.reconciliation_status === "reconciled" || g.reconciliation_status === "settled") {
          tx.state = "merchant_settlement_completed";
          tx.merchantBankReference = g.bank_utr || null;
        } else {
          tx.state = "merchant_settlement_pending";
          tx.merchantBankReference = null;
        }
        transactions.push(tx);
      }
    }

    const reconciliation = reconcileSettlementLedger(transactions);

    return NextResponse.json({
      success: true,
      transactionCount: transactions.length,
      reconciliation,
      transactions,
    });
  } catch (err: any) {
    const status = err.statusCode || (err.name === "AuthError" ? 401 : 500);
    return NextResponse.json({ error: err.message }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    // State transitions require administrator privileges
    const admin = await requireAdmin();
    const body = await req.json().catch(() => ({}));

    if (body.action === "transition_state") {
      const parsed = transitionStateSchema.parse(body);
      const supabase = createAdminClient();

      // Validate bank reference: strictly reject pseudo-UTRs (e.g. "UTR-12345")
      let cleanBankRef: string | null = null;
      if (parsed.merchantBankReference) {
        if (parsed.merchantBankReference.startsWith("UTR-") || parsed.merchantBankReference.startsWith("SIM-")) {
          return NextResponse.json(
            { error: "Fabricated pseudo-UTRs are strictly rejected. Provide authentic bank reference or leave null." },
            { status: 422 }
          );
        }
        cleanBankRef = parsed.merchantBankReference.trim();
      }

      // Persist state transition to the database ledger
      if (parsed.ledgerType === "worker_wage") {
        const { data: existingRecord, error: fetchErr } = await supabase
          .from("payment_records_ledger")
          .select("*")
          .eq("id", parsed.transactionId)
          .single();

        if (fetchErr || !existingRecord) {
          return NextResponse.json({ error: "Payment record ledger entry not found." }, { status: 404 });
        }

        const newResolutionStatus =
          parsed.targetState === "merchant_settlement_completed"
            ? "settled"
            : parsed.targetState === "reconciliation_exception"
            ? "disputed"
            : "pending";

        const { data: updated, error: updateErr } = await supabase
          .from("payment_records_ledger")
          .update({
            resolution_status: newResolutionStatus,
            platform_commission_amount: 0.00, // Constitutional zero-commission permanent invariant
          })
          .eq("id", parsed.transactionId)
          .select()
          .single();

        if (updateErr) {
          return NextResponse.json({ error: updateErr.message }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          action: "state_transitioned_and_persisted",
          ledgerType: "worker_wage",
          updatedRecord: updated,
          targetState: parsed.targetState,
        });
      } else {
        // B2B GST ledger transition
        const { data: existingGst, error: fetchErr } = await supabase
          .from("financial_gst_ledger")
          .select("*")
          .eq("id", parsed.transactionId)
          .single();

        if (fetchErr || !existingGst) {
          return NextResponse.json({ error: "Financial GST ledger entry not found." }, { status: 404 });
        }

        const { data: updatedGst, error: updateErr } = await supabase
          .from("financial_gst_ledger")
          .update({
            reconciliation_status: parsed.targetState === "merchant_settlement_completed" ? "settled" : "pending",
            bank_utr: cleanBankRef,
          })
          .eq("id", parsed.transactionId)
          .select()
          .single();

        if (updateErr) {
          return NextResponse.json({ error: updateErr.message }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          action: "state_transitioned_and_persisted",
          ledgerType: "b2b_gst",
          updatedRecord: updatedGst,
          targetState: parsed.targetState,
        });
      }
    }

    // Default: Record new commercial transaction
    const input: CommercialTransactionInput = {
      stream: body.stream,
      tenantId: body.tenantId,
      description: body.description,
      grossAmount: Number(body.grossAmount),
      isSimulated: false,
      gatewayProvider: body.gatewayProvider,
      gatewayReference: body.gatewayReference,
      merchantBankReference: body.merchantBankReference || null,
      gstRate: body.gstRate,
    };

    const tx = buildCommercialTransaction(input);

    return NextResponse.json(
      {
        success: true,
        action: "transaction_validated",
        transaction: tx,
      },
      { status: 201 }
    );
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: err.errors }, { status: 422 });
    }
    const status = err.statusCode || (err.name === "AuthError" ? 403 : 400);
    return NextResponse.json({ error: err.message }, { status });
  }
}
