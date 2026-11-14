import { NextRequest } from "next/server";
import { requireInstitution } from "@/lib/auth/server";
import { logTraineeProgress, logInstitutionAction } from "@/lib/supabase/db/institutional-ops";
import { handleApiError, createSuccessResponse } from "@/lib/error/handler";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireInstitution();
    const { id: cohortId } = await params;
    const body = await request.json();

    const {
      participantId,
      moduleName,
      hoursAttended,
      assessmentScore,
      practicalVerified,
      evaluatorName,
      placementStatus,
      employerOrContractorName,
      monthlyWage,
    } = body;

    if (!participantId || !moduleName) {
      return handleApiError(
        new Error("Participant ID and module name are required.")
      );
    }

    const progress = await logTraineeProgress({
      participantId,
      moduleName,
      hoursAttended: Number(hoursAttended || 0),
      assessmentScore: assessmentScore ? Number(assessmentScore) : undefined,
      practicalVerified: Boolean(practicalVerified),
      evaluatorName,
      placementStatus,
      employerOrContractorName,
      monthlyWage: monthlyWage ? Number(monthlyWage) : undefined,
    });

    // Record institutional audit trail
    await logInstitutionAction({
      institutionId: "inst-asdm-001",
      actorId: user.id,
      action: "LOG_TRAINEE_PROGRESS",
      targetType: "cohort_participant",
      targetId: participantId,
      details: { cohortId, moduleName, placementStatus },
    });

    return createSuccessResponse(progress, {
      message: "Trainee module progress and placement record updated.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
