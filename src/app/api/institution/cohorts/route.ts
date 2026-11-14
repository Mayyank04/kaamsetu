import { NextRequest } from "next/server";
import { getInstitutions, getInstitutionCohorts } from "@/lib/supabase/db/institutions";
import { handleApiError, createSuccessResponse } from "@/lib/error/handler";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const institutionId = searchParams.get("institutionId");

    if (institutionId) {
      const cohorts = await getInstitutionCohorts(institutionId);
      return createSuccessResponse(cohorts);
    }

    // Default to first active institution's cohorts
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
