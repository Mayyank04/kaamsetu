# KAAMSETU — PHASE 35.1 INITIAL REPOSITORY & SECURITY AUDIT

**Programme:** KAAMSETU Digital Identity & Worker Empowerment Platform  
**Audit Phase:** 35.1 Forensic Inspection & Security Challenge  
**Date:** 2026-11-16  
**Starting Commit:** `fd734750cbe48d8077f030120b76602e45ae2b02`  
**Branch:** `phase-35-1-independent-security-challenge`  
**Parent Main Branch:** `3dff23c314eaba0f2eb66785033eda928146c0f8` (Preserved Untouched)  
**Operating Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Constitutional Invariant:** `platform_commission_amount = 0.00`  

---

## 1. REPOSITORY ARCHITECTURE & ENVIRONMENT SUMMARY

- **Framework:** Next.js 15.1.7 (App Router), React 19, TypeScript 5.7.3
- **Package Manager:** npm (with lockfile version 3)
- **Database & Storage:** Supabase PostgreSQL 15, Row-Level Security (RLS) enabled on all 34 public tables, 29 SQL migrations + upcoming Migration 30
- **Authentication Provider:** Supabase SSR Auth with HttpOnly cryptographic session cookies + sandboxed demo persona authentication strictly isolated behind `isConfigured.demoAuth`
- **Geographic Authorization:** Guwahati Urban (Kamrup Metro, Assam: `781001`–`781039`) & Shillong Urban (East Khasi Hills, Meghalaya: `793001`–`793022`)
- **Blocked/Conditional Zones:** Tripura (BLOCKED, `BLOCKER-01`), Siliguri (CONDITIONAL_READINESS_ONLY), Heavy EPC Staffing (FROZEN, `BLOCKER-03`)

---

## 2. FORENSIC AUDIT FINDINGS REGISTER

