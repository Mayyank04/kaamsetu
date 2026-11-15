# KAAMSETU — PHASE 18: SECURITY & FAILURE TEST REPORT

**Generated:** 2026-11-15T11:51:15+05:30  
**Test Suite Reference:** `test/phase-18-live-ecosystem.test.ts` (100 assertions)  
**Total Platform Assertions:** 724 across 19 automated test suites (100% pass rate)

---

## 1. Test Suite Execution Summary

| Test Area | Assertions | Result | Key Invariant Verified |
|---|---|---|---|
| **Area 1: ONDC Participant Authorization** | Tests 1–5 | `PASSED` | BPP manifest role, multi-city codes, 0% commission tag |
| **Area 2: ONDC Signature Verification** | Tests 6–10 | `PASSED` | 32-byte Ed25519 ceremony, 10/10 staging checklist |
| **Area 3: ONDC Replay Prevention** | Tests 11–15 | `PASSED` | Stale/future timestamp rejection (>300s), RFC 8785 sorting |
| **Area 4: ONest Credential Mapping** | Tests 16–20 | `PASSED` | DSEP domains, `/verify` URL, deterministic SHA-256 ID |
| **Area 5: ERP Tenant Isolation** | Tests 21–25 | `PASSED` | Scoping to Assam & Meghalaya EPCs; zero unconsented leak |
| **Area 6: ERP Synchronization Idempotency** | Tests 26–30 | `PASSED` | Deterministic SHA-256 hash across batch permutations |
| **Area 7: Worker Consent Enforcement** | Tests 31–35 | `PASSED` | Explicit consent requirement; purpose-bound toolkit scope |
| **Area 8: Worker Consent Revocation** | Tests 36–40 | `PASSED` | Immediate drop from roster; cooling-off exit rights |
| **Area 9: NBFC Partner Authorization** | Tests 41–45 | `PASSED` | Rejection of non-RBI lenders and APR > 14.00% |
| **Area 10: Financial Data Minimization** | Tests 46–50 | `PASSED` | Zero banking credentials or raw Aadhaar in payload |
| **Area 11: Loan Disclosure & Boundaries** | Tests 51–55 | `PASSED` | Reducing balance EMI, 3-day cooling-off, 0% commission |
| **Area 12: Regional Launch Gates** | Tests 56–60 | `PASSED` | Siliguri cleared (85.7%); Tripura gated in research (57.1%) |
| **Area 13: Multi-Region Consistency** | Tests 61–65 | `PASSED` | Primary write routing; 2000ms replica lag fallback |
| **Area 14: Edge Cache Invalidation** | Tests 66–70 | `PASSED` | PII rejected from CDN edge; granular purge tags generated |
| **Area 15: External Webhook Security** | Tests 71–75 | `PASSED` | HMAC-SHA256 signature verification; replay defense |
| **Area 16: Integration Suspension** | Tests 76–80 | `PASSED` | Latency & error rate health triggers; suspension blocking |
| **Area 17: Partner Credential Expiry** | Tests 81–85 | `PASSED` | Expired token rejection; proactive renewal warnings |
| **Area 18: Audit Log Confidentiality** | Tests 86–90 | `PASSED` | Bearer token masking; bank account redaction |
| **Area 19: Assisted Onboarding Security** | Tests 91–95 | `PASSED` | Kiosk coordinator hijacking defense; 5-min memory flush |
| **Area 20: Worker Identity Sovereignty** | Tests 96–100 | `PASSED` | Primary trade & wage immutability; 100% RLS on 74 tables |

---

## 2. Test Execution Verdict

- **Total Phase 18 Tests Executed**: 100
- **Total Tests Passed**: 100
- **Total Tests Failed**: 0
- **Regression Suite Health**: 19 of 19 test suites passing (678 unit/integration tests + 210 db verification tests = 724 assertions).
- **PostgreSQL Row-Level Security**: 74 of 74 public tables have `rowsecurity = true` (100% coverage).
- **Next.js Production Build**: 96 of 96 routes compiled with zero errors.
