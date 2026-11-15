/**
 * KAAMSETU Institutional Blocker Service
 * Phase 24 — Pillar A: Authoritative Register for Mandatory Class A Blockers
 * 
 * Manages the 8-state resolution lifecycle for external counterparty dependencies:
 * 1. registered
 * 2. scoping_completed
 * 3. draft_circulated
 * 4. counterparty_legal_review
 * 5. cabinet_or_council_pending
 * 6. approved_pending_execution
 * 7. executed_active
 * 8. blocked
 */

import crypto from "crypto";

export type BlockerLifecycleStatus =
  | "registered"
  | "scoping_completed"
  | "draft_circulated"
  | "counterparty_legal_review"
  | "cabinet_or_council_pending"
  | "approved_pending_execution"
  | "executed_active"
  | "blocked";

export interface InstitutionalBlocker {
  blockerCode: string;
  blockerTitle: string;
  counterpartyName: string;
  currentStatus: BlockerLifecycleStatus;
  underlyingInstrumentRef: string | null;
  requiredAction: string;
  responsibleRemediationOwner: string;
  externalCounterpartyOwner: string;
  blockingRationale: string;
  resolutionCriteria: string;
  evidenceDigest: string;
  notes: string | null;
  lastEvaluatedAt: string;
}

export interface GateReadinessAssessment {
  allResolved: boolean;
  activeBlockerCount: number;
  resolvedBlockerCount: number;
  blockers: InstitutionalBlocker[];
  gateVerdict: "PROCEED_TO_CLASS_A" | "RETAIN_CLASS_B_CONTROLLED_ROLLOUT";
  reasonsForRetention: string[];
  digest: string;
  evaluatedAt: string;
}

export function computeBlockerDigest(blocker: Partial<InstitutionalBlocker>): string {
  const canonical = JSON.stringify({
    code: blocker.blockerCode,
    status: blocker.currentStatus,
    counterparty: blocker.counterpartyName,
    action: blocker.requiredAction,
    criteria: blocker.resolutionCriteria,
  });
  return crypto.createHash("sha256").update(canonical).digest("hex");
}

export const CANONICAL_CLASS_A_BLOCKERS: InstitutionalBlocker[] = (
  [
    {
      blockerCode: "BLOCKER-01",
      blockerTitle: "TSDM Bilateral MoU & Government Cabinet Approval",
      counterpartyName: "Tripura Skill Development Mission (TSDM), Directorate of Skill Development, Govt. of Tripura",
      currentStatus: "cabinet_or_council_pending" as BlockerLifecycleStatus,
      underlyingInstrumentRef: "TSDM/EXP/2026/MOU-DRAFT-04",
      requiredAction: "Bilateral institutional execution under Tripura State Skill Cabinet notification with wet-ink/digital signing",
      responsibleRemediationOwner: "Head of Institutional Partnerships & Legal Compliance",
      externalCounterpartyOwner: "Director of Skill Development, Govt. of Tripura",
      blockingRationale: "Field operations in Tripura remain in research-only status until bilateral execution is ratified by State Cabinet",
      resolutionCriteria: "Gazette notification or signed bilateral MoU registration in official state repository with dual authentication",
      evidenceDigest: "",
      notes: "Draft circulated and approved in committee; awaiting formal Cabinet scheduling",
      lastEvaluatedAt: "2026-11-15T00:00:00.000Z",
    },
    {
      blockerCode: "BLOCKER-02",
      blockerTitle: "ONDC & ONest Production Key Ceremony & Registry Listing",
      counterpartyName: "Open Network for Digital Commerce (ONDC) Council & ONest Consortium Registry",
      currentStatus: "approved_pending_execution" as BlockerLifecycleStatus,
      underlyingInstrumentRef: "ONDC/PROD/CEREMONY/2026-Q4",
      requiredAction: "Formal production key ceremony and registration on production registry smart contract/ledger",
      responsibleRemediationOwner: "Chief Information Security Officer & Core Infrastructure Lead",
      externalCounterpartyOwner: "ONDC Technical Operations Lead & ONest Working Group Convenor",
      blockingRationale: "Current operations are verified on staging networks (staging.ondc.org). Production orders require root signing ceremony",
      resolutionCriteria: "Production Ed25519 participant key listed in ONDC production registry with status 'ACTIVE'",
      evidenceDigest: "",
      notes: "Staging sandbox certified 100% compliant; key ceremony scheduled with registrar",
      lastEvaluatedAt: "2026-11-15T00:00:00.000Z",
    },
    {
      blockerCode: "BLOCKER-03",
      blockerTitle: "National Highway (NHIDCL) & Airport EPC Pilot Stamped Agreements",
      counterpartyName: "National Highways & Infrastructure Development Corp (NHIDCL) & Shillong Airport EPC Consortium",
      currentStatus: "counterparty_legal_review" as BlockerLifecycleStatus,
      underlyingInstrumentRef: "EPC/NHIDCL-SHL/PILOT-2026-REV3",
      requiredAction: "Physical non-judicial stamped paper tripartite master agreements with corporate board resolutions",
      responsibleRemediationOwner: "Head of Enterprise Partnerships & Labor Welfare Officer",
      externalCounterpartyOwner: "Chief General Manager (Technical), NHIDCL & Project Director, EPC Lead Partner",
      blockingRationale: "EPC pilot onboarding cannot commence on active highway/aviation work sites without executed indemnity and wage escrow",
      resolutionCriteria: "Executed stamped agreements registered with bank-guaranteed wage escrow accounts and zero worker wage deduction clauses",
      evidenceDigest: "",
      notes: "Board resolutions drafted and under legal review by consortium counsel",
      lastEvaluatedAt: "2026-11-15T00:00:00.000Z",
    },
  ] as InstitutionalBlocker[]
).map((b) => ({
  ...b,
  evidenceDigest: computeBlockerDigest(b),
}));

