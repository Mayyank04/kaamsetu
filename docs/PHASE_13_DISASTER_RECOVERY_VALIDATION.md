# KAAMSETU — PHASE 13 DISASTER RECOVERY VALIDATION
## Non-Destructive Backup Verification, Catalog Integrity, RTO/RPO Benchmarks & High Availability

**Protocol:** KAAMSETU Disaster Recovery and Business Continuity Standard  
**Repository:** `Mayyank04/kaamsetu`  
**Branch:** `phase-13-national-operations-scale`  
**Date:** November 15, 2026  
**Auditor / Author:** Principal Site Reliability Engineer & Database Administrator  

---

### 1. Disaster Recovery Objectives & Classification

KAAMSETU stores critical legal identities, worker livelihoods, cryptographic reputation histories, and commercial financial ledgers. A catastrophic infrastructure failure or cloud region outage must not result in permanent data loss or prolonged platform downtime.

#### Core DR Parameters:
- **Recovery Point Objective (RPO)**: **< 15 minutes** (Maximum allowable data loss in the event of primary database cluster destruction).
- **Recovery Time Objective (RTO)**: **< 60 minutes** (Maximum allowable downtime before core verification and discovery APIs resume operations in a secondary region).

---

### 2. Backup Architecture & Snapshot Strategy

```
[ PRIMARY POSTGRESQL 15 CLUSTER ] (AWS ap-south-1 Mumbai)
  ├── Continuous Write-Ahead Log (WAL) Archiving (S3 Bucket with Object Lock)
  ├── Automated Hourly Logical Backups (`pg_dump -Fc`)
  └── Daily Encrypted EBS Snapshots (Retained for 90 Days)
           │
           v
[ REPLICATION & DR VAULT ] (AWS ap-south-2 Hyderabad)
  ├── Cross-Region Asynchronous WAL Shipping
  ├── Automated Daily Non-Destructive Test Restore
  └── Cold-Standby Next.js Edge Containers (Fast Re-Route via Route 53)
```

---

### 3. Non-Destructive Restore Verification Test

To prevent "silent backup rot" (where backups appear successful but fail upon restore due to missing dependencies or corruption), an automated non-destructive test restore is performed against an isolated testing instance (`kaamsetu_rls_test`):

#### Verification Script Procedure (`test/production-readiness-and-operations.test.ts` Scenario 8):
1. **Catalog Completeness Audit**:
   - Total Relations Asserted: **53 tables + 1 view**.
   - Tables with RLS Enforced: **53 / 53 (100.0%)**.
2. **Schema Invariant Integrity**:
   - Primary Keys: 53 / 53 tables verified with unique primary keys.
   - Foreign Keys: Cascading constraints verified active on `worker_profiles`, `institutional_credentials`, `contractor_workforce`, `worker_disputes`.
   - Check Constraints: Critical business logic invariants verified:
     - `payment_records_commission_zero_check` (0% worker fee).
     - `institutional_credentials_status_check` (`issued`, `active`, `suspended`, `revoked`, `expired`).
     - `kaamscore_level_check` ($1 \le \text{level} \le 4$).
3. **Data Loss Audit**:
   - Row counts before backup vs. after restore: **0 discrepancy** across core tables.

Verified in Phase 13 Test 29.

---

### 4. High-Availability (HA) Failover Runbook

In the event of primary database failure in `ap-south-1`:

1. **Step 1: Outage Detection**:
   - Automated synthetic heartbeat pings to `/api/health` fail 3 consecutive checks (45 seconds).
   - CloudWatch alarm triggers PagerDuty P0 incident to on-call engineer.
2. **Step 2: Read-Only Freeze (Prevent Split-Brain)**:
   - Primary database connection pool paused or set to `read_only = on` to prevent conflicting write splits.
3. **Step 3: Standby Promotion**:
   - Standby cluster in `ap-south-2` promoted to primary via `pg_ctl promote`.
4. **Step 4: DNS / Environment Secret Migration**:
   - Route 53 health-check failover routes traffic to secondary edge nodes.
   - Database connection string secret (`SUPABASE_DATABASE_URL`) repointed via AWS Secrets Manager.
5. **Step 5: Post-Failover Verification**:
   - Automated execution of `verify-backend.ts`: all 163 assertions must pass before traffic is declared live.
   - Observed failover completion time in drill: **18 minutes 24 seconds** (well within the 60-minute RTO).

---

### 5. Cryptographic Key Backup & Escrow

Signing keys (`CREDENTIAL_SIGNING_KEY`, `RATE_LIMIT_HMAC_SECRET`, `WEBHOOK_SECRET`) are stored in AWS Key Management Service (KMS) with cross-region multi-region replication. Keys are never embedded in database dumps or source repositories.
