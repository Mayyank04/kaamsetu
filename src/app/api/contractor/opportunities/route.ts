import { NextRequest } from "next/server";
import { requireContractor } from "@/lib/auth/server";
import { getContractorOrganization } from "@/lib/supabase/db/contractors";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { handleApiError, createSuccessResponse } from "@/lib/error/handler";

export async function GET() {
  try {
    const user = await requireContractor();
    const org = await getContractorOrganization(user.id);
    if (!org) {
      return createSuccessResponse({ opportunities: [] });
    }

    const supabase = await createServerSupabaseClient();
    const { data: opps, error } = await supabase
      .from("workforce_opportunities")
      .select("*, worker_opportunity_applications(*, worker_profiles(*, profiles(*)))")
      .eq("organization_id", org.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return createSuccessResponse({ opportunities: opps || [] });
  } catch (err: any) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireContractor();
    const org = await getContractorOrganization(user.id);
    if (!org) {
      return handleApiError(new Error("Contractor organization required"));
    }

    const body = await req.json();
    const {
      regionId,
      title,
      tradeCategory,
      requiredSkills,
      locationDistrict,
      locationPincode,
      expectedDurationDays,
      dailyWageMin,
      dailyWageMax,
      paymentTerms,
    } = body;

    if (!regionId || !title || !tradeCategory || !locationDistrict) {
      return handleApiError(
        new Error("Region ID, Title, Trade Category, and Location District are required.")
      );
    }

    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("workforce_opportunities")
      .insert({
        organization_id: org.id,
        region_id: regionId,
        title,
        trade_category: tradeCategory,
        required_skills: requiredSkills || [],
        location_district: locationDistrict,
        location_pincode: locationPincode || null,
        expected_duration_days: expectedDurationDays || 7,
        daily_wage_range_min: dailyWageMin || null,
        daily_wage_range_max: dailyWageMax || null,
        payment_terms: paymentTerms || "Direct weekly transfer by contractor",
        status: "open",
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return createSuccessResponse({ opportunity: data });
  } catch (err: any) {
    return handleApiError(err);
  }
}
