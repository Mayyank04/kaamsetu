import { NextRequest } from "next/server";
import { requireWorker } from "@/lib/auth/server";
import { getWorkerPendingInvitations } from "@/lib/supabase/db/invitations";
import { handleApiError, createSuccessResponse } from "@/lib/error/handler";

export async function GET(request: NextRequest) {
  try {
    const user = await requireWorker();
    const workerProfileId = user.workerProfileId || "55555555-5555-5555-5555-555555550001";

    const invitations = await getWorkerPendingInvitations(workerProfileId);
    return createSuccessResponse(invitations);
  } catch (error) {
    return handleApiError(error);
  }
}
