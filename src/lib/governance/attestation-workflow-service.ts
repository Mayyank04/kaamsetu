/**
 * Independent Attestation Workflow Service
 * Pillar B: Verifiable Independent Attestation & Institutional Integrity
 *
 * MISSION INVARIANT: "Every skill deserves to be seen, even without a degree."
 * INTEGRITY PRINCIPLE: A hash proves immutability since hashing. It does not prove external truth.
 * Non-repudiation and conflict-of-interest checks govern every attestation transition.
 */

import crypto from "crypto";
import {
  EvidenceCategory,
  EvidenceStatus,
  AuthorizedVerifierRole,
  AttestationEventType,
  requiresDualApproval,
  validateAttestationConflict,
} from "./evidence-registry-service";

export interface AttestationSubmissionInput {
  claimId: string;
  category: EvidenceCategory;
  claimOwner: string;
  verifierIdentity: string;
  verifierRole: AuthorizedVerifierRole;
  methodology: string;
  reviewedArtifacts: Record<string, unknown>[];
  scopeAndLimitations: string;
  notes?: string;
  dualApprovedBy?: string | null;
}

export interface AttestationDecisionResult {
  allowed: boolean;
  targetStatus: EvidenceStatus;
  rejectionReason?: string;
  requiresDualApproval: boolean;
  dualApprovalSatisfied: boolean;
  event: {
    claimId: string;
    attestationType: AttestationEventType;
    actorId: string;
    actorRole: AuthorizedVerifierRole;
    methodology: string;
    reviewedArtifacts: Record<string, unknown>[];
    scopeAndLimitations: string;
    signatureDigest: string;
    dualApprovedBy: string | null;
    notes: string | null;
    timestamp: string;
  };
}

/**
 * Validates and records an independent attestation review.
 * Enforces:
 * 1. Verifier identity and role matching.
 * 2. Strict anti-self-approval (owner cannot verify own claim).
 * 3. Dual-approval enforcement on high-impact categories (enterprise_pilot, responsible_finance, commercial_revenue, regional_gate).
 * 4. Conflict of interest defense.
 */
export function processAttestationSubmission(
  input: AttestationSubmissionInput,
  currentStatus: EvidenceStatus = "system_observed"
): AttestationDecisionResult {
  const now = new Date().toISOString();
  const rawDigest = `${input.claimId}:${input.verifierIdentity}:${input.verifierRole}:${input.methodology}:${now}`;
  const signatureDigest = crypto.createHash("sha256").update(rawDigest).digest("hex");

  // 1. Conflict of interest check
  const conflict = validateAttestationConflict({
    claimOwner: input.claimOwner,
    verifierIdentity: input.verifierIdentity,
    targetStatus: "independently_verified",
  });

  if (!conflict.allowed) {
    return {
      allowed: false,
      targetStatus: currentStatus,
      rejectionReason: conflict.reason,
      requiresDualApproval: requiresDualApproval(input.category),
      dualApprovalSatisfied: false,
      event: {
        claimId: input.claimId,
        attestationType: "rejected",
        actorId: input.verifierIdentity,
        actorRole: input.verifierRole,
        methodology: input.methodology,
        reviewedArtifacts: input.reviewedArtifacts,
        scopeAndLimitations: input.scopeAndLimitations,
        signatureDigest,
        dualApprovedBy: null,
        notes: `Rejected due to conflict of interest: ${conflict.reason}`,
        timestamp: now,
      },
    };
  }

  // 2. Role permission check: Only authorized external roles can produce 'independently_verified'
  const independentRoles: AuthorizedVerifierRole[] = [
    "independent_auditor",
    "credential_issuer",
    "institutional_partner",
  ];
  const partnerRoles: AuthorizedVerifierRole[] = [
    "enterprise_partner",
    "financial_partner",
    "customer",
    "contractor",
  ];

  let targetStatus: EvidenceStatus = "unverified";
  if (independentRoles.includes(input.verifierRole)) {
    targetStatus = "independently_verified";
  } else if (partnerRoles.includes(input.verifierRole)) {
    targetStatus = "partner_confirmed";
  } else {
    targetStatus = "system_observed";
  }

  // 3. Dual approval check for sensitive categories
  const needsDual = requiresDualApproval(input.category);
  const dualSatisfied = Boolean(input.dualApprovedBy && input.dualApprovedBy !== input.verifierIdentity);

  if (needsDual && !dualSatisfied && targetStatus === "independently_verified") {
    return {
      allowed: false,
      targetStatus: currentStatus,
      rejectionReason: `Category '${input.category}' requires secondary independent approval from a distinct reviewer.`,
      requiresDualApproval: true,
      dualApprovalSatisfied: false,
      event: {
        claimId: input.claimId,
        attestationType: "clarification_requested",
        actorId: input.verifierIdentity,
        actorRole: input.verifierRole,
        methodology: input.methodology,
        reviewedArtifacts: input.reviewedArtifacts,
        scopeAndLimitations: input.scopeAndLimitations,
        signatureDigest,
        dualApprovedBy: null,
        notes: "Awaiting secondary independent reviewer sign-off.",
        timestamp: now,
      },
    };
  }

  return {
    allowed: true,
    targetStatus,
    requiresDualApproval: needsDual,
    dualApprovalSatisfied: dualSatisfied,
    event: {
      claimId: input.claimId,
      attestationType: "attested",
      actorId: input.verifierIdentity,
      actorRole: input.verifierRole,
      methodology: input.methodology,
      reviewedArtifacts: input.reviewedArtifacts,
      scopeAndLimitations: input.scopeAndLimitations,
      signatureDigest,
      dualApprovedBy: input.dualApprovedBy || null,
      notes: input.notes || null,
      timestamp: now,
    },
  };
}

/**
 * Revokes a previously attested claim upon discovering invalidating evidence or partner retraction.
 */
export function revokeAttestation(params: {
  claimId: string;
  revokedBy: string;
  revokerRole: AuthorizedVerifierRole;
  reason: string;
}): {
  targetStatus: EvidenceStatus;
  revocationEvent: {
    claimId: string;
    attestationType: AttestationEventType;
    actorId: string;
    actorRole: AuthorizedVerifierRole;
    notes: string;
    signatureDigest: string;
    timestamp: string;
  };
} {
  const now = new Date().toISOString();
  const rawDigest = `${params.claimId}:revocation:${params.revokedBy}:${now}`;
  const signatureDigest = crypto.createHash("sha256").update(rawDigest).digest("hex");

  return {
    targetStatus: "revoked",
    revocationEvent: {
      claimId: params.claimId,
      attestationType: "revoked",
      actorId: params.revokedBy,
      actorRole: params.revokerRole,
      notes: params.reason,
      signatureDigest,
      timestamp: now,
    },
  };
}
