# KAAMSETU — PHASE 44: INDIA-WIDE LOCATION ARCHITECTURE
**Operating Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Permanent Financial Invariant:** `platform_commission_amount = 0.00` on artisan wages

---

## 1. Architectural Philosophy: Decoupled Capabilities

KAAMSETU separates **Identity, Onboarding & Discovery** from **Commercial On-Demand Dispatch & Settlement**.

1. **Universal Digital Identity (All 28 States & 8 Union Territories):**
   - Any worker or vendor anywhere in India can register an account, undergo vernacular voice onboarding, mint a cryptographic guild credential, and be publicly discoverable on `/explore`.
   - No geographical restriction blocks a craftsperson from creating their sovereign digital identity.

2. **Controlled Commercial Dispatch (`CLASS_B_CONTROLLED_ROLLOUT`):**
   - On-demand customer booking, routing, physical job dispatch, and platform-managed settlements are strictly limited to authorized pilot clusters where operational field support and grievance infrastructure exist:
     - **Guwahati Urban Cluster, Kamrup Metropolitan, Assam** (PIN 781001–781039)
     - **Shillong Urban Cluster, East Khasi Hills, Meghalaya** (PIN 793001–793022)

---

## 2. Capability Resolution Matrix

| Region | Account Access | Profile Access | Discovery Access | Booking Access | Dispatch Access | Settlement Access |
|---|---|---|---|---|---|---|
| **Guwahati Urban (781001-781039)** | ✅ YES | ✅ YES | ✅ YES | ✅ YES | ✅ YES | ✅ YES |
| **Shillong Urban (793001-793022)** | ✅ YES | ✅ YES | ✅ YES | ✅ YES | ✅ YES | ✅ YES |
| **Rest of Assam / Meghalaya** | ✅ YES | ✅ YES | ✅ YES | ❌ NO | ❌ NO | ❌ NO |
| **All Other 34 States / UTs** | ✅ YES | ✅ YES | ✅ YES | ❌ NO | ❌ NO | ❌ NO |

---

## 3. Graceful Locality & PIN Code Resolution

- When a worker enters a 6-digit Indian PIN code, `GeographicAuthorizationService.lookupPincode(pin)` auto-resolves State, District, and primary urban center.
- If a worker resides in an unlisted rural village or hamlet, they can specify their custom locality or district. The system permits full registration and issues a valid regional registry ID without requiring manual admin approval.
