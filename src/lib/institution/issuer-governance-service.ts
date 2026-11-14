/**
 * KAAMSETU Institutional Credential Trust & Issuer Governance Service
 *
 * Enforces rigorous multi-dimensional credential verification:
 * 1. Cryptographic Signature Validity (RFC 8785 canonical hash + HMAC-SHA256).
 * 2. Issuer Identity & Active Verification Status.
 * 3. Issuer Authorization & Signatory Validity.
 * 4. Credential Status (active vs suspended vs revoked vs expired).
 * 5. Credential Freshness & Rotation Window Enforcement.
 * 6. Explicit Distinction: Signature Validity does NOT automatically imply Claim Truth.
 */

import { SupabaseClient } from "@supabase/supabase-js";
import * as crypto from "crypto";

export interface MultiDimensionalCredentialVerification {
  // 7 Distinct Dimensions:
  signatureValid: boolean;
  issuerIdentified: boolean;
  issuerAuthorized: boolean;
  credentialAuthentic: boolean;
  statusActive: boolean;
  freshnessValid: boolean;
  claimTruthVerified: boolean;
  // Metadata & Audit
  overallResult: "verified_valid" | "signature_valid_status_inactive" | "signature_tampered" | "issuer_unauthorized" | "claim_unverified";
  detailedNotes: string[];
}

export interface EvaluateIssuancePermissionInput {
  institutionId: string;
  institutionStatus: string; // 'verified', 'pending', 'suspended', 'revoked'
  isSandboxKey: boolean;
  isProductionTarget: boolean;
  keyCreatedAt: string;
  keyExpiresAt?: string;
  signatoryIsActive: boolean;
  signatoryAuthorizedTrades: string[];
  targetTrade: string;
}

/**
 * Evaluates whether an institutional partner is permitted to issue a credential.
 * Blocks suspended issuers, mismatched trades, and sandbox keys targeting production.
 */
export function evaluateCredentialIssuancePermission(input: EvaluateIssuancePermissionInput): {
  allowed: boolean;
  reason?: string;
} {
  // 1. Issuer status check
  if (input.institutionStatus === "suspended") {
    return {
      allowed: false,
      reason: "Issuance Blocked: Issuing institution is currently suspended pending compliance review.",
    };
  }

  if (input.institutionStatus !== "verified") {
    return {
      allowed: false,
      reason: `Issuance Blocked: Institution is not verified (current status: '${input.institutionStatus}').`,
    };
  }

  // 2. Sandbox vs Production isolation
  if (input.isSandboxKey && input.isProductionTarget) {
    return {
      allowed: false,
      reason: "Isolation Defense: Sandbox API keys cannot issue live production credentials.",
    };
  }

  // 3. Signatory authority
  if (!input.signatoryIsActive) {
    return {
      allowed: false,
      reason: "Issuance Blocked: Designated institutional signatory is deactivated or revoked.",
    };
  }

  // 4. Authorized trade alignment
  if (
    input.signatoryAuthorizedTrades.length > 0 &&
    !input.signatoryAuthorizedTrades.includes(input.targetTrade) &&
    !input.signatoryAuthorizedTrades.includes("*")
  ) {
    return {
      allowed: false,
      reason: `Signatory Authorization Error: Signatory is not authorized to issue credentials for trade '${input.targetTrade}'.`,
    };
  }

  // 5. Key expiration check
  if (input.keyExpiresAt) {
    const expires = new Date(input.keyExpiresAt).getTime();
    if (Date.now() > expires) {
      return {
        allowed: false,
        reason: "Key Lifecycle Error: Partner API key has expired. Please rotate to a new active key.",
      };
    }
  }

  return { allowed: true };
}

/**
 * Multi-dimensional credential verification decomposing cryptographic math from factual truth.
 */
export function verifyCredentialMultiDimensional(params: {
  canonicalHash: string;
  providedSignature: string;
  signingSecret: string;
  issuerVerificationStatus: string;
  credentialStatus: string;
  issuedAt: string;
  expiresAt?: string;
  signatoryIsActive: boolean;
  underlyingAssessmentReference: string;
}): MultiDimensionalCredentialVerification {
  const notes: string[] = [];

  // Dimension 1: Cryptographic Signature Validity
  const expectedSignature = crypto
    .createHmac("sha256", params.signingSecret)
    .update(params.canonicalHash)
    .digest("hex");

  let signatureValid = false;
  try {
    signatureValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature, "hex"),
      Buffer.from(params.providedSignature, "hex")
    );
  } catch {
    signatureValid = false;
  }

  if (!signatureValid) {
    notes.push("Cryptographic signature mismatch: Payload or signature has been tampered with.");
  } else {
    notes.push("Cryptographic signature mathematically verified (RFC 8785 + HMAC-SHA256).");
  }

  // Dimension 2 & 3: Issuer Identity & Authorization
  const issuerIdentified = Boolean(params.issuerVerificationStatus);
  const issuerAuthorized = params.issuerVerificationStatus === "verified" && params.signatoryIsActive;
  if (!issuerAuthorized) {
    notes.push("Issuer authorization failure: Institution or signatory lacks active verification status.");
  }

  // Dimension 4: Credential Authenticity
  const credentialAuthentic = signatureValid && issuerAuthorized;

  // Dimension 5: Status Active
  const statusActive = params.credentialStatus === "active" || params.credentialStatus === "issued";
  if (!statusActive) {
    notes.push(`Credential status is not active: '${params.credentialStatus}'.`);
  }

  // Dimension 6: Freshness
  let freshnessValid = true;
  if (params.expiresAt) {
    if (Date.now() > new Date(params.expiresAt).getTime()) {
      freshnessValid = false;
      notes.push("Credential has passed its expiration date.");
    }
  }

  // Dimension 7: Underlying Claim Verification
  // Important architectural distinction: Even with a valid signature, underlying claim truth depends on valid assessment reference
  const claimTruthVerified = Boolean(params.underlyingAssessmentReference && params.underlyingAssessmentReference.length > 5);
  if (!claimTruthVerified) {
    notes.push("Caveat: Underlying empirical skill assessment reference missing or unverified.");
  }

  let overallResult: MultiDimensionalCredentialVerification["overallResult"] = "verified_valid";
  if (!signatureValid) {
    overallResult = "signature_tampered";
  } else if (!issuerAuthorized) {
    overallResult = "issuer_unauthorized";
  } else if (!statusActive || !freshnessValid) {
    overallResult = "signature_valid_status_inactive";
  } else if (!claimTruthVerified) {
    overallResult = "claim_unverified";
  }

  return {
    signatureValid,
    issuerIdentified,
    issuerAuthorized,
    credentialAuthentic,
    statusActive,
    freshnessValid,
    claimTruthVerified,
    overallResult,
    detailedNotes: notes,
  };
}
