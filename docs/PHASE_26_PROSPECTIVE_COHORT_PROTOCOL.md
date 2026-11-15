# KAAMSETU — PHASE 26 PROSPECTIVE COHORT STUDY PROTOCOL
## Protocol Specification for Independent Causal Worker Outcome Evaluation (Phase 27 Execution)

**Protocol Code:** `PROTO-EVAL-2027-NE-01`  
**Evaluation Lead:** Independent Labor Econometrician & Academic Evaluation Partner  
**Target Execution Window:** Q1–Q2 2027  
**Governance Scope:** Kamrup Metropolitan (Assam) & East Khasi Hills (Meghalaya)  

---

### 1. Study Rationale & Research Questions

Previous evaluations (`STUDY-REP-2026-AS-01`, $N=45$) established positive pre-post income correlation (+50.00% net realization) but were methodologically restricted to an observational re-analysis without a concurrent control group.

This protocol defines the design for a **Prospective Difference-in-Differences (DiD) Cohort Study** with a matched comparison group to measure the causal impact of KAAMSETU's zero-commission verifiable workforce platform on informal artisan livelihoods.

#### Primary Research Question:
Does verifiable digital credentialing combined with zero-commission direct contracting cause a statistically significant increase in monthly net take-home earnings for informal vocational artisans compared to demographically and commercially matched non-platform artisans?

---

### 2. Study Design & Sample Size Justification

#### 2.1 Design Architecture
- **Methodology:** Prospective Quasi-Experimental Cohort with Matched Control Group (Difference-in-Differences).
- **Treatment Cohort ($T$):** Artisans onboarded to KAAMSETU with verified W3C credentials and active booking visibility.
- **Matched Comparison Cohort ($C$):** Similar artisans working in the same geographic trade clusters (e.g. Dispur, Six Mile, Laitumkhrah) who operate through traditional word-of-mouth or contractor intermediaries. Matching via Propensity Score Matching (PSM) on age, trade experience, baseline rate, and tool ownership.

#### 2.2 Statistical Power & Sample Size Calculation
- **Minimum Detectable Effect (MDE):** +15.0% relative increase in net monthly realization.
- **Significance Level ($\alpha$):** 0.05 (two-sided).
- **Statistical Power ($1 - \beta$):** 0.80 (80% power).
- **Expected Standard Deviation ($\sigma$):** 25% of baseline mean.
- **Required Sample Size Formula:**
  $$n = \frac{2 \times (z_{\alpha/2} + z_{\beta})^2 \times \sigma^2}{\Delta^2} = \frac{2 \times (1.96 + 0.84)^2 \times 0.25^2}{0.15^2} \approx 44\text{ per arm}$$
- **Buffer for Attrition (20%):** $n_{\text{adjusted}} = \frac{44}{1 - 0.20} = 55\text{ artisans per arm}$.
- **Target Recruitment:**
  - Treatment Group: **$N_T = 60$ artisans** (30 Assam, 30 Meghalaya).
  - Control Group: **$N_C = 60$ artisans** (30 Assam, 30 Meghalaya).
  - Total Sample: **$N = 120$ artisans** across two primary trades (Carpentry & Masonry).

---

### 3. Recruitment & Eligibility Criteria

#### 3.1 Inclusion Criteria
1. Age 18–55 years.
2. Informal artisan with $\ge 24\text{ months}$ verifiable work history in carpentry or masonry.
3. Operating actively in Kamrup Metropolitan (Assam) or East Khasi Hills (Meghalaya).
4. Owns a basic smartphone (Android 8.0+) capable of offline SMS/voice logging.
5. Holds a personal bank account or active UPI VPA.
6. Gives voluntary, informed consent in their primary spoken language (Assamese, Khasi, Hindi, Bengali, or English).

#### 3.2 Exclusion Criteria
1. Full-time salaried employees of formal construction corporations.
2. Artisans with prior disciplinary bans or active fraud complaints.
3. Individuals planning interstate migration out of the study area within 6 months.

