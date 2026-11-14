# KAAMSETU — PHASE 13 CONTRACTOR OPPORTUNITY NETWORK
## Opportunity Scoping, Explainable 4-Vector Matching, Worker Privacy & Demographic Neutrality

**Protocol:** KAAMSETU National Sovereign Skill Identity Protocol  
**Repository:** `Mayyank04/kaamsetu`  
**Branch:** `phase-13-national-operations-scale`  
**Date:** November 15, 2026  
**Auditor / Author:** Matching Algorithm Lead & Labor Marketplace Strategist  

---

### 1. The Opportunity Network Architecture

The KAAMSETU Contractor Opportunity Network enables licensed contractors and commercial builders to publish demand for skilled trade labor across district and state boundaries while safeguarding worker privacy, guaranteeing wage transparency, and preventing algorithmic bias.

```
[ CONTRACTOR PUBLISHES PROJECT ]
  ├── Verified Organization Check (GSTIN & License)
  ├── Explicit Wage Range (Min ₹800/day, Prevailing Floor)
  └── Required Trades, Skills, Equipment & Location
           │
           v
[ EXPLAINABLE MATCHING ENGINE V2 ]
  ├── 4-Vector Deterministic Scoring (Max 100)
  │     ├── Vector 1: Trade Alignment (40%)
  │     ├── Vector 2: Skill Overlap (30%)
  │     ├── Vector 3: Location / Travel (15%)
  │     └── Vector 4: KaamScore & Experience (15%)
  ├── Demographic Neutrality Enforcement (Strict Feature Exclusion)
  └── New-Worker Exploration Multiplier (Zero-Review Invariant)
           │
           v
[ CANDIDATE DISCOVERY INTERFACE ]
  ├── Verified Skill Dossier & KaamScore Displayed
  ├── Worker Contact Phone STRICTLY MASKED (+91-XXXXX-XXXXX)
  └── Direct Engagement Request Sent to Worker
           │
           v
[ WORKER SOVEREIGN CONSENT ]
  ├── Worker Reviews Contractor Terms & Wages
  ├── Affirmative Acceptance Unlocks Phone & Direct Contact
  └── Rejection Preserves Complete Anonymity
```

---

### 2. Explainable 4-Vector Matching Engine (`src/lib/opportunity/matching-engine-v2.ts`)

Matching is computed deterministically with zero black-box heuristics. Every match result returns an itemized point breakdown and clear human-readable explanations:

$$\text{Total Score} = S_{\text{trade}} + S_{\text{skill}} + S_{\text{location}} + S_{\text{kaamscore}}$$

#### Vector 1: Trade Alignment (40 Points Max)
- Exact Trade Match: **40 points**.
- Related / Adjacent Trade: **20 points**.
- Non-matching Trade: **0 points**.

#### Vector 2: Technical Skill Overlap (30 Points Max)
$$\text{Skill Points} = \left( \frac{\text{Matching Required Skills}}{\text{Total Required Skills}} \right) \times 30$$
- If an opportunity requires 3 skills and the worker possesses 2, the skill score is $(2/3) \times 30 = 20.0$ points.

#### Vector 3: Geographic Proximity & Travel Willingness (15 Points Max)
- Same District: **15 points**.
- Adjacent District + Worker Travel Willingness $\in \{\text{'adjacent\_districts'}, \text{'statewide'}, \text{'national'}\}$: **10 points**.
- Interstate + Worker Travel Willingness $\in \{\text{'statewide'}, \text{'national'}\}$: **8 points**.
- Beyond travel willingness: **0 points** (hard block on cross-district recommendation).

#### Vector 4: KaamScore Viability & Reliability (15 Points Max)
$$\text{Score Points} = \min\left(15, \frac{\text{KaamScore} - 300}{500} \times 15\right)$$
- An 800+ KaamScore worker achieves the full 15 points.
- **New-Worker Fairness Invariant**: A new worker with 0 reviews is assigned a default baseline viability of **10.0 points** rather than 0, guaranteeing that newly onboarded workers appear in candidate discovery lists and are not trapped in a cold-start starvation loop.

Verified in Phase 13 Test 14.

---

### 3. Protected Demographic Neutrality Guarantee

India's informal labor markets are historically vulnerable to discrimination based on religion, caste, gender, dialect, and socioeconomic markers. KAAMSETU enforces an uncompromising mathematical neutrality guarantee:

1. **Feature Exclusion**: The matching engine input interface strictly rejects protected attributes. Demographic fields (`gender`, `religion`, `caste`, `community`, `dialect`, `phoneBrand`, `deviceType`) do not exist in the candidate matching schema.
2. **Mathematical Parity Verification**: In Phase 13 Test 15, two candidate profiles with identical trades and skills but differing demographic metadata were evaluated against the identical opportunity:
   - Worker Profile A: Score = 98.0 / 100
   - Worker Profile B: Score = 98.0 / 100
   - Mathematical Parity: **100.0%**. Zero variance detected.

---

### 4. Worker Contact Disclosure Protection

To prevent aggressive contractor poaching, harassment, or off-platform intimidation, candidate phone numbers are strictly protected:
- On contractor candidate discovery screens, phone numbers are formatted via `maskPhone`: `+91-XXXXX-XXXXX`.
- The contractor cannot see the worker's real phone number until the worker affirmatively accepts the project invitation.
- Once accepted, the contact details are decrypted and made visible to the specific contractor organization exclusively.

Verified in Phase 13 Test 13.
