# KAAMSETU — Phase 3.1 Security Remediation, Fail-Closed Authentication & Cryptographic Key Integrity

**Platform:** KAAMSETU Sovereign Digital Identity Platform  
**Baseline Git Commit:** `993a523`  
**Final Git Commit:** `ee14ec6`  
**Branch:** `main`  
**Evaluation Standard:** Zero Mock Reliance in Production, RFC 8785 Canonical JSON (JCS) HMAC-SHA256, Fail-Closed OTP Authentication, Persistent Rate Limiting, 256-Bit Cryptographic Key Entropy  
**Date:** November 14, 2026  

---

## Executive Summary

Phase 3.1 is a targeted application security remediation phase conducted on KAAMSETU following an independent review of baseline commit `993a523`.

The platform's guiding promise remains:
> *"Every skill deserves to be seen, even without a degree."*

This phase focused strictly on eliminating four critical vulnerabilities:
1. **Unconfigured Supabase OTP Bypass:** Eliminated the code branch in `validateOtpVerifyAttempt()` where an unconfigured database or connection error could fall through and return `allowed: true`. OTP verification now unconditionally fails closed in production.
2. **Predictable Rate-Limit Salt:** Removed predictable salt fallbacks (`"kaamsetu-rate-limit-privacy-salt"`) and secret reuse. Introduced a dedicated, server-only `RATE_LIMIT_HMAC_SECRET` with 256-bit entropy enforcement and domain separation (`phone:send`, `phone:verify`, `ip:send`).
3. **Custom Signing Secret API Bypass:** Completely removed `customSecret` from production signing and verification interfaces (`signCredentialPayload` and `verifyCredentialSignature`). Production credential issuance and verification now strictly resolve keys through the server-configured key-version resolver. Isolated test dependency injection to non-production environments with production guard assertions.
4. **Diagnostic PII Exposure:** Masked worker phone numbers and sensitive contact data in test diagnostic output, and introduced `src/lib/security/privacy-logger.ts` for safe logging.

---

## 1. Baseline Inspection & Root Causes

| Item | Baseline Defect | Root Cause | Remediation |
|---|---|---|---|
| **Finding A: OTP Fail-Closed Bypass** | If `isConfigured.supabase` was false in production, `validateOtpVerifyAttempt` fell through to in-memory check and returned `allowed: true`. | Fallback path lacked production gating and fail-closed assertion. | In production, missing database or RPC error immediately returns `allowed: false`. Memory fallback is strictly blocked. |
| **Finding B: Predictable Salt & Secret Reuse** | `hashRateLimitKey` defaulted to `"kaamsetu-rate-limit-privacy-salt"` and reused `CREDENTIAL_SIGNING_KEY` / `SUPABASE_SERVICE_ROLE_KEY`. | Single shared fallback string used across multiple security domains. | Dedicated `RATE_LIMIT_HMAC_SECRET` variable required, validated for 256-bit entropy, with typed namespace domain separation. |
| **Finding C: Production `customSecret` Bypass** | `signCredentialPayload` and `verifyCredentialSignature` accepted `options.customSecret`, allowing arbitrary caller-supplied signing secrets. | Parameter exposed directly on production cryptographic interfaces. | Removed `customSecret` from public interfaces. Keys resolved strictly from environment. Isolated test injection behind `NODE_ENV !== "production"` guard. |
| **Finding D: Test Output Phone Exposure** | `test/rls-integration.test.ts` logged worker phone number in plain text in positive control diagnostic string. | Diagnostic string interpolated raw database column `${ownerRows[0]?.phone}`. | Created `src/lib/security/privacy-logger.ts` and masked phone numbers to `******3210` in all test output. |

---

## 2. Cryptographic Key Management & Entropy Policy

### Key Generation Standard
All cryptographic keys in KAAMSETU must be generated using a cryptographically secure random number generator (CSPRNG) possessing at least 32 bytes (256 bits) of entropy, encoded in Base64:

```bash
# Recommended command to generate 256-bit cryptographic keys:
openssl rand -base64 32
```

