# KAAMSETU — PHASE 29 PRIVILEGED ACCESS THREAT MODEL

### 1. Threat Vectors Evaluated
1. **Ordinary User / Attacker:** Blocked by PostgreSQL Row-Level Security policies.
2. **Contractor Admin:** Blocked from modifying wage tables or worker reviews during active disputes.
3. **Application Service Role:** Gated by database triggers; cannot UPDATE or DELETE immutable audit records.
4. **Database Superuser:** Although superuser can bypass RLS, any raw row modification is detected through the external Ed25519-signed audit checkpoints.
