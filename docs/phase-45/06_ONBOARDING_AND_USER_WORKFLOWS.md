# KAAMSETU — PHASE 45 AUDIT DOSSIER 06
# ONBOARDING & USER WORKFLOWS SPECIFICATION

**Operating Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**User Personas:** Skilled Informal Workers, Small Street Vendors, Homeowners, Contractors  
**Status:** `VERIFIED WORKING`

---

## 1. Guided 12-Step Worker Onboarding

The Guided 12-Step Onboarding sequence (`src/components/onboarding/guided-12-step-wizard.tsx`) breaks profile registration into single, low-cognitive-load questions designed for workers with limited digital literacy:

1. **Preferred Language:** Selects from 18 Indian languages.
2. **Full Name:** Plain text input for worker name.
3. **State / UT:** Dropdown covering all 36 States & Union Territories.
4. **District:** Dynamic dropdown populated based on selected State.
5. **City, Town or Village:** City selection with toggle for "Unlisted Rural Village / Hamlet".
6. **Work Type:** Choice between `service_professional`, `goods_vendor`, and `hybrid_artisan`.
7. **Practical Skills:** Chips for recommended trade capabilities + custom skill input.
8. **Years of Experience:** Slider and number stepper from 0 to 40+ years.
9. **Contact Information:** Phone number and contact preferences (Phone / WhatsApp / In-Person).
10. **Profile Photograph:** Photo capture or uploaded avatar.
11. **Review Details:** Complete summary card allowing step jump-back for corrections.
12. **Confirmation & Card Minting:** Displays digital trust card with QR code.

---

## 2. Vernacular Voice Attestation Pathway

As an accessible alternative for workers who prefer speaking over typing:
- Voice recording component (`src/components/onboarding/audio-recorder.tsx`) uses Web Speech API with mapped BCP-47 language codes for all 18 supported languages.
- Real-time speech transcription with audio playback confirmation.
- Extraction editor (`src/components/onboarding/extraction-editor.tsx`) presents extracted skills for worker verification before submission.
- Spoken testimonies are tagged with `verification_type: "voice_submitted"`.

---

## 3. Small Vendor & Artisan Workflow

Small shop owners, market stall operators, and street cart vendors have dedicated workflows:
- Classification of stall setup: Mobile Cart / Thela, Fixed Market Stall, Home Workshop, Street Kiosk, Retail Shop.
- Disclosing working hours (e.g. Dawn-to-dusk 06:00 AM – 01:00 PM).
- Publishing itemized product catalogs with unit prices (e.g. ₹20 / piece, ₹60 / plate).
- Filterable under "Local Vendors & Goods" on `/explore`.
