import { NextRequest } from "next/server";
import { requireWorker } from "@/lib/auth/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { handleApiError, createSuccessResponse } from "@/lib/error/handler";
import {
  fileWorkerDispute,
  getDisputesForWorker,
  DisputeType,
} from "@/lib/disputes/dispute-service";

export async function GET() {
  try {
    const user = await requireWorker();
    const supabase = await createServerSupabaseClient();

    const { data: wp } = await supabase
      .from("worker_profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!wp) {
      return createSuccessResponse({ disputes: [] });
    }

    const disputes = await getDisputesForWorker(wp.id);
    return createSuccessResponse({ disputes });
  } catch (err: any) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireWorker();
    const body = await req.json();

    const supabase = await createServerSupabaseClient();
    const { data: wp } = await supabase
      .from("worker_profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!wp) {
      return handleApiError(new Error("Worker profile not found"));
    }

    const dispute = await fileWorkerDispute({
      workerProfileId: wp.id,
      disputeType: body.disputeType as DisputeType,
      counterpartyName: body.counterpartyName,
      targetId: body.targetId || null,
      evidenceNotes: body.evidenceNotes,
      claimedAmount: body.claimedAmount ? Number(body.claimedAmount) : null,
    });

    return createSuccessResponse({
      dispute,
      message: "Dispute submitted successfully to sovereign worker trust ledger",
    });
  } catch (err: any) {
    return handleApiError(err);
  }
}
