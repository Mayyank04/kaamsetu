import { NextRequest } from "next/server";
import { requireWorker } from "@/lib/auth/server";
import { respondToWorkforceInvitation } from "@/lib/supabase/db/invitations";
import { handleApiError, createSuccessResponse } from "@/lib/error/handler";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireWorker();
    const { id: invitationId } = await params;
    const body = await request.json();

    const { action } = body as { action: "accept" | "reject" };
    if (!action || !["accept", "reject"].includes(action)) {
      return handleApiError(new Error("Action must be either 'accept' or 'reject'."));
    }

    const result = await respondToWorkforceInvitation({
      invitationId,
      workerUserId: user.id,
      action,
    });

    const msg =
      action === "accept"
        ? "Invitation accepted. You have joined the organization crew with self-sovereign control."
        : "Invitation declined.";

    return createSuccessResponse(result, { message: msg });
  } catch (error) {
    return handleApiError(error);
  }
}
