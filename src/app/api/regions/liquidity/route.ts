import { requireAdmin } from "@/lib/auth/server";
import { handleApiError } from "@/lib/error/handler";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { computeRegionalLiquidityDiagnostic } from "@/lib/regions/regional-liquidity-service";

export async function GET(req: NextRequest) {
  try { await requireAdmin(); } catch (authError) { return handleApiError(authError); }
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(req.url);
    const regionCode = searchParams.get("regionCode");

    let query = supabase
      .from("regional_network_liquidity_snapshots")
      .select("*")
      .order("snapshot_date", { ascending: false });

    if (regionCode) {
      query = query.eq("region_code", regionCode);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ snapshots: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try { await requireAdmin(); } catch (authError) { return handleApiError(authError); }
  try {
    const body = await req.json();
    const { regionCode, reportingWindow, supply, demand, quality, isSimulated } = body;

    if (!regionCode || !supply || !demand || !quality) {
      return NextResponse.json(
        { error: "Missing required regional metrics (regionCode, supply, demand, quality)" },
        { status: 400 }
      );
    }

    const diagnostic = computeRegionalLiquidityDiagnostic({
      regionCode,
      reportingWindow,
      supply,
      demand,
      quality,
    });

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("regional_network_liquidity_snapshots")
      .insert({
        region_code: regionCode,
        snapshot_date: new Date().toISOString().split("T")[0],
        reporting_window: diagnostic.reportingWindow,
        registered_workers: supply.registeredWorkers || 0,
        confirmed_workers: supply.confirmedWorkers || 0,
        credential_verified_workers: supply.credentialVerifiedWorkers || 0,
        recently_active_workers: supply.recentlyActiveWorkers || 0,
        available_workers: supply.availableWorkers || 0,
        interstate_mobility_workers: supply.interstateMobilityWorkers || 0,
        job_completing_workers: supply.jobCompletingWorkers || 0,
        active_contractors: demand.activeContractors || 0,
        active_customers: demand.activeCustomers || 0,
        projects_published: demand.projectsPublished || 0,
        qualified_matches: demand.qualifiedMatches || 0,
        accepted_opportunities: demand.acceptedOpportunities || 0,
        confirmed_bookings: demand.confirmedBookings || 0,
        completed_jobs: demand.completedJobs || 0,
        avg_time_to_first_match_ms: quality.avgTimeToFirstMatchMs || 0,
        avg_time_to_first_booking_ms: quality.avgTimeToFirstBookingMs || 0,
        booking_completion_rate: quality.bookingCompletionRate || 0,
        repeat_booking_rate: quality.repeatBookingRate || 0,
        opportunity_fulfilment_rate: quality.opportunityFulfilmentRate || 0,
        liquidity_status: diagnostic.liquidityStatus,
        action_recommendation: diagnostic.actionRecommendation,
        is_simulated: Boolean(isSimulated),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ snapshot: data, diagnostic }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
