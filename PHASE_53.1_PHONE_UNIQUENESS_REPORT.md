# KAAMSETU — PHASE 53.1: PHONE UNIQUENESS & MULTI-ROLE ENFORCEMENT REPORT

**Operating Classification:** `CLASS_B_CONTROLLED_ROLLOUT` (Guwahati Urban & Shillong Urban)  
**Permanent Economic Invariant:** `platform_commission_amount = 0.00` on artisan wages  
**Date:** 2026-11-27  
**Module:** Phone Normalization, Unique Identity Invariant & Database Constraints  
**Target Branch:** `phase-53.1-signup-ui-and-sandbox-otp`  

---

## 1. Single Primary Account Policy

KAAMSETU strictly enforces:
$$\text{One Verified Mobile Phone Number} \equiv \text{Exactly One Primary User Account}$$

### 1.1 Cross-Role Enforcement
The uniqueness constraint applies globally across all 5 roles:
- Worker / Artisan
- Local Vendor
- Contractor
- Customer
- Training Institution

A user who has registered as an Artisan **cannot** register a second primary account as a Contractor, Customer, or Vendor using the same phone number. Attempting to do so triggers HTTP 409 `PHONE_ALREADY_REGISTERED`.

### 1.2 Within-Account Role Expansion
If a verified artisan later acts as a vendor or contractor, role capabilities are granted through within-account authorization tables (e.g., `contractor_organizations`), maintaining a single sovereign identity anchor rather than creating fragmented secondary accounts.

---

## 2. Phone Input & E.164 Normalization

All phone numbers are validated and converted into canonical E.164 strings (`+91XXXXXXXXXX`) in `src/lib/utilities/phone.ts`:

```typescript
export function normalizePhoneNumber(rawPhone: string, defaultCountryCode = "+91"): NormalizedPhone
```

### Invariants:
1. **Format Equivalence:**  
   `9876543210`, `+91 98765 43210`, `+91-98765-43210`, `09876543210`, and `919876543210` all resolve to identical canonical string `+919876543210`. Format variations cannot bypass duplicate detection.
2. **Prefix Validation:** Domestic Indian numbers must begin with 6, 7, 8, or 9. Numbers starting with 0–5 are rejected immediately.
3. **Character Rejection:** Alphabetic characters and invalid symbols are rejected with clear error messages.
4. **International E.164:** Valid international mobile numbers with country calling codes (e.g. `+447911123456`, `+14155552671`) are normalized and supported.

---

## 3. Database-Level Unique Enforcement

Frontend validation and API pre-checks alone are not sufficient security. Database constraints provide the final, immutable authority:

### 3.1 Migration `20261126000001_phase53_unique_phone_and_optional_email.sql`
```sql
-- Partial unique index on verified phone numbers
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_verified_phone_unique
  ON public.profiles (phone)
  WHERE phone IS NOT NULL AND phone_verified = TRUE;

-- Dedicated canonical E.164 unique index
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_phone_e164_unique
  ON public.profiles (phone_e164)
  WHERE phone_e164 IS NOT NULL;
```

### 3.2 Atomic Registration & Concurrency Race Protection
When two requests arrive simultaneously:
1. One request succeeds and commits to `public.profiles`.
2. The concurrent request hits unique constraint violation `23505`.
3. `POST /api/auth/register` catches code `23505`, rolls back the newly created `auth.users` record, and returns HTTP 409 `PHONE_ALREADY_REGISTERED`.

---

## 4. Verification Evidence

Verified in `test/phase-53-phone-verified-registration.test.ts`:
- **Test 1.1:** Format equivalence across 4 formats -> **PASS**
- **Test 3.4:** Duplicate registration with same phone across formats/roles returns 409 -> **PASS**
- **Test 3.5:** Concurrent duplicate registrations allow exactly 1 creation -> **PASS**
- **CDP E2E Step 8:** Re-submitting registration with same phone blocked -> **PASS**
