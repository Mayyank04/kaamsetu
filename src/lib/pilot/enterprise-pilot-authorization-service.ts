/**
 * KAAMSETU Enterprise Pilot Authorization & Anti-Conflation Service
 * Phase 23 — Pillar D: EPC Pilot Authorization & Anti-Conflation Governance
 */

import crypto from "crypto";

export type PilotAgreementStatus =
  | "draft"
  | "under_review"
  | "legal_clearance"
  | "pending_execution"
  | "executed_active"
  | "blocked";

export type PilotAuthorizationStatus =
  | "draft"
  | "scoping"
  | "pending_authorization"
  | "authorized_active"
  | "blocked"
  | "closed";

export interface PilotAuthorizationGateInput {
  pilotName: string;
  partnerName: string;
  counterpartyVerified: boolean;
  authorizedSignatoryVerified: boolean;
  agreementStatus: PilotAgreementStatus;
  executedAgreementRef?: string;
  approvedScopeSummary: string;
  workerProtectionProvisionsVerified: boolean;
  wagePaymentResponsibilityVerified: boolean;
  insuranceSafetyObligationsVerified: boolean;
  dataPrivacyTermsVerified: boolean;
  consentedWorkerCount: number;
  authorizedDeploymentRecordRef?: string;
  isPhysicalSiteGeofenced?: boolean;
}

export interface EnterprisePilotAuthorizationRecord {
  id: string;
  pilotName: string;
  partnerName: string;
  counterpartyVerified: boolean;
  authorizedSignatoryVerified: boolean;
  executedAgreementRef: string | null;
  agreementStatus: PilotAgreementStatus;
  approvedScopeSummary: string;
  workerProtectionProvisionsVerified: boolean;
  wagePaymentResponsibilityVerified: boolean;
  insuranceSafetyObligationsVerified: boolean;
  dataPrivacyTermsVerified: boolean;
  consentedWorkerCount: number;
  authorizedDeploymentRecordRef: string | null;
  pilotAuthorizationStatus: PilotAuthorizationStatus;
  blockingReasons: string[];
  evidenceDigest: string;
  createdAt: string;
  updatedAt: string;
}

export function evaluatePilotAuthorizationGates(input: PilotAuthorizationGateInput): {
  canAuthorize: boolean;
  status: PilotAuthorizationStatus;
  blockingReasons: string[];
  passedGatesCount: number;
  totalGatesCount: number;
} {
  const blockingReasons: string[] = [];
  let passedGatesCount = 0;
  const totalGatesCount = 10;

  // Gate 1: Verified legal counterparty
  if (input.counterpartyVerified) {
    passedGatesCount++;
  } else {
    blockingReasons.push("Gate 1 Failed: Legal counterparty identity unverified in MCA / state registry");
  }

  // Gate 2: Authorized signatory verified
  if (input.authorizedSignatoryVerified) {
    passedGatesCount++;
  } else {
    blockingReasons.push("Gate 2 Failed: Authorized signatory lacks verified Power of Attorney or Board Resolution");
  }

  // Gate 3: Executed agreement
  if (input.agreementStatus === "executed_active" && input.executedAgreementRef) {
    passedGatesCount++;
  } else {
    blockingReasons.push(`Gate 3 Failed: Agreement status is '${input.agreementStatus}', not 'executed_active' with valid reference`);
  }

  // Gate 4: Approved project scope
  if (input.approvedScopeSummary && input.approvedScopeSummary.trim().length >= 15) {
    passedGatesCount++;
  } else {
    blockingReasons.push("Gate 4 Failed: Project scope summary is missing or inadequate");
  }

  // Gate 5: Worker protection provisions
  if (input.workerProtectionProvisionsVerified) {
    passedGatesCount++;
  } else {
    blockingReasons.push("Gate 5 Failed: 0.00% wage commission & grievance protection covenants unverified");
  }

  // Gate 6: Wage and payment responsibilities
  if (input.wagePaymentResponsibilityVerified) {
    passedGatesCount++;
  } else {
    blockingReasons.push("Gate 6 Failed: Contractor wage payment responsibilities & banking UTR schedule unverified");
  }

  // Gate 7: Insurance & safety obligations
  if (input.insuranceSafetyObligationsVerified) {
    passedGatesCount++;
  } else {
    blockingReasons.push("Gate 7 Failed: Worker accident insurance / PPE safety coverage unverified");
  }

  // Gate 8: Data-sharing and privacy terms (DPDP 2023)
  if (input.dataPrivacyTermsVerified) {
    passedGatesCount++;
  } else {
    blockingReasons.push("Gate 8 Failed: DPDP 2023 purpose limitation & consent revocation terms unverified");
  }

  // Gate 9: Worker consent
  if (input.consentedWorkerCount > 0) {
    passedGatesCount++;
  } else {
    blockingReasons.push("Gate 9 Failed: Zero consented workers; roster synchronization alone cannot activate pilot");
  }

  // Gate 10: Authorized deployment record
  if (input.authorizedDeploymentRecordRef) {
    passedGatesCount++;
  } else {
    blockingReasons.push("Gate 10 Failed: Authorized deployment record reference missing");
  }

  const canAuthorize = passedGatesCount === totalGatesCount;
  const status: PilotAuthorizationStatus = canAuthorize
    ? "authorized_active"
    : blockingReasons.length > 0
    ? "blocked"
    : "pending_authorization";

  return {
    canAuthorize,
    status,
    blockingReasons,
    passedGatesCount,
    totalGatesCount,
  };
}

export function computePilotAuthorizationDigest(input: PilotAuthorizationGateInput): string {
  const canonical = JSON.stringify({
    pilotName: input.pilotName,
    partnerName: input.partnerName,
    counterpartyVerified: input.counterpartyVerified,
    agreementStatus: input.agreementStatus,
    workerProtection: input.workerProtectionProvisionsVerified,
    consentedWorkers: input.consentedWorkerCount,
  });
  return crypto.createHash("sha256").update(canonical).digest("hex");
}

export function createEnterprisePilotAuthorizationRecord(
  input: PilotAuthorizationGateInput
): EnterprisePilotAuthorizationRecord {
  const evaluation = evaluatePilotAuthorizationGates(input);
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    pilotName: input.pilotName,
    partnerName: input.partnerName,
    counterpartyVerified: input.counterpartyVerified,
    authorizedSignatoryVerified: input.authorizedSignatoryVerified,
    executedAgreementRef: input.executedAgreementRef || null,
    agreementStatus: input.agreementStatus,
    approvedScopeSummary: input.approvedScopeSummary,
    workerProtectionProvisionsVerified: input.workerProtectionProvisionsVerified,
    wagePaymentResponsibilityVerified: input.wagePaymentResponsibilityVerified,
    insuranceSafetyObligationsVerified: input.insuranceSafetyObligationsVerified,
    dataPrivacyTermsVerified: input.dataPrivacyTermsVerified,
    consentedWorkerCount: input.consentedWorkerCount,
    authorizedDeploymentRecordRef: input.authorizedDeploymentRecordRef || null,
    pilotAuthorizationStatus: evaluation.status,
    blockingReasons: evaluation.blockingReasons,
    evidenceDigest: computePilotAuthorizationDigest(input),
    createdAt: now,
    updatedAt: now,
  };
}
