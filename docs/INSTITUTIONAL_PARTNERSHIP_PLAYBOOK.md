# KAAMSETU — INSTITUTIONAL PARTNERSHIP PLAYBOOK
## Government Missions, ITIs, Polytechnics & Skill Certification Platforms

---

## 1. Institutional Vision & Value Proposition

State skill development missions (such as the **Assam Skill Development Mission - ASDM**) and vocational training institutes (**ITIs, Polytechnics, and rural craft councils**) face three persistent systemic bottlenecks:

1. **Post-Training Traceability Deficit**: Millions of youth complete vocational courses, yet governments lose track of whether trainees secure informal employment, work in their certified trade, or migrate.
2. **Paper Certificate Inutility**: A paper NSQF certificate is easily lost, susceptible to forgery, and ignored by neighborhood households and informal contractors who demand physical demonstration or references.
3. **Absence of Cumulative Work Record**: Formal education awards a degree once; informal labor demands continuous, verified logging of completed work, customer ratings, and contractor endorsements.

**KAAMSETU bridges this gap**:
- Trainees graduate with a **living, portable, voice-first digital skill card** with embedded QR verification.
- Partner institutions receive **anonymized, aggregate outcome metrics** (employment rate, active trade utilization, average daily wages).
- Trainees' ongoing informal work history contributes back to verified evidence, creating a feedback loop for curriculum relevance.

---

## 2. Institutional Partner Classification & Lifecycle

### 2.1 Institution Types
- **State Skill Missions (`state_mission`)**: e.g., ASDM, NSDC State Chapters.
- **Industrial Training Institutes (`vocational_iti`)**: Government and private ITIs offering NSQF Level 3–5 certificates.
- **Polytechnic Colleges (`polytechnic`)**: Technical diploma-awarding institutions.
- **Trade NGOs & Councils (`ngo`)**: Artisanal development bodies (e.g. North East Cane and Bamboo Development Council - NECBDC, handloom clusters).
- **Industry & Builders Associations (`industry_association`)**: CREDAI, BAI (Builders Association of India) regional chapters.

### 2.2 Partnership Lifecycle Stages
Every institutional engagement is formally categorized into six verifiable stages. **Zero fake partnerships may ever be reported.**

1. `identified`: Target institution mapped in regional expansion plan.
2. `contacted`: Initial formal correspondence / introductory presentation delivered.
3. `in_discussion`: Active review of MOU terms, data exchange protocols, and pilot cohorts.
4. `pilot_proposal`: Structured cohort pilot agreed (e.g., 30 solar trainees at ITI Guwahati).
5. `agreement_signed`: Bilateral MOU executed with legal and DPDP consent terms.
6. `operational`: Active cohort onboarding, trainee credential issuance, and aggregate reporting live.

---

## 3. Worker Privacy, Consent Vault & DPDP Act Compliance

### 3.1 Digital Personal Data Protection (DPDP) Act 2023 Safeguards
Under Section 6 of the DPDP Act 2023, personal data processing requires explicit, informed, and revocable consent:

- **Strict Granular Consent (`consent_for_institution`)**:
  A worker's enrollment in an institutional cohort does NOT automatically grant the institution unrestricted access to their private phone number, home address, or personal bookings.
- **Institutional View Masking**:
  When `consent_for_institution = false`, institutional dashboards display:
  `"Private Trainee #TR-AS-XX (Consent Required under DPDP Act)"`. PII is strictly shielded.
- **Revocability**:
  Workers can toggle institutional data-sharing permissions at any time from their sovereign dashboard.
- **Right to Rectification (`profile_corrections`)**:
  Workers can formally dispute or correct any inaccurate institutional credential directly through the DPDP profile correction workflow.

---

## 4. DigiLocker & NeGD Integration Boundary Specification

### 4.1 Strict Fail-Closed Invariant
Official government verification via DigiLocker cannot be simulated or mocked in production.
- **Zero Points Awarded**: Unless an authentic OAuth token is exchanged with the production National e-Governance Division (NeGD) gateway and the resulting JSON-LD / PKI assertion is cryptographically verified against the government public key, **0 points** are added to KAAMSCORE.
- **Unverified State Transparency**: A profile with pending DigiLocker verification displays:
  `"DigiLocker Status: Pending Institutional Integration"` with zero artificial trust boosts.

### 4.2 OAuth 2.0 / OpenID Connect Specifications
- **Authorization Endpoint**: `https://api.digitallocker.gov.in/public/oauth2/1/authorize`
- **Token Endpoint**: `https://api.digitallocker.gov.in/public/oauth2/1/token`
- **PKCE Method**: `S256` (RFC 7636) with cryptographic state verification using HMAC-SHA256.
- **Data Minimization**: KAAMSETU requests only `openid` and verified Aadhaar masked digest. Raw 12-digit Aadhaar numbers are never requested, stored, or processed.

---

## 5. Standard Institutional MOU Template Structure

A standard KAAMSETU Institutional Partnership Agreement encompasses:
1. **Purpose**: Equipping outgoing vocational cohorts with portable digital identities.
2. **Data Sovereignty**: Explicit declaration that the trainee owns their digital identity.
3. **Security Standards**: AES-256 encryption at rest, TLS 1.3 in transit, and RFC 8785 canonical hashing.
4. **No Financial Extraction**: Free onboarding for all vocational students.
5. **Outcome Analytics**: Periodic aggregate reports delivered to the Director of Skill Missions.
