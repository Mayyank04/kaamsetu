import { NextRequest } from "next/server";
import { requireWorker } from "@/lib/auth/server";
import { submitProfileCorrection } from "@/lib/supabase/db/institutions";
import { handleApiError, createSuccessResponse } from "@/lib/error/handler";

export async function POST(request: NextRequest) {
  try {
    const user = await requireWorker();
    const body = await request.json();

    const { workerProfileId, fieldName, correctionReason } = body;
    if (!fieldName || !correctionReason) {
      return handleApiError(
        new Error("Field name and correction reason are required.")
      );
    }

    const targetProfileId = workerProfileId || user.workerProfileId || "55555555-5555-5555-5555-555555550001";

    const correction = await submitProfileCorrection(targetProfileId, user.id, {
      fieldName,
      correctionReason,
    });

    return createSuccessResponse(correction, {
      message: "Profile correction request submitted under DPDP Act right-to-rectification.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
