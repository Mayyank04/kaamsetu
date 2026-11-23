# KAAMSETU — PHASE 50: DEPLOYMENT READINESS & OPERATIONAL CHECKLIST

**Project:** KAAMSETU — India's Skill Identity and Workforce Platform  
**Target Branch:** `phase-50-production-hardening`  
**Production Domain:** `https://kaamsetu-neon.vercel.app`  
**Operating Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Date:** November 23, 2026  
**Auditor:** DevOps Lead & Release Reliability Engineer  

---

## 1. Operational Readiness Inventory

### 1.1 Environment Variables Matrix

| Environment Variable | Required in Production | Status | Purpose & Fail-Closed Behavior |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | **YES** | Configured | Supabase endpoint for database and realtime |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`| **YES** | Configured | Client-side anonymous authentication and querying |
| `SUPABASE_SERVICE_ROLE_KEY` | **YES** | Configured | Privileged backend admin client (strictly server-side) |
| `RATE_LIMIT_HMAC_SECRET` | **YES** | Configured | Cryptographic HMAC-SHA256 signing of session tokens |
| `RATE_LIMIT_HMAC_SECRET_PREVIOUS`| Optional | Configured | Zero-downtime key rotation backward verification |
| `AUTH_VERIFICATION_MODE` | **YES** | Configured (`sandbox` in dev, `sms` in live prod) | Controls whether OTP uses sandbox or telecom gateway |
| `GEMINI_API_KEY` | **YES** | Configured | Live neural translation and skill extraction (`gemini-3.5-flash-lite`) |
| `TWILIO_ACCOUNT_SID` | Optional (Prod Live SMS)| Not Configured | Required if `AUTH_VERIFICATION_MODE=sms`. If absent, returns 503 SMS_GATEWAY_UNAVAILABLE |
| `TWILIO_AUTH_TOKEN` | Optional (Prod Live SMS)| Not Configured | Twilio authentication token |
| `TWILIO_PHONE_NUMBER` | Optional (Prod Live SMS)| Not Configured | Twilio sender phone number |
| `AZURE_TRANSLATOR_KEY` | Optional | Not Configured | Fallback cloud translator; cascades to deterministic if absent |
| `GOOGLE_TRANSLATE_API_KEY` | Optional | Not Configured | Fallback cloud translator; cascades to deterministic if absent |
| `BHASHINI_API_KEY` | Optional | Not Configured | Government of India open model translator; cascades if absent |

---

## 2. Database Migration Status

### Migration: `20261123000001_phase48_app_role_vendor_and_otp_schema.sql`
- **Location:** `supabase/migrations/20261123000001_phase48_app_role_vendor_and_otp_schema.sql`
- **Purpose:** Adds `'vendor'` to PostgreSQL enum `app_role` and creates the `public.otp_challenges` table with indices.
- **Current Execution Status:** Stored in source code repository; queued for execution by Database Administrator via Supabase SQL editor.
- **Application Compatibility:** The application contains backward-compatible role translation. If the remote database enum lacks `'vendor'`, user registration stores `role = 'worker'` in `raw_user_meta_data` while setting `actual_role = 'vendor'` and creating application sessions with `role = 'vendor'`.
- **Pre-Release Action for DBA:**
  Execute `supabase/migrations/20261123000001_phase48_app_role_vendor_and_otp_schema.sql` in the Supabase management console to eliminate the enum fallback shim.

---

## 3. Geographic Boundary & Dispatch Gates

### Authorized Rollout Locations (Class B Controlled Rollout)
Commercial booking dispatch and on-demand customer transactions are strictly restricted to:
1. **Guwahati Urban (Kamrup Metropolitan, Assam):** PIN 781001 – 781039
2. **Shillong Urban (East Khasi Hills, Meghalaya):** PIN 793001 – 793022

### Nationwide Support (All 28 States & 8 Union Territories)
The following capabilities are globally authorized across India:
- Account creation and authentication for all 5 roles (`worker`, `vendor`, `contractor`, `customer`, `institution`).
- Self-sovereign skill profile management and credential minting.
- Public credential verification via QR code and registry ID (`/verify/[registryId]`).
- Multilingual translation across 39 Indian languages and dialects.
- Voice-assisted profile generation and discovery.

---

## 4. Telemetry, Monitoring & Circuit Breakers

1. **Authentication Rate Limiting:**
   - IP-level sliding window: Max 10 requests / 15 minutes.
   - Mobile number challenge limit: Max 5 attempts before 1-hour exponential lockout.
   - Fail-closed behavior on Redis/database unavailability.
2. **Open Redirect Defense:**
   - Multi-level percent-decoding filter blocks single/double-encoded attacks (`/%2fevil.com`, `/%252f%252fevil.com`).
   - Rejects internal `/api/` endpoints as redirection destinations.
3. **Translation Resilience:**
   - Circuit breaker on Gemini requests (8-second timeout, progressive candidate fallback).
   - Instant failover to deterministic trade corpus if cloud APIs return 503 or 429.
   - Cryptographic cache isolation ensuring private messages (`isPrivate: true`) are never cached.

---

## 5. Deployment Step-by-Step Instructions

1. **Database Schema Update:**
   Run `supabase/migrations/20261123000001_phase48_app_role_vendor_and_otp_schema.sql` in Supabase SQL editor.
2. **Vercel Production Deployment:**
   - Push branch `phase-50-production-hardening` to remote repository `Mayyank04/kaamsetu`.
   - Merge into `main` after standard staging verification.
   - Trigger production deployment on Vercel.
3. **Post-Deployment Smoke Test:**
   - Verify `/api/auth/health` returns HTTP 200 with all subsystems reported truthfully.
   - Execute test booking in Guwahati (PIN 781001) ensuring commission is 0.00.
   - Execute test booking outside Class B (PIN 110001) ensuring HTTP 403 rejection.
