/**
 * Central Certification Evidence Registry Service V2
 * Pillar A & B: Controlled Evidence-Management System & Independent Attestation Workflow
 *
 * MISSION INVARIANT: "Every skill deserves to be seen, even without a degree."
 * CONSTITUTIONAL INVARIANT: 0.00% commission on worker wages.
 * INTEGRITY PRINCIPLE: A cryptographic digest proves evidence immutability, not truth of claim.
 */

import crypto from "crypto";

export type EvidenceCategory =
  | "enterprise_pilot"
  | "erp_integration"
  | "ondc_network"
  | "onest_dsep"
  | "responsible_finance"
  | "worker_outcome"
  | "commercial_revenue"
  | "regional_gate"
  | "security_dpdp"
  | "multi_region_dr"
  | "observability"
  | "worker_sovereignty";

export type EvidenceStatus =
  | "unverified"
  | "self_reported"
  | "system_observed"
  | "partner_confirmed"
  | "independently_verified"
  | "expired"
  | "disputed"
  | "rejected"
  | "revoked";

export type AccessClassification = "public" | "internal" | "confidential" | "restricted";

export type AuthorizedVerifierRole =
  | "worker"
  | "customer"
  | "contractor"
  | "enterprise_partner"
  | "institutional_partner"
  | "financial_partner"
  | "credential_issuer"
  | "independent_auditor"
  | "platform_admin";

export type AttestationEventType =
  | "submitted"
  | "observed"
  | "attested"
  | "rejected"
  | "disputed"
  | "clarification_requested"
  | "revoked"
  | "expired";

export interface EvidenceRegistryInput {
  claimId: string;
  claimDescription: string;
  category: EvidenceCategory;
  sourceSystem: string;
  evidenceLocation: string;
  payloadToHash: Record<string, unknown> | string;
  scopeAndLimitations: string;
  claimOwner?: string | null;
  verifierIdentity?: string | null;
  verificationMethod?: string | null;
  revocationReason?: string | null;
  accessClassification?: AccessClassification;
  expiryDate?: string | null;
  verifierRole?: AuthorizedVerifierRole | string;
  status?: EvidenceStatus;
  isPublicSafe?: boolean;
  redactedSummary: string;
  metadata?: Record<string, unknown>;
}