### Distinction Between Cryptographic Properties
* **Key Length vs. Entropy:** A 32-character string does not necessarily possess 256 bits of entropy (e.g. `"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"` has 32 characters but less than 5 bits of entropy). KAAMSETU's `key-validator.ts` decodes Base64/Hex strings, verifies decoded byte length is at least 32 bytes, checks character diversity, and rejects predictable placeholder patterns.
* **Key Versioning (`kid`):** Credentials state their signing key version explicitly (e.g., `v1`, `v2`). This enables seamless key rotation without invalidating historical credentials.
* **Key Revocation:** Compromised or retired key versions are recorded in `REVOKED_SIGNING_KEY_VERSIONS`. Any credential signed with a revoked key is rejected as invalid (`status: "revoked"`).
* **Dual-Secret Rotation for Rate Limiting:** Rotating `RATE_LIMIT_HMAC_SECRET` alters HMAC digests. To prevent active 15-minute lockouts from being bypassed during key rotation, administrators can set `RATE_LIMIT_HMAC_SECRET_PREVIOUS`. The rate limiter checks both active and previous keys before unlocking an identity.

---

## 3. Systematic Findings and Verification Table

| Finding | Root cause | Fix | Regression test | Result |
|---|---|---|---|---|
| **OTP Verification Fail-Closed** | Missing database or RPC failure fell through to memory store returning `allowed: true`. | Added unconditional fail-closed guard in `validateOtpVerifyAttempt()`. | `test/rate-limiter.test.ts` (Scenarios 10, 11) | **FIXED AND INTEGRATION-TESTED** |
| **Atomic Concurrency for Failed OTP** | Concurrent failed requests risked race conditions on counter updates. | Pinned row-level exclusive locks (`SELECT ... FOR UPDATE`) in `check_and_increment_rate_limit`. | `test/rate-limiter.test.ts` (Scenarios 14, 15) | **FIXED AND INTEGRATION-TESTED** |
| **Predictable Rate-Limit Salt** | Fallback to hardcoded string and secret reuse in `hashRateLimitKey`. | Created `RATE_LIMIT_HMAC_SECRET` with 256-bit entropy check and domain separation. | `test/rate-limiter.test.ts` (Scenarios 1, 2, 3, 4) | **FIXED AND INTEGRATION-TESTED** |
| **Dual-Secret Rate Limit Rotation** | Key rotation could drop active lockouts and bypass brute-force counters. | Implemented `RATE_LIMIT_HMAC_SECRET_PREVIOUS` dual-key check in `validateOtpVerifyAttempt`. | `test/rate-limiter.test.ts` (Scenario 5) | **FIXED AND INTEGRATION-TESTED** |
| **Production `customSecret` Parameter** | `options.customSecret` allowed API callers to inject arbitrary signing secrets. | Removed parameter from `signCredentialPayload` and `verifyCredentialSignature`. | `test/credential-signature.test.ts` (Scenario 14) | **FIXED AND UNIT-TESTED** |
| **Test Key Injection Production Guard** | Test mock store could theoretically be accessed in production code. | Added `if (process.env.NODE_ENV === "production") throw Fatal Security Violation`. | `test/credential-signature.test.ts` (Scenario 15) | **FIXED AND UNIT-TESTED** |
| **Cryptographic Key Material Quality** | Length check >= 32 chars allowed low-entropy keys. | Implemented `validateCryptographicKeyMaterial` checking decoded bytes (>= 32) and entropy. | `test/credential-signature.test.ts` (Scenario 16) | **FIXED AND UNIT-TESTED** |
| **Diagnostic PII Exposure in Logs** | Positive control in RLS test printed worker phone number in console output. | Created `src/lib/security/privacy-logger.ts` and masked phone output (`maskPhone`). | `test/rls-integration.test.ts` (Test 1), `test/rate-limiter.test.ts` (Scenario 17) | **FIXED AND INTEGRATION-TESTED** |

---

## 4. Test Suite Execution & Verification Evidence

All test suites were executed directly against local PostgreSQL 15 (`kaamsetu_rls_test`) and Node.js v20 runtime. Zero mock stubs were used for database security invariants.

### 1. Cryptographic Credential Signature & Key Rotation Suite (`npm run test:crypto`)
* **Execution Command:** `tsx test/credential-signature.test.ts`
* **Result:** **16 / 16 Scenarios PASSED** (Exit Code: 0)

