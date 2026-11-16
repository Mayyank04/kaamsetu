/**
 * KAAMSETU — Credential Domain Service
 * Sovereign cryptographic credential signing, verification, and W3C interoperability.
 */

import {
  signEd25519Credential,
  verifyEd25519Credential,
  CanonicalCredentialPayload,
  CredentialSignatureResult,
  VerificationResult,
  DEFAULT_KEY_VERSION,
} from "@/lib/crypto/credential-signer";
import { ValidationError } from "@/lib/errors/app-error";

export class CredentialService {
  /**
   * Signs a worker credential using sovereign Ed25519 private key
   */
  public static signCredential(
    payload: CanonicalCredentialPayload,
    keyVersion: string = DEFAULT_KEY_VERSION
  ): CredentialSignatureResult {
    if (!payload.workerProfileId) {
      throw new ValidationError("Worker profile ID is required for credential signing", {
        field: "workerProfileId",
      });
    }
    if (!payload.fullName) {
      throw new ValidationError("Full name is required for credential signing", {
        field: "fullName",
      });
    }
    return signEd25519Credential(payload, { keyVersion });
  }

  /**
   * Verifies an Ed25519 cryptographic credential assertion
   */
  public static verifyCredential(
    payload: CanonicalCredentialPayload,
    signature: string,
    keyVersion: string = DEFAULT_KEY_VERSION
  ): VerificationResult {
    if (!signature) {
      throw new ValidationError("Signature is required for credential verification", {
        field: "signature",
      });
    }
    return verifyEd25519Credential(payload, signature, { keyVersion });
  }

  /**
   * Formats a W3C-compliant Verifiable Credential presentation
   */
  public static formatVerifiableCredential(
    payload: CanonicalCredentialPayload,
    sigResult: CredentialSignatureResult
  ) {
    return {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://kaamsetu.in/schemas/v1",
      ],
      id: `urn:uuid:${payload.registryId}`,
      type: ["VerifiableCredential", "VocationalSkillCredential"],
      issuer: {
        id: "did:kaamsetu:trust-protocol",
        name: payload.issuer,
      },
      issuanceDate: sigResult.issuedAt,
      credentialSubject: {
        id: `did:kaamsetu:worker:${payload.workerProfileId}`,
        name: payload.fullName,
        trade: payload.primaryTrade,
        category: payload.category,
        nsqfLevel: payload.nsqfLevel,
        status: payload.status,
      },
      proof: {
        type: "Ed25519Signature2020",
        created: sigResult.issuedAt,
        verificationMethod: `did:kaamsetu:trust-protocol#${sigResult.keyVersion}`,
        proofPurpose: "assertionMethod",
        proofValue: sigResult.signature,
        canonicalHash: sigResult.canonicalHash,
      },
    };
  }
}
