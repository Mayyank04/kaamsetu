import { requireAdmin } from "@/lib/auth/server";
import { handleApiError } from "@/lib/error/handler";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { progressIncidentLifecycle } from "@/lib/security/incident-response-service";

export async function GET(req: NextRequest) {
  try { await requireAdmin(); } catch (authError) { return handleApiError(authError); }
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(req.url);
    const incidentId = searchParams.get("incidentId");

    let query = supabase.from("operational_incidents_lifecycle").select("*").order("created_at", { ascending: false });
    if (incidentId) {
      query = query.eq("incident_id", incidentId);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ lifecycleEvents: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try { await requireAdmin(); } catch (authError) { return handleApiError(authError); }
  try {
    const supabase = createAdminClient();
    const body = await req.json();

    const result = await progressIncidentLifecycle(supabase, {
      incidentId: body.incidentId,
      fromStage: body.fromStage,
      toStage: body.toStage,
      accountableOwnerId: body.accountableOwnerId,
      containmentSteps: body.containmentSteps,
      affectedEntities: body.affectedEntities,
      notificationRequired: body.notificationRequired,
      postIncidentReviewNotes: body.postIncidentReviewNotes,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
