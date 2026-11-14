# KAAMSETU — Known Limitations & Architectural Boundary Disclosures

**Application:** KAAMSETU Digital Skill Identity Platform  
**Document Purpose:** Transparent Engineering & Pilot Operational Disclosure  
**Status:** Active Controlled Pilot Architecture  
**Principle:** Radical honesty regarding technical boundaries and non-simulated claims.

---

## 1. DigiLocker Government Verification Status

### Current Architecture
- In the KAAMSCORE calculation engine (`src/lib/scoring/kaamscore.ts`), the dimension `official_government_verified` (DigiLocker) awards **0 points** by default.
- The platform strictly enforces: **No simulated points are granted for unverified government credentials.**
- On public profiles, the badge `DIGILOCKER LINKED` is displayed only if a cryptographically verified token has been anchored.

### Real-World Production Dependency
- Production integration with DigiLocker requires an institutional partner agreement with the National e-Governance Division (NeGD) / Ministry of Electronics and Information Technology (MeitY), Government of India.
- Until production OAuth credentials and PKI certificates are provisioned by NeGD, workers can complete voice attestation, peer confirmation, and customer ledger verification, but official government verification remains unlinked.

---

## 2. SMS Gateway Delivery & India DLT Compliance

### Current Behavior
- In local development and automated integration testing, the OTP subsystem operates via deterministic sandbox phone numbers and structured console logging.
- In production mode (`NODE_ENV=production`), the application strictly **fails closed**: OTPs cannot be generated or verified without a connected PostgreSQL database and configured SMS gateway (`TWILIO` or `MSG91`).

### Production Prerequisite
- Direct commercial deployment across India requires an active DLT (Distributed Ledger Technology) registration with Indian telecom operators (Jio / Airtel / Vi) under TRAI regulations.
- Without DLT approval for the SMS header and message templates, telecommunications carriers in India will drop OTP SMS delivery.

---

## 3. Indic Voice Streaming on Low-Bandwidth Networks (2G/3G)

### Current Behavior
- Voice attestation uses the browser MediaRecorder API to capture spoken audio and stream chunks to the backend Gemini AI extraction pipeline.
- Audio recorded at high bitrates (e.g. 128 kbps stereo) can experience upload latency on unstable rural 2G/EDGE cellular connections in remote parts of Assam.

### Mitigation & Pilot Recommendation
- A **Text-Based Attestation** alternative mode is provided in the onboarding wizard for low-bandwidth scenarios or noisy workshop environments.
- Workers can speak directly to a field facilitator equipped with a 4G/5G mobile hotspot.

---

## 4. Rate Limiting in Offline / Development Mode

### Current Behavior
- In production, rate limiting is strictly backed by atomic PostgreSQL RPCs (`check_and_increment_rate_limit`) with persistent lockouts and SHA-256 HMAC privacy hashing.
- Fallback to in-memory rate limiting is strictly prohibited in production. If the database connection is lost in production, the system fails closed (rejects incoming sensitive requests) rather than allowing an invisible rate-limit bypass.
- In development, an in-memory store is permitted **only** when the environment variable `ENABLE_IN_MEMORY_RATE_LIMIT_MOCK=true` is explicitly set.

---

## 5. Geographic Pilot Scope (Guwahati / Kamrup Metro)

### Pilot Focus Area
- The active pilot dataset and localization optimizations are tailored for Guwahati and Kamrup Metropolitan District, Assam.
- Key local crafts modeled:
  - APDCL-compliant residential and commercial electricians.
  - Master bamboo and cane joinery artisans.
  - Submersible borewell and hydro-infrastructure plumbers.
- Expansion to other Northeastern states (Meghalaya, Nagaland, Arunachal Pradesh) and pan-India regions will require region-specific NCO craft mappings and vernacular speech calibration.
