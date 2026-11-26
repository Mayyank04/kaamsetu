import { NextRequest } from "next/server";
import {
  getCohortParticipants,
  updateCohortParticipantConsent,
} from "@/lib/supabase/db/institutions";
import {
  requireAuthenticatedUser,
  requireInstitutionCohortOwnership,
  requireOwnedWorkerProfile,
} from "@/lib/auth/server";
import { handleApiError, createSuccessResponse } from "@/lib/error/handler";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: cohortId } = await params;
    await requireInstitutionCohortOwnership(cohortId);
    const participants = await getCohortParticipants(cohortId);

    return createSuccessResponse(participants, { cohortId });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuthenticatedUser();
    const { id: cohortId } = await params;
    const body = await request.json();

    const { workerProfileId, consent } = body;
    if (!workerProfileId) {
      return handleApiError(new Error("Worker Profile ID is required."));
    }

    if (user.role === "worker") {
      await requireOwnedWorkerProfile(workerProfileId);
    } else {
      await requireInstitutionCohortOwnership(cohortId);
    }

    await updateCohortParticipantConsent(cohortId, workerProfileId, Boolean(consent));

    return createSuccessResponse(
      { cohortId, workerProfileId, consent: Boolean(consent) },
      { message: "Institutional consent preference updated." }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
