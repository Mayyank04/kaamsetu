# KAAMSETU — PHASE 17 WORKER ACCESSIBILITY & ASSISTED SERVICE
## Preserving The Zero-Degree & Zero-Smartphone Invariant at National Scale

---

## 1. The Core Invariant
> **"Every skill deserves to be seen, even without a degree."**

As KAAMSETU scales into national protocols, enterprise ERPs, and financial platforms, **the platform must never become an exclusive tool for tech-literate, smartphone-owning elites**. Over 65% of India's skilled tradespersons (carpenters, masons, bar benders, welders) do not own a personal smartphone, read English, or possess a formal school certificate.

---

## 2. Assisted Service Infrastructure Architecture

```mermaid
flowchart TD
    Worker["Tradesperson (No Smartphone / Degree)"] --> Kiosk["Physical Assisted Kiosk (Tehsil / Chawk Hub)"]
    Kiosk --> Coord["Vetted Field Coordinator (Equipped with Tablet & QR Scanner)"]
    
    subgraph Assisted Onboarding Flow
        Coord --> Voice["1. Multilingual Audio Prompt (Assamese/Bengali/Khasi/Hindi)"]
        Voice --> Extract["2. AI Voice Skill Extraction (Zero-Invention Invariant)"]
        Extract --> AudioVerify["3. Worker Speaks Confirmation Phrase (Audit Recorded)"]
        AudioVerify --> PrintCard["4. Physical Plastic Encrypted QR Identity Card Issued"]
    end
    
    subgraph Security Guardrails
        PrintCard --> KioskLock["Kiosk Operator CANNOT Take Ownership of Worker Account"]
        PrintCard --> AutoFlush["Auto-Timeout (5 min idle) & In-Memory Credential Flush"]
    end
    
    style PrintCard fill:#15803d,stroke:#166534,stroke-width:2px,color:#fff
    style KioskLock fill:#b91c1c,stroke:#991b1b,stroke-width:2px,color:#fff
```

---

## 3. Five Pillar Invariants for Assisted Service

1. **Physical Encrypted QR Cards**: Workers carry a durable, offline-scannable card with an HMAC-SHA256 encrypted QR code containing their verified NSQF competencies and trade credentials.
2. **Kiosk Account Hijacking Defense**: Field coordinators are granted strictly scoped session tokens. A coordinator **cannot** change a worker's payout bank account or transfer account ownership (Test 77).
3. **Session Auto-Flush**: Kiosk tablets automatically wipe cached credentials and local storage after 5 minutes of inactivity (Test 78).
4. **Mandatory Worker Audio Confirmation**: Before any profile is activated, the worker's own spoken confirmation is recorded and hashed into `voice_extraction_audits` (Test 79).
5. **No WhatsApp Gatekeeping**: While WhatsApp notifications are supported for workers who choose it, WhatsApp or smartphone ownership is NEVER mandatory. Standard SMS and voice IVR calls remain primary notification channels.

---

## 4. Test Verification
Verified in `test/phase-17-national-ecosystem.test.ts` (Tests 77–79).
