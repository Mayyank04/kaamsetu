# KAAMSETU — PHASE 17 GEM INTEROPERABILITY FEASIBILITY
## Government e-Marketplace (GeM) Workforce Compliance Verification Architecture

---

## 1. Executive Summary & Statutory Context

**Target System:** Government e-Marketplace (GeM) — Public Procurement Portal of India  
**Use Case:** Verification of contractor workforce compliance, statutory minimum wage adherence, and local district affirmative action quotas for public works tenders.  
**Strict Prohibition:** **ZERO SCRAPING OR UNAUTHORIZED AUTOMATION.** KAAMSETU interfaces strictly via authorized verification tokens and standardized compliance descriptors.  
**Status:** `FEASIBILITY_ESTABLISHED & COMPLIANCE_DESCRIPTOR_TESTED`

---

## 2. GeM Workforce Compliance Engine

Public works contractors executing state or central government tenders via GeM are legally required to verify:
1. **Statutory Minimum Wage Compliance**: 100% of deployed site workforce must receive at least the notified state minimum wage.
2. **Local Workforce Affirmative Quota**: Minimum 50% of unskilled and semi-skilled labor must be sourced from the local state/district.
3. **EPF / ESIC Enrollment**: Active social security coverage where statutory thresholds apply.

```mermaid
flowchart TD
    SiteRoster["Deployed Site Workforce Roster"] --> ComplianceEngine["GeM Compliance Engine (EnterpriseConnectorFramework)"]
    ComplianceEngine --> Check1{"Minimum Wage Compliant == 100%?"}
    ComplianceEngine --> Check2{"Local District Ratio >= 50%?"}
    Check1 & Check2 -->|Yes| TokenGen["Generate Cryptographic GeM Compliance Descriptor"]
    Check1 & Check2 -->|No| Reject["Reject Tender Submission (Non-Compliant)"]
    TokenGen --> Hash["Compute Deterministic SHA-256 Verification Digest"]
    Hash --> Cert["GeM Verification Token (Zero Raw PII Leaked)"]
    style Cert fill:#15803d,stroke:#166534,stroke-width:2px,color:#fff
    style Reject fill:#b91c1c,stroke:#991b1b,stroke-width:2px,color:#fff
```

---

## 3. Compliance Descriptor Payload Specification

```typescript
export interface GeMComplianceDescriptor {
  tenderId: string;
  contractorOrgId: string;
  totalWorkforceDeployed: number;
  statutoryMinimumWageCompliantRatio: number; // Must be 1.0 (100%)
  localDistrictWorkforceRatio: number; // Must be >= 0.50 (50%)
  complianceStatus: "compliant" | "non_compliant" | "under_review";
  verificationDigest: string; // Deterministic SHA-256
}
```

---

## 4. Test Verification
Verified in `test/phase-17-national-ecosystem.test.ts` (Tests 23–27):
- **Test 23 & 24:** 100% wage compliance requirement enforced.
- **Test 25:** Local district quota ($\ge 50\%$) verified.
- **Test 26:** Underpaid site deployment rejected as `non_compliant`.
- **Test 27:** Verification digest determinism confirmed.
