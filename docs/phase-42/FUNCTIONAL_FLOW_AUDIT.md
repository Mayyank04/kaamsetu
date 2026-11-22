# KAAMSETU — PHASE 42 AUDIT DOSSIER 9
# FUNCTIONAL FLOW AUDIT & USER JOURNEY VERIFICATION

**Operating Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Audited Personas:** Skilled Workers, Small Vendors, Customers, Contractors, Institutions  
**Status:** `VERIFIED WORKING` (All Core Journeys Validated Across Desktop & Mobile)

---

## 1. Skilled Worker Journey

The worker journey is the foundational backbone of KAAMSETU:
1. **Intake Discovery:** Worker visits homepage (`/`) and reads clear vernacular orientation ("Every skill deserves to be seen, even without a degree").
2. **Onboarding Pathway Choice:** Worker chooses between:
   - **Guided 12-Step Wizard:** Step-by-step low-cognitive-load form with single questions, big tap targets, draft auto-saving, and review summary.
   - **Voice Attestation:** Vernacular audio intake with automatic transcription and trade extraction.
3. **No-OTP Account Creation:** Account registration requires only phone/email and password. Eliminates SMS gateways, telecom delivery delays, and 503 deadlocks.
4. **Credential Minting:** Upon saving profile, a cryptographic Ed25519 verifiable credential is minted with an unforgeable QR code and tamper-evident registry ID.
5. **Worker Workspace (`/dashboard`):** 10 structured sections providing complete visibility over profile details, skills, opportunities, bookings, portfolio, trust index, and earnings ledger.

---

## 2. Small Vendor & Artisan Journey

Introduced in Phase 44 and refined in Phase 42:
1. **Profile Specialization:** Artisan selects `goods_vendor` or `hybrid_artisan`.
2. **Physical Setup Classification:** Classifies stall (Mobile Cart / Thela, Fixed Market Stall, Street Kiosk, Home Workshop).
3. **Operating Schedule:** Sets working hours (e.g. 06:00 AM – 02:00 PM dawn shift).
4. **Catalog Itemization:** Publishes transparent product/produce offerings with unit pricing (e.g. ₹25 / item).
5. **Discovery:** Appears under "Local Vendors & Goods" on `/explore`.

---

## 3. Customer & Homeowner Journey

1. **Discovery Engine (`/explore`):** Customer filters by state, district, trade, and profile type without requiring login.
2. **Profile Inspection:** Customer views verified work samples, tool inventory, language capabilities, and scanned trust card.
3. **Inquiry / Booking:**
   - Within Class B zones (Guwahati PIN 781001-39, Shillong PIN 793001-22): Customer can book direct physical dispatch.
   - Outside Class B zones: Customer can submit direct inquiries while booking dispatch clearly indicates pilot availability boundaries.

---

## 4. Contractor & Enterprise Journey

1. **Opportunity Portal (`/contractor/dashboard`):** Contractors post trade opportunities with required crew sizes, skill tags, day rates, and district locations.
2. **Worker Discovery:** Matches active verified workers in the selected district and invites them directly.
3. **Contractor Invariants:** Zero commission deducted from worker remuneration.

---

## 5. UI Accessibility & Dialog Verification

All modals, dialogs, drawers, and form elements adhere to accessible UX standards:
- **Focus Management:** Active `focus-visible` ring on all interactive elements.
- **Escape Key Dismissal:** All dialogs and menus close immediately upon `Escape` keypress.
- **Mobile Bottom Sheets:** On screens `< 768px`, dialogs render as sliding bottom drawers rather than overflowing desktop modals.
- **Visible Text Scaling:** Header toggle (`A` / `A+`) instantly scales body typography from 16px to 18px without layout clipping.
