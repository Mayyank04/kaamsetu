import { NextRequest } from "next/server";
import { getWorkerDashboardData } from "@/lib/supabase/db/dashboard";
import { handleApiError, createSuccessResponse } from "@/lib/error/handler";
import { requireWorker } from "@/lib/auth/server";

export async function GET(request: NextRequest) {
  try {
    const user = await requireWorker();

    // Securely retrieve dashboard data strictly for the verified authenticated worker
    const data = await getWorkerDashboardData(user.slug || undefined);

    return createSuccessResponse(data, {
      workerId: user.id,
      isDemo: user.isDemo,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
