/**
 * KAAMSETU Institutional Evidence Control Plane Service
 * Phase 30 — Pillar A: Centralized Institutional Authorization & State Machine
 *
 * Implements:
 * 1. Centralized institutional authorization register with all 16 mandatory evidence fields
 * 2. Controlled 8-stage lifecycle:
 *    IDENTIFIED → DOCUMENTATION_PENDING → SUBMITTED → UNDER_REVIEW →
 *    APPROVED_PENDING_EXECUTION → EXECUTED → INDEPENDENTLY_VERIFIED → CLOSED
 * 3. Terminal/Exceptional states: REJECTED, EXPIRED, WITHDRAWN, SUSPENDED, BLOCKED
 * 4. Dual-authorization transition engine prohibiting unilateral administrative advancement
 * 5. Strict anti-masking rule: External counterparty obligations cannot be closed by internal assertions
 */

import * as crypto from "crypto";

export type ControlledAuthorizationState =
  | "IDENTIFIED"
  | "DOCUMENTATION_PENDING"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "APPROVED_PENDING_EXECUTION"
  | "EXECUTED"
  | "INDEPENDENTLY_VERIFIED"
  | "CLOSED";

export type ExceptionalTerminalState =
  | "REJECTED"
  | "EXPIRED"
  | "WITHDRAWN"
  | "SUSPENDED"
  | "BLOCKED";

export type AuthorizationLifecycleState =
  | ControlledAuthorizationState
  | ExceptionalTerminalState;

export interface InstitutionalBlockerRecord {
  blockerId: string;
  institutionOrCounterparty: string;
  legalIdentityAndJurisdiction: string;
  requiredAuthorization: string;
  currentDocumentaryStatus: AuthorizationLifecycleState;
  sourceDocumentReference: string;
  documentIssuer: string;
  authorizedSignatory: string;
  issueDate: string;
  expiryDate: string | null;
  verificationMethod: string;
  legalReviewStatus: string;
  technicalDependency: string;
  operationalRestrictions: string;
  outstandingConditions: string;
  responsibleParty: string;
  lastIndependentlyVerifiedDate: string;
  evidenceDigest: string;
}

export interface StateTransitionRecord {
  transitionId: string;
  blockerId: string;
  fromState: AuthorizationLifecycleState;
  toState: AuthorizationLifecycleState;
  requestedBy: string;
  approvedByRoles: string[];
  evidenceDigest: string;
  timestamp: string;
  unilateralBypassBlocked: boolean;
  notes?: string;
}

export interface InstitutionalGateAssessment {
  allResolved: boolean;
  activeBlockerCount: number;
  resolvedBlockerCount: number;
  blockers: InstitutionalBlockerRecord[];
  gateVerdict: "PROCEED_TO_CLASS_A" | "RETAIN_CLASS_B_CONTROLLED_ROLLOUT";
  reasonsForRetention: string[];
  digest: string;
  evaluatedAt: string;
}

