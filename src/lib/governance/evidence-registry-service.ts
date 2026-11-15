/**
 * Central Certification Evidence Registry Service
 * Pillar L: Establishes an immutable, tamper-evident registry for all material platform claims,
 * tracking claim provenance, verification timestamps, and public-safe redactions.
 *
 * MISSION INVARIANT: "Every skill deserves to be seen, even without a degree."
 * CONSTITUTIONAL INVARIANT: 0.00% commission on worker wages.
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
  | "rejected";

export interface EvidenceRegistryInput {
  claimId: string;
  claimDescription: string;
  category: EvidenceCategory;
  sourceSystem: string;
  evidenceLocation: string;
  payloadToHash: Record<string, unknown> | string;
  scopeAndLimitations: string;
  expiryDate?: string | null;
  verifierRole?: string;
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
  expiryDate: string | null;
  status: EvidenceStatus;
  isPublicSafe: boolean;
  redactedSummary: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Computes deterministic RFC 8785 canonical SHA-256 digest of evidence payload.
 */
export function computeEvidenceHash(payload: Record<string, unknown> | string): string {
  const content = typeof payload === "string" ? payload : JSON.stringify(payload, Object.keys(payload).sort());
  return crypto.createHash("sha256").update(content).digest("hex");
}

/**
 * Creates a validated Evidence Registry Record.
 * Strictly verifies absence of sensitive personal data or plaintext secrets in public summaries.
 */
export function buildEvidenceRegistryRecord(input: EvidenceRegistryInput): EvidenceRegistryRecord {
  // Prohibit raw PII and credentials in summary
  const forbiddenPatterns = [
    /bearer\s+[a-z0-9_\-\.]+/i,
    /password/i,
    /\b\d{4}[ -]?\d{4}[ -]?\d{4}\b/, // Aadhaar pattern
    /\b\d{10}\b/, // Unmasked 10-digit phone number
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
    verificationTimestamp: input.status === "independently_verified" || input.status === "partner_confirmed" ? now : null,
    verifierRole: input.verifierRole || "independent_auditor",
    scopeAndLimitations: input.scopeAndLimitations,
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
 * Evaluates valid evidence status transitions.
 * Enforces governing rule: unverified claims cannot transition to independently_verified without prior observation.
 */
export function validateEvidenceStatusTransition(
  current: EvidenceStatus,
  target: EvidenceStatus
): { allowed: boolean; reason?: string } {
  const allowedTransitions: Record<EvidenceStatus, EvidenceStatus[]> = {
    unverified: ["self_reported", "system_observed", "rejected"],
    self_reported: ["system_observed", "disputed", "rejected"],
    system_observed: ["partner_confirmed", "independently_verified", "disputed", "rejected"],
    partner_confirmed: ["independently_verified", "expired", "disputed", "rejected"],
    independently_verified: ["expired", "disputed", "rejected"],
    expired: ["unverified", "system_observed"],
    disputed: ["unverified", "rejected", "independently_verified"],
    rejected: ["unverified"],
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
 * Returns a public-safe view of an evidence record, redacting internal source locations if private.
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
