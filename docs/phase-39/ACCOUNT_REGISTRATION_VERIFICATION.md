# KAAMSETU — PHASE 39 ACCOUNT REGISTRATION VERIFICATION REPORT

**Program:** KAAMSETU Digital Identity & Worker Empowerment Platform  
**Target:** `Mayyank04/kaamsetu`  
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT` (Guwahati Urban & Shillong Urban)  
**Status:** Fully Implemented & Certified  

---

## 1. Defect Remediation Background

Prior to Phase 39, `src/app/auth/register/page.tsx` simply contained:
```typescript
export { default } from "@/app/login/page";
```
There was no dedicated registration form. Prospective workers, contractors, or training partners clicking "Create Account" or "Register" were redirected to the login page, where they encountered the demo persona picker rather than an account creation flow.

In Phase 39, dedicated, production-grade registration interfaces were constructed at both `/auth/register` and `/signup` (aliased).

---

## 2. Registration Architecture & User Journey

```
+-------------------------------------------------------------+
|              Step 1: Account Information Form               |
|                                                             |
|  - Full Name (Minimum 2 characters, text only)              |
|  - Mobile Number (+91 10-digit Indian standard)             |
|  - Account Type Selector:                                   |
|      * Skilled Worker / Artisan                             |
|      * Contractor / Business Client                         |
|      * Training Partner / ITI Institution                   |
|      * Individual Customer / Homeowner                      |
|  - Statutory Consent Checkbox (Terms & Privacy)             |
+-------------------------------------------------------------+
                              │
                              │ Validates via Zod Schema
                              ▼
+-------------------------------------------------------------+
|               Step 2: Cryptographic OTP Step                |
|                                                             |
|  - Dispatches challenge via `/api/auth/otp/send`            |
|  - In Sandbox Mode: Discloses code with 1-click helper      |
|  - Accepts 6-digit numeric input with countdown timer       |
|  - Rate limited: 3 sends / 15m; 5 attempts max              |
+-------------------------------------------------------------+
                              │
                              │ Verifies via `/api/auth/otp/verify`
                              ▼
+-------------------------------------------------------------+
|               Step 3: Database Account Creation             |
|                                                             |
|  - Inserts record into `profiles` table                     |
|  - Assigns selected role & honest sandbox status            |
|  - Sets HttpOnly, Secure `kaamsetu_session` cookie          |
|  - Redirects to designated landing surface                  |
+-------------------------------------------------------------+
```

---

## 3. Form Validation Specifications (`auth.schema.ts`)

Registration inputs are rigorously validated on both client and server:

```typescript
export const phoneAuthSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(
      /^(?:\+91|91)?[6-9]\d{9}$/,
      "Please enter a valid 10-digit Indian mobile number (e.g., 9876543210)"
    ),
  role: z
    .enum(["worker", "contractor", "institution", "customer", "admin"])
    .default("worker"),
  intent: z
    .enum(["login", "registration"])
    .default("login"),
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must not exceed 100 characters")
    .optional(),
});
```

---

## 4. Post-Registration Route Dispatch

Upon successful OTP verification and profile creation, users are deterministically directed according to their selected role:

| Registered Role | Destination Route | Next Action in Journey |
| :--- | :--- | :--- |
| **Worker / Artisan** | `/onboarding` | 4-step artisan profile builder & skill attestation |
| **Contractor** | `/contractor/dashboard` | Crew management, project posting & work orders |
| **Training Partner** | `/institution/dashboard` | Verification queue, student certification & batches |
| **Customer** | `/search` | Directory of verified skilled workers in local ward |

---

## 5. Visual Consistency & Tactile Polish

The registration experience adheres strictly to the project's Human-Centred Design System:
- **Primary Canvas:** Warm Ivory (`#F7F5F0`).
- **Structural Anchors:** Deep Forest Green (`#153E35`).
- **Interactive Focus States:** Calibrated 2px rings with `focus-visible:ring-forest/30`.
- **Form Controls:** Touch targets calibrated to $\ge 44\text{px} \times 44\text{px}$ for accessibility on mobile devices.
- **Copy:** Respectful, direct, devoid of marketing hype or AI fluff.
