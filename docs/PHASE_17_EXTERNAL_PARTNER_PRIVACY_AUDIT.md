# KAAMSETU — PHASE 17 EXTERNAL PARTNER PRIVACY AUDIT
## DPDP Act Compliance, Data Minimization & Third-Party Telemetry Scrubbing

---

## 1. Compliance Mandate: DPDP Act, 2023

Under India's **Digital Personal Data Protection (DPDP) Act, 2023**:
- KAAMSETU acts as a **Data Fiduciary** for worker identity and credential data.
- External partners (ONDC BAPs, ONest participants, SAP/Oracle systems, NBFC lenders) act as **Data Processors** or secondary fiduciaries bound by specific consented purposes.

### Audit Checklist:
1. **Notice & Consent**: Clear, multilingual notice displayed to workers before any data sharing.
2. **Purpose Limitation**: Data shared with an NBFC for tool financing cannot be repurposed for insurance sales or general marketing.
3. **Data Minimization**: Only the strictly necessary fields are exported.
4. **Right of Erasure & Revocation**: Worker can unilaterally withdraw consent at any time.

---

## 2. Granular Field Minimization Matrix

| Data Category | Raw Platform Field | ONDC Export | ONest Export | Enterprise ERP | NBFC Readiness |
|---|---|---|---|---|---|
| **Worker Identity** | Full legal name, Aadhaar | Masked Moniker | Anonymized Ref | Ext Worker ID | Name & Trade |
| **Contact Info** | Mobile number, OTP | **STRIPPED** | **STRIPPED** | Optional / Masked | **STRIPPED** |
| **Financial Records** | Payout sums, bank account | **STRIPPED** | **STRIPPED** | Wage Compliant (Y/N) | Evidence Ratio Only |
| **Credentials** | NSQF Level, Certificate URL | Trade & Years | Full DSEP Credential | Skill list | Verified Badges Count |
| **Grievances** | Whistleblower reports | **STRIPPED** | **STRIPPED** | **STRIPPED** | **STRIPPED** |

---

## 3. Telemetry Log Scrubbing Verification
All production telemetry pipelines pass through regex scrubbing:
- 10-digit mobile numbers replaced with `[REDACTED_PHONE]`.
- 12-digit Aadhaar identifiers replaced with `[REDACTED_AADHAAR]`.
- Bank account numbers replaced with `[REDACTED_BANK_ACCOUNT]`.

Verified in automated test suite: zero raw PII logged to stdout or external monitoring streams.
