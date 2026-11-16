# KAAMSETU — PHASE 39 KNOWN LIMITATIONS & COMMERCIAL ROADMAP

**Program:** KAAMSETU Digital Identity & Worker Empowerment Platform  
**Target:** `Mayyank04/kaamsetu`  
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  

---

## 1. Sandbox Verification Limitations

KAAMSETU Phase 39 introduces a robust, fail-safe sandbox authentication mode (`AUTH_VERIFICATION_MODE=sandbox`). The operational boundaries of this mode are transparently documented:

1. **Absence of Cellular SMS Delivery:**
   - In sandbox mode, no cellular SMS packets are dispatched to telecommunication carriers.
   - The system generates authentic cryptographic challenges and returns the valid code in the API response payload for testing, QA, and evaluation.
2. **Honest Phone Verification Status:**
   - Accounts registered or authenticated via sandbox mode are stored in PostgreSQL with:
     - `phone_verification_status = 'sandbox_unverified'`
     - `verification_method = 'sandbox'`
     - `phone_verified = false`
   - These accounts are fully functional for navigating the platform, creating artisan profiles, attesting skills, and browsing work, but will require real carrier verification before receiving formal commercial bank disbursements or government micro-credit endorsements.

---

## 2. Telecom Carrier Integration Roadmap

To transition from `sandbox` to live production `sms` mode:

1. **TRAI DLT Entity Registration:**
   - Institutional registration under the Telecom Regulatory Authority of India (TRAI) Distributed Ledger Technology (DLT) framework (e.g. Jio DLT / Vilpower / Airtel DLT).
   - Approval of Principal Entity ID and Sender Header (`KMTSETU` or `KMSETU`).
2. **Registered Consent & Content Templates:**
   - Registration of transactional OTP SMS template:
     `"Your KAAMSETU verification code is {#var#}. Valid for 10 minutes. Do not share this code with anyone. - KAAMSETU"`
3. **Gateway Provisioning:**
   - Configuration of enterprise SMS gateway credentials (e.g., CDAC Mobile Seva for public governance, MSG91, or Twilio India).
   - Setting `AUTH_VERIFICATION_MODE=sms` in production environment secrets.

---

## 3. Geographic Scope Limitation

- **Authorized Territories:** Controlled rollout is strictly restricted to:
  - Guwahati Urban (Kamrup Metropolitan): Pincodes 781001 – 781039.
  - Shillong Urban (East Khasi Hills): Pincodes 793001 – 793022.
- **Out-of-Scope Territories:** Registrations with pincodes outside these boundaries are halted at the geographic verification step. Expanding beyond these clusters requires formal institutional agreements with state skill development missions (ASDM / MSSDS).

---

## 4. Disconnected Database Fallback

- When running in offline unit test environments where Supabase is unconfigured, OTP challenges and rate limiter windows reside in memory with TTL expiration.
- In production (`NODE_ENV=production`), Supabase database connectivity is mandatory; offline fallback is strictly disabled to prevent ephemeral data loss.
