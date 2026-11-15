# KAAMSETU — PHASE 32 PRIVILEGED DATABASE ACCESS AUDIT

### 1. Immutability Triggers
- `trg_consent_audit_immutability` blocks UPDATE/DELETE operations on audit logs.
- Signed checkpoint records are permanent and append-only.
