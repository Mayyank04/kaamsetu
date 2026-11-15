import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  processAttestationSubmission,
  revokeAttestation,
  AttestationSubmissionInput,
} from "@/lib/governance/attestation-workflow-service";
import { AuthorizedVerifierRole, EvidenceCategory, EvidenceStatus } from "@/lib/governance/evidence-registry-service";

export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(req.url);
    const claimId = searchParams.get("claimId");
    const actorRole = searchParams.get("actorRole");

    let query = supabase.from("evidence_attestation_events").select("*");

    if (claimId) {
      query = query.eq("claim_id", claimId);
    }
    if (actorRole) {
      query = query.eq("actor_role", actorRole);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      count: data?.length || 0,
      events: data || [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = createAdminClient();

    if (body.action === "revoke") {
      const { claimId, revokedBy, revokerRole, reason } = body;
      if (!claimId || !revokedBy || !reason) {
        return NextResponse.json(
          { error: "claimId, revokedBy, and reason are required for revocation" },
          { status: 400 }
        );
      }

      const revocationResult = revokeAttestation({
        claimId,
        revokedBy,
        revokerRole: (revokerRole as AuthorizedVerifierRole) || "independent_auditor",
        reason,
      });

      // Insert audit event
      await supabase.from("evidence_attestation_events").insert({
        id: "att-" + Math.random().toString(36).substring(2, 10),
        claim_id: revocationResult.revocationEvent.claimId,
        attestation_type: revocationResult.revocationEvent.attestationType,
        actor_id: revocationResult.revocationEvent.actorId,
        actor_role: revocationResult.revocationEvent.actorRole,
        methodology: "attestation_revocation",
        reviewed_artifacts: [],
        scope_and_limitations: "Post-verification invalidation event",
        signature_digest: revocationResult.revocationEvent.signatureDigest,
        dual_approved_by: null,
        notes: revocationResult.revocationEvent.notes,
        created_at: revocationResult.revocationEvent.timestamp,
      });

      // Update evidence record
      await supabase
        .from("evidence_registry_records")
        .update({
          status: "revoked",
          revocation_reason: reason,
          updated_at: new Date().toISOString(),
        })
        .eq("claim_id", claimId);

      return NextResponse.json({
        success: true,
        action: "revoked",
        result: revocationResult,
      });
    }

    // Default: Attestation submission
    const input: AttestationSubmissionInput = {
      claimId: body.claimId,
      category: body.category as EvidenceCategory,
      claimOwner: body.claimOwner,
      verifierIdentity: body.verifierIdentity,
      verifierRole: body.verifierRole as AuthorizedVerifierRole,
      methodology: body.methodology || "cryptographic_audit_and_external_attestation",
      reviewedArtifacts: body.reviewedArtifacts || [],
      scopeAndLimitations: body.scopeAndLimitations || "Limited to provided cryptographic proof and credentials",
      notes: body.notes,
      dualApprovedBy: body.dualApprovedBy,
    };

    // Fetch existing status
    const { data: existing } = await supabase
      .from("evidence_registry_records")
      .select("status, claim_owner")
      .eq("claim_id", input.claimId)
      .limit(1)
      .maybeSingle();

    const currentStatus: EvidenceStatus = (existing?.status as EvidenceStatus) || "system_observed";
    if (existing?.claim_owner) {
      input.claimOwner = existing.claim_owner;
    }

    const decision = processAttestationSubmission(input, currentStatus);

    if (!decision.allowed) {
      // Record rejection/clarification event in audit trail
      await supabase.from("evidence_attestation_events").insert({
        id: "att-" + Math.random().toString(36).substring(2, 10),
        claim_id: decision.event.claimId,
        attestation_type: decision.event.attestationType,
        actor_id: decision.event.actorId,
        actor_role: decision.event.actorRole,
        methodology: decision.event.methodology,
        reviewed_artifacts: decision.event.reviewedArtifacts,
        scope_and_limitations: decision.event.scopeAndLimitations,
        signature_digest: decision.event.signatureDigest,
        dual_approved_by: decision.event.dualApprovedBy,
        notes: decision.event.notes,
        created_at: decision.event.timestamp,
      });

      return NextResponse.json(
        {
          success: false,
          reason: decision.rejectionReason,
          requiresDualApproval: decision.requiresDualApproval,
        },
        { status: 422 }
      );
    }

    // Insert approved attestation event
    await supabase.from("evidence_attestation_events").insert({
      id: "att-" + Math.random().toString(36).substring(2, 10),
      claim_id: decision.event.claimId,
      attestation_type: decision.event.attestationType,
      actor_id: decision.event.actorId,
      actor_role: decision.event.actorRole,
      methodology: decision.event.methodology,
      reviewed_artifacts: decision.event.reviewedArtifacts,
      scope_and_limitations: decision.event.scopeAndLimitations,
      signature_digest: decision.event.signatureDigest,
      dual_approved_by: decision.event.dualApprovedBy,
      notes: decision.event.notes,
      created_at: decision.event.timestamp,
    });

    // Update evidence registry record status
    await supabase
      .from("evidence_registry_records")
      .update({
        status: decision.targetStatus,
        verifier_identity: input.verifierIdentity,
        verifier_role: input.verifierRole,
        verification_method: input.methodology,
        verification_timestamp: decision.event.timestamp,
        updated_at: decision.event.timestamp,
      })
      .eq("claim_id", input.claimId);

    return NextResponse.json(
      {
        success: true,
        action: "attested",
        targetStatus: decision.targetStatus,
        event: decision.event,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
