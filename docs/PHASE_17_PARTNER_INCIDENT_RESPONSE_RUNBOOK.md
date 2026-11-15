# KAAMSETU — PHASE 17 PARTNER INCIDENT RESPONSE RUNBOOK
## Protocol Outages, Webhook Failures, Secret Compromise & Recovery Runbooks

---

## 1. Incident Classification Matrix

| Severity | Definition | Target Resolution SLA | Escalation Target |
|---|---|---|---|
| **P1 - Critical** | Total gateway outage (ONDC/ONest NACK storm), cryptographic key compromise, or PII leak | **< 30 minutes** | CTO, Lead Security Auditor, DevOps Lead |
| **P2 - Major** | Elevated error rate ($\ge 15\%$), enterprise ERP sync backlog ($> 500$ records), or replica lag ($> 5\text{s}$) | **< 2 hours** | Integration Architect, Backend Lead |
| **P3 - Minor** | Degraded connector performance, transient rate-limit throttling from single partner | **< 8 hours** | On-call Platform Engineer |

---

## 2. Emergency Operational Runbooks

### Runbook 1: Cryptographic Key Compromise & Emergency Rotation
1. **Identify Compromised Key**: Check `keyId` from audit log.
2. **Revoke Key**: Insert revocation entry into `public.credential_revocation_registry`:
   ```sql
   INSERT INTO public.credential_revocation_registry (key_version, revoked_at, reason)
   VALUES ('v2', now(), 'Emergency security key rotation');
   ```
3. **Deploy Rotated Key Version**: Update environment secret `CREDENTIAL_SIGNING_SECRET_V3` and bump active key version to `v3`.
4. **Notify Network Participants**: Emit ONDC/ONest key rotation broadcast.

### Runbook 2: ONDC Gateway Circuit Breaker Activation
1. If ONDC Gateway latency exceeds $5,000\text{ ms}$ or error rate exceeds $30\%$, trigger circuit breaker:
   - Gateway immediately returns standard Beckn NACK with code `50000` (`Provider temporary maintenance`).
   - Prevents downstream cascading failures into PostgreSQL primary.
2. Re-test gateway with local synthetic probe every 60 seconds; auto-reset circuit breaker when probe latency falls below $1,000\text{ ms}$.

### Runbook 3: Read-Replica Replication Lag Spike (> 2.0s)
1. Routing service automatically routes reads to `primary_mumbai`.
2. Inspect PostgreSQL replication status on Primary:
   ```sql
   SELECT pid, application_name, client_addr, state, sync_state FROM pg_stat_replication;
   ```
3. If WAL backlog is high, increase network bandwidth allocation or restart replica WAL receiver process.

---

## 3. Post-Incident Review Protocol
Every P1/P2 incident requires an immutable Post-Mortem Document within 48 hours documenting root cause, impact duration, and preventive unit test additions.
