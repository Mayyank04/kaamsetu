import { NextRequest } from "next/server";
import { getInstitutions, getInstitutionCohorts } from "@/lib/supabase/db/institutions";
import { requireInstitution } from "@/lib/auth/server";
import { handleApiError, createSuccessResponse } from "@/lib/error/handler";

export async function GET(request: NextRequest) {
  try {
    const user = await requireInstitution();
    const { searchParams } = new URL(request.url);
    const requestedInstitutionId = searchParams.get("institutionId");
    const targetInstitutionId =
      user.role === "admin" && requestedInstitutionId
        ? requestedInstitutionId
        : user.institutionId;

    if (targetInstitutionId) {
      const cohorts = await getInstitutionCohorts(targetInstitutionId);
      return createSuccessResponse(cohorts, { institutionId: targetInstitutionId });
    }

    const institutions = await getInstitutions();
    const targetId = institutions[0]?.id || "inst-asdm-001";
    const cohorts = await getInstitutionCohorts(targetId);

    return createSuccessResponse(cohorts, {
      institutionId: targetId,
      institutionName: institutions[0]?.name,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
