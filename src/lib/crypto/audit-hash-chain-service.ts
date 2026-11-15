/**
 * KAAMSETU Phase 27 — Pillar D & E: Audit Hash Chaining & Tamper-Evident Governance Service
 *
 * Implements:
 * 1. RFC 8785 Canonical JSON Serialization (JCS)
 * 2. SHA-256 Merkle / linear hash chaining on audit logs
 * 3. Sequence monotonicity and cryptographic event chaining (H_n = SHA-256(H_{n-1} || canonical(E_n)))
 * 4. Ed25519-signed periodic audit chain checkpoints
 * 5. Privileged threat model evaluation (Application, DB Service Role, Superuser, External Anchor)
 */

import * as crypto from "crypto";

export const GENESIS_AUDIT_DIGEST = "0000000000000000000000000000000000000000000000000000000000000000";

export interface ConsentAuditEventPayload {
  workerProfileId: string;
  eventType: "consent_granted" | "consent_withdrawn" | "purpose_modified" | "notice_version_updated" | "data_sharing_recipient_changed" | "access_revoked" | "correction_recorded" | "legal_retention_applied";
  purpose: string[];
  noticeVersion: string;
  recipientCategory?: string;
  ipHash: string;
  userAgent: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface ChainedAuditEvent {
  sequenceNumber: number;
  previousDigest: string;
  payload: ConsentAuditEventPayload;
  eventDigest: string;
  createdAt: string;
}

export interface AuditChainCheckpointPayload {
  chainName: string;
  checkpointSequence: number;
  startSequence: number;
  endSequence: number;
  rootDigest: string;
  timestamp: string;
  signingKeyId: string;
}

export interface SignedAuditCheckpoint {
  payload: AuditChainCheckpointPayload;
  signature: string; // Ed25519 signature in hex
  publicKeyPem: string;
}

export interface ThreatModelEvaluation {
  actor: "ordinary_user" | "contractor_admin" | "application_service_role" | "database_superuser" | "external_auditor";
  canDirectlyUpdateRow: boolean;
  canDirectlyDeleteRow: boolean;
  canBypassDatabaseTrigger: boolean;
  canTamperWithoutChainInvalidation: boolean;
  mitigationLayer: string;
}

/**
 * Deterministic RFC 8785 Canonical JSON serializer
 */
export function canonicalizeJson(obj: unknown): string {
  if (obj === null || typeof obj !== "object") {
    return JSON.stringify(obj);
  }

  if (Array.isArray(obj)) {
    return "[" + obj.map(item => canonicalizeJson(item)).join(",") + "]";
  }

  const keys = Object.keys(obj as Record<string, unknown>).sort();
  const entries: string[] = [];
  for (const key of keys) {
    const val = (obj as Record<string, unknown>)[key];
    if (val !== undefined) {
      entries.push(`${JSON.stringify(key)}:${canonicalizeJson(val)}`);
    }
  }
  return "{" + entries.join(",") + "}";
}

/**
 * Calculates deterministic SHA-256 digest of a chained event
 */
export function computeAuditEventDigest(
  sequenceNumber: number,
  previousDigest: string,
  payload: ConsentAuditEventPayload
): string {
  const canonicalPayload = canonicalizeJson(payload);
  const preimage = `${sequenceNumber}:${previousDigest}:${canonicalPayload}`;
  return crypto.createHash("sha256").update(preimage, "utf8").digest("hex");
}

/**
 * Builds a chained event from previous state and incoming payload
 */
export function createChainedEvent(
  previousEvent: ChainedAuditEvent | null,
  payload: ConsentAuditEventPayload
): ChainedAuditEvent {
  const sequenceNumber = previousEvent ? previousEvent.sequenceNumber + 1 : 1;
  const previousDigest = previousEvent ? previousEvent.eventDigest : GENESIS_AUDIT_DIGEST;
  const eventDigest = computeAuditEventDigest(sequenceNumber, previousDigest, payload);

  return {
    sequenceNumber,
    previousDigest,
    payload,
    eventDigest,
    createdAt: payload.timestamp || new Date().toISOString(),
  };
}

/**
 * Verifies the mathematical integrity of an entire event chain
 */
export function verifyAuditChain(chain: ChainedAuditEvent[]): {
  isValid: boolean;
  brokenSequenceIndex?: number;
  reason?: string;
} {
  if (chain.length === 0) {
    return { isValid: true };
  }

  for (let i = 0; i < chain.length; i++) {
    const event = chain[i];

    // Check sequence monotonic increments
    const expectedSeq = i + 1;
    if (event.sequenceNumber !== expectedSeq) {
      return {
        isValid: false,
        brokenSequenceIndex: i,
        reason: `Broken sequence: expected ${expectedSeq}, got ${event.sequenceNumber}`,
      };
    }

    // Check previous digest chaining
    const expectedPrevDigest = i === 0 ? GENESIS_AUDIT_DIGEST : chain[i - 1].eventDigest;
    if (event.previousDigest !== expectedPrevDigest) {
      return {
        isValid: false,
        brokenSequenceIndex: i,
        reason: `Broken previous digest at index ${i}: expected ${expectedPrevDigest}, got ${event.previousDigest}`,
      };
    }

    // Check event digest matches recomputed hash
    const recomputedDigest = computeAuditEventDigest(
      event.sequenceNumber,
      event.previousDigest,
      event.payload
    );

    if (event.eventDigest !== recomputedDigest) {
      return {
        isValid: false,
        brokenSequenceIndex: i,
        reason: `Tampered payload at index ${i}: stored digest ${event.eventDigest} != computed ${recomputedDigest}`,
      };
    }
  }

  return { isValid: true };
}

/**
 * Creates and signs an audit chain checkpoint using Ed25519
 */
export function createSignedCheckpoint(
  chainName: string,
  checkpointSequence: number,
  events: ChainedAuditEvent[],
  keyPair: { keyId: string; privateKeyPem: string; publicKeyPem: string }
): SignedAuditCheckpoint {
  if (events.length === 0) {
    throw new Error("Cannot create checkpoint for empty event list");
  }

  const startSequence = events[0].sequenceNumber;
  const endSequence = events[events.length - 1].sequenceNumber;
  const rootDigest = events[events.length - 1].eventDigest;
  const timestamp = new Date().toISOString();

  const payload: AuditChainCheckpointPayload = {
    chainName,
    checkpointSequence,
    startSequence,
    endSequence,
    rootDigest,
    timestamp,
    signingKeyId: keyPair.keyId,
  };

  const canonicalPayload = canonicalizeJson(payload);
  const signature = crypto
    .sign(null, Buffer.from(canonicalPayload, "utf8"), keyPair.privateKeyPem)
    .toString("hex");

  return {
    payload,
    signature,
    publicKeyPem: keyPair.publicKeyPem,
  };
}

/**
 * Verifies a signed audit checkpoint using Ed25519
 */
export function verifySignedCheckpoint(checkpoint: SignedAuditCheckpoint): boolean {
  try {
    const canonicalPayload = canonicalizeJson(checkpoint.payload);
    return crypto.verify(
      null,
      Buffer.from(canonicalPayload, "utf8"),
      checkpoint.publicKeyPem,
      Buffer.from(checkpoint.signature, "hex")
    );
  } catch {
    return false;
  }
}

/**
 * Generates an in-memory testing Ed25519 keypair for checkpoints
 */
export function generateTestCheckpointKeyPair(keyId: string = "did:kaamsetu:audit:checkpoint-key-1") {
  const { privateKey, publicKey } = crypto.generateKeyPairSync("ed25519", {
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });
  return { keyId, privateKeyPem: privateKey, publicKeyPem: publicKey };
}

/**
 * Privileged Threat Model Matrix (Pillar D)
 */
export const PRIVILEGED_THREAT_MODEL_MATRIX: ThreatModelEvaluation[] = [
  {
    actor: "ordinary_user",
    canDirectlyUpdateRow: false,
    canDirectlyDeleteRow: false,
    canBypassDatabaseTrigger: false,
    canTamperWithoutChainInvalidation: false,
    mitigationLayer: "PostgreSQL Row-Level Security (RLS) + trg_consent_audit_immutability",
  },
  {
    actor: "contractor_admin",
    canDirectlyUpdateRow: false,
    canDirectlyDeleteRow: false,
    canBypassDatabaseTrigger: false,
    canTamperWithoutChainInvalidation: false,
    mitigationLayer: "Tenant isolation RLS + trg_consent_audit_immutability",
  },
  {
    actor: "application_service_role",
    canDirectlyUpdateRow: false,
    canDirectlyDeleteRow: false,
    canBypassDatabaseTrigger: false,
    canTamperWithoutChainInvalidation: false,
    mitigationLayer: "Database trigger trg_consent_audit_immutability blocks all UPDATE/DELETE regardless of role",
  },
  {
    actor: "database_superuser",
    canDirectlyUpdateRow: true, // Superuser can disable trigger or alter table
    canDirectlyDeleteRow: true,
    canBypassDatabaseTrigger: true,
    canTamperWithoutChainInvalidation: false, // CANNOT alter without breaking cryptographic hash chain
    mitigationLayer: "Cryptographic SHA-256 hash chaining + Ed25519 signed checkpoints anchored off-host",
  },
  {
    actor: "external_auditor",
    canDirectlyUpdateRow: false,
    canDirectlyDeleteRow: false,
    canBypassDatabaseTrigger: false,
    canTamperWithoutChainInvalidation: false,
    mitigationLayer: "Read-only replica access + independent public-key verification of signed checkpoints",
  },
];
