# KAAMSETU PHASE 14: WORKER PRIVACY AND CONSENT ARCHITECTURE
## DPDP Act Compliance, Plain-Language Multilingual Notices & Sovereign Identity Protection

**Version:** 1.0.0  
**Phase:** 14 — Operational Proof, Trust Governance & Regional Sustainability  
**Author:** Data Privacy Officer & Application Security Specialist  
**Regulatory Standard:** Digital Personal Data Protection (DPDP) Act, 2023 (India)  
**Classification:** B. NATIONAL EXPANSION READY — CONTROLLED ROLLOUT  

---

## 1. Compliance Architecture & Legislative Grounding

The Digital Personal Data Protection (DPDP) Act, 2023 establishes statutory requirements for data fiduciaries operating in India. Under Section 5(1) and Section 6 of the Act, data collection must be preceded by an itemized, clear, and plain-language notice accompanied by an uncoerced, affirmative consent mechanism.

Informal sector workers—many with limited formal literacy or unfamiliar with complex legal terms of service—are exceptionally vulnerable to predatory terms and unconsented data exploitation. KAAMSETU’s privacy architecture treats worker identity data as a sovereign asset owned entirely by the worker.

### Core Privacy Principles:
1. **Notice in the Worker's Mother Tongue:** Plain-language explanations rendered in Assamese, Hindi, and English.
2. **Selective Granular Disclosure:** Phone numbers, Aadhaar numbers, and commercial rates are never disclosed by default.
3. **Unilateral Revocation at Will:** Workers can revoke any contractor or institutional access grant instantly with zero penalty.
4. **Anti-Lock-in & Post-Cancellation Preservation:** Contractor tier cancellations or disputes never impair worker profile ownership.

---

## 2. Plain-Language Multilingual Privacy Notices

Implemented in `src/lib/worker/worker-trust-service.ts`, the platform generates localized, plain-language notices avoiding confusing legalese:

### 2.1 Assamese (`as`)
> "আপোনাৰ ডিজিটেল পৰিচয় সম্পূৰ্ণৰূপে আপোনাৰ অধীনত। ঠিকাদাৰে আপোনাৰ দক্ষতা আৰু কামৰ অভিজ্ঞতা চাব পাৰিব, কিন্তু আপোনাৰ অনুমতি অবিহনে আপোনাৰ ফোন নম্বৰ বা ব্যক্তিগত ঠিকনা কেতিয়াও কোনো অপৰিচিত ব্যক্তিক দিয়া নহ'ব। আপুনি যিকোনো সময়তে এই অনুমতি বাতিল কৰিব পাৰে।"
> *(Your digital identity is completely under your control. Contractors can view your skills and work experience, but without your permission, your phone number or private address will never be shared with strangers. You can cancel this permission at any time.)*

### 2.2 Hindi (`hi`)
> "आपकी डिजिटल पहचान पूरी तरह से आपके नियंत्रण में है। ठेकेदार आपके कौशल और काम के अनुभव को देख सकते हैं, लेकिन आपकी स्पष्ट अनुमति के बिना आपका फोन नंबर या आधार कभी किसी को नहीं दिया जाएगा। आप जब चाहें इस अनुमति को तुरंत वापस ले सकते हैं।"
> *(Your digital identity is completely under your control. Contractors can see your skills and work experience, but without your explicit permission, your phone number or Aadhaar will never be given to anyone. You can withdraw this permission whenever you want.)*

### 2.3 English (`en`)
> "Your digital identity belongs to you. Contractors can review your verified trade skills and work history, but your telephone number and Aadhaar details are strictly hidden unless you explicitly choose to share them. You can revoke access at any time with one click."

---

## 3. Granular Field-Level Disclosure Engine

Worker privacy settings are governed by the `worker_privacy_settings` table:

```typescript
export interface WorkerPrivacySettings {
  id: string;
  workerProfileId: string;
  fieldVisibility: {
    shareContactPhone: boolean;
    shareRates: boolean;
    shareCertifications: boolean;
    shareWorkHistory: boolean;
    shareAadhaarLast4: boolean;
  };
  consentExpiresAt: string;
  autoRenewConsent: boolean;
  allowCrossRegionDiscovery: boolean;
}
```

