import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateEventProvenanceHash } from "@/lib/analytics/data-governance-service";

export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(req.url);
    const entityType = searchParams.get("entityType");
    const regionCode = searchParams.get("regionCode");

    let query = supabase
      .from("analytics_provenance_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (entityType) {
      query = query.eq("entity_type", entityType);
    }
    if (regionCode) {
      query = query.eq("region_code", regionCode);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ provenanceEvents: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      eventName,
      entityType,
      entityId,
      regionCode,
      isSimulated,
      modelVersion,
      promptVersion,
      extractionConfidence,
      workerConfirmed,
      workerCorrected,
      metadata,
    } = body;

    if (!eventName || !entityType || !entityId || !regionCode) {
      return NextResponse.json(
        { error: "Missing required parameters (eventName, entityType, entityId, regionCode)" },
        { status: 400 }
      );
    }

    const payloadHash = generateEventProvenanceHash({
      eventName,
      entityType,
      entityId,
      regionCode,
      isSimulated,
    });

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("analytics_provenance_events")
      .insert({
        event_name: eventName,
        entity_type: entityType,
        entity_id: entityId,
        region_code: regionCode,
        is_simulated: Boolean(isSimulated),
        model_version: modelVersion || null,
        prompt_version: promptVersion || null,
        extraction_confidence: extractionConfidence || null,
        worker_confirmed: workerConfirmed !== undefined ? workerConfirmed : null,
        worker_corrected: workerCorrected !== undefined ? workerCorrected : null,
        payload_hash: payloadHash,
        metadata: metadata || {},
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ provenanceEvent: data, payloadHash }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
