import { NextRequest, NextResponse } from "next/server";
import { getWorkerDashboardData } from "@/lib/supabase/db/dashboard";
import { handleApiError, createSuccessResponse } from "@/lib/error/handler";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug") || undefined;

    const data = await getWorkerDashboardData(slug);
    return createSuccessResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}
