import { NextRequest } from "next/server";
import {
  getInstitutions,
  getInstitutionalAggregateMetrics,
} from "@/lib/supabase/db/institutions";
import { requireInstitution } from "@/lib/auth/server";
import { handleApiError, createSuccessResponse } from "@/lib/error/handler";

export async function GET(request: NextRequest) {
  try {
    await requireInstitution();
    const { searchParams } = new URL(request.url);
    const district = searchParams.get("district") || undefined;
    const status = searchParams.get("status") || undefined;

    const [institutions, aggregateMetrics] = await Promise.all([
      getInstitutions(district, status),
      getInstitutionalAggregateMetrics(),
    ]);

    return createSuccessResponse({
      institutions,
      aggregateMetrics,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