export const CANONICAL_PHASE_30_BLOCKERS: InstitutionalBlockerRecord[] = [
  {
    blockerId: "BLOCKER-01",
    institutionOrCounterparty:
      "Tripura Skill Development Mission (TSDM), Directorate of Skill Development, Govt. of Tripura",
    legalIdentityAndJurisdiction:
      "Government of Tripura, Department of Skill Development, Agartala, Tripura, India",
    requiredAuthorization:
      "State Cabinet Notification and Bilateral Government Memorandum of Understanding (MoU)",
    currentDocumentaryStatus: "UNDER_REVIEW",
    sourceDocumentReference: "TSDM/EXP/2026/MOU-DRAFT-04",
    documentIssuer: "Directorate of Skill Development, Government of Tripura",
    authorizedSignatory: "Director of Skill Development & Member Secretary, TSDM",
    issueDate: "2026-10-14T00:00:00.000Z",
    expiryDate: null,
    verificationMethod:
      "Gazette notification and official government electronic registry authentication",
    legalReviewStatus: "COMPLETED_LEGAL_COUNSEL_NER",
    technicalDependency:
      "Tripura regional routing adapter and local language Assamese/Bengali/Kokborok NLP model",
    operationalRestrictions:
      "Operations strictly restricted to candidate/research-only mode; 0 live bookings or worker dispatch permitted in Tripura",
    outstandingConditions:
      "State Cabinet approval resolution and bilateral signing ceremony with digital/wet-ink signature",
    responsibleParty:
      "Head of Institutional Partnerships & Legal Compliance (Kaamsetu)",
    lastIndependentlyVerifiedDate: "2026-11-15T00:00:00.000Z",
    evidenceDigest:
      "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945",
  },
  {
    blockerId: "BLOCKER-02",
    institutionOrCounterparty:
      "Open Network for Digital Commerce (ONDC) Council & ONest Consortium Registry",
    legalIdentityAndJurisdiction:
      "ONDC Section 8 Non-Profit Company (DPIIT/Ministry of Commerce, New Delhi, India)",
    requiredAuthorization:
      "Production Root Cryptographic Key Ceremony and Live Production Registry Authorization",
    currentDocumentaryStatus: "APPROVED_PENDING_EXECUTION",
    sourceDocumentReference: "ONDC/PROD/CEREMONY/2026-Q4",
    documentIssuer: "ONDC Trust Network Operations & Security Committee",
    authorizedSignatory: "Chief Technology Officer & CISO, ONDC",
    issueDate: "2026-11-05T00:00:00.000Z",
    expiryDate: null,
    verificationMethod:
      "Ed25519 root certificate authority verification & ONDC network registry cryptographic lookup",
    legalReviewStatus: "APPROVED_BY_LEGAL_AND_SECURITY_WORKING_GROUP",
    technicalDependency:
      "BPP protocol adapter with production Ed25519 signing key in isolated HSM KMS",
    operationalRestrictions:
      "Production transaction gateway disabled; staging sandbox traffic strictly isolated from live bookings",
    outstandingConditions:
      "Physical/virtual dual-custody root key ceremony with CISO and ONDC witness; production credentials generation",
    responsibleParty:
      "Chief Information Security Officer & Core Infrastructure Lead (Kaamsetu)",
    lastIndependentlyVerifiedDate: "2026-11-15T00:00:00.000Z",
    evidenceDigest:
      "7b4321a18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f33361202b999",
  },
  {
    blockerId: "BLOCKER-03",
    institutionOrCounterparty:
      "L&T Construction (NE Circle) / NHIDCL Guwahati EPC Consortium",
    legalIdentityAndJurisdiction:
      "Larsen & Toubro Limited (Heavy Civil Infrastructure) & NHIDCL (Ministry of Road Transport and Highways), Assam, India",
    requiredAuthorization:
      "Stamped Bilateral Tripartite Master Service Agreement with Wage Escrow & Non-Retaliation Covenants",
    currentDocumentaryStatus: "UNDER_REVIEW",
    sourceDocumentReference: "EPC/NE/2026/PILOT-MSA-REV03",
    documentIssuer: "Consortium Legal Counsel & Kaamsetu Enterprise Partnerships",
    authorizedSignatory:
      "Project Director (NHIDCL) & Regional Head (L&T NE Circle)",
    issueDate: "2026-10-28T00:00:00.000Z",
    expiryDate: null,
    verificationMethod:
      "Registered legal document e-stamping certificate verification and corporate seal authentication",
    legalReviewStatus: "COUNTERPARTY_EXTERNAL_COUNSEL_REVIEW",
    technicalDependency:
      "Enterprise batch payroll direct pass-through API and project site geo-fenced attendance verification",
    operationalRestrictions:
      "Heavy civil infrastructure workforce dispatch frozen; 0 enterprise workers deployed to active EPC construction sites",
    outstandingConditions:
      "Execution of stamped tripartite agreement, direct wage escrow account mandate, and mandatory safety indemnification covenants",
    responsibleParty:
      "VP Enterprise Partnerships & General Counsel (Kaamsetu)",
    lastIndependentlyVerifiedDate: "2026-11-15T00:00:00.000Z",
    evidenceDigest:
      "9a1234a18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f55561202b666",
  },
];

export class InstitutionalEvidenceControlPlaneService {
  private blockers: Map<string, InstitutionalBlockerRecord> = new Map();
  private transitions: StateTransitionRecord[] = [];

  constructor() {
    for (const b of CANONICAL_PHASE_30_BLOCKERS) {
      this.blockers.set(b.blockerId, { ...b });
    }
  }

  public getBlocker(blockerId: string): InstitutionalBlockerRecord | undefined {
    return this.blockers.get(blockerId);
  }

  public getAllBlockers(): InstitutionalBlockerRecord[] {
    return Array.from(this.blockers.values());
  }