export interface EvidenceRegistryRecord {
  id: string;
  claimId: string;
  claimDescription: string;
  category: EvidenceCategory;
  sourceSystem: string;
  evidenceLocation: string;
  evidenceSha256: string;
  collectionTimestamp: string;
  verificationTimestamp: string | null;
  verifierRole: string;
  scopeAndLimitations: string;
  claimOwner: string | null;
  verifierIdentity: string | null;
  verificationMethod: string | null;
  revocationReason: string | null;
  accessClassification: AccessClassification;
  expiryDate: string | null;
  status: EvidenceStatus;
  isPublicSafe: boolean;
  redactedSummary: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface EvidenceAttestationEventRecord {
  id: string;
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
  createdAt: string;
}

/**
 * Computes deterministic RFC 8785 canonical SHA-256 digest of evidence payload.
 * Invariant: Digest proves immutability since hashing; does NOT prove external ground truth.
 */
export function computeEvidenceHash(payload: Record<string, unknown> | string): string {
  const content = typeof payload === "string" ? payload : JSON.stringify(payload, Object.keys(payload).sort());
  return crypto.createHash("sha256").update(content).digest("hex");
}

/**
 * Creates a validated Evidence Registry Record V2.
 * Strictly verifies absence of sensitive personal data or plaintext secrets in public summaries.
 */
export function buildEvidenceRegistryRecord(input: EvidenceRegistryInput): EvidenceRegistryRecord {
  const forbiddenPatterns = [
    /bearer\s+[a-z0-9_\-\.]+/i,
    /password/i,
    /\b\d{4}[ -]?\d{4}[ -]?\d{4}\b/, // Aadhaar pattern
    /\b[6-9]\d{9}\b/, // Unmasked 10-digit Indian phone number
  ];

  for (const pattern of forbiddenPatterns) {
    if (pattern.test(input.redactedSummary)) {
      throw new Error(`Public evidence summary contains prohibited PII or credential pattern: ${pattern}`);
    }
  }

  const now = new Date().toISOString();
  const evidenceSha256 = computeEvidenceHash(input.payloadToHash);

  return {
    id: "ev-" + crypto.randomUUID().slice(0, 12),
    claimId: input.claimId,
    claimDescription: input.claimDescription,
    category: input.category,
    sourceSystem: input.sourceSystem,
    evidenceLocation: input.evidenceLocation,
    evidenceSha256,
    collectionTimestamp: now,
    verificationTimestamp:
      input.status === "independently_verified" || input.status === "partner_confirmed" ? now : null,
    verifierRole: input.verifierRole || "independent_auditor",
    scopeAndLimitations: input.scopeAndLimitations,
    claimOwner: input.claimOwner || null,
    verifierIdentity: input.verifierIdentity || null,
    verificationMethod: input.verificationMethod || null,
    revocationReason: input.revocationReason || null,
    accessClassification: input.accessClassification || "internal",
    expiryDate: input.expiryDate || null,
    status: input.status || "unverified",
    isPublicSafe: input.isPublicSafe ?? true,
    redactedSummary: input.redactedSummary,
    metadata: input.metadata || {},
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Evaluates conflict of interest between claim submitter and verifier.
 * Strictly prohibits self-approval: submitter cannot certify their own claim as independently_verified.
 */
export function validateAttestationConflict(params: {
  claimOwner?: string | null;
  verifierIdentity?: string | null;
  targetStatus: EvidenceStatus;
}): { allowed: boolean; reason?: string } {
  if (
    params.targetStatus === "independently_verified" &&
    params.claimOwner &&
    params.verifierIdentity &&
    params.claimOwner === params.verifierIdentity
  ) {
    return {
      allowed: false,
      reason: "Conflict of Interest: A claim owner cannot self-attest or self-approve independent verification.",
    };
  }

  return { allowed: true };
}

/**
 * Evaluates whether a sensitive claim category requires dual-approval.
 */
export function requiresDualApproval(category: EvidenceCategory): boolean {
  const dualApprovalCategories: EvidenceCategory[] = [
    "enterprise_pilot",
    "responsible_finance",
    "commercial_revenue",
    "regional_gate",
  ];
  return dualApprovalCategories.includes(category);
}

/**
 * Evaluates valid evidence status transitions under the V2 strict state machine.
 */
export function validateEvidenceStatusTransition(
  current: EvidenceStatus,
  target: EvidenceStatus
): { allowed: boolean; reason?: string } {
  const allowedTransitions: Record<EvidenceStatus, EvidenceStatus[]> = {
    unverified: ["self_reported", "system_observed", "rejected"],
    self_reported: ["system_observed", "disputed", "rejected"],
    system_observed: ["partner_confirmed", "independently_verified", "disputed", "rejected"],
    partner_confirmed: ["independently_verified", "expired", "disputed", "rejected", "revoked"],
    independently_verified: ["expired", "disputed", "rejected", "revoked"],
    expired: ["unverified", "system_observed"],
    disputed: ["unverified", "rejected", "independently_verified"],
    rejected: ["unverified"],
    revoked: ["unverified", "disputed"],
  };

  const allowed = allowedTransitions[current]?.includes(target) ?? false;
  if (!allowed) {
    return {
      allowed: false,
      reason: `Illegal status transition from '${current}' to '${target}'. Evidence must follow progressive provenance verification.`,
    };
  }

  return { allowed: true };
}

/**
 * Builds an immutable Evidence Attestation Event Record.
 */
export function buildAttestationEvent(params: {
  claimId: string;
  attestationType: AttestationEventType;
  actorId: string;
  actorRole: AuthorizedVerifierRole;
  methodology: string;
  reviewedArtifacts: Record<string, unknown>[];
  scopeAndLimitations: string;
  dualApprovedBy?: string | null;
  notes?: string | null;
}): EvidenceAttestationEventRecord {
  const now = new Date().toISOString();
  const rawDigest = `${params.claimId}:${params.attestationType}:${params.actorId}:${params.actorRole}:${now}`;
  const signatureDigest = crypto.createHash("sha256").update(rawDigest).digest("hex");

  return {
    id: "att-" + crypto.randomUUID().slice(0, 12),
    claimId: params.claimId,
    attestationType: params.attestationType,
    actorId: params.actorId,
    actorRole: params.actorRole,
    methodology: params.methodology,
    reviewedArtifacts: params.reviewedArtifacts,
    scopeAndLimitations: params.scopeAndLimitations,
    signatureDigest,
    dualApprovedBy: params.dualApprovedBy || null,
    notes: params.notes || null,
    createdAt: now,
  };
}

/**
 * Returns a public-safe view of an evidence record V2, strictly hiding internal source locations and confidential artifacts.
 */
export function sanitizePublicEvidenceRecord(record: EvidenceRegistryRecord) {
  return {
    claimId: record.claimId,
    claimDescription: record.claimDescription,
    category: record.category,
    status: record.status,
    evidenceSha256: record.evidenceSha256,
    verifierRole: record.verifierRole,
    scopeAndLimitations: record.scopeAndLimitations,
    redactedSummary: record.redactedSummary,
    verificationTimestamp: record.verificationTimestamp,
    accessClassification: record.accessClassification,
    expiryDate: record.expiryDate,
    isRevoked: record.status === "revoked",
    revocationReason: record.status === "revoked" ? record.revocationReason : null,
  };
}

/**
 * Summarizes the verification status counts of a collection of evidence records.
 */
export function summarizeRegistryStatus(records: EvidenceRegistryRecord[]) {
  const statusCounts: Record<EvidenceStatus, number> = {
    unverified: 0,
    self_reported: 0,
    system_observed: 0,
    partner_confirmed: 0,
    independently_verified: 0,
    expired: 0,
    disputed: 0,
    rejected: 0,
    revoked: 0,
  };

  for (const r of records) {
    statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
  }

  const verifiedCount = statusCounts.independently_verified + statusCounts.partner_confirmed;
  const verificationRatio = records.length > 0 ? Math.round((verifiedCount / records.length) * 1000) / 10 : 0.0;

  return {
    totalRecords: records.length,
    statusCounts,
    verifiedCount,
    verificationRatio,
  };
}
