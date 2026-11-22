# KAAMSETU — PHASE 45 AUDIT DOSSIER 05
# API REFERENCE & SERVICE CONTRACTS

**Operating Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**API Paradigm:** Next.js 15 Route Handlers + Typed Service Contracts  
**Status:** `VERIFIED WORKING`

---

## 1. Core Endpoints

### Worker & Onboarding APIs
- `POST /api/worker/onboarding/save`: Persists worker or vendor profile. Validates payload with Zod schema, checks geographic boundaries, executes schema-adaptive database save, and mints cryptographic credential.
- `GET /api/workers`: Discovery engine search. Accepts query params: `search`, `state`, `district`, `city`, `pincode`, `profileType`, `vendorType`, `stallType`, `minKaamScore`, `limit`, `offset`.
- `GET /api/worker/profile`: Retrieves authenticated worker profile and linked skills.
- `PUT /api/worker/profile`: Updates headline, bio, rates, and availability.

### Geographic & Jurisdictional APIs
- `GET /api/geo/states`: Returns all 36 States and Union Territories with metadata.
- `GET /api/geo/districts?state={state}`: Returns authoritative census districts for selected state.
- `GET /api/geo/lookup?pincode={pincode}`: Resolves location hierarchy from 6-digit Indian postal code.
- `POST /api/geo/validate`: Evaluates location against decoupled capabilities matrix.
- `POST /api/geo/custom-locality`: Ingests unlisted rural village or hamlet names.

### Service Booking & Opportunity APIs
- `POST /api/bookings`: Initiates customer service booking with permanent zero platform commission (`platform_commission_amount = 0.00`).
- `GET /api/customer/bookings`: Returns bookings initiated by the authenticated customer.
- `GET /api/contractor/dashboard`: Returns contractor enterprise roster, projects, and active postings.

---

## 2. Standardized Error Contract

All API endpoints return consistent error responses:

```json
{
  "error": "Human-readable actionable message",
  "code": "ERROR_CODE_STRING",
  "details": {},
  "timestamp": "2026-11-22T17:45:00.000Z"
}
```

Common status codes:
- `400 Bad Request`: Zod input validation failure.
- `401 Unauthorized`: Missing or invalid session JWT.
- `403 Forbidden`: Geographic dispatch boundary exceeded or cross-tenant modification attempt.
- `404 Not Found`: Worker profile or registry ID not found.
- `429 Too Many Requests`: Rate limit threshold exceeded.
- `500 Internal Server Error`: Infrastructure or database failure with correlation ID.
