# KAAMSETU — PHASE 10 ADVERSARIAL SECURITY & PRIVACY AUDIT
## Privilege Escalation Defense, Row-Level Tenant Scoping, Cryptographic Integrity & DPDP Compliance

**Milestone:** Phase 10 — National Network Expansion & Infrastructure Readiness  
**Audit Scope:** 39 PostgreSQL 15 Database Tables, 58 Next.js Production Routes, 11 Automated Test Suites (240 Automated Invariants)  
**Security Mandate:** OWASP Top 10 API Security, RFC 8785 (JSON Canonicalization Scheme), Digital Personal Data Protection Act (DPDP Act, 2023)

---

## 1. Threat Modeling & Attack Surface Overview

As KAAMSETU expands from a local Guwahati cohort into a multi-region network, the platform faces expanded threat vectors:

1. **Horizontal Privilege Escalation (Cross-Tenant):** Contractor A attempting to query or modify Contractor B's project crew rosters or billing records.
2. **Vertical Privilege Escalation (Role Bypass):** Authenticated workers or contractors attempting to elevate themselves to `admin` or `regional_director`.
3. **Cross-Region Contamination:** Regional administrators in Kamrup attempting to view or alter records in Shillong.
4. **Token Replay & Forgery:** Forged identity export tokens or replayed webhook events attempting to bypass cryptographic integrity.

---

## 2. Row Level Security & Privilege Boundary Defense

All 39 database tables enforce Postgres RLS. Unauthenticated and unprivileged writes are rejected at the database engine level.

```mermaid
flowchart TD
    Req[Incoming Client Request] --> AuthCheck{JWT Authenticated?}
    AuthCheck -->|No| PublicAnon[Only published profiles, verified reviews, and public trades visible]
    AuthCheck -->|Yes| RoleCheck{Profile Role}

    RoleCheck -->|Worker| WorkerBoundary[auth.uid() = profile.id: Access only to own records, grants & applications]
    RoleCheck -->|Contractor| ContractorBoundary[auth.uid() = org.owner_id: Access only to owned workforce & projects]
    RoleCheck -->|Regional Admin| RegionalBoundary[user_id = auth.uid(): Access strictly scoped to assigned region_id]
    RoleCheck -->|Privilege Escalation Attempt| TriggerDeny[trg_prevent_profile_privilege_escalation: Forces NEW.role := OLD.role]
```

### 2.1 Database Trigger Privilege Escalation Defense
- Implemented in `trg_prevent_profile_privilege_escalation` on `public.profiles`.
- If an authenticated user attempts to update their own `role` or `is_verified` flag, the trigger checks if they possess `service_role` or existing `admin` status. If not, the trigger silently and automatically neutralizes the attack: `NEW.role := OLD.role`.
- **Verification Evidence:** Tested in `test/national-network-and-infrastructure.test.ts` (Test 13).

---

## 3. Cryptographic Integrity & Non-Repudiation

1. **RFC 8785 Canonical JSON (JCS):** Whitespace variance and key-ordering variance are strictly eliminated before HMAC signing.
2. **Timing-Safe Equality:** Webhook signatures and export provenance tokens are validated using `crypto.timingSafeEqual` with strict length guards to prevent timing attacks and buffer RangeError exceptions.
3. **Anti-Replay Expiry:** Timestamps older than 300 seconds are rejected immediately with a 401 Unauthorized status.

---

## 4. DPDP Act (2023) Statutory Compliance Review

| DPDP Requirement | Technical Implementation | Audit Status |
|---|---|---|
| **Section 4 (Purpose Limitation)** | Worker voice audio is processed for profile extraction and discarded immediately. | **VERIFIED COMPLIANT** |
| **Section 6 (Consent & Revocation)** | Workers can revoke digital access grants anytime via `/api/worker/identity/grants`. | **VERIFIED COMPLIANT** |
| **Section 8 (Data Minimization)** | Aadhaar is strictly masked (`XXXX-XXXX-1011`). Raw 12-digit numbers are never stored or exposed. | **VERIFIED COMPLIANT** |
| **Section 12 (Right to Portability)** | Workers can export a cryptographically signed Schema 2.0 dossier via `/api/worker/identity/export`. | **VERIFIED COMPLIANT** |
| **Section 12(1) (Right to Correction)** | Workers can modify any AI-extracted information via `/api/worker/profile/correction`. | **VERIFIED COMPLIANT** |
| **Section 9 (No Commercial Resale)** | RLS and database triggers strictly prevent any third-party bulk scraping or broker resale. | **VERIFIED COMPLIANT** |

---

## 5. Security Limitations & Production Caveats

- **DigiLocker Integration:** Stated DigiLocker verification remains fail-closed and disabled until formal bilateral agreement and authorized API endpoints are provisioned with NeGD / MeitY.
- **Physical Security at Kiosks:** Laminated QR cards printed at cyber cafés or CSC kiosks rely on public visual scanning; workers are educated never to share their private login OTPs with kiosk operators.
