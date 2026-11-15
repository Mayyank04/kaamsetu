# PHASE 19: ONDC & ONEST APPROVAL STATUS REPORT
## Authoritative Network Whitelisting & Digital Public Goods Integration State

**Mission Invariant:** *"Every skill deserves to be seen, even without a degree."*  
**Date:** 2026-11-15  
**Domain Services:**  
- `src/lib/ecosystem/ondc/ondc-onboarding-service.ts`  
- `src/lib/ecosystem/onest/onest-live-service.ts`  
**Test Coverage:** `test/phase-19-evidence-assurance.test.ts` (Tests 17–25)

---

### 1. Context: Digital Public Goods Strategy

KAAMSETU integrates with national digital public infrastructure (DPI) to eliminate intermediary monopolies:
1. **Open Network for Digital Commerce (ONDC)**: Acts as a Beckn Protocol v1.2.0 **BPP (Seller Network Participant)**, enabling buyers on any Beckn buyer app to discover informal artisans across Guwahati, Shillong, and Siliguri.
2. **Open Network for Education & Skilling Transformations (ONest / DSEP)**: Acts as a decentralized skilling provider, federating verified vocational skill claims across NSDC, ASDM, and MSSDS.

---

### 2. Independent Audit Findings

#### A. ONDC Beckn v1.2.0 Conformance (`SANDBOX VALIDATED`)
- **Manifest Role**: Manifest role is certified as `BPP` under domain `ONDC:SRV11` (Services & Construction) with `zeroCommissionEnforced: true` (Test 17).
- **Cryptographic Key Ceremony**: Ed25519 32-byte public key ceremony conforms strictly to Beckn specifications (Test 18).
- **Staging Conformance**: All 10 automated Beckn conformance checks pass:
  1. Discovery search acknowledgment (`on_search`)
  2. Catalog delivery
  3. Item selection validation (`on_select`)
  4. Quote generation (`on_init`)
  5. Booking execution (`on_confirm`)
  6. Order status query handling (`on_status`)
  7. Cancellation & refund handling (`on_cancel`)
  8. Ed25519 signature verification
  9. Replay defense timestamp window (< 300 seconds)
  10. Worker PII contact masking
- **Replay Protection**: Stale requests older than 300 seconds or clock-skewed requests are rejected (Test 21).

#### B. ONest DSEP Decentralized Credential Protocol (`SANDBOX VALIDATED`)
- **Schema 2.0 Mapping**: `buildOnestProviderProfile` conforms to DSEP Schema 2.0 across jobs, courses, and assessments (Test 22).
- **Claim Immutability**: Third-party ONest buyer applications cannot overwrite or downgrade worker-owned trade classifications (Test 23).
- **Cryptographic Sovereignty**: Worker Ed25519 identity signatures are preserved throughout opportunity synchronization without platform re-signing (Test 24).

#### C. Network Approval Status (`AWAITING APPROVAL`)
- **ONDC Council Whitelisting**: Formal submission of the BPP participant profile was executed on 2026-11-10. Formal approval and cryptographic whitelisting key issuance by the ONDC Network Consortium remain pending.
- **DSEP Production Keys**: Consortium production credentials for the live skilling registry remain pending.

---

### 3. Summary Scorecard & Operating State

```
┌─────────────────────────────────┬────────────────────────┬──────────────────────┐
│ DPI Protocol Integration        │ Architecture & Tests   │ Authoritative State  │
├─────────────────────────────────┼────────────────────────┼──────────────────────┤
│ ONDC Beckn BPP Seller Adapter   │ 100% Conformance Ready │ awaiting_approval    │
│ ONest DSEP Skilling Provider    │ 100% Conformance Ready │ awaiting_approval    │
└─────────────────────────────────┴────────────────────────┴──────────────────────┘
```

**Certification Policy**:  
In accordance with zero-tolerance for unverified claims, neither ONDC nor ONest is represented as "live in production". Both are accurately recorded in the platform evidence registry as `awaiting_approval`.
