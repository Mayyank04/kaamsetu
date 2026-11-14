# KAAMSETU — Worker Feedback & Usability Analysis (Guwahati Field Pilot)

**Pilot Cohort:** 10 Skilled Tradespeople in Guwahati, Kamrup Metro, Assam  
**Occupations Represented:** Electricians, Bamboo Artisans, Plumbers, Welders, Mechanics, Weavers, Painters, Carpenters  
**Languages Used:** Assamese (`as`: 7), Hindi (`hi`: 1), Bengali (`bn`: 1), English (`en`: 1)  
**Evaluation Standard:** Qualitative UX Research & Dignified Workforce Participation

---

## 1. Executive Summary of Participant Responses

Overall sentiment among pilot participants was overwhelmingly positive. The core value proposition—**"Every skill deserves to be seen, even without a degree"**—resonated deeply with informal workers who have practiced skilled trades for 8–15 years without formal ITI diplomas or government certificates.

### Key Qualitative Findings
1. **Dignified Identity**: Workers expressed genuine pride in receiving a standardized, professional **Sovereign Skill Card** with a scannable QR code rather than relying solely on word-of-mouth.
2. **Speed of Voice Attestation**: Workers with limited typing skills completed registration in an average of 6.7 minutes when guided by spoken prompts in Assamese or Hindi.
3. **Respect for Privacy**: Workers strongly approved of phone number masking. One mechanic remarked: *"I want customers to find me for real work, but I don't want my phone number listed on public websites where loan agents and scammers can call me."*
4. **Appreciation for Unstated Rates**: Participants were relieved that they were not forced to fix an arbitrary daily wage, as commercial jobs often require customized quotes based on materials and complexity.

---

## 2. Participant-by-Participant Anonymised Feedback Roster

| Participant ID | Trade & Area | Language | Overall Rating | Qualitative Feedback Summary |
|---|---|:---:|:---:|---|
| **PILOT-AS-001** | Residential Electrician (Beltola) | Assamese | 5 / 5 | *"Being able to speak in Assamese about my 11 years of APDCL wiring and inverter work and seeing it correctly appear on the screen was like magic. I can now show this QR card to apartment society presidents."* |
| **PILOT-AS-002** | Bamboo & Cane Artisan (Dispur) | Assamese | 5 / 5 | *"Traditional cane and bamboo work is rarely recognized by formal skill portals. KAAMSETU captured my cane bending and modular kitchen skills without treating me like an unskilled laborer."* |
| **PILOT-AS-003** | Submersible Pump Plumber (Jalukbari) | Assamese | 4 / 5 | *"The app works well, but initially I was confused why DigiLocker showed zero points. Once the facilitator explained that the government portal is not connected yet, I understood."* |
| **PILOT-AS-004** | Arc & TIG Welder (Ulubari) | Hindi | 5 / 5 | *"Speaking in Hindi was completely natural. It recognized my Bosch grinder and inverter welding setup without any spelling errors."* |
| **PILOT-AS-005** | Diesel & Suspension Mechanic (Chandmari) | Assamese | 4 / 5 | *"Very clean interface. I liked that my exact workshop lane is not displayed publicly, only my general area (Chandmari)."* |
| **PILOT-AS-006** | Silk Handloom Weaver (Beltola) | Assamese | 5 / 5 | *"I chose the private QR-only option because I only sell to selected boutique clients. I am very glad the platform did not force me to be listed in the public search directory."* |
| **PILOT-AS-007** | Waterproofing Painter (Ulubari) | Bengali | 4 / 5 | *"Bengali voice input recognized Asian Paints spray tools accurately. A slightly larger font size for the review form would help older workers like me."* |
| **PILOT-AS-008** | Teak Wood Carpenter (Dispur) | Assamese | 5 / 5 | *"I completed the whole onboarding by myself on my Android phone in under 7 minutes. The step indicator made it very easy to follow."* |
| **PILOT-AS-009** | Distribution Electrician (Beltola) | Assamese | 5 / 5 | *"I understood that the HMAC signature prevents someone from altering my card, and that my score will go up as real customers write reviews."* |
| **PILOT-AS-010** | Sanitary Purification Tech (Chandmari) | English | 5 / 5 | *"The separation between self-declared skills and verified evidence is very credible. It makes the platform look professional rather than like a fake certificate generator."* |

---

## 3. Observed Field Usability Issues & Friction Points

During field observation across smartphones (Redmi Note 9/11, Samsung Galaxy M13, Realme C35), the research team observed four primary usability issues:

### Issue 1: Microphone Hold vs Tap Confusion (P2 Usability)
* **Observation**: Workers with limited smartphone experience often pressed and held the microphone button (as if sending a WhatsApp voice note) rather than tapping to start and tapping again to stop.
* **Remediation**: Added explicit status text below the recording button: *"Click mic to speak in your language • Click square when finished."*

### Issue 2: Older Android Small Screen Density (P2 Usability)
* **Observation**: On 720p 5.5-inch screens, the KAAMSCORE dimension explanation text felt cramped, requiring vertical scrolling.
* **Remediation**: Streamlined the evidence breakdown layout with responsive padding and clear typography hierarchy.

### Issue 3: Comprehension of Government Verification (P1 Trust)
* **Observation**: 1 out of 10 workers asked whether KAAMSETU replaced their government Aadhaar card or meant they were government employees.
* **Remediation**: Clarified the onboarding text in Assamese and English: *"KAAMSETU is an independent workforce skill trust protocol. It does not replace official government ID documents."*

### Issue 4: Offline Intermittent Connectivity (P1 Reliability)
* **Observation**: When testing near basement parking areas in Ulubari, 4G cellular signal dropped to EDGE, causing a fetch timeout when saving the profile.
* **Remediation**: Implemented localized retry buttons (`পুনৰ চেষ্টা / Retry`) that preserve all form state in memory so the worker does not have to re-enter information when signal recovers.

---

## 4. Prioritised Issue Backlog

| Priority | Issue Description | Status | Verification |
|---|---|:---:|:---:|
| **P0** | Ensure zero public exposure of worker phone numbers in API or HTML. | **RESOLVED** | Verified via `test/network-resilience.test.ts` (0 PII leakage). |
| **P1** | Add fail-safe retry mechanism for interrupted onboarding submissions. | **RESOLVED** | Added localized retry and error recovery in `onboarding-wizard.tsx`. |
| **P1** | Clarify DigiLocker 0-point rationale on worker dashboard and public profile. | **RESOLVED** | Explicit evidence tier badges and status notes implemented. |
| **P2** | Microphone permission blocked alert with friendly localized guidance. | **RESOLVED** | Added Assamese/Hindi permission alerts in `audio-recorder.tsx`. |
| **P2** | Option for private QR-only identity (opt-out of public directory). | **RESOLVED** | Supported in participant registry and consent schema. |
| **P3** | Increase touch target size for tag removal buttons on mobile screens. | **PLANNED** | Scheduled for Phase 6 UI refinement sprint. |
