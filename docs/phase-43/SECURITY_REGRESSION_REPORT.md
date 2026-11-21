# KAAMSETU — PHASE 43 AUDIT DOSSIER 12
# SECURITY & RLS REGRESSION AUDIT

**Repository:** `Mayyank04/kaamsetu`  
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Audit Scope:** Supabase Row Level Security, RBAC, Data Protection, Session Integrity  
**Status:** `VERIFIED WORKING`

---

## 1. Security Architecture Summary

KAAMSETU enforces multi-layered defense-in-depth across identity, storage, database, and API execution:
1. **Server-Side Authorization Guards:** Privileged contractor and institutional routes are guarded on the server via `requireContractor()` and `requireInstitution()`. UI hiding is never the sole security gate.
2. **Row Level Security (RLS):** All tables (`profiles`, `worker_profiles`, `bookings`, `skills`, `service_coverage_areas`, `custom_localities`) enforce RLS policies restricting read/write access to authenticated row owners.
3. **Tenant & Profile Isolation:** User A cannot modify or delete User B's profile, portfolio items, or booking statuses.
4. **PII & Aadhaar Masking:** Zero raw 12-digit Aadhaar numbers are persisted in database tables; only masked VIDs or cryptographic hashes are stored.
5. **Fail-Closed Session Verification:** JWT session tokens are signed with asymmetric server keys; invalid or expired sessions reject requests with HTTP 401.
