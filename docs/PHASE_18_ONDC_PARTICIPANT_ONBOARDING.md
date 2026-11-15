# KAAMSETU — PHASE 18: ONDC PARTICIPANT ONBOARDING

**Generated:** 2026-11-15T11:47:30+05:30  
**Status Classification:** `sandbox_validated` / `awaiting_approval`  
**Network Role:** Seller Network Participant (BPP)  
**Protocol Version:** Beckn Protocol v1.2.0  
**Registered Domains:** `ONDC:SRV11`, `nic2004:construction`, `nic2004:services`

---

## 1. Operational Status Breakdown

| Dimension | Classification Status | Evidence & Details |
|---|---|---|
| **BPP Subscriber Registry Manifest** | `implemented` & `sandbox_validated` | Built in `src/lib/ecosystem/ondc/ondc-onboarding-service.ts` |
| **Ed25519 Key Ceremony** | `implemented` & `sandbox_validated` | Verified 32-byte public key; HSM-compatible derivation |
| **Staging Environment Conformance** | `sandbox_validated` | 10 of 10 Beckn protocol staging test cases executed with 100% pass |
| **Network Council Pre-Prod Approval** | `awaiting_approval` | Formal paperwork submitted; awaiting ONDC Council signoff |
| **Live Production Financial Clearing** | `blocked` | Gated until pre-prod approval and formal escrow authorization |
| **Worker Wage Commission Deduction** | `not_applicable` | Constitutional 0.00% commission permanently enforced |

---

## 2. Participant Configuration Manifest

```json
{
  "participantId": "kaamsetu.live.bpp.ondc",
  "subscriberId": "kaamsetu.org",
  "networkRole": "BPP",
  "domain": ["ONDC:SRV11", "nic2004:construction", "nic2004:services"],
  "cityCode": ["std:0361", "std:0364", "std:0353"],
  "uniqueKeyId": "kaamsetu-bpp-prod-v1",
  "callbackUrl": "https://kaamsetu.org/api/ecosystem/ondc",
  "lifecycleStatus": "sandbox_validated",
  "stagingStatus": {
    "passed": true,
    "testCasesCompleted": 10,
    "totalTestCases": 10
  },
  "zeroCommissionEnforced": true
}
```

---

## 3. Cryptographic Key Ceremony Specification

In accordance with ONDC security guidelines, KAAMSETU utilizes dual-key asymmetric cryptography:
1. **Signing Key Pair**: Ed25519 (32-byte raw public key, RFC 8032) for Beckn Authorization header generation and verification.
2. **Encryption Key Pair**: X25519 (Curve25519 Diffie-Hellman) for payload encryption when exchanging sensitive buyer details.
3. **Key Rotation Lifecycle**: Managed through `uniqueKeyId` versioning with zero downtime overlap.
