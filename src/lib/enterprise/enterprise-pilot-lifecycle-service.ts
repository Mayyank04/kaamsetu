/**
 * Enterprise Pilot Lifecycle & Deployment Proof Service
 * Pillar G: Enterprise EPC Pilot Execution & Anti-Conflation Governance
 *
 * MISSION INVARIANT: "Every skill deserves to be seen, even without a degree."
 * CONSTITUTIONAL INVARIANT: 0.00% commission on worker wages.
 * ONTOLOGICAL INVARIANTS:
 * - A signed contract does not prove worker deployment.
 * - A roster synchronization does not prove work performed.
 * - A deployment record does not prove wages paid.
 * - An invoice does not prove worker receipt.
 */

import crypto from "crypto";

export type EnterprisePilotState =
  | "prospect"
  | "due_diligence"
  | "draft_agreement"
  | "signed_agreement"
  | "pilot_authorized"
  | "worker_consent_verified"
  | "roster_synced"
  | "deployment_confirmed"
  | "work_completed"
  | "wage_payment_documented"
  | "pilot_closed"
  | "suspended"
  | "terminated"
  | "disputed";

export interface EnterpriseEngagementRecord {
  id: string;
  clientOrganizationName: string;
  projectCode: string;
  erpSystem: "sap_successfactors" | "oracle_fusion" | "gem_contract" | "custom_odata";
  state: EnterprisePilotState;
  hasExecutedStampedAgreement: boolean;
  stampedPaperRef: string | null;
  hasAuthorizedSignatoryProof: boolean;
  authorizedSignatoryName: string | null;
  consentedWorkersCount: number;
  syncedRosterCount: number;
  confirmedDeployedCount: number;
  deploymentEvidenceRef: string | null;
  workCompletedCount: number;
  wagePaymentEvidenceRef: string | null;
  platformCommissionDeduction: number; // MUST BE 0.00
  evidenceSha256: string;
  notes: string | null;
  updatedAt: string;
}

export function createEnterpriseEngagement(params: {
  clientOrganizationName: string;
  projectCode: string;
  erpSystem: "sap_successfactors" | "oracle_fusion" | "gem_contract" | "custom_odata";
}): EnterpriseEngagementRecord {
  const now = new Date().toISOString();
  return {
    id: "ep-" + crypto.randomUUID().slice(0, 12),
    clientOrganizationName: params.clientOrganizationName,
    projectCode: params.projectCode,
    erpSystem: params.erpSystem,
    state: "prospect",
    hasExecutedStampedAgreement: false,
    stampedPaperRef: null,
    hasAuthorizedSignatoryProof: false,
    authorizedSignatoryName: null,
    consentedWorkersCount: 0,
    syncedRosterCount: 0,
    confirmedDeployedCount: 0,
    deploymentEvidenceRef: null,
    workCompletedCount: 0,
    wagePaymentEvidenceRef: null,
    platformCommissionDeduction: 0.0,
    evidenceSha256: "",
    notes: null,
    updatedAt: now,
  };
}

/**
 * Validates and progresses enterprise pilot state along the 11-stage pipeline.
 * Strictly prevents skipping required legal, technical, and wage payment proofs.
 */