| ID | Credential Scenario | Target Specification | Status |
|---|---|---|---|
| 1 | Valid credential signature verification | HMAC-SHA256 non-repudiation verified | PASSED [OK] |
| 2 | Modified payload detection (forged NSQF Level) | Tamper detected via canonical hash mismatch | PASSED [OK] |
| 3 | Wrong signing key rejection | Cryptographic signature validation failure | PASSED [OK] |
| 4 | Missing production secret fails closed | Fatal Configuration Error thrown in production | PASSED [OK] |
| 5 | Unknown key version rejection | Unregistered key version fails validation | PASSED [OK] |
| 6 | Revoked key version identification | Flagged in `REVOKED_SIGNING_KEY_VERSIONS` | PASSED [OK] |
| 7 | Expired credential detection | `validUntil` timestamp check enforced | PASSED [OK] |
| 8 | Suspended credential handling | Registry status check enforced | PASSED [OK] |
| 9 | Revoked credential identification | Registry revocation status enforced | PASSED [OK] |
| 10 | Signature byte tampering rejection | Single-bit alteration detected | PASSED [OK] |
| 11 | RFC 8785 Canonical JSON sorting & Unicode | Multi-lingual UTF-8 & key order invariance | PASSED [OK] |
| 12 | Multi-version key rotation support | Simultaneous validity across v1 and v2 keys | PASSED [OK] |
| 13 | Registry identifier mismatch rejection | Discrepancy between signed ID and registry | PASSED [OK] |
| 14 | Arbitrary customSecret cannot bypass key resolver | customSecret ignored by engine | PASSED [OK] |
| 15 | Test-only injection strictly throws in production | Fatal Security Violation thrown in production | PASSED [OK] |
| 16 | Cryptographic key material quality & entropy enforcement | Rejects weak/predictable, accepts 256-bit | PASSED [OK] |

### 2. Persistent Rate Limiting & Fail-Closed Defense Suite (`npm run test:ratelimit`)
* **Execution Command:** `tsx test/rate-limiter.test.ts`
* **Result:** **17 / 17 Scenarios PASSED** (Exit Code: 0)

| ID | Scenario | Verification Criteria | Status |
|---|---|---|---|
| 1 | Privacy-Preserving SHA-256 HMAC Key Hashing | Digest generated without leaking phone or IP | PASSED [OK] |
| 2 | Domain Separation Across Namespaces | Distinct HMAC digests for phone:send vs phone:verify | PASSED [OK] |
| 3 | Missing RATE_LIMIT_HMAC_SECRET in Production Fails Closed | Fatal Error Thrown (Blocked) | PASSED [OK] |
| 4 | Weak RATE_LIMIT_HMAC_SECRET (<32 bytes) Rejected | Fatal Error Thrown on weak entropy | PASSED [OK] |
| 5 | Dual-Secret Rotation Preserves Active Lockout | Lockout preserved across key rotation | PASSED [OK] |
| 6 | Atomic PostgreSQL check_and_increment_rate_limit RPC | Initial attempt allowed, count = 1 | PASSED [OK] |
| 7 | Threshold Exceeded Triggers Block Duration | Allowed=false, is_blocked=true, remaining > 500s | PASSED [OK] |
| 8 | Persistent 5-Attempt Lockout Enforcement | Lockout persisted in database, blocking verify | PASSED [OK] |
| 9 | Persistent Lockout Reset via clear_rate_limit RPC | is_blocked=false, count=0 | PASSED [OK] |
| 10 | Production Fail-Closed Architecture (No Silent Memory Bypass) | Allowed=false (reject without database in prod) | PASSED [OK] |
| 11 | Production OTP Verify Fails Closed Without Database | Never allow OTP verify without database | PASSED [OK] |
| 12 | Development Fail-Closed Without Explicit Mock Opt-In | Explicit opt-in required for memory fallback | PASSED [OK] |
| 13 | Development In-Memory Mock Store with Explicit Flag | Memory store functional when explicitly enabled | PASSED [OK] |
| 14 | Atomic Concurrency Serialization on First Key Insertion | 10 parallel queries count = 10, zero collisions | PASSED [OK] |
| 15 | Concurrent Failed Attempts Serialized and Locked | 5 concurrent failures recorded; 6th blocked | PASSED [OK] |
| 16 | Multi-Tier OTP Send Validation (60s Cooldown) | First attempt allowed, second blocked by cooldown | PASSED [OK] |
| 17 | Logging Privacy & Diagnostic Masking Assertion | All PII and secrets safely redacted | PASSED [OK] |

