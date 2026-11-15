# KAAMSETU — PHASE 28 REGIONAL OPERATIONS SCORECARD
## Assam & Meghalaya Operating Metrics, Candidate Gate Holding & Regional Invariants

**Evaluation Context:** December 2026  
**Auditor:** Regional Operations Controller & Principal Systems Auditor  
**Scope:** Regional boundaries, verified artisan cohorts, and candidate gating.

---

## 1. Regional Footprint & Operational Boundaries

KAAMSETU maintains strict geographical containment to guarantee high operational quality, in-person artisan verification, and localized dispute handling:

```
ACTIVE OPERATING REGIONS (Controlled Production)
  ├── Assam (IN-AS): Kamrup Metropolitan (Guwahati Metro Hub)
  └── Meghalaya (IN-ML): East Khasi Hills (Shillong Regional Center)

GATED CANDIDATE REGIONS (Expansion Frozen)
  ├── Siliguri (IN-WB): Gated as 'conditionally_ready' (Pending physical hub lease)
  └── Tripura (IN-TR): Gated as 'candidate' / Research-Only (Pending TSDM Cabinet MoU)
```

As tested in [TEST 83], [TEST 84], and [TEST 85] of `test:phase28`, the platform strictly prohibits registering production workers or issuing production credentials outside Assam and Meghalaya.

---

## 2. Active Regional Operational Metrics

| Metric | Kamrup Metropolitan (Assam) | East Khasi Hills (Meghalaya) | Total Active Operations |
| :--- | :---: | :---: | :---: |
| **Operational Status** | Active (Production) | Active (Production) | **2 Active Districts** |
| **Active Verified Trades** | Carpentry, Electrical, Plumbing, Masonry | Carpentry, Electrical | **4 Trades** |
| **Completed Bookings** | 337 jobs | 180 jobs | **517 bookings** |
| **Gross Customer Payments** | ₹12,15,200.00 | ₹6,30,000.00 | **₹18,45,200.00** |
| **Worker Wage Entitlement** | ₹12,15,200.00 | ₹6,30,000.00 | **₹18,45,200.00** |
| **Platform Commission** | ₹0.00 (0.00%) | ₹0.00 (0.00%) | **₹0.00 (0.00%)** |
| **Average Settlement Latency** | 4.2 Hours | 4.6 Hours | **4.3 Hours** |
| **Physical Support Centers** | Guwahati Panbazar Hub | Shillong Police Bazar Hub | **2 Centers** |

---

## 3. Strict Candidate Region Gating

### Siliguri (West Bengal)
- **Status:** `conditionally_ready`
- **Gate Blocker:** Physical artisan support center commercial lease agreement pending finalization.
- **Rule:** Digital onboarding is disabled in Siliguri until physical dispute and biometric verification staff are stationed on-site.

### Tripura
- **Status:** `candidate` (Research-Only)
- **Gate Blocker:** `BLOCKER-01` (TSDM Cabinet MoU pending).
- **Rule:** Candidate profiles remain tagged as non-public drafts; 0 transactions permitted.
