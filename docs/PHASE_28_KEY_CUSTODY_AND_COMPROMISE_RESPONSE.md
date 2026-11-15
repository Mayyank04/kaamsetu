# KAAMSETU — PHASE 28 KEY CUSTODY AND COMPROMISE RESPONSE
## Hardware Security Modules (HSM), Key Lifecycle & Emergency Revocation Runbook

**Evaluation Context:** December 2026  
**Auditor:** Chief Information Security Officer & Cryptographic Lead

---

## 1. Key Hierarchy & Separation of Duties

To prevent catastrophic compromise, cryptographic keys are strictly segregated by tier and operational environment:

```
Tier 0: Root Identity Key (Offline Air-Gapped Cold Storage)
                   │
                   ▼ (Signs Annual Intermediate Authorities)
Tier 1: Intermediate Credential Authority Key (HSM Protected, AWS KMS / CloudHSM)
                   │
                   ├─────────────────────────────┐
                   ▼                             ▼
Tier 2A: Staging Issuance Key       Tier 2B: Production Issuance Key
(Staging Sandbox Only)             (Production Environment Only)
```

### Mandatory Invariant: Zero Secrets in Source Code
As asserted in [TEST 77] of `test:phase28`, the entire Git repository, commits, and environment files are audited for private keys. Zero private keys, seed phrases, or AWS KMS master secrets exist in source files.

---

## 2. Key Lifecycle & Rotation Schedule

1. **Active Key:** Currently active signing key `did:web:kaamsetu.org#phase28-key-1`.
2. **Scheduled Rotation:** 365-day automated rotation cycle. Older keys transition to `RETIRED` status.
3. **Retired Key Behavior:** A retired key can be used to verify historical credentials issued during its active validity window, but the system strictly prohibits issuing new credentials using a retired key ([TEST 52]).
4. **Unknown Key Behavior:** Any credential referencing an unregistered or unverified key version is rejected immediately (`VERIFICATION_METHOD_KEY_NOT_FOUND`).

---

## 3. Key Compromise Emergency Response Runbook

In the event of suspected key leakage or cryptographic compromise:

### Step 1: Emergency Key Revocation Notification (T + 0 Minutes)
- The Security Incident Response Team (SIRT) issues an emergency revocation entry for the compromised key in the DID Document (`revoked: true`, `revokedAt: ISO_TIMESTAMP`).
- Broadcast status update to all ONDC BAP nodes and TSDM verification registries.

### Step 2: Invalidation of Pending Credentials (T + 15 Minutes)
- Database trigger updates `credential_status` for all active credentials signed by the compromised key to `SUSPENDED_KEY_COMPROMISE`.
- Edge CDN and Redis caches are flushed globally.

### Step 3: HSM Root Re-Issuance Ceremony (T + 4 Hours)
- Dual-custody key custodians convene to activate a new secondary intermediate key from cold storage.
- Automated batch re-signing engine re-issues valid credentials for affected artisans at zero cost to the workers.

### Step 4: Post-Mortem & Independent Forensic Audit (T + 24 Hours)
- Independent forensic audit logs submitted to the Governance Board.
- Publication of security advisory in accordance with ISO/IEC 27001 standards.
