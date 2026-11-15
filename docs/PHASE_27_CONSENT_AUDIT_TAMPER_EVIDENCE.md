# KAAMSETU Phase 27 Consent Audit Tamper Evidence & Privileged Threat Model
## Database Triggers, Superuser Threat Vectors, Cryptographic Hash Chaining & External Checkpointing

**Evaluation Context:** November 2026  
**Implementation Source:** [audit-hash-chain-service.ts](file:///Users/mayankgautam/Desktop/stitch_kaamsetu_digital_identity_platform/src/lib/crypto/audit-hash-chain-service.ts)  
**Database Migration:** [20261115000028_audit_hash_chaining_and_payout_disputes.sql](file:///Users/mayankgautam/Desktop/stitch_kaamsetu_digital_identity_platform/supabase/migrations/20261115000028_audit_hash_chaining_and_payout_disputes.sql)

---

## 1. The Trigger Limitation & Privileged Threat Model

In Phase 26, the platform introduced `trg_consent_audit_immutability` to block `UPDATE` and `DELETE` queries on `worker_consent_audit_events`. While this fulfills Section 6 and Section 8 of the Digital Personal Data Protection (DPDP) Act 2023 for ordinary application users, an honest architectural review reveals its boundary:

> [!CAUTION]
> **Privileged Operator Boundary:**  
> A PostgreSQL database superuser, migration operator, or cloud infrastructure administrator possessing direct connection access can execute:
> ```sql
> ALTER TABLE public.worker_consent_audit_events DISABLE TRIGGER trg_consent_audit_immutability;
> UPDATE public.worker_consent_audit_events SET ...;
> ```
> Therefore, database triggers ALONE do not constitute tamper-proof or non-repudiable audit evidence against privileged internal actors.

### 1.1 Threat Actor Evaluation Matrix

| Actor Role | Direct Row Mutation | Row Deletion | Bypass DB Trigger | Tamper Without Chain Invalidation | Primary Defense Layer |
|---|---|---|---|---|---|
| **Ordinary Worker** | BLOCKED | BLOCKED | BLOCKED | BLOCKED | Row-Level Security (RLS) |
| **Contractor Admin** | BLOCKED | BLOCKED | BLOCKED | BLOCKED | Tenant isolation RLS |
| **Application Service Role** | BLOCKED | BLOCKED | BLOCKED | BLOCKED | Trigger `trg_consent_audit_immutability` |
| **Database Superuser** | Possible | Possible | Possible | **BLOCKED** | SHA-256 Hash Chaining + Signed Checkpoints |
| **Infrastructure Admin** | Possible | Possible | Possible | **BLOCKED** | Off-host Checkpoint Anchoring (WORM/Log) |

---

## 2. Append-Only Event Design & Lifecycle Operations

Under Section 5.1, consent updates must never destructively alter historical records. Every lifecycle action generates a new immutable event row:
1. `consent_granted`: Worker authorizes specific data sharing purposes.
2. `consent_withdrawn`: Worker withdraws authorization; access revoked immediately.
3. `purpose_modified`: Worker adds or removes specific processing purposes.
4. `notice_version_updated`: Platform re-notifies worker of policy revision.
5. `data_sharing_recipient_changed`: Disclosed recipient category modified.
6. `access_revoked`: System or ombudsperson revokes contractor access.
7. `correction_recorded`: Worker records updated personal details.
8. `legal_retention_applied`: Statutory tax/settlement retention applied.

---

## 3. Cryptographic Hash Chaining Specification

Migration 28 adds cryptographic chaining columns to `public.worker_consent_audit_events`:
- `previous_event_digest TEXT`: SHA-256 digest of previous event in sequence ($H_{n-1}$).
- `event_sequence_number BIGINT`: Strictly monotonic counter ($1, 2, 3, \dots$).
- `event_digest TEXT`: SHA-256 digest of current event ($H_n$).
- `chain_checkpoint_id UUID`: Reference to signed Merkle/checkpoint block.

### 3.1 Chaining Algorithm
$$H_0 = 0000000000000000000000000000000000000000000000000000000000000000$$
$$H_n = \text{SHA256}(\text{sequence\_number} \,\|\, H_{n-1} \,\|\, \text{JCS}(\text{event\_payload}))$$

If a superuser disables the trigger and modifies even a single byte of an event payload or deletes a historical record:
1. The recomputed event digest $H_n$ no longer matches the stored value.
2. All subsequent events $H_{n+1}, H_{n+2}, \dots$ fail verification because their `previous_event_digest` link is broken.
3. Verification fails immediately with `TAMPERED_PAYLOAD` or `BROKEN_SEQUENCE`.

---

## 4. Off-Host Checkpointing & Anchor Architecture

Migration 28 creates table `public.audit_chain_checkpoints`. At regular intervals (every 100 events or 24 hours):
1. A checkpoint row is created summarizing $[start\_sequence, end\_sequence]$ and recording the root hash $H_{end}$.
2. The payload is signed with an Ed25519 release key (`did:kaamsetu:audit:checkpoint-key-1`).
3. Checkpoint hashes are mirrored to off-host, append-only cold storage (e.g. AWS S3 Object Lock in Compliance Mode / WORM storage).
4. Once written to WORM storage, no database superuser can rewrite history without mathematical detection.