---

### 4. Observation Timeline & Data Collection

```
      T-30 Days                 Day 0                  Day 90                Day 180
         │                        │                       │                     │
         ▼                        ▼                       ▼                     ▼
┌─────────────────┐      ┌─────────────────┐     ┌─────────────────┐   ┌─────────────────┐
│ Baseline Period │      │ Onboarding /    │     │ Mid-line Survey │   │ End-line Survey │
│ 30-Day Pre-Log  │─────►│ Platform Launch │────►│ 90-Day Audit    │──►│ 180-Day Impact  │
│ (T and C arms)  │      │ (Treatment arm) │     │ (Both arms)     │   │ & Dissemination │
└─────────────────┘      └─────────────────┘     └─────────────────┘   └─────────────────┘
```

#### 4.1 Data Collection Instruments
1. **Digital Work Logbook:** Daily structured SMS/IVR prompt:
   - "Did you work today? [Yes/No]"
   - "Hours worked: [Hours]"
   - "Gross wage agreed: [₹]"
   - "Actual payment received: [₹]"
   - "Direct out-of-pocket expenses (travel, blades, glue, food): [₹]"
2. **Bi-Weekly Field Assessor Spot-Audits:** Independent enumerators verify 10% of completed jobs on-site with physical inspection.
3. **Banking Statement Reconciliation:** Monthly masked bank passbook/UPI transaction audits to verify settlement authenticity.

---

### 5. Outcome Variables & Definitions

- **Primary Outcome:** **Net Monthly Realization (INR)**:
  $$\text{Net Realization} = \sum (\text{Gross Payout Received}) - \sum (\text{Direct Out-of-Pocket Job Expenses})$$
- **Secondary Outcomes:**
  1. *Active Working Days per Month.*
  2. *Average Realized Hourly Wage Rate (INR/hour).*
  3. *Payment Delay Latency (hours from job completion to cash receipt).*
  4. *Dispute and Unpaid Wage Incidents (Rate per 100 jobs).*
  5. *Customer Retention Rate (Percentage of repeat bookings).*

---

### 6. Analytical Plan: Difference-in-Differences Model

The causal impact will be estimated using an econometric panel regression:
$$Y_{it} = \beta_0 + \beta_1 \cdot \text{Post}_t + \beta_2 \cdot \text{Treatment}_i + \mathbf{\delta} \cdot (\text{Treatment}_i \times \text{Post}_t) + \mathbf{X}_{it}'\gamma + \varepsilon_{it}$$

Where:
- $Y_{it}$: Net monthly realization for artisan $i$ in period $t$.
- $\text{Treatment}_i$: Binary indicator (1 for KAAMSETU platform, 0 for traditional matched control).
- $\text{Post}_t$: Binary indicator (1 for post-launch evaluation window, 0 for baseline).
- $\mathbf{\delta}$: **The causal Difference-in-Differences treatment effect**.
- $\mathbf{X}_{it}$: Vector of individual covariates (age, experience, trade tier, tool score).
- Standard errors clustered at the district-cluster level.

---

### 7. Ethical Governance, Privacy & Institutional Oversight

1. **Institutional Review Board (IRB) Approval:** Protocol must be submitted for formal ethics review to an independent university or research institute prior to subject enrollment.
2. **DPDP Act 2023 Compliance:** Explicit purpose-specific consent recorded in `worker_consent_audit_events`. Participants may withdraw at any time without penalty or loss of platform access.
3. **Remuneration for Survey Burden:** Both treatment and control participants will receive a compensation allowance of ₹300 per completed monthly survey to compensate for time taken.
4. **Zero Conflict of Interest:** Data collection and statistical analysis conducted by external academic partners with no equity or commercial interest in KAAMSETU.

---

### 8. Summary Conclusion

This prospective cohort protocol provides the definitive methodological blueprint for Phase 27. It moves beyond observational claims to establish peer-reviewed, academically rigorous causal proof of worker economic empowerment under zero commission.
