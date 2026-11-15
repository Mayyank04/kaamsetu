# KAAMSETU — PHASE 29 EXTERNAL CHECKPOINT ASSURANCE

### 1. Checkpoint Mechanism
Periodic checkpoints of the audit chain root digest are signed using an isolated Ed25519 checkpoint key (`did:kaamsetu:audit:checkpoint-key-1`).

### 2. Immutability Enforced
The `audit_chain_checkpoints` table is protected by PostgreSQL trigger `trg_audit_checkpoint_immutability`. Attempted UPDATE queries raise:
`audit_chain_checkpoints are tamper-evident cryptographic anchors and cannot be updated or deleted`
