import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  buildCommercialTransaction,
  transitionSettlementState,
  reconcileSettlementLedger,
  CommercialTransactionInput,
  SettlementState,
  CommercialTransactionRecord,
} from "@/lib/governance/commercial-settlement-service";

export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient();

    // Query both payment_records_ledger (worker wages) and financial_gst_ledger (B2B SaaS)
    const { data: wageRecords } = await supabase.from("payment_records_ledger").select("*");
    const { data: gstRecords } = await supabase.from("financial_gst_ledger").select("*");

    const transactions: CommercialTransactionRecord[] = [];

    // Map wage records (0.00% commission invariant)
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
          tx.merchantBankReference = `UTR-${g.id.slice(0, 8).toUpperCase()}`;
        } else {
          tx.state = "merchant_settlement_pending";
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
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.action === "transition_state") {
      const { transaction, targetState, merchantBankReference, notes } = body;
      if (!transaction || !targetState) {
        return NextResponse.json(
          { error: "transaction and targetState are required for transition" },
          { status: 400 }
        );
      }

      const result = transitionSettlementState({
        transaction,
        targetState: targetState as SettlementState,
        merchantBankReference,
        notes,
      });

      if (!result.allowed) {
        return NextResponse.json(
          { error: result.reason, code: "INVALID_SETTLEMENT_TRANSITION" },
          { status: 422 }
        );
      }

      return NextResponse.json({
        success: true,
        action: "state_transitioned",
        transaction: result.updatedTransaction,
      });
    }

    // Default: Build & validate new transaction
    const input: CommercialTransactionInput = {
      stream: body.stream,
      tenantId: body.tenantId,
      description: body.description,
      grossAmount: Number(body.grossAmount),
      isSimulated: body.isSimulated ?? false,
      gatewayProvider: body.gatewayProvider,
      gatewayReference: body.gatewayReference,
      merchantBankReference: body.merchantBankReference,
      gstRate: body.gstRate,
    };

    const tx = buildCommercialTransaction(input);

    return NextResponse.json(
      {
        success: true,
        action: "transaction_recorded",
        transaction: tx,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
