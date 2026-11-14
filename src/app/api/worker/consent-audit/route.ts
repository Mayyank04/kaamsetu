import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { recordWorkerConsentAudit, getWorkerPrivacyExplanation } from "@/lib/worker/worker-trust-service";

export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(req.url);
    const workerProfileId = searchParams.get("workerProfileId");
    const lang = (searchParams.get("lang") as "en" | "hi" | "as") || "en";

    const explanation = getWorkerPrivacyExplanation(lang);

    let auditEvents: any[] = [];
    if (workerProfileId) {
      const { data, error } = await supabase
        .from("worker_consent_audit_events")
        .select("*")
        .eq("worker_profile_id", workerProfileId)
        .order("created_at", { ascending: false });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      auditEvents = data || [];
    }

    return NextResponse.json({
      privacyExplanation: explanation,
      consentHistory: auditEvents,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const body = await req.json();

    const result = await recordWorkerConsentAudit(supabase, {
      workerProfileId: body.workerProfileId,
      recipientEntityType: body.recipientEntityType,
      recipientEntityId: body.recipientEntityId,
      action: body.action,
      disclosedFields: body.disclosedFields || [],
      policyVersion: body.policyVersion,
      actorId: body.actorId,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
