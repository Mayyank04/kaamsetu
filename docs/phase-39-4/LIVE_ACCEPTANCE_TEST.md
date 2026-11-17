# KAAMSETU — PHASE 39.4 LIVE ACCEPTANCE TEST PROTOCOL
## End-to-End Functional Verification & Acceptance Test Procedures

**Target Domain:** `https://kaamsetu-neon.vercel.app`  
**Target Route:** `/onboarding`, `/login`, `/auth/register`  
**Operating Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Acceptance Test Status:** `IMPLEMENTED — NOT LIVE VERIFIED` (Ready for execution once remote database migration is run)

---

## 1. Acceptance Test Scenario 1: New Worker Registration (`/auth/register`)

1. Open `https://kaamsetu-neon.vercel.app/auth/register`.
2. Observe UI:
   - Full Name input field.
   - Mobile number input field with `+91` prefix.
   - Role selector (Worker selected by default).
   - Terms of Service checkbox.
3. Enter invalid Indian phone prefix (e.g. `5456565656`).
4. **Verification Point:** Inline error displays immediately: *"Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9."* Submit button remains disabled.
5. Enter valid Indian mobile number (e.g. `9876543210`), enter full name `"Mohammad Rafiq"`, and check Terms of Service.
6. Click **Send Verification Code**.
7. **Verification Point:**
   - Under `AUTH_VERIFICATION_MODE=sandbox`, modal displays Sandbox badge with server-generated 6-digit PIN.
   - Copy helper and "Auto-fill Code" button appear.
   - Button reflects 60-second cooldown countdown.
8. Click **Auto-fill Code** (or type the 6-digit PIN).
9. Click **Verify & Create Account**.
10. **Verification Point:**
    - Profile is created in `public.profiles`.
    - User is redirected to `/dashboard`.
    - User name `"Mohammad Rafiq"` is displayed.

---

## 2. Acceptance Test Scenario 2: Existing User Login (`/login`)

1. Open `https://kaamsetu-neon.vercel.app/login`.
2. Enter registered phone number `9876543210`.
3. Click **Send Verification Code**.
4. **Verification Point:** Server verifies account existence in `public.profiles` and dispatches challenge.
5. Enter 6-digit PIN and submit.
6. **Verification Point:**
    - Session cookie `kaamsetu_session` is minted.
    - User is redirected to `/dashboard`.

---

## 3. Acceptance Test Scenario 3: Unregistered Number Login (`/login`)

1. Open `https://kaamsetu-neon.vercel.app/login`.
2. Enter an unregistered phone number (e.g. `9876549999`).
3. Click **Send Verification Code**.
4. **Verification Point:**
   - Server returns HTTP 404 with typed code `ACCOUNT_NOT_FOUND`.
   - UI displays clear actionable error: *"No account found with this mobile number. Please register first."*
   - Link to `/auth/register` is clearly visible.

---

## 4. Acceptance Test Scenario 4: Duplicate Registration Conflict (`/auth/register`)

1. Open `https://kaamsetu-neon.vercel.app/auth/register`.
2. Enter already registered phone number `9876543210`.
3. Fill name, check terms, and click **Send Verification Code**.
4. **Verification Point:**
   - Server returns HTTP 409 with typed code `ACCOUNT_ALREADY_EXISTS`.
   - UI displays: *"An account already exists with this mobile number. Please sign in instead."*
   - Link to `/login` is provided.

---

## 5. Acceptance Test Scenario 5: Artisan Onboarding Modal (`/onboarding`)

1. Open `https://kaamsetu-neon.vercel.app/onboarding`.
2. Complete Step 1 (Trade: Carpentry, Experience: 8 years, Daily Rate: ₹850).
3. Complete Step 2 (Tools: Circular Saw, Router, Spirit Level).
4. Complete Step 3 (City: Guwahati, State: Assam, Pincode: 781003).
5. Click **Sign & Mint Sovereign Credential**.
6. Inline verification modal opens.
7. Enter new mobile number (e.g. `9876543215`).
8. Click **Send Verification Code**.
9. Auto-fill 6-digit sandbox PIN and verify.
10. **Verification Point:**
    - Credential minting succeeds.
    - Confetti animation triggers.
    - Permanent verifiable registry link is displayed.

---

## 6. Acceptance Test Scenario 6: Clean Session Revocation (Logout)

1. While authenticated on `/dashboard`, click **Sign Out**.
2. **Verification Point:**
   - `POST /api/auth/logout` clears `kaamsetu_session` with `path: "/"`, `maxAge: 0`.
   - User is redirected to `/login`.
   - Attempting to navigate back to `/dashboard` redirects to `/login`.
