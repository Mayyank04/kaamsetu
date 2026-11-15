/**
 * KAAMSETU Class A Readiness Assurance Service
 * Phase 23 — Pillar M: 12-Requirement Formal Assessment Framework
 */

import crypto from "crypto";

export type AuditRequirementResult = "pass" | "fail" | "conditional" | "blocked";

export type AuditRequirementStatus =
  | "not_started"
  | "in_progress"
  | "evidence_pending"
  | "under_review"
  | "passed"
  | "failed"
  | "blocked";

export interface ClassARequirementAudit {
  requirementNumber: number;
  requirementTitle: string;
  requiredEvidence: string;
  evidenceReceived: string | null;
  verificationMethod: string;
  independentReviewer: string;
  auditResult: AuditRequirementResult;
  outstandingDependency: string | null;
  remediationOwner: string;
  status: AuditRequirementStatus;
}

export interface ClassAAssessmentSummary {
  certifiedClassification: "CLASS_A" | "CLASS_B" | "CLASS_C";
  isClassAApproved: boolean;
  totalRequirements: number;
  passedCount: number;
  blockedCount: number;
  inProgressCount: number;
  failedCount: number;
  criticalBlockers: string[];
  auditDigest: string;
  assessmentTimestamp: string;
}

export const CANONICAL_CLASS_A_REQUIREMENTS: Omit<ClassARequirementAudit, "evidenceReceived" | "independentReviewer" | "auditResult" | "outstandingDependency" | "remediationOwner" | "status">[] = [
  {
    requirementNumber: 1,
    requirementTitle: "Verified Production Operations",
    requiredEvidence: "SROP >= 90% conformance in active regional hubs (Guwahati & Shillong) with 500+ verified paid jobs",
    verificationMethod: "Field audit logs, biometric/geofenced check-ins, customer confirmation OTP hashes",
  },
  {
    requirementNumber: 2,
    requirementTitle: "Executed Institutional Agreements",
    requiredEvidence: "Wet-ink executed bilateral MoUs across state missions (ASDM, TSDM) with zero unexecuted drafts",
    verificationMethod: "Institutional legal registry inspection, wet-ink document review",
  },
  {
    requirementNumber: 3,
    requirementTitle: "Approved Production Open Network Participation",
    requiredEvidence: "Official ONDC Network Registrar production Ed25519 keys & ONest Consortium production registry listing",
    verificationMethod: "Cryptographic network handshake, production registry lookup",
  },
  {
    requirementNumber: 4,
    requirementTitle: "Authorized Enterprise EPC Pilots",
    requiredEvidence: "Stamped paper pilot agreements with board resolutions for NHIDCL & Meghalaya Airport civil projects",
    verificationMethod: "Corporate legal vetting, 10-gate pilot authorization ledger inspection",
  },
  {
    requirementNumber: 5,
    requirementTitle: "Independently Verified Worker Outcomes",
    requiredEvidence: "11-stage outcome progression ledger with dual-authorized settlement and banking UTR matching",
    verificationMethod: "Masked bank UTR regex validation, dual-investigator sign-off audit",
  },
  {
    requirementNumber: 6,
    requirementTitle: "Reconciled Financial Records",
    requiredEvidence: "Zero-commission wage proof, B2B SaaS revenue billing with 18% GST, reconciliation within ₹0.01 tolerance",
    verificationMethod: "Statutory tax audit, GSTR-1 matching, commercial ledger reconciliation",
  },
  {
    requirementNumber: 7,
    requirementTitle: "Sustainable Unit Economics",
    requiredEvidence: "Positive gross software operating margin (> 50%) funding cloud and SMS costs without worker fee extraction",
    verificationMethod: "Cost of Goods Sold (COGS) vs SaaS subscription ARR accounting analysis",
  },
  {
    requirementNumber: 8,
    requirementTitle: "Worker Protection and Grievance Assurance",
    requiredEvidence: "48-hour SLA resolution for worker grievances, automated employer review shielding, zero retaliation cases",
    verificationMethod: "Grievance desk ticket timestamp audit, retaliation incident ledger check",
  },
  {
    requirementNumber: 9,
    requirementTitle: "Independent Security Assurance",
    requiredEvidence: "100.0% Row-Level Security across all 89 database tables, primary-replica replication lag < 5s, rate-limiting",
    verificationMethod: "Automated penetration tests, PostgreSQL catalog query, DR replication monitor",
  },
  {
    requirementNumber: 10,
    requirementTitle: "Tested Recovery and Operational Resilience",
    requiredEvidence: "Automated cold backup restore drill validation with zero row or byte loss, RPO < 60s, RTO < 60min",
    verificationMethod: "Isolated sandbox database restore test with complete checksum verification",
  },
  {
    requirementNumber: 11,
    requirementTitle: "Worker Identity Portability",
    requiredEvidence: "DPDP 2023 compliant portable credential export, selective disclosure, instant consent withdrawal",
    verificationMethod: "JSON-LD cryptographic credential export test, QR HMAC-SHA256 URL validation",
  },
  {
    requirementNumber: 12,
    requirementTitle: "Transparent Governance and Auditability",
    requiredEvidence: "Dual-view operations dashboard, immutable SHA-256 evidence digests, public PII masking",
    verificationMethod: "Public API inspection, evidence digest cryptographic recomputation",
  },
];

export function evaluateClassAReadiness(
  requirements: ClassARequirementAudit[]
): ClassAAssessmentSummary {
  let passedCount = 0;
  let blockedCount = 0;
  let inProgressCount = 0;
  let failedCount = 0;
  const criticalBlockers: string[] = [];

  for (const req of requirements) {
    if (req.status === "passed" && req.auditResult === "pass") {
      passedCount++;
    } else if (req.status === "blocked" || req.auditResult === "blocked") {
      blockedCount++;
      criticalBlockers.push(`Req #${req.requirementNumber} (${req.requirementTitle}): ${req.outstandingDependency || "Pending external counterparty action"}`);
    } else if (req.status === "failed" || req.auditResult === "fail") {
      failedCount++;
      criticalBlockers.push(`Req #${req.requirementNumber} (${req.requirementTitle}): FAILED audit criteria`);
    } else {
      inProgressCount++;
      criticalBlockers.push(`Req #${req.requirementNumber} (${req.requirementTitle}): In progress or evidence pending`);
    }
  }

  // ANTI-MASKING INVARIANT:
  // Class A is strictly prohibited if ANY mandatory requirement is blocked, failed, or in-progress.
  const isClassAApproved = passedCount === requirements.length && blockedCount === 0 && failedCount === 0;
  const certifiedClassification: "CLASS_A" | "CLASS_B" | "CLASS_C" = isClassAApproved
    ? "CLASS_A"
    : blockedCount > 0 || inProgressCount > 0
    ? "CLASS_B"
    : "CLASS_C";

  const canonical = JSON.stringify({
    passedCount,
    blockedCount,
    criticalBlockers,
    classification: certifiedClassification,
  });
  const auditDigest = crypto.createHash("sha256").update(canonical).digest("hex");

  return {
    certifiedClassification,
    isClassAApproved,
    totalRequirements: requirements.length,
    passedCount,
    blockedCount,
    inProgressCount,
    failedCount,
    criticalBlockers,
    auditDigest,
    assessmentTimestamp: new Date().toISOString(),
  };
}
