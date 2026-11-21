# KAAMSETU — PHASE 42 AUDIT DOSSIER 05
# WORKER IDENTITY AND SOVEREIGN CREDENTIAL REPORT

**Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Identity Principle:** "Every skill deserves to be seen, even without a degree."  
**Standard:** Sovereign Verifiable Credentials, KaamScore Algorithmic Trust  
**Status:** `VERIFIED WORKING`  

---

## 1. The Worker Identity Model

KAAMSETU establishes a sovereign, portable professional identity for informal and skilled technical workers across India. The identity is built from verifiable, evidence-grounded facts rather than self-inflated marketing resumes or arbitrary certificates.

### Identity Components

1. **Unique Nationwide Registry ID:**
   - Format: `IN-{STATE_CODE}-2026-{RANDOM_4_DIGITS}-KS`
   - Examples: `IN-AS-2026-4821-KS` (Assam), `IN-RJ-2026-9042-KS` (Rajasthan), `IN-KA-2026-3118-KS` (Karnataka).
   - Collision-resistant, portable across states, and verified via public QR endpoint (`/verify/[registryId]`).

2. **Decoupled Verification Tiering:**
   - **Self-Declared Craft Testimony:** Clearly labeled with informational badges; no unearned "Government Certified" badges.
   - **Voice Attestation Proof:** Audio recording stored in secure cloud storage, providing non-repudiable voice evidence of trade mastery.
   - **Peer Endorsements:** Verified colleagues and master guild artisans vouching for on-site competency.
   - **Official State Linkages:** Aadhaar verification and DigiLocker NSQF trade diploma sync where available.

3. **Multi-Sector Trade Taxonomy:**
   Expanded in Phase 42 to 22 standardized occupations across 6 national sectors:
   - Construction & Trades (Masonry, Solar, Electrical, Joinery, Tile, Steel)
   - Automotive & Machinery (EV Diagnostics, Heavy Equipment, Diesel Powertrain)
   - Home & Personal Services (Appliance Tech, Industrial Cleaning, Healthcare Assistance)
   - Agriculture & Rural Work (Micro-Irrigation, Solar Pumps, Dairy Tech)
   - Transport & Logistics (Multi-Axle Container Haulage, Cold-Chain Inventory)
   - Digital & Professional Services (Solar CAD Drafting, Vernacular Outreach, Heritage Textiles)

---

## 2. Evidence-Driven KaamScore Engine

KaamScore provides an algorithmic trust score (range 300 to 900) computed from multi-dimensional operational evidence:

```typescript
const scoreResult = calculateKaamScore({
  hasVoiceAttestation: boolean,
  workerConfirmedVoice: boolean,
  yearsExperience: number,
  verifiedSkillsCount: number,
  completedBookingsCount: number,
  peerEndorsementsCount: number,
  officialGovVerified: boolean,
});
```

### KaamScore Tiers

| Score Range | Tier Title | Characteristics |
| :--- | :--- | :--- |
| **300 – 499** | Provisional Artisan | Unverified initial self-declaration, draft profile. |
| **500 – 699** | Certified Practitioner | Spoken voice attestation, verified tools, confirmed trade location. |
| **700 – 819** | Institutional Master | Peer endorsements, multi-year track record, safety compliance. |
| **820 – 900** | Sovereign Craftsman | Government linkage (DigiLocker/ASDM), flawless client dispute record. |

---

## 3. Worker Data Sovereignty & DPDP Compliance

In strict compliance with the Digital Personal Data Protection (DPDP) Act of India:
- Workers retain 100% ownership over their profile data.
- Personal phone numbers are masked (`+91 98XXXX3210`) in all public discovery views.
- Direct contact is mediated through sovereign messaging or authorized booking requests.
- Workers can unpublish, export, or permanently delete their profile with a single action.
