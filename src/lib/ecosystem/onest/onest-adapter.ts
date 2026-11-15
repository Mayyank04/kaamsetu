/**
 * ONest & Employment Ecosystem Integration Adapter
 * Pillar B: Implements interoperability mapping between KAAMSETU Schema 2.0
 * Verifiable Credentials and ONest / DSEP (Decentralised Special Education & Placement)
 * schemas, enforcing worker sovereignty and strict immutable profile protection.
 *
 * MISSION INVARIANT: "Every skill deserves to be seen, even without a degree."
 * CONSTITUTIONAL INVARIANT: 0.00% commission on worker wages.
 */

import crypto from "crypto";
import { IdentitySchemaV2Export } from "../../identity/identity-schema-v2-service";

export interface OnestLearningCredentialDescriptor {
  id: string;
  name: string;
  code: string;
  nsqf_level?: number | null;
  issued_by: {
    id: string;
    name: string;
    accreditation_body: string;
  };
  issuance_date: string;
  status: "verified" | "revoked" | "provisional";
  verification_url: string;
}

export interface OnestCandidateProfile {
  id: string;
  descriptor: {
    name: string; // Worker name or masked moniker
    short_desc: string;
  };
  skills: Array<{
    name: string;
    category: string;
    years_practiced: number | null;
    verification_tier: string;
  }>;
  credentials: OnestLearningCredentialDescriptor[];
  work_mobility: {
    preferred_jurisdiction: string;
    interstate_allowed: boolean;
  };
  sovereignty: {
    worker_consent_id: string;
    data_minimization: boolean;
    allows_external_mutation: false; // Invariant: external platforms cannot mutate
  };
}

export interface OnestOpportunitySyncRequest {
  external_job_id: string;
  title: string;
  trade_category: string;
  required_skills: string[];
  statutory_daily_rate_min: number;
  statutory_daily_rate_max: number;
  location: {
    district: string;
    state: string;
  };
  employer_name: string;
}

export class OnestAdapter {
  /**
   * Transforms a KAAMSETU Schema 2.0 Dossier into an ONest DSEP-compliant Profile.
   * Strips all non-consented PII (phone, Aadhaar, private bank details).
   */
  public static mapSchemaV2ToOnest(
    v2Export: IdentitySchemaV2Export,
    consentToken: string,
    workerName: string,
    state: string
  ): OnestCandidateProfile {
    // 1. Verify consent token is provided
    if (!consentToken || consentToken.trim().length === 0) {
      throw new Error("Worker consent token required for ONest network profile export.");
    }

    // 2. Map credentials to ONest format
    const credentials: OnestLearningCredentialDescriptor[] = (v2Export.institutionalCredentials || []).map((vc, idx) => ({
      id: vc.credentialIdentifier || `onest-cred-${idx + 1}`,
      name: vc.tradeTitle || "Vocational Competency",
      code: vc.tradeTitle || "SKILL",
      nsqf_level: vc.nsqfLevel ?? null,
      issued_by: {
        id: "kaamsetu-registry",
        name: vc.issuingInstitution || "KAAMSETU Skill Registry",
        accreditation_body: "NSDC / State Skill Mission",
      },
      issuance_date: vc.issuanceDate || new Date().toISOString(),
      status: vc.status === "active" ? "verified" : vc.status === "revoked" ? "revoked" : "provisional",
      verification_url: `https://kaamsetu.org/verify/${vc.credentialIdentifier || "credential"}`,
    }));

    // 3. Map skills
    const skills = (v2Export.workerProfile?.skills || []).map((s: string) => ({
      name: s,
      category: v2Export.workerProfile?.primaryTrade || "Vocational Trade",
      years_practiced: null,
      verification_tier: "institutional_verified",
    }));

    return {
      id: `onest-worker-${v2Export.id.substring(0, 8)}`,
      descriptor: {
        name: workerName,
        short_desc: `Sovereign certified worker in ${state} with ${credentials.length} verified credentials.`,
      },
      skills,
      credentials,
      work_mobility: {
        preferred_jurisdiction: state,
        interstate_allowed: true,
      },
      sovereignty: {
        worker_consent_id: consentToken,
        data_minimization: true,
        allows_external_mutation: false, // Strict invariant
      },
    };
  }

  /**
   * Asserts that external ONest synchronization cannot silently overwrite
   * worker-controlled identity attributes.
   */
  public static validateIncomingMutationAttempt(mutation: {
    target_worker_id: string;
    field: string;
    proposed_value: any;
    originating_network: string;
  }): { allowed: boolean; rejection_reason?: string } {
    const protectedFields = [
      "full_name",
      "phone",
      "identity_number",
      "primary_trade",
      "skills",
      "verification_status",
      "wage_payout_ledger",
    ];

    if (protectedFields.includes(mutation.field)) {
      return {
        allowed: false,
        rejection_reason: `Field '${mutation.field}' is protected by worker digital sovereignty. External network '${mutation.originating_network}' cannot overwrite worker claims.`,
      };
    }

    return { allowed: true };
  }

  /**
   * Generates a deterministic idempotency digest for ONest opportunity sync
   */
  public static computeOpportunityDigest(opp: OnestOpportunitySyncRequest): string {
    const payload = `${opp.external_job_id}:${opp.trade_category}:${opp.location.district}:${opp.statutory_daily_rate_min}`;
    return crypto.createHash("sha256").update(payload).digest("hex");
  }
}