| Finding ID | File & Function | Vulnerability / Defect | Severity | Impact | Required Remediation | Verification Method |
|---|---|---|---|---|---|---|
| **SEC-35.1-01** | `src/lib/auth/server.ts` — `getAuthenticatedSession()` | Unsafe role fallback: `profile?.role \|\| "worker"` assigns worker role when DB query fails or profile is absent. | **P0 (Critical)** | Privilege escalation: unprofiled users or users with failed DB queries acquire worker privileges instead of failing closed. | Eliminate fallback. Require verified DB profile and active status. Fail closed with `null`/`AuthError(401/403)`. | Real session test with missing profile record. |
| **SEC-35.1-02** | `src/app/api/worker/payouts/route.ts` — `GET`, `POST`, `PATCH` | Missing contractor-booking-worker relationship checks; lack of DB uniqueness constraint on idempotency key; unauthenticated contractor mutation. | **P0 (Critical)** | Unauthorized contractor access to unrelated worker payouts; duplicate payout processing during network race conditions. | Verify contractor org ownership, booking assignment, and worker crew membership; add DB uniqueness constraint; paginate GET. | Route integration tests calling `GET`, `POST`, `PATCH` with mismatched IDs. |
| **SEC-35.1-03** | `src/app/api/worker/consent-audit/route.ts` — `POST` | Non-worker callers (contractor, customer, institution) bypass ownership check and can inject arbitrary consent records. | **P0 (Critical)** | Consent record forgery and falsified DPDP compliance audits. | Restrict consent creation strictly to profile-owned worker or authorized institution; bind `actor_id` to server session. | Route integration test with contractor session calling POST for worker. |
| **SEC-35.1-04** | `src/app/api/disputes/moderation/route.ts` — `POST` | Any caller can file appeal on behalf of any worker; no validation between review, booking, and appellant. | **P0 (Critical)** | Review appeal forgery and bypass of moderation quarantine lifecycle. | Verify that appellant owns the worker profile for the target review; verify review belongs to booking; reject duplicate appeals. | Route integration tests verifying ownership and duplicate rejection. |
| **SEC-35.1-05** | `src/app/api/v2/identity/export/route.ts` — `POST` | Stored XSS / HTML injection via unescaped worker profile fields in printable export; invented default metrics (5.0 rating, 500 score, Carpentry/Electrical skills). | **P0 (Critical)** | Arbitrary script execution during dossier print/export; fabrication of unverified worker competence. | Implement HTML entity escaping across all profile fields; remove invented defaults; use explicit state labels (`Not yet rated`, `Self-declared`). | Route test with `<script>alert(1)</script>` payload and unrated worker profile. |
| **SEC-35.1-06** | `src/app/api/v2/identity/export/route.ts` — `POST` | Format spoofing: returning HTML string with `format=pdf` while claiming PDF generation. | **P1 (High)** | Client confusion and deceptive API contract. | Generate genuine PDF binary or provide clearly named `html_printable` format and explicitly report binary PDF as pending external library. | Inspect response MIME type and file header. |
| **SEC-35.1-07** | `src/app/api/governance/financial-settlement/route.ts` — `POST` | Settlement state transitions are calculated in memory and returned without persisting updates to `payment_records_ledger`. | **P0 (Critical)** | Ephemeral financial state: database records remain un-updated despite successful API response. | Persist state transitions to database; validate relationship; reject unconfirmed bank references. | Route test asserting DB ledger state mutation. |
| **SEC-35.1-08** | `supabase/migrations/` — Database Ledger Triggers | `trg_prevent_ledger_clawback` was documented but not created in SQL migrations. | **P0 (Critical)** | Potential retrospective wage reduction if application validation is bypassed. | Implement Migration 30 with immutable PostgreSQL trigger preventing downward modification of `amount_paid` and non-zero commission. | Direct SQL update test attempting to reduce paid wages or extract commission. |
| **SEC-35.1-09** | `src/lib/geo/geographic-authorization-service.ts` — `validateLocation()` | Permissive disjunction: `pinMatches \|\| textMatches` allows cross-state bypass (e.g. Guwahati PIN with Mumbai state/city). | **P0 (Critical)** | Geographic boundary bypass: requests outside authorized Class B operating zones can spoof location. | Require consistent conjunction of PIN, city, district, state, and bounding box; reject contradictory inputs. | Negative tests with mismatched PIN and state. |
| **SEC-35.1-10** | `src/app/api/worker/onboarding/save/route.ts` — `POST` | Voice attestation awarded via client-supplied boolean without verifying stored audio object in bucket. | **P1 (High)** | Worker can claim voice attestation points by sending `hasVoiceAttestation: true` in JSON body. | Implement verification state machine; require stored audio reference in storage before awarding `voice_submitted` status. | Onboarding test without storage object verifying status remains `self_declared`. |
| **SEC-35.1-11** | `src/lib/crypto/credential-signer.ts` | Discrepancy between documentation claiming W3C Ed25519 and code using HMAC-SHA256. | **P1 (High)** | Cryptographic architectural mismatch and inability to perform third-party asymmetric verification. | Implement authentic Ed25519 asymmetric signing & verification alongside RFC 8785 canonical JSON; label HMAC as internal. | Key generation, signing, and verification unit tests. |
| **SEC-35.1-12** | `test/phase-35-security-and-authorization.test.ts` | Test suite implemented local helper functions (`verifyOwnership`, `checkAdmin`) rather than calling actual Next.js route handlers. | **P1 (High)** | False confidence: passing tests did not execute actual route authorization logic. | Rebuild test suite to invoke real Next.js route handlers with simulated `NextRequest` and session headers. | Layered test suite execution. |

---

## 3. AUDIT CONCLUSION & EXECUTION ROADMAP

The forensic audit confirms that while Phase 35 established the structural foundations, Phase 35.1 must deliver deep source-code repairs, an additive SQL migration, strictConjunction geographic validation, authentic Ed25519 asymmetric cryptography, and genuine route integration tests.
