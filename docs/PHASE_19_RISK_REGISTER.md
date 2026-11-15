# PHASE 19: RISK REGISTER & MITIGATION STRATEGY
## Threat Assessment, Operational Gaps & Defensive Controls

**Mission Invariant:** *"Every skill deserves to be seen, even without a degree."*  
**Date:** 2026-11-15  
**Review Standard:** Enterprise Risk Management (ERM) & Cybersecurity Framework

---

### Risk Assessment Matrix

| Risk ID | Category | Risk Description | Inherent Severity | Residual Risk | Implemented Defensive Control / Mitigation |
|---|---|---|---|---|---|
| **RSK-01** | Regulatory | Premature production launch into ONDC/DSEP without formal consortium whitelisting keys | Critical | Low | Hardcoded gating in `ondc-onboarding-service.ts` keeps status strictly in `awaiting_approval`. Outbound network requests blocked until council certificate issuance. |
| **RSK-02** | Legal / Operational | Enterprise EPC pilot disputes arising from lack of stamped non-judicial bilateral contracts | High | Medium | Classified as `partner_unverified`. Deployments limited to sandbox rosters; live muster rolls blocked until legal paper execution. |
| **RSK-03** | Financial Compliance | NBFC tool financing declared active without statutory Tripartite LSP execution under RBI 2022 norms | High | Low | Tool financing APIs restricted to `sandbox_validated` simulation. KFS builder enforces $\le 14\%$ APR and 0% origination fee. Live credit bureau calls blocked. |
| **RSK-04** | Privacy / DPDP | Accidental edge CDN caching of artisan phone numbers or national Aadhaar identifiers | High | Very Low | Edge Cache Admission Firewall (`MultiRegionRoutingService.validateEdgeCacheAdmission`) inspects all payloads for Aadhaar, phone, and IFSC regex patterns. |
| **RSK-05** | Infrastructure | Cross-region WAN partition between Mumbai primary and Kolkata read replica | Medium | Low | Replication lag threshold trigger at 2,000ms immediately redirects reads back to Mumbai primary; circuit breaker trips after 3 consecutive failures. |
| **RSK-06** | Data Integrity | Involuntary worker skill downgrade or erasure by external third-party skilling platforms | High | Very Low | `protectWorkerClaimsFromOnestMutation` defends worker-owned claims as immutable against external overwrite. |
| **RSK-07** | Economic Ethics | Unscrupulous contractors deducting platform fees from informal artisan daily wages | Critical | Zero | Database check constraint `worker_outcome_milestones_platform_commission_amount_check` permanently rejects non-zero commission (`platform_commission_amount = 0.00`). |
| **RSK-08** | Regional Gating | Premature launch in expansion territory Tripura without state skilling mission MoU | Medium | Very Low | Launch gate evaluation script strictly locks Tripura in `gated_in_research` at 57.1% until TSDM MoU prerequisite is fulfilled. |
