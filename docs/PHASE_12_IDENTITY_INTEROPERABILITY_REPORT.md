# KAAMSETU — PHASE 12 IDENTITY INTEROPERABILITY REPORT
## Open Interoperability Architecture, NCO-2015 Mapping, NSQF Alignment & National Integration

**Protocol:** KAAMSETU National Sovereign Identity Protocol  
**Scope:** Open Standards, Government Database Compatibility & External Interoperability  
**Date:** November 15, 2026  

---

### 1. Executive Summary & Non-Lock-In Principle

A sovereign worker identity protocol must never become a "walled garden." If a craftsperson builds their verified profile, portfolio, and work history on KAAMSETU, they must have the unencumbered right to export, verify, and present that identity to any external platform, state skilling portal, or employer across India.

KAAMSETU establishes three pillars of open interoperability:
1. **NCO-2015 National Classification of Occupations Mapping:** Every verified trade is mapped to its official 8-digit Directorate General of Employment (DGE) occupation code.
2. **NSQF (National Skills Qualification Framework) Levels 1–8:** Micro-credentials issued by accredited ITIs and state missions map directly to the Government of India's NSQF hierarchy.
3. **Open Machine-Readable Schema (REST + JSON-LD):** Public verification endpoints allow authorized third-party systems to verify digital credentials via open cryptographic standards without proprietary SDK lock-in.

---

### 2. National Classification & Trade Mapping Matrix

Informal trade names used across Indian dialects are standardized into national taxonomy codes while preserving local terminology in the worker's voice profile:

| Worker Vernacular Term | Dialect / State | KAAMSETU Standard Trade | NCO-2015 Code | NSQF Level Alignment |
|---|---|---|---|---|
| *ৱায়াৰিং মিস্ত্ৰী (Wiring Mistri)* | Assamese (Assam) | Industrial Electrician & Solar Grid Specialist | `7411.0100` | Level 4 |
| *নল আৰু প্লাম্বাৰ (Nol Mistri)* | Assamese (Assam) | Master Sanitary Engineer & High-Pressure Piping Specialist | `7126.0100` | Level 4 |
| *Nong-thung Buit (House Builder)* | Khasi (Meghalaya) | Structural Mason & Reinforced Concrete Specialist | `7112.0100` | Level 3 |
| *প্লাম্বার ও পাইপফিটার (Plumber)* | Bengali (Tripura / Bengal) | Commercial Piping & Sanitary Technician | `7126.0200` | Level 4 |
| *काठ मिस्त्री (Wood Mistri)* | Hindi (National) | Architectural Woodwork & Joinery Specialist | `7115.0100` | Level 4 |
| *তাঁত শিল্পী (Taant Weaver)* | Assamese / Bengali | Master Handloom Weaver & Zardozi Artisan | `7318.0100` | Level 5 |
| *गाड़ी मैकेनिक (Fleet Mechanic)* | Hindi / Nagamese | Heavy Fleet Diesel & EV Retrofitting Specialist | `7231.0100` | Level 5 |

---

### 3. DigiLocker, e-Shram & Skill India Digital Integration Status

KAAMSETU maintains complete transparency regarding the state of official integrations:

| Platform / Agency | Technical Interface | Governance Status | Real-World Capability | Fail-Closed Policy |
|---|---|---|---|---|
| **DigiLocker (NeGD)** | OAuth 2.0 / Pull API | Institutional Agreement in Discussion | Readiness verified via mock/sandbox; live verification withheld until formal agreement signed. | If live agreement is unverified, UI states "DigiLocker verification pending institutional MoU" rather than simulating state badges. |
| **e-Shram (Ministry of Labour)** | UAN Hash Verification | Architectural Design Complete | 12-digit UAN can be attested by worker; cryptographic verification requires Ministry gateway access. | Never claims government verification for self-attested UAN numbers. |
| **Skill India Digital (NSDC)** | Verifiable Credentials / QR | Schema Aligned to NSQF 2.0 | Credentials follow NSQF nomenclature and canonical HMAC signatures. | Third-party verification supported via open REST endpoints. |

---

### 4. Machine-Readable Export & Third-Party Verification Workflow

External employers and institutional auditors verify KAAMSETU worker credentials via three public mechanisms:

1. **Visual Physical Badge Scan:** Scanning the worker's QR badge navigates directly to `https://kaamsetu.in/verify/<registryId>`, rendering a lightweight, low-bandwidth verification card with zero tracking scripts.
2. **Public REST Verification API:**
   ```http
   GET /api/v1/interop/worker/<grant_access_token>
   Accept: application/json
   ```
   Returns the JCS-canonicalized Schema 2.1 dossier with cryptographic proof signature.
3. **Offline Public Key Verification:** Air-gapped verification terminals can verify QR payload authenticity using KAAMSETU's published public HMAC verification keys without transmitting network packets.

**Conclusion:** KAAMSETU delivers genuine, standards-compliant interoperability that aligns with India's national skilling architecture while firmly protecting worker self-sovereignty.
