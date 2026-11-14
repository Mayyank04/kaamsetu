import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isConfigured } from "@/lib/env";
import {
  reportRegionalIncident,
  resolveRegionalIncident,
  suspendRegionWorkflow,
  evaluateRegionalActivationGate,
} from "@/lib/regions/regional-operations-service";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const regionCode = searchParams.get("regionCode") || "IN-AS-KMP-METRO";

  if (!isConfigured.supabase) {
    const gate = evaluateRegionalActivationGate(regionCode, 0, true, true);
    return NextResponse.json({
      success: true,
      regionCode,
      activationGate: gate,
      activeIncidents: [],
      milestonesCompleted: 10,
      totalMilestones: 12,
    });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const { data: region } = await supabase
    .from("operational_regions")
    .select("id, region_code, status, active_incident_count, readiness_score")
    .eq("region_code", regionCode)
    .single();

  if (!region) {
    return NextResponse.json({ error: "Region not found" }, { status: 404 });
  }

  const { data: incidents } = await supabase
    .from("regional_operational_incidents")
    .select("*")
    .eq("region_id", region.id)
    .in("status", ["open", "investigating"]);

  const gate = evaluateRegionalActivationGate(
    regionCode,
    incidents?.length || 0,
    true,
    true
  );

  return NextResponse.json({
    success: true,
    region,
    activationGate: gate,
    activeIncidents: incidents || [],
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.regionId || !body.title || !body.incidentType || !body.details) {
      return NextResponse.json(
        { error: "Missing required fields: regionId, title, incidentType, details" },
        { status: 400 }
      );
    }

    const incident = await reportRegionalIncident({
      regionId: body.regionId,
      title: body.title,
      incidentType: body.incidentType,
      severity: body.severity || "medium",
      details: body.details,
      reportedBy: body.reportedBy,
    });

    return NextResponse.json({ success: true, incident }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.action === "suspend") {
      if (!body.regionId || !body.reason || !body.actorId) {
        return NextResponse.json(
          { error: "Missing required fields: regionId, reason, actorId" },
          { status: 400 }
        );
      }

      const result = await suspendRegionWorkflow({
        regionId: body.regionId,
        reason: body.reason,
        actorId: body.actorId,
      });

      return NextResponse.json({ success: true, result });
    }

    if (body.action === "resolve_incident") {
      if (!body.incidentId || !body.resolvedBy || !body.resolutionNotes) {
        return NextResponse.json(
          { error: "Missing required fields: incidentId, resolvedBy, resolutionNotes" },
          { status: 400 }
        );
      }

      const result = await resolveRegionalIncident(
        body.incidentId,
        body.resolvedBy,
        body.resolutionNotes
      );

      return NextResponse.json({ success: true, result });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
