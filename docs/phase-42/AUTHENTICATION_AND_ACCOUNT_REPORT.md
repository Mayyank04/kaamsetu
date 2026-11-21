# KAAMSETU — PHASE 42 AUDIT DOSSIER 04
# AUTHENTICATION AND ACCOUNT REPORT

**Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Authentication Standard:** Direct Account Creation with Cryptographic Session Tokens  
**OTP Policy:** Strictly Removed as Mandatory Gate (Phase 39.7 Architectural Invariant)  
**Status:** `VERIFIED WORKING` (Phase 40: 20/20, Phase 39.7: 18/18, Phase 42: 22/22)  

---

## 1. Authentication Architecture

In Phase 39.7 and solidified in Phase 40 and 42, mandatory phone SMS/OTP verification was eliminated from user registration and onboarding. Users create real Supabase Auth accounts with email or normalized phone credentials, establishing an authenticated session with HMAC-SHA256 integrity tokens.

### Key Authentication Workflows

1. **Direct Account Registration (`/auth/register`):**
   - Inputs: Full Legal Name, Account Role (`worker` | `contractor` | `customer`), Email or 10-digit Indian Mobile, Password (min 8 characters).
   - Validation: Normalized phone (`+91XXXXXXXXXX`) or standard email address.
   - Persistence: Creates real user in `auth.users`, triggers profile insertion in `public.profiles`.
   - Result: Automatically issues session token and redirects directly to `/onboarding`.

2. **Direct Sign In (`/auth/login`):**
   - Inputs: Email or phone identifier + password.
   - Protection: Memory + Redis rate limiter (5 failed attempts per IP / identifier triggers 15-minute cooldown).
   - Result: Cryptographic SSR cookie set via `createServerClient`.

3. **Session Restoration & Refresh:**
   - Client sessions survive page refreshes, tab closures, and device reboots via HTTP-only cryptographic session tokens.
   - Local drafts stored in browser localStorage are reconciled automatically upon re-authentication.

---

## 2. Nationwide Account Access Validation

Under the Phase 42 decoupled capability architecture, account access is permanently enabled nationwide:

```typescript
const caps = ServiceCoverageRegistry.getCapabilities(state, district, pincode);
assert.strictEqual(caps.account_access, true); // True across all 36 States & UTs
```

Artisans and contractors from remote districts, tier-3 towns, and rural gram panchayats can register and manage accounts without geographic boundary restrictions.

---

## 3. Tenant Isolation & Security Hardening

1. **Row Level Security (RLS):** All database operations enforce `auth.uid() = user_id` for profile modification. User A cannot read or modify User B's unapproved drafts or private contact details.
2. **Password Security:** Passwords are never logged, never returned in API payloads, and never stored in plaintext (managed via Supabase bcrypt hash engine).
3. **No False Success:** In the event of a database or network failure, API routes return structured, truthful error payloads (`HTTP 500 DATABASE_UNAVAILABLE` or `HTTP 409 ACCOUNT_ALREADY_EXISTS`) rather than masked success states.
