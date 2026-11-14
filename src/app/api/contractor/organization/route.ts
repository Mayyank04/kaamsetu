import { NextRequest } from "next/server";
import { requireContractor } from "@/lib/auth/server";
import {
  getContractorDashboardData,
  createContractorOrganization,
} from "@/lib/supabase/db/contractors";
import { handleApiError, createSuccessResponse } from "@/lib/error/handler";

export async function GET(request: NextRequest) {
  try {
    const user = await requireContractor();
    const dashboardData = await getContractorDashboardData(user.id);

    return createSuccessResponse(dashboardData, {
      userId: user.id,
      role: user.role,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireContractor();
    const body = await request.json();

    const { companyName, gstin, businessType, operatingCity, operatingState } = body;
    if (!companyName || !operatingCity) {
      return handleApiError(new Error("Company name and operating city are required."));
    }

    const org = await createContractorOrganization({
      owner_id: user.id,
      company_name: companyName,
      gstin: gstin || null,
      business_type: businessType || "proprietorship",
      operating_city: operatingCity,
      operating_state: operatingState || "Assam",
      subscription_tier: "starter",
    });

    return createSuccessResponse(org, {
      message: "Contractor organization registered successfully.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
