# KAAMSETU — PHASE 36.1 PRODUCT DEMO & TRUST AUDIT

**Programme:** KAAMSETU Digital Identity & Worker Empowerment Platform  
**Workstream:** Phase 36.1 — Trust Architecture, Demo Integrity & Truthful Disclosure  
**Operating Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Rollout Scope:** Guwahati Urban (Kamrup Metropolitan, Assam) & Shillong Urban (East Khasi Hills, Meghalaya)  
**Permanent Invariant:** `platform_commission_amount = 0.00` on artisan wages  
**Date:** 16 November 2026  

---

## 1. Executive Summary

Digital platforms that serve informal workers must be held to the highest standard of institutional truthfulness. In Phase 36.1, KAAMSETU underwent an independent audit of its trust surfaces, demo systems, and disclosure mechanisms to guarantee that:
1. No unearned or fabricated credentials appear on worker profiles.
2. Self-declared testimony is clearly and truthfully badged.
3. The demo persona switcher functions with full transparency.
4. The permanent zero-commission guarantee is strictly maintained across all code paths.
5. Regional rollout boundaries are enforced without ambiguous claims.

---

## 2. Worker Identity & Attestation Truthfulness

### 2.1 The Problem of "AI Verification" in Gig Platforms
Many contemporary gig economy applications use AI-based voice transcription and then label the output as "AI Verified" or "Government Approved", misleading customers and exposing workers to liability.

### 2.2 KAAMSETU's Tiered Trust Model
KAAMSETU enforces three distinct, unambiguous credential categories:

| Credential Type | Visual Badge | Data Source | Cryptographic Backing |
|---|---|---|---|
| **Self-Declared Testimony** | `variant="outline"` (Forest Green) | Worker voice recording & trade interview | Worker's Ed25519 public key signature |
| **Trade Suggestion** | `variant="outline"` (Warm Amber) | Algorithmic NCO 2015 trade code match | Explicit user edit & confirmation required |
| **Verified Work Record** | `variant="sovereign"` (Sand / Forest) | Completed booking with counterparty review | Client OTP confirmation + Immutable DB record |
| **Institutional Certification** | `variant="default"` (Emerald) | State ITI / Vocational Institute roster | Institutional authorized signatory key |

### 2.3 Elimination of Fake Confidence Percentages
All synthetic confidence percentages ("98.4% Confidence") were permanently excised from `src/components/onboarding/extraction-editor.tsx`. Workers are presented with their extracted trade title, NCO code, and daily rate in plain editable text fields with an explicit disclaimer:
> *"Suggested code based on testimony. Not a formal government certification or NSQF diploma."*

---

## 3. Demo Persona Switcher Architecture

To allow evaluators, state labor departments, and institutional auditors to inspect KAAMSETU without requiring live Aadhaar OTP authentication, the application provides an institutional demo persona switcher in `src/components/layout/institutional-header.tsx`.

### 3.1 Transparent Iconography
- Previous revision used a Lucide `Sparkles` icon, implying automated AI magic.
- Remediated in Phase 36.1 to a `UserCheck` icon, clearly indicating an institutional role simulator.

### 3.2 Available Demo Personas
1. **Rameshwar Sharma (Master Carpenter, Guwahati):** Demonstrates sovereign worker dashboard, voice attestation records, incoming job inquiries, and Ed25519 identity export.
2. **Kamrup Builders & Infra (Contractor Enterprise):** Demonstrates commercial crew management, GST invoice generation, and workforce subscription tiers with zero worker commission.
3. **Assam State Skill Mission (State Training Institute):** Demonstrates vocational cohort monitoring, granular trainee consent tracking, and credential issuance.
4. **Priya Das (Homeowner / Customer, Guwahati):** Demonstrates direct artisan discovery, booking requests, and OTP-confirmed review submission.

---

## 4. Constitutional Invariant: Zero Commission

The application enforces the permanent constitutional invariant across all financial, booking, and terms components:
```sql
ALTER TABLE bookings ADD CONSTRAINT chk_zero_platform_commission 
CHECK (platform_commission_amount = 0.00);
```

### 4.1 Proof of Zero Commission
- **Artisan Payouts:** 100% of the customer-agreed rate is disbursed directly to the worker.
- **Contractor Revenue Model:** Commercial contractors pay transparent flat software subscriptions (Starter, Pro, Business) for enterprise crew management software, completely decoupled from worker wages.
- **Customer Bookings:** Customers pay zero platform markup or service tax on artisan labor.

---

## 5. Controlled Rollout Boundaries

The application operates strictly under `CLASS_B_CONTROLLED_ROLLOUT` boundaries:
- **Authorized Urban Zones:** Guwahati Urban (PIN codes 781001–781039) and Shillong Urban (PIN codes 793001–793022).
- **Out-of-Bounds Handling:** Artisans from outside the pilot zones are permitted to create a non-dispatch profile for portfolio documentation, but are strictly barred from active commercial dispatch bookings until state launch gates are satisfied.
- **Zero Hallucinated Approvals:** Staging metrics are never represented as production clearances, and pending state MoUs are labeled truthfully as pending.
