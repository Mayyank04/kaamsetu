# KAAMSETU — PHASE 54: OPTIONAL EMAIL INTEGRATION REPORT

**Product:** KAAMSETU  
**Mission:** Every skill deserves to be seen, even without a degree.  
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT` (Guwahati Urban & Shillong Urban)  
**Permanent Constitutional Invariant:** `platform_commission_amount = 0.00` on artisan wages  
**Verification Date:** November 27, 2026  

---

## 1. Executive Summary

Many informal artisans, daily wage helpers, and traditional craftsmen in India do not maintain an active email account, relying predominantly on phone and WhatsApp for communication. Forcing email registration creates an exclusionary digital literacy barrier that contradicts KAAMSETU's constitutional mission.

Phase 54 provides a first-class **optional email** architecture:
- Email is completely optional during signup.
- Users without an email register with `email: null` and full functional parity.
- Users who choose to provide an email (e.g. for notifications or password recovery) have their input normalized, trimmed, and validated against standard email formatting.
- Provided emails are stored with `email_verified = false`, ensuring no unverified address is falsely treated as verified.

---

## 2. Field Behavior & UI Specification

### 2.1 UI Component in Signup Form
```tsx
<div className="space-y-1.5">
  <div className="flex items-center justify-between">
    <label htmlFor="reg-email" className="text-xs font-semibold text-charcoal">
      Email address (optional)
    </label>
    <span className="text-[11px] text-charcoal-muted font-mono">Optional</span>
  </div>
  <Input
    id="reg-email"
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    placeholder="you@example.com (optional)"
    className="h-11 bg-card border-forest/20 text-charcoal text-sm"
  />
  <p className="text-[11px] text-charcoal-muted leading-tight">
    Optional — add an email for account recovery and important updates. You can skip this.
  </p>
</div>
```

---

## 3. Storage & Database Schema

In `public.profiles`:
```sql
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE public.profiles ALTER COLUMN phone DROP NOT NULL;
```

### 3.1 Case Insensitivity & Normalization
When provided, email strings are sanitized:
- Surrounding whitespace trimmed: `"  user@domain.com  "` -> `"user@domain.com"`
- Lowercased: `"User@Gmail.COM"` -> `"user@gmail.com"`
- Regex validated: `^[^\s@]+@[^\s@]+\.[^\s@]+$`
- When omitted or blank, normalized strictly to `null`.

### 3.2 Uniqueness Invariant
If an email is supplied, duplicate registration with that same email is rejected with `HTTP 409 Conflict`. When `email: null`, multiple workers can exist without email collision because PostgreSQL unique constraints ignore `NULL` values.

---

## 4. Test Verification Matrix

| Test Case | Input | Expected Output | Status |
|---|---|---|---|
| Omitted Email | `{ fullName, phone, password }` | `201 Created, email: null, emailVerified: false` | PASS |
| Empty String Email | `{ email: "   " }` | `201 Created, email: null, emailVerified: false` | PASS |
| Valid Gmail | `{ email: "artisan.guwahati@gmail.com" }` | `201 Created, email: "artisan.guwahati@gmail.com", emailVerified: false` | PASS |
| Space-Padded Email | `{ email: "  BIPUL@GMAIL.COM  " }` | `201 Created, email: "bipul@gmail.com"` | PASS |
| Invalid Email Format | `{ email: "invalid-address" }` | `400 Bad Request, code: "INVALID_EMAIL_FORMAT"` | PASS |
| Duplicate Email Attempt | `{ email: existingEmail }` | `409 Conflict, code: "EMAIL_ALREADY_EXISTS"` | PASS |

---

## 5. Security & Verification Guardrails

1. **No Auto-Verification:** Providing an email never automatically sets `email_verified: true`.
2. **Supabase Internal Auth Binding:** When email is omitted, Supabase Auth user record is bound to the canonical phone handle (`phone.<hash>@phone.kaamsetu.internal`), maintaining zero dependence on third-party mail providers for authentication.
3. **Recovery Parity:** Password reset and login workflows support mobile phone SMS OTP verification as the authoritative recovery channel.
