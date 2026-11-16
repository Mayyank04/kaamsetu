# PHASE 35.1: API SECURITY & ACCESS CONTROL MATRIX

**Programme:** KAAMSETU Digital Identity Platform  
**Workstream:** Phase 35.1 Security Remediation  
**Operating Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  

---

## Access Control Framework

All KAAMSETU API routes enforce server-authoritative authentication via `src/lib/auth/server.ts`. 

The security architecture mandates:
1. **Fail-Closed Session Resolution:** Anonymous or invalid session tokens throw an explicit 401 Unauthorized.
2. **Explicit Role Verification:** Routes require specific personas (`worker`, `contractor`, `customer`, `institution`, `admin`/`moderator`).
3. **Multi-Tenant Ownership Binding:** Resource identifiers (e.g. `contractor_org_id`, `worker_id`, `cohort_id`, `review_id`) are cross-checked against database records owned by the authenticated caller.
4. **Input Sanitization:** All user-controlled inputs are validated with Zod schemas; text exported to HTML is escaped with `escapeHtml()`; tabular exports are sanitized against CSV injection via `sanitizeCsv()`.
5. **Rate Limiting:** Unauthenticated endpoints (OTP, login, search) are protected by HMAC-salted in-memory / distributed token buckets.

---

## Detailed Route Security Matrix

| Route Path | HTTP Method | Allowed Roles | Auth Mechanism | Tenant / Ownership Boundary | Input Validation & Sanitization | Test Verification |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/worker/payouts` | `GET` | `worker`, `contractor`, `admin` | `requireAuth()` | Workers view only their own payouts; contractors view only payouts for their owned organization | Page / Limit clamped (`1-100`) | `test/phase-35-1-layered-security.test.ts` (Layer 2) |
| `/api/worker/payouts` | `POST` | `contractor` | `requireOwnedContractorOrg()` | Contractor must own the target org; worker must be in contractor crew | Zod schema, positive non-zero amount, idempotency key, unique reference | `test/phase-35-1-layered-security.test.ts` (Layer 2) |
| `/api/worker/payouts` | `PATCH` | `contractor`, `worker` | `requireAuth()` | Actor must be payout worker (dispute) or paying contractor (status update). Finalized payouts cannot be modified. | Zod schema, dispute reason required, amount check | `test/phase-35-1-layered-security.test.ts` (Layer 2) |
| `/api/worker/consent-audit` | `GET` | `worker`, `admin` | `requireAuth()` | Worker views only their own consent event history | Query parameter workerId checked against session | `test/phase-35-1-layered-security.test.ts` (Layer 2) |
| `/api/worker/consent-audit` | `POST` | `worker` | `requireOwnedWorkerProfile()` | Only worker can generate consent events; actorId bound to session user.id | Zod schema, action enum validation, IP masked | `test/phase-35-1-layered-security.test.ts` (Layer 2) |
| `/api/disputes/moderation` | `GET` | `admin`, `moderator` | `requireModerator()` | Platform-level dispute queue | Status filtering | Layer 2 integration |
| `/api/disputes/moderation` | `POST` | `worker`, `customer` | `requireAuth()` | User can appeal only reviews where they are the reviewed party | Zod schema, appeal reason length check, 409 duplicate block | `test/phase-35-1-layered-security.test.ts` (Layer 2) |
| `/api/disputes/moderation` | `PATCH` | `admin`, `moderator` | `requireModerator()` | Moderator resolution queue; reviewer ID stamped from session | Decision enum, resolution notes | `test/phase-35-1-layered-security.test.ts` (Layer 2) |
| `/api/v2/identity/export` | `POST` | `worker`, `contractor`, `institution` | `requireAuth()` | Worker exports own credential; contractor/institution must have active consent grant | HTML escaped (`escapeHtml`), CSV sanitized (`sanitizeCsv`), binary PDF honesty | `test/phase-35-1-layered-security.test.ts` (Layer 2) |
| `/api/institution/cohorts/[id]/export` | `GET` | `institution` | `requireAuth()` | Institution can export only cohorts created by their own tenant | CSV formula escaping (`^\s*[=+\-@\t\r|]`), audit logging | `test/phase-35-1-layered-security.test.ts` (Layer 2) |
| `/api/governance/financial-settlement` | `POST` | `admin` | `requireRole("admin")` | System-wide settlement ledger | Strict RBI UTR regex, rejection of pseudo-UTRs (`UTR-...`), zero commission | `test/phase-35-1-layered-security.test.ts` (Layer 2) |
| `/api/worker/onboarding/save` | `POST` | `worker` | `requireAuth()` | Worker onboards own profile | Strict geographic conjunction (PIN + City + State), audio storage path verified | `test/phase-35-1-layered-security.test.ts` (Layer 2) |
| `/api/worker/grievance` | `POST` | `worker` | `requireAuth()` | Worker submits grievance for own profile | Zod schema, worker ID bound to session | `test/phase-35-1-layered-security.test.ts` (Layer 2) |
| `/api/auth/otp/send` | `POST` | Public | Rate Limited | Phone number format validation (E.164 / Indian 10-digit) | Salted HMAC token bucket rate limit | `test/rate-limiter.test.ts` |
| `/api/auth/otp/verify` | `POST` | Public | Rate Limited | OTP verification with single-use consumption | 6-digit numeric validation | Route handler unit check |

---

## Security Invariants

1. **Zero Commission Invariant:** All settlement and payout handlers assert `platform_commission_amount = 0.00`. Any attempt to assign a positive commission to worker wages is rejected at the route layer and blocked by database triggers.
2. **Degree-Free Universal Access Invariant:** No route, schema, or database column requires educational credentials or formal degrees to register, verify, or be booked.
3. **No Silent Identity Invention:** When worker data is missing (ratings, test scores, certifications), exports must return `null` or explicit empty collections. Fabricated default scores are prohibited.
