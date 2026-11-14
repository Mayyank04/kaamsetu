import { NextRequest } from "next/server";
import { requireAuthenticatedUser, requireWorker } from "@/lib/auth/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { handleApiError, createSuccessResponse } from "@/lib/error/handler";
import {
  recordPaymentSettlement,
  getWorkerPaymentHistory,
} from "@/lib/billing/payment-transparency-service";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();
    const supabase = await createServerSupabaseClient();

    let targetWorkerProfileId = req.nextUrl.searchParams.get("workerProfileId");

    if (user.role === "worker") {
      const { data: wp } = await supabase
        .from("worker_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!wp) return createSuccessResponse({ records: [] });
      targetWorkerProfileId = wp.id;
    }

    if (!targetWorkerProfileId) {
      return handleApiError(new Error("workerProfileId is required"));
    }

    const records = await getWorkerPaymentHistory(targetWorkerProfileId);
    return createSuccessResponse({ records });
  } catch (err: any) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAuthenticatedUser();
    const body = await req.json();

    const record = await recordPaymentSettlement({
      bookingId: body.bookingId || null,
      opportunityId: body.opportunityId || null,
      workerProfileId: body.workerProfileId,
      employerDeclaredAmount: Number(body.employerDeclaredAmount),
      workerAgreedAmount: Number(body.workerAgreedAmount),
      amountInvoiced: Number(body.amountInvoiced),
      amountPaid: Number(body.amountPaid),
      platformCommissionAmount: body.platformCommissionAmount !== undefined ? Number(body.platformCommissionAmount) : 0.00,
      paymentDate: body.paymentDate,
      paymentEvidenceRef: body.paymentEvidenceRef || null,
    });

    return createSuccessResponse({
      record,
      message: "Payment provenance record anchored to sovereign ledger with 0% commission",
    });
  } catch (err: any) {
    return handleApiError(err);
  }
}
