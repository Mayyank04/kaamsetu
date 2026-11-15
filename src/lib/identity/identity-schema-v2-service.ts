/**
 * KAAMSETU Phase 16: Worker Identity & Credential Schema 2.0 Interoperability Service
 *
 * Implements Schema 2.0 W3C-aligned verifiable identity exports, RFC 8785 canonical
 * JSON signing, backward compatibility with Schema 1.0, and offline freshness caveats.
 */

import * as crypto from "crypto";

export interface IdentitySchemaV2Export {
  "@context": string[];
  schemaVersion: "2.0";
  id: string; // Worker registry ID
  issuedAt: string;
  workerProfile: {
    fullName: string;
    primaryTrade: string;
    skills: string[];
    kaamScore: number;
    completedProjectsCount: number;
    ratingAverage: number;
  };
  institutionalCredentials: Array<{
    credentialIdentifier: string;
    tradeTitle: string;
    nsqfLevel: number | null;
    issuingInstitution: string;
    issuanceDate: string;
    status: "active" | "suspended" | "revoked";
  }>;
  selectiveDisclosure: {
    phoneDisclosed: boolean;
    earningsDisclosed: boolean;
    identityMasked: boolean;
  };
  integrityProof: {
    type: "HmacSha256Signature2026";
    created: string;
    verificationMethod: string;
    proofValue: string;
  };
  disclaimers: {
    nonGovernmentStatus: string;
    offlineVerificationCaveat: string;
  };
}

export interface LegacySchemaV1Dossier {
  schemaVersion?: "1.0";
  workerId: string;
  name: string;
  trade: string;
  skills: string[];
  kaamScore: number;
  credentials?: Array<{
    id: string;
    title: string;
    issuer: string;
    issuedDate: string;
  }>;
}

/**
 * RFC 8785 canonical JSON stringify.
 * Sorts object keys recursively, normalizes whitespace and encoding.
 */
export function canonicalizeJson(obj: any): string {
  if (obj === null || typeof obj !== "object") {
    return JSON.stringify(obj);
  }

  if (Array.isArray(obj)) {
    return "[" + obj.map((item) => canonicalizeJson(item)).join(",") + "]";
  }

  const sortedKeys = Object.keys(obj).sort();
  const pairs = sortedKeys.map((key) => {
    return JSON.stringify(key) + ":" + canonicalizeJson(obj[key]);
  });

  return "{" + pairs.join(",") + "}";
}

/**
 * Creates a compliant Schema 2.0 Worker Identity Export.
 */
export function generateIdentitySchemaV2(
  input: {
    workerId: string;
    fullName: string;
    primaryTrade: string;
    skills: string[];
    kaamScore: number;
    completedProjectsCount: number;
    ratingAverage: number;
    credentials?: Array<{
      credentialIdentifier: string;
      tradeTitle: string;
      nsqfLevel: number | null;
      issuingInstitution: string;
      issuanceDate: string;
      status: "active" | "suspended" | "revoked";
    }>;
    selectiveDisclosure?: {
      phoneDisclosed?: boolean;
      earningsDisclosed?: boolean;
    };
  },
  signingKey: string = "kaamsetu_sec_v2_default_test_signing_key_32_bytes_len"
): IdentitySchemaV2Export {
  const payloadToSign = {
    id: input.workerId,
    fullName: input.fullName,
    primaryTrade: input.primaryTrade,
    skills: input.skills,
    kaamScore: input.kaamScore,
  };

  const canonicalPayload = canonicalizeJson(payloadToSign);
  const proofValue = crypto
    .createHmac("sha256", signingKey)
    .update(canonicalPayload, "utf-8")
    .digest("hex");

  return {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://w3id.org/kaamsetu/v2",
    ],
    schemaVersion: "2.0",
    id: input.workerId,
    issuedAt: new Date().toISOString(),
    workerProfile: {
      fullName: input.fullName,
      primaryTrade: input.primaryTrade,
      skills: input.skills,
      kaamScore: input.kaamScore,
      completedProjectsCount: input.completedProjectsCount,
      ratingAverage: input.ratingAverage,
    },
    institutionalCredentials: input.credentials || [],
    selectiveDisclosure: {
      phoneDisclosed: Boolean(input.selectiveDisclosure?.phoneDisclosed),
      earningsDisclosed: Boolean(input.selectiveDisclosure?.earningsDisclosed),
      identityMasked: true,
    },
    integrityProof: {
      type: "HmacSha256Signature2026",
      created: new Date().toISOString(),
      verificationMethod: "https://kaamsetu.org/keys/v2",
      proofValue,
    },
    disclaimers: {
      nonGovernmentStatus:
        "This credential certifies vocational competence verified by accredited institutions on KAAMSETU. It does NOT constitute a government gazetted degree or DigiLocker official document.",
      offlineVerificationCaveat:
        "Offline verification valid as of cache timestamp; real-time revocation status cannot be verified without network connectivity.",
    },
  };
}

/**
 * Backward compatibility parser:
 * Accepts a Schema 1.0 dossier and upgrades it cleanly to Schema 2.0 structure.
 */
export function upgradeLegacySchemaV1ToV2(legacy: LegacySchemaV1Dossier): IdentitySchemaV2Export {
  return generateIdentitySchemaV2({
    workerId: legacy.workerId,
    fullName: legacy.name,
    primaryTrade: legacy.trade,
    skills: legacy.skills || [],
    kaamScore: legacy.kaamScore || 500,
    completedProjectsCount: 0,
    ratingAverage: 5.0,
    credentials: (legacy.credentials || []).map((c) => ({
      credentialIdentifier: c.id,
      tradeTitle: c.title,
      nsqfLevel: null,
      issuingInstitution: c.issuer,
      issuanceDate: c.issuedDate,
      status: "active",
    })),
  });
}

/**
 * Evaluates offline verification freshness and caveats.
 */
export function evaluateOfflineVerificationFreshness(cacheTimestamp: string): {
  isFresh: boolean;
  status: "offline_fresh_with_caveat" | "offline_cache_stale";
  cacheAgeDays: number;
  caveat: string;
} {
  const cachedTime = new Date(cacheTimestamp).getTime();
  const now = Date.now();
  const diffDays = Math.max(0, Math.floor((now - cachedTime) / (1000 * 60 * 60 * 24)));

  const isFresh = diffDays <= 7;

  return {
    isFresh,
    status: isFresh ? "offline_fresh_with_caveat" : "offline_cache_stale",
    cacheAgeDays: diffDays,
    caveat:
      "Offline verification valid as of cache timestamp; real-time revocation status cannot be verified without network connectivity.",
  };
}
