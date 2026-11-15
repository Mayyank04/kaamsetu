# KAAMSETU — FINANCING PARTNER DUE DILIGENCE
## Responsible Worker Finance, RBI Digital Lending Guidelines 2022, NBFC Tripartite Requirements & Worker Protection

**Regulatory Basis:** Reserve Bank of India (RBI) Guidelines on Digital Lending (September 2, 2022)  
**Target Product:** Professional Tool & Equipment Micro-Financing for Informal Workers  
**Current Operating Classification:** `sandbox_validated`  
**Service Implementation:** `src/lib/finance/nbfc-tool-financing-service.ts`

---

### 1. Regulatory Context & Mission Invariant

In India's informal economy, skilled artisans, electricians, carpenters, and plumbers frequently struggle with productivity because they lack ownership of high-efficiency modern power tools. However, predatory fintech lending traps vulnerable informal workers in compounding debt cycles.

KAAMSETU establishes a **Worker-First Financial Inclusion Framework** strictly compliant with RBI 2022 Digital Lending Guidelines:

1. **Non-Conditionality:** Tool financing is strictly optional. It is **never** a mandatory condition for registering an identity, accessing job opportunities, or receiving wages.
2. **Cap on Cost of Credit:** All financing offerings are capped at an Annual Percentage Rate (APR) $\le 14.0\%$. Predatory rates (e.g. 24%–36%) are hard-blocked by software validation.
3. **Cooling-Off Period:** Informal borrowers receive a statutory 3-day look-up / cooling-off period during which the credit agreement can be exited without prepayment penalties.
4. **Direct Disbursement Flow:** Loan disbursements never touch unregulated intermediaries. Funds flow directly from the regulated NBFC escrow account to the verified equipment merchant.
5. **No Biometric Credential Storage:** Lending risk models are strictly forbidden from capturing or storing biometric data.

---

### 2. Tripartite LSP Agreement Requirements

Under RBI rules, a technology platform acting as a Lending Service Provider (LSP) must operate under a formal, registered **Tripartite Agreement** between:
1. The Regulated Entity (RBI-registered NBFC).
2. The Technology Platform / LSP (KAAMSETU).
3. The Escrow Trustee / Scheduled Commercial Bank.

#### Current Operational Status:
- **Financial Model & Logic:** 100% Implemented & Tested in code (`nbfc-tool-financing-service.ts`).
- **RBI Key Fact Statement (KFS) Generator:** Automated and compliant.
- **Candidate NBFC Discussions:** Technical due diligence completed with regional NBFC partner.
- **Tripartite Legal Contract:** **UNEXECUTED / IN DRAFT REVIEW**.
- **Audit Classification:** **`sandbox_validated`**.
- **Execution Policy:** Zero live loans will be originated or disbursed until the Tripartite Agreement is signed and stamped.

---

### 3. Sample Standardized Key Fact Statement (KFS)

Before any informal worker consents to a tool financing agreement, the platform displays an unbundled, plain-language Key Fact Statement in the worker's native language (e.g. Assamese, Hindi, Bengali):

```json
{
  "kfsId": "KFS-2026-AS-0042",
  "lenderName": "Candidate Regulated NBFC Partner Ltd",
  "lspName": "KaamSetu Digital Identity Platform",
  "borrowerName": "Bhaben Roy",
  "tradeCategory": "Masonry & Tiling",
  "financedAsset": "Bosch Professional Rotary Laser & Tile Cutter Kit",
  "loanPrincipalInr": 15000.00,
  "termMonths": 6,
  "nominalInterestRatePercent": 10.5,
  "annualPercentageRatePercent": 11.8,
  "processingFeeInr": 0.00,
  "insuranceOrIncidentalFeesInr": 0.00,
  "monthlyInstallmentInr": 2587.50,
  "totalAmountPayableInr": 15525.00,
  "coolingOffPeriodDays": 3,
  "prepaymentPenaltyPercent": 0.00,
  "nodalGrievanceOfficerPhone": "+91-1800-XXX-XXXX"
}
```

---

### 4. Due Diligence Evaluation Matrix

| Criterion | Statutory Requirement | KAAMSETU Implementation | Status |
| :--- | :--- | :--- | :--- |
| **Max APR Cap** | Fair Lending Practice | Hard cap $\le 14.0\%$ | **VERIFIED IN TESTS** |
| **Cooling-Off Window**| Minimum 3 Days | 3 Days with Full Refund | **VERIFIED IN TESTS** |
| **LSP Tripartite MoU** | Mandatory per RBI 2022 | In Legal Draft | **GATED (UNEXECUTED)** |
| **Disbursement Flow** | Regulated Entity $\to$ Merchant | Direct Merchant Escrow | **VERIFIED IN TESTS** |
| **Identity Non-Coercion**| Constitution of KaamSetu | Decoupled from Core ID | **VERIFIED IN TESTS** |

*Verdict: Financial logic and worker protections are rigorously validated; live origination remains blocked pending execution of the Tripartite LSP Agreement.*
