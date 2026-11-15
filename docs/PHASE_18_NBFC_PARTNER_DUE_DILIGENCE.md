# KAAMSETU — PHASE 18: NBFC PARTNER DUE DILIGENCE

**Generated:** 2026-11-15T11:49:10+05:30  
**Status Classification:** `partner_approved` / `sandbox_tested`  
**Partner Entity:** North East Micro-Enterprise Finance Ltd  
**RBI Registration Number:** `B-05.00192` (RBI-registered NBFC-MFI)

---

## 1. Operational Classification Matrix

- **Implemented**: Partner evaluation service (`evaluateNbfcPartnerEligibility`), Key Fact Statement builder, application schema (`tool_financing_pilot_applications`).
- **Mocked**: Synthetic loan disbursement webhooks during offline regression tests.
- **Sandbox-tested**: Evaluated 5 multi-point partner criteria across Tests 41–45.
- **Partner-approved**: North East Micro-Enterprise Finance Ltd executed bilateral sandbox charter.
- **Production-active**: False (Controlled pilot mode).
- **Blocked**: Production capital disbursements until cooling-off integration is fully certified.
- **Not applicable**: Origination commissions, referral fees, or interest rate spreads.

---

## 2. Partner Evaluation Checklist & Audit Results

| Due Diligence Criterion | Statutory Requirement | Partner Evaluation | Status |
|---|---|---|---|
| **RBI License Status** | Valid Certificate of Registration | `B-05.00192` verified with RBI public database | `PASSED` |
| **Transparent KFS** | Standardized RBI Key Fact Statement | Offers standardized KFS prior to execution | `PASSED` |
| **APR Ceiling** | $\le 14.00\%$ p.a. for informal micro-tools | 11.5% - 12.0% p.a. reducing balance | `PASSED` |
| **Cooling-Off Window** | Minimum 3 days zero penalty | 3 business days statutory cooling-off window | `PASSED` |
| **No Cross-Selling Covenant** | Zero personal loans / insurance selling | Signed binding non-cross-selling covenant | `PASSED` |
| **Platform Commission** | Strictly 0.00% to KAAMSETU | Verified ₹0.00 referral fee or spread | `PASSED` |

---

## 3. Disqualified Lenders Audit

During the Phase 18 partner selection process, two candidate lenders were formally rejected:
1. *Candidate A (Digital App Lender)*: Demanded worker contact book and SMS read permissions. **REJECTED: Severe DPDP & RBI violation.**
2. *Candidate B (FinTech NBFC)*: Offered APR of 19.5% with 2.5% processing fee. **REJECTED: Exceeded 14.00% APR ceiling.**
