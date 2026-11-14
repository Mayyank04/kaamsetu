import { NextRequest } from "next/server";
import { requireContractor } from "@/lib/auth/server";
import {
  getContractorOrganization,
  getContractorWorkforce,
  addWorkerToWorkforce,
  removeWorkerFromWorkforce,
} from "@/lib/supabase/db/contractors";
import { handleApiError, createSuccessResponse } from "@/lib/error/handler";

export async function GET(request: NextRequest) {
  try {
    const user = await requireContractor();
    const org = await getContractorOrganization(user.id);
    if (!org) {
      return createSuccessResponse([], { message: "No contractor organization found." });
    }

    const workforce = await getContractorWorkforce(org.id);
    return createSuccessResponse(workforce);
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
    const { workerProfileId, projectRole, dailyWageRate } = body;

    if (!workerProfileId) {
      return handleApiError(new Error("Worker Profile ID is required."));
    }

    const member = await addWorkerToWorkforce(
      org.id,
      workerProfileId,
      projectRole || "Crew Member",
      dailyWageRate ? Number(dailyWageRate) : undefined
    );

    return createSuccessResponse(member, {
      message: "Worker successfully added to organization workforce roster.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireContractor();
    const org = await getContractorOrganization(user.id);
    if (!org) {
      return handleApiError(new Error("No contractor organization found."));
    }

    const { searchParams } = new URL(request.url);
    const workerProfileId = searchParams.get("workerProfileId");
    if (!workerProfileId) {
      return handleApiError(new Error("Worker Profile ID parameter is required."));
    }

    await removeWorkerFromWorkforce(org.id, workerProfileId);
    return createSuccessResponse({ success: true }, {
      message: "Worker removed from organization workforce roster.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
