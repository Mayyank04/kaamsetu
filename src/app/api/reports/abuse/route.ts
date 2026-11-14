import { NextRequest } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth/server";
import { submitAbuseReport } from "@/lib/supabase/db/institutions";
import { handleApiError, createSuccessResponse } from "@/lib/error/handler";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();
    const body = await request.json();

    const { targetType, targetId, reason, details } = body;
    if (!targetType || !targetId || !reason) {
      return handleApiError(
        new Error("Target Type, Target ID, and Reason are required.")
      );
    }

    if (!["worker_profile", "review", "booking", "contractor"].includes(targetType)) {
      return handleApiError(new Error("Invalid target type for abuse report."));
    }

    const report = await submitAbuseReport(user.id, {
      targetType,
      targetId,
      reason,
      details,
    });

    return createSuccessResponse(report, {
      message: "Abuse report submitted successfully. Our trust & safety team will review it within 24 hours.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
