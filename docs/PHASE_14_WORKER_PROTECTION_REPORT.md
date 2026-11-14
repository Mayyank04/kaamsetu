# KAAMSETU PHASE 14: WORKER PROTECTION REPORT
## Constitutional Protections, Anti-Exploitation Guardrails & Identity Defense Mechanisms

**Version:** 1.0.0  
**Phase:** 14 — Operational Proof, Trust Governance & Regional Sustainability  
**Author:** Worker Rights Advocate & Application Security Architect  
**Legal Framework:** Minimum Wages Act, 1948; Inter-State Migrant Workmen Act, 1979  
**Classification:** B. NATIONAL EXPANSION READY — CONTROLLED ROLLOUT  

---

## 1. The Worker Protection Mandate

In India's informal construction and service economy, daily wage workers face structural precarity:
- Predatory middleman contractors extracting 20% to 40% commissions from daily wages.
- Arbitrary wage deductions and delayed payments.
- Zero occupational safety protections or insurance coverage.
- Risk of digital identity theft or SIM-swap account takeover.

KAAMSETU was established on an uncompromising social contract:
> *"Every skill deserves to be seen, even without a degree."*

Phase 14 solidifies this promise through five structural protection pillars:
1. **Constitutional Zero-Commission Wage Architecture**
2. **Statutory Minimum Wage Transparency & Floor Enforcement**
3. **Defense Against SIM-Swap Identity Hijacking**
4. **Physical QR Card Access Without Smartphone Dependence**
5. **Worker Sovereignty Over Data Portability**

---

## 2. Constitutional Zero-Commission Enforcement

Unlike commercial gig platforms that charge 15%–30% platform take-rates on worker earnings, KAAMSETU guarantees **0.00% commission on worker wages forever**.
Revenue is generated solely through SaaS subscriptions paid by commercial contractors and institutional enterprise accounts.

### Database Constraint Implementation
This policy is enforced not merely in marketing copy, but at the relational database schema layer via PostgreSQL check constraint in `public.payment_records_ledger`:

```sql
ALTER TABLE public.payment_records_ledger
ADD CONSTRAINT payment_records_ledger_platform_commission_amount_check
CHECK (platform_commission_amount = 0.00);
```

### Tamper-Resistance Proof:
Any backend service, API route, or administrative script that attempts to record a commission deduction fails with PostgreSQL error code `23514` (`check_violation`).

Tested and verified in Phase 14 Test Suite (`Test 26: Constitutional 0% Worker Commission Enforcement`).

---

## 3. Statutory Minimum Wage Floor Enforcement

In accordance with the Minimum Wages Act, 1948 and official notifications from the Government of Assam Labor Department, all opportunities posted on KAAMSETU must meet or exceed state minimum wage rates for skilled and semi-skilled occupations:

| Occupation Trade | Classification | Assam State Minimum Daily Wage (Floor) | KAAMSETU Platform Average Daily Wage | Worker Wage Protection Margin |
|:---|:---|:---:|:---:|:---:|
| Electrician & Solar Installer | Skilled | ₹580.00 | ₹950.00 | +63.8% above floor |
| Plumber & Sanitary Technician | Skilled | ₹580.00 | ₹850.00 | +46.5% above floor |
| Mason & Concrete Specialist | Skilled | ₹580.00 | ₹900.00 | +55.2% above floor |
| Finish Carpenter | Skilled | ₹580.00 | ₹1,000.00 | +72.4% above floor |
| Assistant Helper / Laborer | Semi-Skilled | ₹450.00 | ₹600.00 | +33.3% above floor |

### Automated Job Post Gatekeeper:
If an employer attempts to post an opportunity with a daily wage below the statutory floor for the region and trade, the posting is rejected at the API layer with HTTP 422 Unprocessable Entity.

---

## 4. Defense Against SIM-Swap & Identity Hijacking

Informal workers frequently change SIM cards, lose physical phones, or fall victim to unauthorized SIM swaps. In conventional systems, automated SMS-based password resets allow malicious actors to hijack the worker's reputation, digital wallet, and work history.

### The KAAMSETU Account Recovery Protocol:
1. **No Instant SMS Handover on High-Risk Flags:**
   If a password reset or phone change is requested from a new device fingerprint or IP location, automated SMS OTP recovery is immediately blocked.
2. **Field Verification Queue:**
   The account is placed into a temporary recovery hold. The request routes to the local regional coordinator in Guwahati or Shillong.
3. **Physical / Voice Verification:**
   The worker verifies their identity in person at a partnered ASDM training center or via an authenticated video/voice verification call confirming their registered mother tongue and past project locations.
4. **Audit Trail:**
   All recovery authorizations require signed approval by the regional administrator.

Verified in Phase 14 Test Suite (`Test 8: Account Recovery Security Against SIM-Swap Identity Hijacking`).

---

## 5. Free Digital Identity & Physical QR Card Guarantee

A major barrier to digital equity is the assumption that every worker owns an expensive smartphone with an active 4G data pack.

KAAMSETU guarantees:
- **Zero Smartphone Barrier:** Workers without smartphones can be onboarded via assisted voice enrollment at field camps.
- **Durable Physical QR Card:** Every worker receives a physical laminated QR card free of charge, funded by institutional partnership budgets.
- **Offline Scannability:** Any contractor, municipal engineer, or client can scan the QR card using standard camera apps to inspect the worker's verified skills, NSQF certifications, and police clearance status without requiring the worker to unlock a phone or consume cellular data.

---

## 6. Worker Data Portability & Independence

Under DPDP Act Section 12, workers have the legal right to data portability.
Workers can export their full professional dossier at any time:
- Export format: RFC 8785 Canonical JSON archive + printable PDF.
- Cryptographic SHA-256 hash anchoring ensuring third-party verifiability outside KAAMSETU.
- Zero exit fees or administrative penalties.
