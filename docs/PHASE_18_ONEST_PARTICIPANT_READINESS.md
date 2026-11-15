# KAAMSETU — PHASE 18: ONEST PARTICIPANT READINESS

**Generated:** 2026-11-15T11:48:05+05:30  
**Status Classification:** `sandbox_validated` / `awaiting_approval`  
**Network Role:** DSEP Skilling & Opportunity Provider  
**Protocol Version:** DSEP / Beckn-Onest v1.0.0

---

## 1. Operational Classification

- **Implemented**: Schema 2.0 to ONest DSEP mapping, vocational credentials schema, public verification endpoints (`/verify/[id]`), claim protection invariants.
- **Mocked**: External learning management systems in automated test harnesses.
- **Sandbox-tested**: Successfully verified mapping and opportunity ingestion with ASDM & MSSDS accredited institutions.
- **Partner-approved**: Pre-production partner readiness confirmed with ASDM; formal DSEP consortium council ratification pending (`awaiting_approval`).
- **Production-active**: False (Controlled rollout gated).
- **Blocked**: Production credential synchronization with non-consenting external platforms.
- **Not applicable**: Academic degree prerequisites (strictly unrequired).

---

## 2. DSEP Provider Profile

```json
{
  "providerId": "kaamsetu.onest.dsep.provider",
  "providerUri": "https://kaamsetu.org/api/ecosystem/onest",
  "name": "KAAMSETU Digital Identity Platform",
  "dsepDomains": ["dsep:jobs", "dsep:courses", "dsep:assessments"],
  "supportedTrades": [
    "electrical-solar",
    "plumbing-sanitation",
    "masonry-construction",
    "carpentry-woodwork",
    "welding-fabrication"
  ],
  "verifiableRegistryEndpoint": "https://kaamsetu.org/verify",
  "zeroCommissionGuarantee": true
}
```

---

## 3. Worker Claim Protection Guarantees

In accordance with Phase 18 non-negotiables, external platforms interacting with KAAMSETU via ONest cannot:
1. Mutate or downgrade worker primary trades.
2. Alter or overwrite historical wage records or KaamScore calculations.
3. Remove or strip institutional verifiable credentials.
4. Claim ownership over worker profiles.
