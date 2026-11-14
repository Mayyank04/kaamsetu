import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { computeContractorHealthScore } from "@/lib/contractor/customer-success-service";

export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get("organizationId");

    if (!organizationId) {
      return NextResponse.json({ error: "organizationId is required" }, { status: 400 });
    }

    const { data: events, error: eventErr } = await supabase
      .from("contractor_customer_success_events")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false });

    if (eventErr) {
      return NextResponse.json({ error: eventErr.message }, { status: 500 });
    }

    const { data: org, error: orgErr } = await supabase
      .from("contractor_organizations")
      .select("*")
      .eq("id", organizationId)
      .single();

    if (orgErr && orgErr.code !== "PGRST116") {
      return NextResponse.json({ error: orgErr.message }, { status: 500 });
    }

    const health = computeContractorHealthScore({
      organizationId,
      subscriptionTier: (org?.subscription_tier as any) || "pro",
      subscriptionStatus: (org?.subscription_status as any) || "active",
      rosterUtilizationPercent: 78.5,
      activeProjectsCount: 3,
      openGrievancesCount: 0,
      daysSinceLastActive: 1,
      unresolvedSupportTicketsCount: 0,
    });

    return NextResponse.json({ organization: org, healthScore: health, events: events || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      organizationId,
      eventType,
      previousTier,
      newTier,
      healthScore,
      rosterUtilizationPercent,
      activeProjectsCount,
      churnRiskLevel,
      cancellationReason,
      supportResolutionMs,
      metadata,
    } = body;

    if (!organizationId || !eventType) {
      return NextResponse.json({ error: "organizationId and eventType are required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("contractor_customer_success_events")
      .insert({
        organization_id: organizationId,
        event_type: eventType,
        previous_tier: previousTier || null,
        new_tier: newTier || null,
        health_score: healthScore !== undefined ? healthScore : 100,
        roster_utilization_percent: rosterUtilizationPercent || 0,
        active_projects_count: activeProjectsCount || 0,
        churn_risk_level: churnRiskLevel || "low",
        cancellation_reason: cancellationReason || null,
        support_resolution_ms: supportResolutionMs || null,
        metadata: metadata || {},
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ successEvent: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
