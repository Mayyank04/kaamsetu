import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  buildEvidenceRegistryRecord,
  validateEvidenceStatusTransition,
  summarizeRegistryStatus,
  EvidenceRegistryInput,
  EvidenceCategory,
  EvidenceStatus,
  EvidenceRegistryRecord,
} from "@/lib/governance/evidence-registry-service";

export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") as EvidenceCategory | null;
    const status = searchParams.get("status") as EvidenceStatus | null;
    const claimId = searchParams.get("claimId");

    let query = supabase.from("evidence_registry_records").select("*");

    if (category) {
      query = query.eq("category", category);
    }
    if (status) {
      query = query.eq("status", status);
    }
    if (claimId) {
      query = query.eq("claim_id", claimId);
    }

    const { data, error } = await query.order("collection_timestamp", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const rows = data || [];
    const records: EvidenceRegistryRecord[] = rows.map((r) => ({
      id: r.id,
      claimId: r.claim_id,
      claimDescription: r.claim_description,
      category: r.category as EvidenceCategory,
      sourceSystem: r.source_system,
      evidenceLocation: r.evidence_location,
      evidenceSha256: r.evidence_sha256,
      collectionTimestamp: r.collection_timestamp,
      verificationTimestamp: r.verification_timestamp,
      verifierRole: r.verifier_role,
      scopeAndLimitations: r.scope_and_limitations,
      claimOwner: r.claim_owner || null,
      verifierIdentity: r.verifier_identity || null,
      verificationMethod: r.verification_method || null,
      revocationReason: r.revocation_reason || null,
      accessClassification: r.access_classification || "internal",
      expiryDate: r.expiry_date,
      status: r.status as EvidenceStatus,
      isPublicSafe: r.is_public_safe,
      redactedSummary: r.redacted_summary,
      metadata: r.metadata || {},
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));

    const summary = summarizeRegistryStatus(records);

    return NextResponse.json({
      success: true,
      count: records.length,
      records,
      summary,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = createAdminClient();

    if (body.action === "update_status") {
      const { claimId, targetStatus } = body;
      if (!claimId || !targetStatus) {
        return NextResponse.json(
          { error: "claimId and targetStatus are required for status update" },
          { status: 400 }
        );
      }

      const { data: existing, error: fetchErr } = await supabase
        .from("evidence_registry_records")
        .select("*")
        .eq("claim_id", claimId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchErr || !existing) {
        return NextResponse.json({ error: "Record not found for claimId" }, { status: 404 });
      }

      const currentStatus = existing.status as EvidenceStatus;
      const validation = validateEvidenceStatusTransition(currentStatus, targetStatus as EvidenceStatus);
      if (!validation.allowed) {
        return NextResponse.json(
          { error: validation.reason, code: "INVALID_STATUS_TRANSITION" },
          { status: 422 }
        );
      }

      const now = new Date().toISOString();
      const { data: updated, error: updateErr } = await supabase
        .from("evidence_registry_records")
        .update({
          status: targetStatus,
          verification_timestamp:
            targetStatus === "independently_verified" || targetStatus === "partner_confirmed"
              ? now
              : existing.verification_timestamp,
          updated_at: now,
        })
        .eq("id", existing.id)
        .select("*")
        .single();

      if (updateErr) {
        return NextResponse.json({ error: updateErr.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        action: "status_updated",
        record: updated,
      });
    }

    // Default: Register new evidence claim
    const input: EvidenceRegistryInput = {
      claimId: body.claimId,
      claimDescription: body.claimDescription,
      category: body.category,
      sourceSystem: body.sourceSystem,
      evidenceLocation: body.evidenceLocation,
      payloadToHash: body.payloadToHash,
      scopeAndLimitations: body.scopeAndLimitations,
      claimOwner: body.claimOwner,
      verifierIdentity: body.verifierIdentity,
      verificationMethod: body.verificationMethod,
      revocationReason: body.revocationReason,
      accessClassification: body.accessClassification,
      expiryDate: body.expiryDate,
      verifierRole: body.verifierRole,
      status: body.status,
      isPublicSafe: body.isPublicSafe,
      redactedSummary: body.redactedSummary,
      metadata: body.metadata,
    };

    const record = buildEvidenceRegistryRecord(input);

    const { error: insertError } = await supabase.from("evidence_registry_records").insert({
      id: record.id,
      claim_id: record.claimId,
      claim_description: record.claimDescription,
      category: record.category,
      source_system: record.sourceSystem,
      evidence_location: record.evidenceLocation,
      evidence_sha256: record.evidenceSha256,
      collection_timestamp: record.collectionTimestamp,
      verification_timestamp: record.verificationTimestamp,
      verifier_role: record.verifierRole,
      scope_and_limitations: record.scopeAndLimitations,
      claim_owner: record.claimOwner,
      verifier_identity: record.verifierIdentity,
      verification_method: record.verificationMethod,
      revocation_reason: record.revocationReason,
      access_classification: record.accessClassification,
      expiry_date: record.expiryDate,
      status: record.status,
      is_public_safe: record.isPublicSafe,
      redacted_summary: record.redactedSummary,
      metadata: record.metadata,
      created_at: record.createdAt,
      updated_at: record.updatedAt,
    });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        success: true,
        action: "registered",
        record,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
