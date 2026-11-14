import { NextRequest } from "next/server";
import { requireWorker } from "@/lib/auth/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { handleApiError, createSuccessResponse } from "@/lib/error/handler";
import { evaluateOpportunityMatch } from "@/lib/opportunity/matching";

export async function GET() {
  try {
    const user = await requireWorker();
    const supabase = await createServerSupabaseClient();

    // Fetch worker profile and skills
    const { data: wp, error: wpError } = await supabase
      .from("worker_profiles")
      .select("*, occupations(*)")
      .eq("user_id", user.id)
      .single();

    if (wpError || !wp) {
      return handleApiError(new Error("Worker profile not found"));
    }

    const { data: skills } = await supabase
      .from("worker_skills")
      .select("*, skills(*)")
      .eq("worker_profile_id", wp.id);

    const workerSkills = (skills || []).map((s: any) => s.skills?.name_en || "");

    // Fetch open opportunities
    const { data: opps, error: oppsError } = await supabase
      .from("workforce_opportunities")
      .select("*, operational_regions(*)")
      .in("status", ["open", "matching"])
      .order("created_at", { ascending: false })
      .limit(20);

    if (oppsError) {
      throw oppsError;
    }

    const candidate = {
      id: wp.id,
      primaryTrade: (wp.occupations as any)?.title_en || "General Craftsperson",
      skills: workerSkills,
      operatingDistrict: wp.operating_city || "Kamrup Metropolitan",
      availability: (wp.availability_status as any) || "available",
      kaamscore: wp.kaamscore || 650,
      experienceYears: wp.experience_years,
    };

    const opportunitiesWithMatches = (opps || []).map((opp) => {
      const evaluation = evaluateOpportunityMatch(
        {
          id: opp.id,
          title: opp.title,
          tradeCategory: opp.trade_category,
          requiredSkills: opp.required_skills || [],
          locationDistrict: opp.location_district,
          locationPincode: opp.location_pincode,
          dailyWageMin: opp.daily_wage_range_min,
          dailyWageMax: opp.daily_wage_range_max,
        },
        candidate
      );

      return {
        ...opp,
        matchScore: evaluation.matchScore,
        isRecommended: evaluation.isRecommended,
        matchReasons: evaluation.matchReasons,
        missingSkills: evaluation.missingSkills,
      };
    });

    // Sort by match score descending
    opportunitiesWithMatches.sort((a, b) => b.matchScore - a.matchScore);

    return createSuccessResponse({
      opportunities: opportunitiesWithMatches,
    });
  } catch (err: any) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireWorker();
    const body = await req.json();
    const opportunityId = body.opportunityId;

    if (!opportunityId) {
      return handleApiError(new Error("Opportunity ID is required"));
    }

    const supabase = await createServerSupabaseClient();
    const { data: wp } = await supabase
      .from("worker_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!wp) {
      return handleApiError(new Error("Worker profile not found"));
    }

    // Apply with explicit worker consent
    const { data, error } = await supabase
      .from("worker_opportunity_applications")
      .insert({
        opportunity_id: opportunityId,
        worker_profile_id: wp.id,
        match_score: body.matchScore || 75.0,
        match_explanation: body.matchExplanation || {},
        status: "applied",
        worker_consent_given: true,
        applied_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return createSuccessResponse({ application: data });
  } catch (err: any) {
    return handleApiError(err);
  }
}
