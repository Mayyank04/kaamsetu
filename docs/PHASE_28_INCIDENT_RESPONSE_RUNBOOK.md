# KAAMSETU — PHASE 28 INCIDENT RESPONSE RUNBOOK
## Security Incident Severity Classification, On-Call Escalation & Recovery Procedures

**Evaluation Context:** December 2026  
**Auditor:** Incident Response Commander & Site Reliability Lead

---

## 1. Incident Severity Matrix

| Severity Level | Definition | Response SLA | Resolution SLA | Escalation Path |
| :--- | :--- | :---: | :---: | :--- |
| **SEV-1 (Critical)** | Active wage ledger corruption, signing key leak, production outage | **< 15 Mins** | **< 4 Hours** | CISO, CTO, Lead Architect, Legal Counsel |
| **SEV-2 (Major)** | ONDC gateway degraded, payment webhook failure, RLS policy bug | **< 30 Mins** | **< 8 Hours** | Lead Architect, Backend Lead, DevOps On-Call |
| **SEV-3 (Moderate)** | Non-blocking API latency spikes, background queue delays | **< 2 Hours** | **< 24 Hours** | Service On-Call Engineer |
| **SEV-4 (Minor)** | Documentation typo, cosmetic UI defect | **< 24 Hours** | **< 5 Days** | Routine sprint triage |

---

## 2. Emergency Operational Playbooks

### Playbook A: Suspected Disguised Commission or Ledger Discrepancy
1. **Freeze Automated Payouts:** Trigger circuit breaker via admin API (`POST /api/admin/payouts/circuit-breaker/pause`).
2. **Audit Isolation:** Execute `TransactionReconciliationService.reconcileLedger()` to isolate the offending transaction ID.
3. **Notify Ombudsperson:** Flag dispute to Worker Protection Lead.
4. **Invariant Check:** Verify that no funds have been diverted to platform revenue accounts.
5. **Resume Settlement:** Release unaffected worker disbursements immediately upon reconciliation.

### Playbook B: Database Primary Failover (Unplanned Outage)
1. **Automated Detection:** RDS Multi-AZ health check detects master failure; triggers automated DNS failover to standby replica in AZ-B (< 90 seconds).
2. **Application Reconnection:** Connection pooler (PgBouncer) drains existing sockets and routes new connections to secondary AZ.
3. **Catalog & Invariant Verification:** Automated health runner runs `verify:db` (275 checks) to confirm schema and table consistency.
4. **Issue Incident Summary:** Publish status notice on system status portal.
