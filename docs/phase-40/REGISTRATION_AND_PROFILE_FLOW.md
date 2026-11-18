# KAAMSETU — PHASE 40: REGISTRATION & PROFILE LIFECYCLE FLOW

**Classification:** `CLASS_B_CONTROLLED_ROLLOUT` (Guwahati Urban & Shillong Urban)  
**Permanent Financial Invariant:** `platform_commission_amount = 0.00` on artisan wages  
**Release Policy:** Direct Password Registration — Complete Removal of Mandatory SMS/OTP  

---

## 1. User Journey Overview

```
[ Visitor: /auth/register ]
          │
          │ 1. Submits Name, Email, Password, (Optional Phone)
          │    Accepts Terms & Privacy Policy
          ▼
[ POST /api/auth/register ]
          │
          │ 2. Enforces Rate Limit & Password Strength
          │ 3. Creates Supabase Auth User (email_confirm: true)
          │ 4. Upserts public.profiles (Linked to auth.users.id)
          │ 5. Records Statutory Consents in public.user_consents
          │ 6. Issues Secure HttpOnly kaamsetu_session Cookie
          ▼
[ Redirect: /onboarding ]
          │
          │ 7. Worker completes trade profile & skills
          │ 8. Location verified against Class B Rollout Zones
          │ 9. Digital Craft Credential minted (Registry ID)
          ▼
[ /worker/[slug] or /dashboard ]
```

---

## 2. Direct Account Registration (`/auth/register`)

### 2.1 Form Inputs & Validation Schema
Users can register as an artisan/worker, small contractor, customer, or vocational institution without receiving SMS or phone OTP codes.

- **Full Name:** Required, 2–100 characters.
- **Email:** Required, validated RFC 5322 email.
- **Password:** Required, minimum 8 characters, maximum 128 characters, OWASP complexity rules (requires at least one uppercase letter, one lowercase letter, and one number or special character).
- **Confirm Password:** Must match password exactly.
- **Mobile Number:** Optional during initial account creation. If provided, strictly validated against standard Indian 10-digit mobile prefix standards (`^[6-9]\d{9}$`).
- **Role:** Defaults to `worker`. Client privilege escalation attempts are rejected.
- **Terms & Privacy Consent:** Explicit unchecked-by-default checkbox requiring positive affirmation before account creation.

### 2.2 Server-Side Execution Steps
1. **Rate Limiting:** Protects against automated account spamming (maximum 10 registrations per IP per hour).
2. **Database Readiness Probe:** Performs a lightweight probe on `public.profiles`. If unmigrated (`PGRST205`), fails closed immediately with HTTP 503 `SCHEMA_NOT_READY`.
3. **Supabase Auth Provisioning:**
   ```typescript
   const { data: authData, error: authCreateErr } = await adminClient.auth.admin.createUser({
     email: cleanEmail,
     password: data.password,
     email_confirm: true, // Immediate login capability without external SMTP dependency
     user_metadata: {
       full_name: data.fullName,
       role: assignedRole,
       phone: cleanPhone,
     },
   });
   ```
4. **Cascade Profile Upsert:**
   ```typescript
   await adminClient.from("profiles").upsert({
     id: authData.user.id,
     email: cleanEmail,
     full_name: data.fullName,
     phone: cleanPhone,
     role: assignedRole,
     account_status: "active",
     phone_verification_status: "not_verified",
     verification_method: "none",
     phone_verified: false,
     terms_accepted_at: nowIso,
     privacy_accepted_at: nowIso,
     terms_version: "2026.1",
     privacy_version: "2026.1",
     consent_purpose: "workforce_identity_registration",
   });
   ```
5. **Session Cookie:** The server signs an HMAC-SHA256 session token containing the user's ID, role, and claims, setting it in the `kaamsetu_session` cookie across `/`.
6. **Navigation:** Workers are automatically redirected to `/onboarding`.

---

## 3. Worker Onboarding & Credential Initialization (`/onboarding`)

### 3.1 Onboarding Steps
1. **Trade & Experience:** Selection of primary trade category (aligned with 8 NSQF national trades in `public.occupations`) and years of experience.
2. **Vernacular Attestation:** Optional audio voice prompt capturing local language skills (Assamese, Hindi, Bengali, English).
3. **Location & Dispatch Eligibility:**
   - **Guwahati Urban:** PIN 781001–781039 (Full dispatch eligible).
   - **Shillong Urban:** PIN 793001–793022 (Full dispatch eligible).
   - **Other Indian Pincodes:** Permitted as sovereign non-dispatch craft credentials (customer bookings disabled).
4. **Credential Minting:**
   - Generates collision-resistant national registry ID: e.g. `IN-AS-2026-4821-KS`.
   - Generates SEO-safe profile slug: e.g. `bipul-kalita-guwahati-4821`.
   - Calculates initial KAAMSCORE (Level 1–3).
   - Generates QR verification URL: `https://kaamsetu-neon.vercel.app/verify/IN-AS-2026-4821-KS`.

---

## 4. Account Sign-In Flow (`/login`)

1. User enters their registered **Email** or **10-Digit Mobile Number** along with their **Password**.
2. If mobile number is provided, the API resolves the registered email address from `public.profiles`.
3. The API validates credentials directly against Supabase Auth (`signInWithPassword`).
4. Upon successful authentication, failed attempt counters are reset, and a fresh 14-day `kaamsetu_session` cookie is issued.
5. Session state persists seamlessly across browser restarts and page reloads.
