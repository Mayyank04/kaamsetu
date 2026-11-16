# KAAMSETU — PHASE 38 API AUTHORIZATION & IDOR AUDIT

**Programme:** KAAMSETU Digital Identity & Worker Empowerment Platform  
**Assessment Phase:** 38 — Security Audit & Vulnerability Remediation  
**Status:** Certified & Hardened

---

## 1. Authorization Architecture

KAAMSETU adheres to strict server-side authorization enforcement. UI navigation guards and hidden buttons are treated strictly as presentation enhancements; every privileged action requires explicit validation in the API route handler or server action:

1. **Session Authenticity:** Verified via `requireAuth()` or `requireAuthenticatedUser()`.
2. **Role Verification:** Verified via `requireUserRole(allowedRoles)` or dedicated guards (`requireWorker()`, `requireContractor()`, `requireInstitution()`, `requireAdmin()`).
3. **Object Ownership:** Verified via dedicated ownership guards (`requireOwnedWorkerProfile()`, `requireOwnedContractorOrg()`, `requireInstitutionCohortOwnership()`).

---

## 2. Insecure Direct Object Reference (IDOR) Matrix

| Domain Asset | Parameter | Attack Scenario | Defense Implementation | Status |
| :--- | :--- | :--- | :--- | :---: |
| **Worker Payouts** | `workerProfileId` in GET `/api/worker/payouts` | Worker A queries Worker B's payout history | `requireOwnedWorkerProfile(targetWorkerId)` strictly asserts profile ownership. Disallowed requests return HTTP 403. | **VERIFIED NOT VULNERABLE** |
| **Payout Disbursals** | `contractorOrganizationId` in POST `/api/worker/payouts` | Contractor A disburses wages from Contractor B's organization | `requireOwnedContractorOrg(orgId)` verifies caller is the verified owner of the contractor organization. | **VERIFIED NOT VULNERABLE** |
| **Dispute Claims** | `payoutConfirmationId` in PATCH `/api/worker/payouts` | Contractor files a fraudulent dispute against worker payout | Route asserts `user.role === "worker"` and verifies worker owns the disputed payout. Contractors attempting disputes receive HTTP 403. | **VERIFIED NOT VULNERABLE** |
| **Worker Grievance** | `workerProfileId` in POST `/api/worker/grievance` | User submits grievance claiming another worker's identity | `requireOwnedWorkerProfile(parsed.workerProfileId)` verifies caller matches the grievance filer. | **VERIFIED NOT VULNERABLE** |
| **Portfolio Assets** | `workerProfileId` in POST `/api/worker/portfolio/upload` | Worker uploads image to another artisan's showcase | Server queries `worker_profiles` and confirms `profile.user_id === user.id`. Foreign IDs rejected with HTTP 403. | **VERIFIED NOT VULNERABLE** |
| **Trainee Dossiers** | `cohortId` in GET `/api/institution/cohorts/[id]/export` | Institution A exports participant data from Institution B's cohort | `requireInstitutionCohortOwnership(cohortId)` verifies caller is the registered institutional sponsor. | **VERIFIED NOT VULNERABLE** |
| **Booking Status** | `bookingId` in PATCH `/api/bookings/[id]/status` | Outsider changes booking state or cancels private job | Server checks `isCustomer = booking.customer_id === user.id` and `isWorker = worker_profile.user_id === user.id`. Non-participants rejected with HTTP 403. | **VERIFIED NOT VULNERABLE** |

---

## 3. Verification Evidence

Automated IDOR tests in `test/phase-35-1-layered-security.test.ts` verify that:
- Anonymous calls to protected routes return `401 Unauthorized`.
- Cross-worker queries return `403 Forbidden`.
- Cross-contractor payout attempts return `403 Forbidden`.
- Cross-institution cohort access returns `403 Forbidden`.