export function evaluateBlockerStatus(blocker: InstitutionalBlocker): {
  isResolved: boolean;
  canAdvance: boolean;
  nextStatus: BlockerLifecycleStatus;
} {
  const lifecycleOrder: BlockerLifecycleStatus[] = [
    "registered",
    "scoping_completed",
    "draft_circulated",
    "counterparty_legal_review",
    "cabinet_or_council_pending",
    "approved_pending_execution",
    "executed_active",
  ];

  const currentIndex = lifecycleOrder.indexOf(blocker.currentStatus);
  const isResolved = blocker.currentStatus === "executed_active";

  if (blocker.currentStatus === "blocked") {
    return { isResolved: false, canAdvance: false, nextStatus: "blocked" };
  }

  if (isResolved || currentIndex === -1 || currentIndex >= lifecycleOrder.length - 1) {
    return { isResolved, canAdvance: false, nextStatus: blocker.currentStatus };
  }

  const nextStatus = lifecycleOrder[currentIndex + 1];
  return { isResolved, canAdvance: true, nextStatus };
}

export function assessInstitutionalGateReadiness(
  blockers: InstitutionalBlocker[] = CANONICAL_CLASS_A_BLOCKERS
): GateReadinessAssessment {
  let resolvedCount = 0;
  let activeBlockerCount = 0;
  const reasonsForRetention: string[] = [];

  for (const blocker of blockers) {
    if (blocker.currentStatus === "executed_active") {
      resolvedCount++;
    } else {
      activeBlockerCount++;
      reasonsForRetention.push(
        `[${blocker.blockerCode}] ${blocker.blockerTitle} - Pending at stage '${blocker.currentStatus}': ${blocker.blockingRationale}`
      );
    }
  }

  const allResolved = activeBlockerCount === 0 && resolvedCount === blockers.length;
  const gateVerdict: "PROCEED_TO_CLASS_A" | "RETAIN_CLASS_B_CONTROLLED_ROLLOUT" = allResolved
    ? "PROCEED_TO_CLASS_A"
    : "RETAIN_CLASS_B_CONTROLLED_ROLLOUT";

  const digest = crypto
    .createHash("sha256")
    .update(
      JSON.stringify({
        gateVerdict,
        resolvedCount,
        activeBlockerCount,
        blockerCodes: blockers.map((b) => `${b.blockerCode}:${b.currentStatus}`),
      })
    )
    .digest("hex");

  return {
    allResolved,
    activeBlockerCount,
    resolvedBlockerCount: resolvedCount,
    blockers,
    gateVerdict,
    reasonsForRetention,
    digest,
    evaluatedAt: new Date().toISOString(),
  };
}