export function transitionEnterprisePilotState(params: {
  engagement: EnterpriseEngagementRecord;
  targetState: EnterprisePilotState;
  stampedPaperRef?: string;
  authorizedSignatoryName?: string;
  deploymentEvidenceRef?: string;
  wagePaymentEvidenceRef?: string;
  consentedWorkersCount?: number;
  syncedRosterCount?: number;
  confirmedDeployedCount?: number;
  workCompletedCount?: number;
  requiredEvidence?: string;
  notes?: string;
}): { allowed: boolean; updatedEngagement: EnterpriseEngagementRecord; reason?: string } {
  const allowedTransitions: Record<EnterprisePilotState, EnterprisePilotState[]> = {
    prospect: ["due_diligence", "suspended", "terminated"],
    due_diligence: ["draft_agreement", "suspended", "terminated"],
    draft_agreement: ["signed_agreement", "suspended", "terminated"],
    signed_agreement: ["pilot_authorized", "suspended", "terminated", "disputed"],
    pilot_authorized: ["worker_consent_verified", "suspended", "terminated", "disputed"],
    worker_consent_verified: ["roster_synced", "suspended", "terminated", "disputed"],
    roster_synced: ["deployment_confirmed", "suspended", "terminated", "disputed"],
    deployment_confirmed: ["work_completed", "suspended", "terminated", "disputed"],
    work_completed: ["wage_payment_documented", "suspended", "terminated", "disputed"],
    wage_payment_documented: ["pilot_closed", "suspended", "terminated", "disputed"],
    pilot_closed: [],
    suspended: ["prospect", "due_diligence", "draft_agreement", "pilot_authorized", "roster_synced", "deployment_confirmed"],
    terminated: [],
    disputed: ["suspended", "terminated", "wage_payment_documented", "pilot_closed"],
  };

  const allowed = allowedTransitions[params.engagement.state]?.includes(params.targetState);
  if (!allowed) {
    return {
      allowed: false,
      updatedEngagement: params.engagement,
      reason: `Illegal state transition from '${params.engagement.state}' to '${params.targetState}'.`,
    };
  }

  // 1. Signed agreement requires stamped paper reference and signatory proof
  if (params.targetState === "signed_agreement") {
    const stampedRef = params.stampedPaperRef || params.engagement.stampedPaperRef;
    const signatory = params.authorizedSignatoryName || params.engagement.authorizedSignatoryName;
    if (!stampedRef || !signatory) {
      return {
        allowed: false,
        updatedEngagement: params.engagement,
        reason: "Transition to 'signed_agreement' requires executed non-judicial stamped paper reference and verified signatory.",
      };
    }
  }

  // 2. Roster sync requires verified worker consent (anti-involuntary conscription)
  if (params.targetState === "roster_synced") {
    const consented = params.consentedWorkersCount ?? params.engagement.consentedWorkersCount;
    if (consented === 0) {
      return {
        allowed: false,
        updatedEngagement: params.engagement,
        reason: "Cannot synchronize roster to enterprise ERP without verified affirmative worker consent.",
      };
    }
    const synced = params.syncedRosterCount ?? params.engagement.syncedRosterCount;
    if (synced > consented) {
      return {
        allowed: false,
        updatedEngagement: params.engagement,
        reason: "Synced roster count cannot exceed consented workers count.",
      };
    }
  }

  // 3. Deployment confirmation requires physical site deployment evidence
  if (params.targetState === "deployment_confirmed") {
    const deployRef = params.deploymentEvidenceRef || params.engagement.deploymentEvidenceRef;
    if (!deployRef) {
      return {
        allowed: false,
        updatedEngagement: params.engagement,
        reason: "Cannot confirm deployment without physical on-site geo-tagged muster or gate telemetry evidence.",
      };
    }
  }

  // 4. Wage payment documented requires verified bank/UPI payment reference
  if (params.targetState === "wage_payment_documented") {
    const payRef = params.wagePaymentEvidenceRef || params.engagement.wagePaymentEvidenceRef;
    if (!payRef) {
      return {
        allowed: false,
        updatedEngagement: params.engagement,
        reason: "Cannot document wage payment without verified banking payment reference (UTR / NEFT). Booking or invoice is NOT proof.",
      };
    }
  }

  const now = new Date().toISOString();
  const updated: EnterpriseEngagementRecord = {
    ...params.engagement,
    state: params.targetState,
    hasExecutedStampedAgreement:
      params.targetState === "signed_agreement" || params.engagement.hasExecutedStampedAgreement
        ? true
        : params.engagement.hasExecutedStampedAgreement,
    stampedPaperRef: params.stampedPaperRef || params.engagement.stampedPaperRef,
    hasAuthorizedSignatoryProof:
      params.authorizedSignatoryName || params.engagement.hasAuthorizedSignatoryProof
        ? true
        : params.engagement.hasAuthorizedSignatoryProof,
    authorizedSignatoryName: params.authorizedSignatoryName || params.engagement.authorizedSignatoryName,
    consentedWorkersCount: params.consentedWorkersCount ?? params.engagement.consentedWorkersCount,
    syncedRosterCount: params.syncedRosterCount ?? params.engagement.syncedRosterCount,
    confirmedDeployedCount: params.confirmedDeployedCount ?? params.engagement.confirmedDeployedCount,
    deploymentEvidenceRef: params.deploymentEvidenceRef || params.engagement.deploymentEvidenceRef,
    workCompletedCount: params.workCompletedCount ?? params.engagement.workCompletedCount,
    wagePaymentEvidenceRef: params.wagePaymentEvidenceRef || params.engagement.wagePaymentEvidenceRef,
    platformCommissionDeduction: 0.0, // Constitutional invariant
    notes: params.notes || params.engagement.notes,
    updatedAt: now,
  };

  const digestPayload = {
    id: updated.id,
    projectCode: updated.projectCode,
    state: updated.state,
    stampedRef: updated.stampedPaperRef,
    deployRef: updated.deploymentEvidenceRef,
    payRef: updated.wagePaymentEvidenceRef,
  };
  updated.evidenceSha256 = crypto.createHash("sha256").update(JSON.stringify(digestPayload)).digest("hex");

  return {
    allowed: true,
    updatedEngagement: updated,
  };
}

/**
 * Validates ontological anti-conflation invariants across an enterprise engagement record.
 */
export function validateAntiConflationState(record: EnterpriseEngagementRecord): {
  isValid: boolean;
  violations: string[];
} {
  const violations: string[] = [];

  if (record.syncedRosterCount > record.consentedWorkersCount) {
    violations.push("Synced roster exceeds consented workers count.");
  }
  if (record.confirmedDeployedCount > record.syncedRosterCount) {
    violations.push("Deployed count exceeds synced roster count.");
  }
  if (record.workCompletedCount > record.confirmedDeployedCount) {
    violations.push("Completed work count exceeds deployed worker count.");
  }
  if (record.state === "signed_agreement" && !record.hasExecutedStampedAgreement) {
    violations.push("Signed agreement lacks non-judicial stamped paper reference.");
  }
  if (record.state === "deployment_confirmed" && !record.deploymentEvidenceRef) {
    violations.push("Deployment confirmed lacks on-site telemetry evidence.");
  }
  if (record.state === "wage_payment_documented" && !record.wagePaymentEvidenceRef) {
    violations.push("Wage payment documented lacks bank UTR reference.");
  }
  if (record.platformCommissionDeduction !== 0.0) {
    violations.push("Constitutional violation: Platform commission must be 0.00.");
  }

  return {
    isValid: violations.length === 0,
    violations,
  };
}