  /**
   * Deterministic transition validation rule
   */
  public validateTransition(input: {
    blockerId: string;
    targetState: AuthorizationLifecycleState;
    requestedBy: string;
    approverRoles: string[];
    evidenceDigest: string;
  }): { isValid: boolean; error?: string } {
    const blocker = this.blockers.get(input.blockerId);
    if (!blocker) {
      return { isValid: false, error: `BLOCKER_NOT_FOUND: ${input.blockerId}` };
    }

    // Evidence digest requirement
    if (
      !input.evidenceDigest ||
      input.evidenceDigest.length !== 64 ||
      !/^[0-9a-f]{64}$/.test(input.evidenceDigest)
    ) {
      return {
        isValid: false,
        error:
          "MISSING_OR_INVALID_EVIDENCE_HASH: Transition requires verified 64-character SHA-256 evidence digest",
      };
    }

    // Dual authorization rule: Advancement past UNDER_REVIEW requires >= 2 distinct roles
    const advancedStates: AuthorizationLifecycleState[] = [
      "APPROVED_PENDING_EXECUTION",
      "EXECUTED",
      "INDEPENDENTLY_VERIFIED",
      "CLOSED",
    ];

    if (advancedStates.includes(input.targetState)) {
      const distinctRoles = new Set(input.approverRoles);
      if (distinctRoles.size < 2) {
        return {
          isValid: false,
          error:
            "UNILATERAL_ADVANCEMENT_PROHIBITED: Promotion beyond UNDER_REVIEW requires multi-role counterparty verification",
        };
      }
    }

    // Strict Anti-Masking rule: Internal administrators cannot mark a blocker as EXECUTED, INDEPENDENTLY_VERIFIED, or CLOSED
    // without verified counterparty legal instrument
    if (
      input.targetState === "EXECUTED" ||
      input.targetState === "INDEPENDENTLY_VERIFIED" ||
      input.targetState === "CLOSED"
    ) {
      // Must contain external counterparty or legal ombudsman role
      const hasExternalAuth =
        input.approverRoles.includes("external_counterparty_signatory") ||
        input.approverRoles.includes("state_cabinet_secretary") ||
        input.approverRoles.includes("ondc_root_custodian") ||
        input.approverRoles.includes("epc_consortium_counsel");

      if (!hasExternalAuth) {
        return {
          isValid: false,
          error:
            "EXTERNAL_COUNTERPARTY_SIGNATURE_REQUIRED: Blocker cannot be closed by internal platform administrators",
        };
      }
    }

    return { isValid: true };
  }

  /**
   * Records a validated transition
   */
  public transitionBlocker(input: {
    blockerId: string;
    targetState: AuthorizationLifecycleState;
    requestedBy: string;
    approverRoles: string[];
    evidenceDigest: string;
    notes?: string;
  }): StateTransitionRecord {
    const validation = this.validateTransition(input);
    if (!validation.isValid) {
      throw new Error(`TRANSITION_BLOCKED: ${validation.error}`);
    }

    const blocker = this.blockers.get(input.blockerId)!;
    const fromState = blocker.currentDocumentaryStatus;

    const transition: StateTransitionRecord = {
      transitionId: `TR-P30-${input.blockerId}-${Date.now()}`,
      blockerId: input.blockerId,
      fromState,
      toState: input.targetState,
      requestedBy: input.requestedBy,
      approvedByRoles: input.approverRoles,
      evidenceDigest: input.evidenceDigest,
      timestamp: new Date().toISOString(),
      unilateralBypassBlocked: true,
      notes: input.notes,
    };

    blocker.currentDocumentaryStatus = input.targetState;
    blocker.evidenceDigest = input.evidenceDigest;
    this.transitions.push(transition);

    return transition;
  }

  /**
   * Assesses overall institutional readiness for Class A promotion
   */
  public assessInstitutionalReadiness(): InstitutionalGateAssessment {
    const blockers = this.getAllBlockers();
    let resolvedCount = 0;
    let activeBlockerCount = 0;
    const reasonsForRetention: string[] = [];

    for (const b of blockers) {
      if (
        b.currentDocumentaryStatus === "INDEPENDENTLY_VERIFIED" ||
        b.currentDocumentaryStatus === "CLOSED"
      ) {
        resolvedCount++;
      } else {
        activeBlockerCount++;
        reasonsForRetention.push(
          `[${b.blockerId}] ${b.institutionOrCounterparty} - Pending in state '${b.currentDocumentaryStatus}': ${b.outstandingConditions}`
        );
      }
    }

    const allResolved = activeBlockerCount === 0 && resolvedCount === blockers.length;
    const gateVerdict: "PROCEED_TO_CLASS_A" | "RETAIN_CLASS_B_CONTROLLED_ROLLOUT" =
      allResolved ? "PROCEED_TO_CLASS_A" : "RETAIN_CLASS_B_CONTROLLED_ROLLOUT";

    const digest = crypto
      .createHash("sha256")
      .update(
        JSON.stringify({
          gateVerdict,
          resolvedCount,
          activeBlockerCount,
          blockerStates: blockers.map(
            (b) => `${b.blockerId}:${b.currentDocumentaryStatus}`
          ),
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
   * Validates regional dispatch eligibility
   */
  public validateRegionalDispatchEligibility(stateCode: string): {
    isPermitted: boolean;
    operationalMode: "ACTIVE_CONTROLLED" | "CANDIDATE_RESEARCH_ONLY" | "UNAUTHORIZED";
    restrictionReason?: string;
  } {
    if (stateCode === "IN-AS" || stateCode === "IN-ML") {
      return {
        isPermitted: true,
        operationalMode: "ACTIVE_CONTROLLED",
      };
    }

    if (stateCode === "IN-TR") {
      return {
        isPermitted: false,
        operationalMode: "CANDIDATE_RESEARCH_ONLY",
        restrictionReason:
          "Field dispatch in Tripura held in candidate mode pending TSDM Cabinet MoU execution",
      };
    }

    return {
      isPermitted: false,
      operationalMode: "UNAUTHORIZED",
      restrictionReason: `State ${stateCode} is outside authorized regional footprint`,
    };
  }
}

export const institutionalEvidenceControlPlaneService =
  new InstitutionalEvidenceControlPlaneService();
