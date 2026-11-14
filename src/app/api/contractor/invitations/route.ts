import { NextRequest } from "next/server";
import { requireContractor } from "@/lib/auth/server";
import { getContractorOrganization } from "@/lib/supabase/db/contractors";
import {
  createWorkforceInvitation,
  getOrganizationInvitations,
} from "@/lib/supabase/db/invitations";
import { handleApiError, createSuccessResponse } from "@/lib/error/handler";

export async function GET(request: NextRequest) {
  try {
    const user = await requireContractor();
    const org = await getContractorOrganization(user.id);
    if (!org) {
      return createSuccessResponse([]);
    }

    const invitations = await getOrganizationInvitations(org.id);
    return createSuccessResponse(invitations);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireContractor();
    const org = await getContractorOrganization(user.id);
    if (!org) {
      return handleApiError(new Error("You must create a contractor organization first."));
    }

    const body = await request.json();
    const { workerProfileId, proposedRole, proposedDailyWage, message } = body;

    if (!workerProfileId) {
      return handleApiError(new Error("Worker Profile ID is required to send an invitation."));
    }

    const invitation = await createWorkforceInvitation({
      organizationId: org.id,
      workerProfileId,
      invitedBy: user.id,
      proposedRole,
      proposedDailyWage: proposedDailyWage ? Number(proposedDailyWage) : undefined,
      message,
    });

    return createSuccessResponse(invitation, {
      message: "Workforce invitation sent to worker. Worker must accept before joining your roster.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
