# KAAMSETU — PHASE 18: WORKER FINANCIAL CONSENT & DISCLOSURES

**Generated:** 2026-11-15T11:49:35+05:30  
**Regulatory Standard:** Digital Personal Data Protection Act (DPDPA 2023) & RBI Digital Lending Directions  
**Status Classification:** `implemented` & `sandbox_tested`

---

## 1. Consent Architecture Overview

Worker financial data sharing is gated by four strict non-negotiables:
1. **Explicit Positive Opt-in**: Pre-ticked boxes are architecturally prohibited; affirmative action is recorded with an ISO 8601 timestamp and digital signature.
2. **Purpose Limitation**: Consent is strictly bound to `micro_enterprise_tool_financing`; partners cannot use data for consumer credit, personal loans, or marketing.
3. **Time-Bounded Validity**: Consents default to 90 days validity and auto-expire thereafter.
4. **Instant Unilateral Revocation**: Workers can revoke consent at any time via the UI or assisted kiosk, instantly terminating partner data read privileges.

---

## 2. Key Fact Statement (KFS) Disclosure Format

Every worker reviewing a tool financing advance is presented with a clear, tabular disclosure before confirmation:

```
================================================================================
KAAMSETU — KEY FACT STATEMENT (RBI DIGITAL LENDING COMPLIANT)
================================================================================
Reference ID:             KFS-7B29F4C1
Borrower Worker ID:       w-worker-0982 (Tokenized)
Lending Partner:          North East Micro-Enterprise Finance Ltd
RBI Registration No:      B-05.00192
Vocational Tool Pack:     Solar PV Installation & Testing Kit
--------------------------------------------------------------------------------
Principal Advance Amount: ₹18,000.00
Annual Percentage Rate:   11.50% p.a. (Reducing Balance)
Repayment Tenure:         6 Months
Monthly EMI:              ₹3,101.42
Total Interest Payable:   ₹608.52
Total Repayment Amount:   ₹18,608.52
--------------------------------------------------------------------------------
Processing Fees:          ₹0.00 (Zero)
Prepayment Penalty:       ₹0.00 (Zero)
Cooling-off Period:       3 Business Days (Exit with 0 penalty)
Platform Commission Rate: 0.00% (Guaranteed)
KFS Verification Hash:    8c91a0f8b1e4c7...
================================================================================
```

---

## 3. Multilingual Accessibility

To ensure informal workers fully understand their rights:
- KFS disclosures are rendered in native scripts: Hindi, Assamese, Bengali, and English.
- Voice-assisted readout option reads key terms (Principal, EMI, Tenure, and 0% Commission) aloud in the worker's chosen local dialect.
