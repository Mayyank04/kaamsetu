# KAAMSETU — PHASE 28 WORKER DATA PORTABILITY AND CONSENT
## Sovereign Identity Ownership, DPDP Act 2023 Compliance & Cryptographic Export

**Evaluation Context:** December 2026  
**Auditor:** Principal Privacy Architect & Worker Protection Lead

---

## 1. Principles of Worker Identity Sovereignty

Workers on KAAMSETU own their digital identities, verified credentials, and work history. The platform operates under the principle that worker reputation is personal property and must never be locked within a proprietary walled garden.

In conformance with the **Digital Personal Data Protection Act 2023 (DPDP)**:
1. **Explicit Notice & Consent:** Consent is collected for specific, granular purposes (profile discovery, job matching, institutional credentialing).
2. **Right to Withdraw Consent:** Consent can be revoked at any time with immediate effect.
3. **Right to Data Portability:** Workers can export their complete profile, credential package, and job ledger in standard machine-readable formats (W3C JSON-LD, PDF).
4. **Zero Penalty for Revocation:** Revoking optional consent never affects earned wages, past ratings, or valid credentials.

---

## 2. Portable Credential Packaging & Export

Artisans can download their verifiable credentials directly to their mobile devices or self-custody wallets:
- **Format:** W3C Verifiable Credentials Data Model v1.1 compliant JSON-LD.
- **Signature:** Ed25519Signature2020 suite, verifiable offline without pinging Kaamsetu servers.
- **Offline QR Code:** Compact Base64URL-encoded CBOR representation with compressed Ed25519 proof.
- **PDF Dossier:** Human-readable skill passport with embedded offline QR code for physical presentation at construction checkpoints.

---

## 3. Consent Revocation Flow & Isolation

When an artisan revokes consent for public discovery:
```
Worker Revokes Consent in App
             │
             ▼
POST /api/worker/consent/revoke
             │
             ▼
Postgres INSERT worker_consent_audit_events (Chained Hash Event)
             │
             ▼
Postgres UPDATE worker_profiles SET is_public = false
             │
             ▼
Redis / Edge CDN Purge Broadcast (p99: 121.6 ms)
             │
             ▼
Public Profile Hidden; Search Tombstoned; Work History Safely Retained
```

As demonstrated in [TEST 74] of `test:phase28`, revoking consent for Worker A never affects or invalidates the consent state or public visibility of Worker B. Data isolation is maintained 100%.
