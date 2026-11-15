/**
 * Institutional Ratification & Partner Assurance Service
 * Pillar E & F: Institutional Instruments, ONDC/ONest Key Ceremonies & Due Diligence
 *
 * MISSION INVARIANT: "Every skill deserves to be seen, even without a degree."
 * INTEGRITY PRINCIPLE: A partner is not verified because its name appears in a database.
 * No platform promotion to production status without authentic counterparty instruments.
 */

import crypto from "crypto";

export type InstitutionCategory =
  | "open_network_ondc"
  | "open_network_onest"
  | "enterprise_epc"
  | "regulated_nbfc"
  | "state_skill_mission"
  | "training_partner";

export type InstrumentType =
  | "stamped_commercial_agreement"
  | "institutional_mou"
  | "tripartite_lsp_agreement"
  | "network_whitelisting_key"
  | "training_accreditation_charter";

export type RatificationExecutionStatus =
  | "uninitiated"
  | "drafting"
  | "legal_review"
  | "counterparty_pending"
  | "stamped_and_executed"
  | "production_whitelisted"
  | "suspended"
  | "terminated"
  | "disputed";

export interface InstitutionalRatificationRecord {
  id: string;
  institutionCode: string;
  institutionName: string;
  category: InstitutionCategory;
  legalEntityVerified: boolean;
  authorizedSignatoryVerified: boolean;
  instrumentType: InstrumentType;
  status: RatificationExecutionStatus;
  instrumentReference: string | null;
  effectiveDate: string | null;
  expiryDate: string | null;
  productionKeyIdentifier: string | null;
  verificationMethod: string | null;
  limitations: string | null;
  workerDataProtectionTerms: boolean;
  isActive: boolean;
  evidenceSha256: string;
  auditNotes: string | null;
  updatedAt: string;
}

/**
 * Builds an institutional ratification record enforcing strict verification of legal entity and signatories.
 */
export function buildInstitutionalRatification(params: {
  id?: string;
  institutionCode: string;
  institutionName: string;
  category: InstitutionCategory;
  instrumentType: InstrumentType;
  legalEntityVerified?: boolean;
  authorizedSignatoryVerified?: boolean;
  status?: RatificationExecutionStatus;
  instrumentReference?: string;
  effectiveDate?: string;
  expiryDate?: string;
  productionKeyIdentifier?: string;
  verificationMethod?: string;
  limitations?: string;
  workerDataProtectionTerms?: boolean;
  auditNotes?: string;
}): InstitutionalRatificationRecord {
  const now = new Date().toISOString();
  const status = params.status || "uninitiated";
  const legalVerified = params.legalEntityVerified ?? false;
  const signatoryVerified = params.authorizedSignatoryVerified ?? false;

  // Active status is strictly gated
  const isFullyExecuted =
    status === "stamped_and_executed" || status === "production_whitelisted";
  const isActive = isFullyExecuted && legalVerified && signatoryVerified;

  const rawPayload = {
    code: params.institutionCode,
    name: params.institutionName,
    category: params.category,
    status,
    ref: params.instrumentReference || null,
    key: params.productionKeyIdentifier || null,
  };
  const evidenceSha256 = crypto.createHash("sha256").update(JSON.stringify(rawPayload)).digest("hex");

  return {
    id: params.id || "inst-" + crypto.randomUUID().slice(0, 12),
    institutionCode: params.institutionCode,
    institutionName: params.institutionName,
    category: params.category,
    legalEntityVerified: legalVerified,
    authorizedSignatoryVerified: signatoryVerified,
    instrumentType: params.instrumentType,
    status,
    instrumentReference: params.instrumentReference || null,
    effectiveDate: params.effectiveDate || (isFullyExecuted ? now.slice(0, 10) : null),
    expiryDate: params.expiryDate || null,
    productionKeyIdentifier: params.productionKeyIdentifier || null,
    verificationMethod: params.verificationMethod || null,
    limitations: params.limitations || null,
    workerDataProtectionTerms: params.workerDataProtectionTerms ?? true,
    isActive,
    evidenceSha256,
    auditNotes: params.auditNotes || null,
    updatedAt: now,
  };
}

/**
 * Validates transition of institutional ratification.
 * Prohibits setting status to 'production_whitelisted' or 'stamped_and_executed'
 * without verifiable instrument reference, legal entity validation, and signatory verification.
 */
export function transitionRatificationStatus(params: {
  record: InstitutionalRatificationRecord;
  targetStatus: RatificationExecutionStatus;
  instrumentReference?: string;
  productionKeyIdentifier?: string;
  verificationMethod?: string;
  limitations?: string;
  notes?: string;
}): { allowed: boolean; updatedRecord: InstitutionalRatificationRecord; reason?: string } {
  if (
    (params.targetStatus === "stamped_and_executed" || params.targetStatus === "production_whitelisted") &&
    (!params.record.legalEntityVerified || !params.record.authorizedSignatoryVerified)
  ) {
    return {
      allowed: false,
      updatedRecord: params.record,
      reason: "Cannot promote to executed/whitelisted status without verified legal entity and authorized signatory proofs.",
    };
  }

  if (params.targetStatus === "production_whitelisted" && !params.productionKeyIdentifier && !params.record.productionKeyIdentifier) {
    return {
      allowed: false,
      updatedRecord: params.record,
      reason: "Production whitelisting requires valid registry council production key identifier.",
    };
  }

  if (params.targetStatus === "stamped_and_executed" && !params.instrumentReference && !params.record.instrumentReference) {
    return {
      allowed: false,
      updatedRecord: params.record,
      reason: "Executed status requires authentic non-judicial stamped paper instrument reference number.",
    };
  }

  const now = new Date().toISOString();
  const isFullyExecuted =
    params.targetStatus === "stamped_and_executed" || params.targetStatus === "production_whitelisted";

  const updated: InstitutionalRatificationRecord = {
    ...params.record,
    status: params.targetStatus,
    instrumentReference: params.instrumentReference || params.record.instrumentReference,
    productionKeyIdentifier: params.productionKeyIdentifier || params.record.productionKeyIdentifier,
    verificationMethod: params.verificationMethod || params.record.verificationMethod,
    limitations: params.limitations || params.record.limitations,
    effectiveDate: isFullyExecuted ? params.record.effectiveDate || now.slice(0, 10) : params.record.effectiveDate,
    isActive: isFullyExecuted,
    auditNotes: params.notes || params.record.auditNotes,
    updatedAt: now,
  };

  const rawPayload = {
    code: updated.institutionCode,
    status: updated.status,
    ref: updated.instrumentReference,
    key: updated.productionKeyIdentifier,
  };
  updated.evidenceSha256 = crypto.createHash("sha256").update(JSON.stringify(rawPayload)).digest("hex");

  return {
    allowed: true,
    updatedRecord: updated,
  };
}
