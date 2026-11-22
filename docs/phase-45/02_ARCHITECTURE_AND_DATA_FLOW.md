# KAAMSETU — PHASE 45 AUDIT DOSSIER 02
# ARCHITECTURE AND DATA FLOW SPECIFICATION

**Operating Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Architectural Paradigm:** Decoupled Multi-Tier Sovereign Identity & Resilient Data Access  
**Status:** `VERIFIED WORKING`

---

## 1. Architectural Tiers & Separation of Concerns

KAAMSETU enforces strict boundaries between presentation, application business logic, cryptographic signing, and persistence layers:

```text
+----------------------------------------------------------------------------------------------------+
|                                      PRESENTATION TIER (Next.js 15 App Router)                     |
|                                                                                                    |
|  [ Homepage / ]    [ Discovery /explore ]   [ 12-Step Wizard ]   [ Voice Intake ]   [ Dashboards ]  |
|  - Plain language   - 18 Indian Languages    - Step-by-step low    - Native speech    - Worker/Vendor|
|  - Zero AI-slop     - RTL (Urdu/Kashmiri)     cognitive load        recognition        Contractor    |
+--------------------------------------------------+-------------------------------------------------+
                                                   | Type-Safe Contracts & Schemas
                                                   v
+----------------------------------------------------------------------------------------------------+
|                                    APPLICATION BUSINESS SERVICE LAYER                              |
|                                                                                                    |
|  [ OnboardingService ]  [ BookingService ]  [ GeographicAuthorizationService ]  [ CredentialService ]
|  - Schema resilience    - Invariant checks  - Decoupled pilot dispatch matrix   - Ed25519 signing    |
|  - Draft autosave       - Status lifecycle  - 36 States/UTs, 700+ districts     - W3C VC payload     |
+--------------------------------------------------+-------------------------------------------------+
                                                   | Secure Authenticated Client
                                                   v
+----------------------------------------------------------------------------------------------------+
|                                   DATA ACCESS & PERSISTENCE LAYER                                  |
|                                                                                                    |
|  [ Supabase Auth (No OTP) ]       [ PostgreSQL 15 Tables & RLS ]      [ Schema-Adaptive Fallbacks ]
|  - Direct bcrypt session          - profiles, worker_profiles         - Core column fallback       |
|  - HttpOnly JWT cookies           - occupations, skills, bookings     - Zero-downtime resilience   |
+----------------------------------------------------------------------------------------------------+
```

---

## 2. Critical User Journey Data Flows

### A. Worker & Vendor Onboarding Flow
1. User authenticates via `/auth/register` (Direct account creation, No OTP).
2. User selects Guided 12-Step Form or Vernacular Voice Attestation.
3. Client auto-persists drafts to local storage (`kaamsetu_guided_onboarding_draft`).
4. Upon review and confirmation, client invokes `POST /api/worker/onboarding/save`.
5. Server validates payload via `approvedProfileSubmissionSchema` (Zod).
6. Server checks geographic boundaries via `GeographicAuthorizationService.validateLocation`.
7. `OnboardingService` executes schema-adaptive insert:
   - Attempts insertion of full small-vendor and geographic columns.
   - If database schema cache lacks extended columns, automatically retries and persists core worker columns.
8. Server mints asymmetric Ed25519 cryptographic credential.
9. Returns structured profile receipt with valid `registryId` and provisional `kaamscore`.

### B. Discovery & Filter Flow
1. User accesses `/explore` without login requirement.
2. Selects filters (State, District, Trade, Service vs Goods Vendor).
3. `getPublishedWorkerProfiles` queries Supabase PostgREST:
   - Uses composite index `idx_worker_profiles_geo` (`state, district, city, pincode`).
   - If `profile_type` column is missing from remote DB, gracefully filters in memory.
4. Returns verified worker profiles with zero platform fees.