### 3. Database RLS & Concurrency Test Suite (`npm run test:rls`)
* **Execution Command:** `tsx test/rls-integration.test.ts`
* **Result:** **14 / 14 Invariants PASSED** (Exit Code: 0)
* All 14 invariants independently verified using paired positive and negative controls against real PostgreSQL sessions. Masked phone number output verified.

### 4. Supabase Backend & AI Invariant Verification Suite (`npm run verify:db`)
* **Execution Command:** `tsx src/lib/supabase/db/verify-backend.ts`
* **Result:** **71 / 71 Tests PASSED (0 Failed)** (Exit Code: 0)

### 5. Next.js Production Build (`npm run build`)
* **Result:** **34 / 34 Routes Compiled Successfully** (Exit Code: 0)
* Zero TypeScript compilation errors (`npx tsc --noEmit` clean).

---

## 5. Summary of Changed Files

1. `src/lib/crypto/key-validator.ts`: New module providing `validateCryptographicKeyMaterial` and `assertCryptographicKeyQuality` (256-bit entropy, decoded byte length, predictable pattern rejection).
2. `src/lib/crypto/credential-signer.ts`: Removed `customSecret` from public interfaces; added `__setTestSigningKeyForVersion` and `__resetTestSigningKeys` with production guard assertions; integrated key quality validator.
3. `src/lib/security/privacy-logger.ts`: New module providing `maskPhone`, `maskEmail`, `maskSecret`, and `sanitizeLogData`.
4. `src/lib/security/rate-limiter.ts`: Introduced `RATE_LIMIT_HMAC_SECRET` with 256-bit entropy check; domain separation across namespaces; fail-closed `validateOtpVerifyAttempt` preventing any unauthenticated bypass; dual-secret rotation support.
5. `src/app/api/auth/otp/verify/route.ts`: Integrated atomic `recordFailedOtpAttempt` return values; fail-closed 429/400 handling; prevented OTP success from overriding lockout.
6. `src/lib/env.ts`: Added `RATE_LIMIT_HMAC_SECRET` and `RATE_LIMIT_HMAC_SECRET_PREVIOUS` to schema; updated `validateEnvironmentSafety()` to enforce key material quality without printing secrets.
7. `.env.example`: Updated with clear instructions, variable names, and key generation commands (`openssl rand -base64 32`).
8. `test/rls-integration.test.ts`: Integrated `maskPhone` to redact phone numbers in test output.
9. `test/credential-signature.test.ts`: Removed `customSecret` usage; added test injection production guard tests, key quality tests, and custom secret rejection tests (16 scenarios).
10. `test/rate-limiter.test.ts`: Expanded to 17 scenarios covering OTP fail-closed, domain separation, 256-bit entropy, dual-secret rotation, concurrency, and privacy masking.
11. `docs/PHASE_3_1_SECURITY_PATCH.md`: Complete audit report and remediation documentation.

---

## 6. External Credential Dependencies & Production Gaps

The following external dependencies remain required for live commercial hosting:
1. **Hosted Supabase Project:** A live Supabase project is required for cloud hosting (replacing local PostgreSQL).
2. **Real SMS Gateway:** Production phone verification requires an active SMS gateway (Twilio, MSG91, or Supabase Auth SMS).
3. **Production Gemini API Quota:** Multilingual voice onboarding requires a Google Gemini 2.0 API key with appropriate production RPM/TPM quota.
4. **Production Secret Injection:** Hosting environments must configure `RATE_LIMIT_HMAC_SECRET` (>= 32 bytes base64), `CREDENTIAL_SIGNING_KEY` (>= 32 bytes base64), `SUPABASE_SERVICE_ROLE_KEY`, and `NEXT_PUBLIC_SUPABASE_URL`.

---

## 7. Final Production Readiness Decision

### **DECISION: CONTROLLED PILOT READY**

**Justification:**
All identified security gaps (OTP fail-closed bypass, predictable HMAC salt, `customSecret` parameter bypass, key entropy validation, and diagnostic PII logging) have been systematically resolved, covered by executable automated regression tests, and verified against PostgreSQL 15. The system demonstrates robust fail-closed security properties and cryptographic integrity. Because live third-party cloud infrastructure (hosted Supabase cloud, real telecom SMS gateway, and production cloud secrets) has not yet been connected, the platform is classified as **CONTROLLED PILOT READY**.
