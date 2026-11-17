# AUTOMATED REGRESSION TEST EVIDENCE DOSSIER

**Document ID:** `KAAMSETU-DOC-39-6-10`  
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Status:** `VERIFIED LOCALLY`

---

## 1. Test Suite Execution Summary

All automated test suites across Phase 39.1 through Phase 39.6 were executed successfully with 0 failures:

| Test Suite | Command | Total Tests | Passed | Failed | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Phase 39.6** | `npm run test:phase39.6` | 15 | 15 | 0 | **PASS** |
| **Phase 39.5** | `npm run test:phase39.5` | 5 | 5 | 0 | **PASS** |
| **Phase 39.4** | `npm run test:phase39.4` | 27 | 27 | 0 | **PASS** |
| **Phase 39.3** | `npm run test:phase39.3` | 21 | 21 | 0 | **PASS** |
| **Phase 39.2** | `npm run test:phase39.2` | 24 | 24 | 0 | **PASS** |
| **Incident Repair**| `npm run test:incident-repair` | 14 | 14 | 0 | **PASS** |
| **Aggregate Total**| Across all suites | **106** | **106** | **0** | **PASS** |

---

## 2. Key Assertion Details (Phase 39.6 Suite)

- **Failure A (Consent Checkbox):**
  - Checkbox presence (`id="onboarding-modal-consent"`) and binding to `termsAccepted`: PASS.
  - Links to Terms/Privacy with `stopPropagation`: PASS.
  - Accessible error banner (`role="alert"`): PASS.
  - Mobile overflow prevention (`max-h-[calc(100vh-2rem)]`): PASS.
  - Indian mobile number validation (+91, 10 digits starting with 6-9): PASS.
- **Failure B (Homepage Image):**
  - Explicit dimensions `width={72} height={72}` on `ProfessionalCard`: PASS.
  - Elimination of unconstrained `fill` on avatar portraits: PASS.
  - Fixed 72px square boundary wrapper: PASS.
  - Explicit dimensions `width={96} height={96}` on `CredentialDialog`: PASS.
- **Gemini Fallback & Extraction:**
  - Dynamic 5-model candidate chain (`gemini-3.8-flash` to `2.0-flash`): PASS.
  - Faithful fallback without fake names or fabricated surnames: PASS.
  - Confidence score bounding [0.0, 1.0]: PASS.
- **Authentication & Invariants:**
  - Tamper-evident HMAC session tokens: PASS.
  - Rejection of tampered payloads: PASS.
  - Permanent zero commission (`platform_commission_amount = 0.00`): PASS.
  - Class B rollout boundaries (Guwahati 781001-781039, Shillong 793001-793022): PASS.