### Default Hardened State
When a worker creates their profile, the system defaults to maximum privacy:
- `shareContactPhone = false`: Phone number is masked as `+91-XXXXX-XXXXX`.
- `shareRates = false`: Wage expectations are withheld from public directory searches.
- `shareAadhaarLast4 = false`: Government identifiers are completely shielded.
- `allowCrossRegionDiscovery = false`: Workers are not suggested for interstate relocation unless explicitly opted in.

---

## 4. Consent Lifecycle & Audit Trail

Every interaction involving worker data follows a strictly audited 5-stage lifecycle:

```mermaid
sequenceDiagram
    autonumber
    actor Worker as Worker (PWA / Voice)
    participant Platform as KaamSetu Privacy Engine
    participant Ledger as worker_consent_audit_events
    actor Contractor as Contractor / Institution

    Contractor->>Platform: Request Contact Details for Booking
    Platform->>Worker: Present Plain-Language Consent Prompt (Assamese / Hindi)
    Worker->>Platform: Affirmative Click / Voice Confirmation
    Platform->>Ledger: Insert Audit Record (SHA-256 Hash + IP + User Agent)
    Platform->>Contractor: Issue Time-Bound Access Token (14 Days)
    Note over Worker,Contractor: Token active; contact revealed

    Worker->>Platform: Revoke Access Button Clicked
    Platform->>Ledger: Record Instant Revocation Event
    Platform->>Contractor: Invalidate Access Token (HTTP 401 Unauthorized)
```

### Immutable Consent Ledger (`worker_consent_audit_events`)
The `worker_consent_audit_events` table (added in Migration 15) captures an immutable historical record:

| Field Name | Type | Description |
|:---|:---|:---|
| `id` | `UUID` | Primary key |
| `worker_profile_id` | `UUID` | Foreign key referencing `worker_profiles(id)` |
| `event_type` | `VARCHAR(64)` | `consent_granted`, `consent_renewed`, `consent_revoked`, `fields_modified` |
| `disclosed_fields` | `JSONB` | Exact list of permitted fields at event timestamp |
| `grantee_id` | `VARCHAR(128)` | Target contractor organization or institution identifier |
| `ip_address` | `INET` | Client IP address for legal provenance |
| `user_agent` | `TEXT` | Browser / device client header |
| `consent_hash` | `VARCHAR(64)` | SHA-256 fingerprint of consent notice text and payload |
| `created_at` | `TIMESTAMPTZ` | Immutable UTC timestamp |

---

## 5. Instant Revocation & Access-Grant Invalidation

When a worker completes a job or chooses to sever ties with a contractor, they can click "Revoke Access" in the mobile PWA.
Under `src/lib/worker/worker-trust-service.ts`:
1. The grant record in `worker_identity_access_grants` is set to `status = 'revoked'` with `revoked_at = now()`.
2. The authorization cache immediately purges the active token.
3. Subsequent contractor API requests using that token receive:
   ```json
   {
     "error": "Access grant revoked",
     "revoked_at": "2026-11-15T01:00:00Z"
   }
   ```
This was verified in Phase 14 Test Suite (`Test 8: Instant Access-Grant Revocation Defense`).

---

## 6. Anti-Lock-in & Commercial Downgrade Invariant

A major failure mode of exploitative labor platforms is "platform capture"—where a worker's professional history is held hostage by the employer who pays the software subscription.

In KAAMSETU:
- Worker identity records reside in `worker_profiles`, decoupled from `contractor_organizations`.
- When an employer cancels their Contractor Pro subscription (`subscription_status = 'cancelled'`), a cascade deletion or suspension of worker profiles is strictly prevented.
- The worker retains 100% of their verified work records, customer ratings, institutional skill credentials, and QR card accessibility.

Verified in Phase 14 Test Suite (`Test 27: Subscription Cancellation Identity Preservation Invariant`).
