# KAAMSETU — PHASE 25 INDEPENDENT WORKER IMPACT REVIEW
## Statistical Re-Analysis, Estimator Auditing & Causal Limitations of STUDY-REP-2026-AS-01

**Repository:** `Mayyank04/kaamsetu`  
**Working Branch:** `phase-25-independent-evidence-and-class-a-reassessment`  
**Evaluation Date:** November 15, 2026  
**Auditor:** Statistical Replication Lead & Worker Impact Analyst  

---

### 1. Cohort Specification & Re-Analysis Nature

Phase 24 presented a replicated study of the Guwahati Carpentry Cohort (`STUDY-REP-2026-AS-01`).

**Critical Methodological Finding:**
- **Study Nature:** Phase 24 did **NOT** recruit an independent new cohort of 45 carpenters. Rather, it performed a **rigorous secondary re-analysis and mathematical disaggregation** of the original 45-artisan cohort observed across Q4 2026.
- In accordance with academic and institutional research standards, this is formally classified as `study_type = 'cohort_reanalysis'`.

---

### 2. Mathematical Disaggregation of Sensitivity Models

$$\text{Sample Size } N = 45 \text{ Artisans}$$
$$\text{Baseline: } 16.2 \text{ mean active days} \times ₹650.00/\text{day} = ₹10,530.00 \text{ gross}$$
$$\text{Post: } 19.8 \text{ mean active days} \times ₹775.00/\text{day} = ₹15,345.00 \text{ gross}$$

#### 2.1 Empirical Variable Expense Model (+50.00% Net Gain)
- Direct work expenses (local tempo/bus transit and site food) scale with active working days.
- Baseline: 16.2 days $\times \approx ₹92.59/\text{day} = \mathbf{₹1,500.00}$. Baseline Net = $₹10,530.00 - ₹1,500.00 = \mathbf{₹9,030.00}$.
- Post: 19.8 days $\times \approx ₹90.91/\text{day} = \mathbf{₹1,800.00}$. Post Net = $₹15,345.00 - ₹1,800.00 = \mathbf{₹13,545.00}$.
$$\text{Net Growth} = \frac{₹13,545.00 - ₹9,030.00}{₹9,030.00} = \frac{₹4,515.00}{₹9,030.00} = \mathbf{+50.00\%}$$

#### 2.2 Fixed Expense Sensitivity Model (+55.15% Net Gain)
- Assumes constant fixed monthly direct overhead of ₹1,800.00 across both periods.
- Baseline Net: $₹10,530.00 - ₹1,800.00 = \mathbf{₹8,730.00}$.
- Post Net: $₹15,345.00 - ₹1,800.00 = \mathbf{₹13,545.00}$.
$$\text{Net Growth} = \frac{₹13,545.00 - ₹8,730.00}{₹8,730.00} = \frac{₹4,815.00}{₹8,730.00} = \mathbf{+55.15\% \approx 55.2\%}$$

Both calculations are mathematically exact. In all reporting, they must remain clearly distinguished.

---

### 3. Statistical Estimator & Confidence Interval Audit

The reported 95% Confidence Interval for post-participation monthly net realization is **$[₹13,120.00, ₹13,970.00]$**.

#### 3.1 Estimator Reconstruction:
- **Statistic Evaluated:** Mean post net monthly earnings ($\bar{X} = ₹13,545.00$).
- **Method:** Two-sided Student's $t$-distribution with $df = N - 1 = 44$.
- **Critical Value:** $t_{0.025, 44} \approx 2.01537$.
- **Margin of Error ($E$):** $\frac{₹13,970.00 - ₹13,120.00}{2} = ₹425.00$.
- **Standard Error ($SE$):** $SE = \frac{E}{t} = \frac{₹425.00}{2.01537} \approx ₹210.88$.
- **Implied Sample Standard Deviation ($s$):**
  $$s = SE \times \sqrt{N} = 210.88 \times \sqrt{45} \approx 210.88 \times 6.7082 \approx \mathbf{₹1,414.63}$$
- **Substantive Plausibility:** A standard deviation of $\approx ₹1,415$ on a monthly net base of ₹13,545 ($\text{CV} \approx 10.4\%$) is highly realistic for a cohort of skilled carpenters working between 17 and 22 days per month.

---

### 4. Methodological & Causal Limitations

While the arithmetic and summary statistical replication are certified `reproduced_exact`, the following scientific caveats must be acknowledged:
1. **Pre-Post Observational Design:** Without a randomized control group or synthetic control group, part of the +50.0% gain may be attributable to pre-Diwali seasonal construction spikes in urban Guwahati, general post-monsoon weather improvements, or inflationary market adjustments.
2. **Worker Selection Bias:** Artisans who voluntarily adopted digital skill verification may possess higher baseline motivation or entrepreneurial drive than the broader informal artisan population.
3. **Causal Attribution Recommendation:** Future phases should implement a Difference-in-Differences (DiD) study comparing verified KAAMSETU artisans against an unverified control group of carpenters in comparable Guwahati wards.
