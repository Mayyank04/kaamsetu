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

/**
 * Authoritative 6-stage lifecycle model (Phase 28 Pillar B)
 */
export type AuthoritativeBlockerState =
  | "IDENTIFIED"
  | "EVIDENCE_REQUESTED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "EXECUTED"
  | "EFFECTIVE";

export type BlockerTerminalState =
  | "REJECTED"
  | "EXPIRED"
  | "SUPERSEDED"
  | "BLOCKED";

export interface BlockerStateTransition {
  transitionId: string;
  blockerCode: string;
  fromState: AuthoritativeBlockerState | BlockerTerminalState;
  toState: AuthoritativeBlockerState | BlockerTerminalState;
  requestedBy: string;
  approvedByRoles: string[];
  evidenceHash: string;
  timestamp: string;
  unilateralBypassBlocked: boolean;
  notes?: string;
}

export interface InstitutionalBlocker {
  blockerCode: string;
  blockerTitle: string;
  counterpartyName: string;
  currentStatus: BlockerLifecycleStatus;
  authoritativeState?: AuthoritativeBlockerState | BlockerTerminalState;
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

/**
 * Maps 8-status lifecycle to authoritative 6-stage model (Phase 28 Pillar B)
 */
export function mapToAuthoritativeState(status: BlockerLifecycleStatus): AuthoritativeBlockerState | BlockerTerminalState {
  switch (status) {
    case "registered":
    case "scoping_completed":
      return "IDENTIFIED";
    case "draft_circulated":
      return "EVIDENCE_REQUESTED";
    case "counterparty_legal_review":
    case "cabinet_or_council_pending":
      return "UNDER_REVIEW";
    case "approved_pending_execution":
      return "APPROVED";
    case "executed_active":
      return "EXECUTED";
    case "blocked":
      return "BLOCKED";
    default:
      return "IDENTIFIED";
  }
}

export const BLOCKER_TRANSITION_HISTORY: BlockerStateTransition[] = [
  {
    transitionId: "TR-BLK-01-01",
    blockerCode: "BLOCKER-01",
    fromState: "IDENTIFIED",
    toState: "EVIDENCE_REQUESTED",
    requestedBy: "Director, Institutional Programs",
    approvedByRoles: ["institutional_lead"],
    evidenceHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    timestamp: "2026-08-10T10:00:00Z",
    unilateralBypassBlocked: true,
    notes: "Circulated bilateral draft to Directorate of Skill Development",
  },
  {
    transitionId: "TR-BLK-01-02",
    blockerCode: "BLOCKER-01",
    fromState: "EVIDENCE_REQUESTED",
    toState: "UNDER_REVIEW",
    requestedBy: "Legal Counsel (North East Region)",
    approvedByRoles: ["legal_counsel", "institutional_lead"],
    evidenceHash: "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945",
    timestamp: "2026-10-14T15:30:00Z",
    unilateralBypassBlocked: true,
    notes: "Draft MoU reviewed; forwarded to State Cabinet secretariat",
  },
  {
    transitionId: "TR-BLK-02-01",
    blockerCode: "BLOCKER-02",
    fromState: "IDENTIFIED",
    toState: "EVIDENCE_REQUESTED",
    requestedBy: "Core Infrastructure Lead",
    approvedByRoles: ["ciso"],
    evidenceHash: "1a8565a9d214a1a3614d9b4b92b6a2f347ebca87f8b9e67b2d2026e6ef121111",
    timestamp: "2026-09-01T09:00:00Z",
    unilateralBypassBlocked: true,
    notes: "ONDC sandbox integration verified",
  },
  {
    transitionId: "TR-BLK-02-02",
    blockerCode: "BLOCKER-02",
    fromState: "EVIDENCE_REQUESTED",
    toState: "UNDER_REVIEW",
    requestedBy: "CISO",
    approvedByRoles: ["ciso", "principal_architect"],
    evidenceHash: "6c5432a18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f22261202b888",
    timestamp: "2026-10-20T11:00:00Z",
    unilateralBypassBlocked: true,
    notes: "Security and integration review completed by ONDC technical committee",
  },
  {
    transitionId: "TR-BLK-02-03",
    blockerCode: "BLOCKER-02",
    fromState: "UNDER_REVIEW",
    toState: "APPROVED",
    requestedBy: "CISO",
    approvedByRoles: ["ciso", "ondc_working_group_chair"],
    evidenceHash: "7b4321a18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f33361202b999",
    timestamp: "2026-11-05T14:00:00Z",
    unilateralBypassBlocked: true,
    notes: "Approved by ONDC council; pending production key signing ceremony",
  },
  {
    transitionId: "TR-BLK-03-01",
    blockerCode: "BLOCKER-03",
    fromState: "IDENTIFIED",
    toState: "EVIDENCE_REQUESTED",
    requestedBy: "Enterprise Partnerships Lead",
    approvedByRoles: ["institutional_lead"],
    evidenceHash: "2b7654a18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f44461202b777",
    timestamp: "2026-09-15T16:00:00Z",
    unilateralBypassBlocked: true,
    notes: "EPC pilot framework drafted for NHIDCL and Airport projects",
  },
  {
    transitionId: "TR-BLK-03-02",
    blockerCode: "BLOCKER-03",
    fromState: "EVIDENCE_REQUESTED",
    toState: "UNDER_REVIEW",
    requestedBy: "Labor Welfare Officer",
    approvedByRoles: ["legal_counsel", "labor_welfare_officer"],
    evidenceHash: "9a1234a18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f55561202b666",
    timestamp: "2026-10-28T12:00:00Z",
    unilateralBypassBlocked: true,
    notes: "Tripartite agreements under review by NHIDCL legal counsel",
  },
];

/**
 * Validates transition rules and enforces non-unilateral requirement (Phase 28 Pillar B)
 */
export function validateBlockerTransition(
  blockerCode: string,
  targetState: AuthoritativeBlockerState | BlockerTerminalState,
  requestedByRole: string,
  approverRoles: string[],
  evidenceDigest: string
): { isValid: boolean; error?: string } {
  if (!evidenceDigest || evidenceDigest.length !== 64 || !/^[0-9a-f]{64}$/.test(evidenceDigest)) {
    return {
      isValid: false,
      error: "MISSING_OR_INVALID_EVIDENCE_HASH: Transition requires verified 64-char hex SHA-256 evidence digest",
    };
  }

  // Dual authorization rule: Advancing past UNDER_REVIEW requires at least two distinct approval roles
  if (targetState === "APPROVED" || targetState === "EXECUTED" || targetState === "EFFECTIVE") {
    const distinctRoles = new Set(approverRoles);
    if (distinctRoles.size < 2) {
      return {
        isValid: false,
        error: "UNILATERAL_ADVANCEMENT_PROHIBITED: Promotion beyond UNDER_REVIEW requires dual-party verification",
      };
    }
  }

  return { isValid: true };
}
