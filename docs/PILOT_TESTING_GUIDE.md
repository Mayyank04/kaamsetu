# KAAMSETU — Field Pilot Testing Guide (Guwahati / Kamrup Metro, Assam)

**Platform:** KAAMSETU — Voice-First Multilingual Digital Skill Identity  
**Pilot Location:** Guwahati, Kamrup Metropolitan District, Assam, India  
**Target Pilot Scope:** 10 Selected Trade Professionals (Electricians, Plumbers, Bamboo/Carpentry Artisans)  
**Supported Languages:** Assamese (`as`), Bengali (`bn`), Hindi (`hi`), English (`en`)  
**Guiding Principle:** *"Every skill deserves to be seen, even without a degree."*

---

## 1. Pilot Mission & Objective

The objective of the KAAMSETU Controlled Field Pilot is to test and validate the end-to-end user experience and reliability of sovereign digital skill identities with real informal trade workers in Guwahati, Assam.

The pilot validates:
1. **Zero-friction voice onboarding** in native Assamese and Hindi without complex multi-page forms.
2. **Strict non-invention**: The AI extraction must never invent or assume years of experience, daily wages, or tools not explicitly claimed by the worker.
3. **Transparent Evidence Tiers**: Clear visual and cryptographic separation between self-declared claims and verified work history.
4. **Verifiable Sovereign Credentials**: Instant QR code generation with HMAC-SHA256 non-repudiation, scannable by any customer or contractor smartphone camera.
5. **Authentic Service Lifecycle**: Direct customer booking, worker acceptance, work completion, and customer review without platform commission leakage.

---

## 2. Field Worker Onboarding Checklist

### Pre-Onboarding Preparation (Field Facilitator)
- [ ] Ensure smartphone or tablet has internet connectivity (4G/5G or Wi-Fi).
- [ ] Open the KAAMSETU application at `https://kaamsetu.in/onboarding` (or local pilot URL `http://localhost:3000/onboarding`).
- [ ] Verify quiet acoustic environment for clear spoken attestation.

### Step-by-Step Onboarding Protocol

#### Step 1: Language & Medium Selection
- [ ] Select worker's primary language:
  - **অসমীয়া (Assamese)** for native Assamese speakers.
  - **বাংলা (Bengali)** for Bengali-speaking artisans in Barak Valley / Guwahati.
  - **हिन्दी (Hindi)** or **English** as preferred.
- [ ] Select **Voice-First Attestation (মাতৰ মাধ্যমেৰে পঞ্জীয়ন / आवाज से पंजीकरण)**.

#### Step 2: Spoken Craft Attestation
- [ ] Tap the microphone button (**ৰেকৰ্ডিং আৰম্ভ কৰক**).
- [ ] Guide the worker to speak freely for 30–60 seconds covering:
  1. Full name.
  2. Operating locality in Guwahati (e.g., Beltola, Ulubari, Dispur, Jalukbari).
  3. Primary trade (Electrician, Plumber, Bamboo Craftsman, etc.).
  4. Specific equipment and tools handled (e.g., Megger tester, CPVC cutter, Bosch drill, planer).
  5. Years of hands-on experience.
  6. Standard daily wage expectation (optional).
- [ ] Tap **Stop Recording** and review the live streamed transcript.
- [ ] Tap **Extract Skills with AI (AI ৰে দক্ষতা বিশ্লেষণ কৰক)**.

#### Step 3: Worker Review & Sovereign Confirmation
- [ ] Review the AI-extracted craft profile together with the worker.
- [ ] **Non-Invention Verification**:
  - Verify that years of experience matches what was spoken (or left blank if unmentioned).
  - Verify operating city is set to Guwahati and state to Assam (no defaulting to other states).
  - Verify daily rates are accurate or left as optional consultation.
  - Verify only mentioned tools appear in the equipment list.
- [ ] Add or remove any specific sub-skills using the tag editor.
- [ ] Tap **Approve & Mint Sovereign Skill Card (অনুমোদন কৰক আৰু কাৰ্ড লাভ কৰক)**.

#### Step 4: Credential Issuance & QR Verification
- [ ] Present the minted **Sovereign Skill Card** to the worker.
- [ ] Note the permanent Registry ID (format: `IN-AS-2026-XXXX-KS`).
- [ ] Scan the on-screen QR code using a separate phone camera to verify instant redirection to the live public profile.
- [ ] Provide worker with the direct link and print-ready QR image.

---

## 3. Customer Discovery & Booking Walkthrough

### Customer Journey Protocol

1. **Discovery & Search**:
   - Navigate to `/explore`.
   - Filter by location: **Guwahati** or **Dispur**.
   - Filter by craft: **Electrical & Solar**, **Carpentry & Joinery**, or **Plumbing & Sanitation**.
   - Inspect worker cards: notice the clear `[DEMO RECORD]` vs `[VERIFIED PILOT]` badges and transparent KAAMSCORE evidence breakdown.

2. **Inspecting Worker Trust & Evidence**:
   - Open worker profile (e.g., `/profile/dipak-kalita-guwahati`).
   - Review **Skills & Craft Credentials**:
     - Note the separation between **Verified Evidence** (Voice AI Attested, Customer Confirmed) and **Self-Declared Skills**.
     - Verify notice: *"Credential cryptographic integrity verified via HMAC-SHA256 non-repudiation."*
   - Review past work records and customer ratings.

3. **Commissioning a Booking**:
   - Tap **Request Service / Hire**.
   - Fill in service location in Guwahati, scheduled date, and job description.
   - Submit booking request.

4. **Worker Acceptance & Lifecycle Transitions**:
   - Worker views incoming request on `/dashboard` or `/customer/bookings`.
   - Worker clicks **Accept Booking** (`requested` -> `confirmed`).
   - On scheduled day, worker clicks **Start Work** (`confirmed` -> `in_progress`).
   - Upon job finish, worker clicks **Mark Completed** (`in_progress` -> `completed`).

5. **Customer Review & Evidence Anchoring**:
   - Customer dashboard updates to show the booking is `completed`.
   - Customer submits a 1–5 star rating and verified feedback.
   - System anchors the review to the worker's ledger, updating the customer-confirmed evidence points.

---

## 4. Informed Pilot Consent Form (Field Script)

### Assamese Translation (মৌখিক সন্মতি পাঠ)
> "নমস্কাৰ। কাজসেতু হৈছে আপোনাৰ কাৰিকৰী দক্ষতা আৰু কামৰ অভিজ্ঞতা ডিজিটেলভাৱে প্ৰতিষ্ঠা কৰাৰ এক মুক্ত মঞ্চ। আপুনি আপোনাৰ কণ্ঠস্বৰেৰে দিয়া তথ্যৰ ভিত্তিত এক ছোভাৰেইন ডিজিটেল পৰিচয় পত্ৰ (QR ক’ড) প্ৰস্তুত কৰা হ’ব। আপোনাৰ ফোন নম্বৰ বা ব্যক্তিগত তথ্য কেতিয়াও ৰাজহুৱা কৰা নহ’ব। কেৱল আপোনাৰ কামৰ দক্ষতা আৰু কামৰ স্থান গ্ৰাহক বা ঠিকাদাৰে চাব পাৰিব। আপুনি বিচৰা যিকোনো সময়তে এই পৰিচয় পৰিৱৰ্তন কৰিব পাৰিব। আপুনি এই পাইলট কাৰ্যসূচীত অংশগ্ৰহণ কৰিবলৈ সন্মত নে?"

### English Translation
> "Namaskar. KAAMSETU is an open platform to digitally recognize your skilled craft and work history. Based on your spoken testimony, a sovereign digital skill card and verifiable QR code will be created. Your phone number and private identification will never be exposed publicly. Only your craft skills, tools, and general operating area will be visible to potential clients. You retain full ownership and may update or withdraw your profile at any time. Do you agree to participate in this controlled pilot?"

- **Participant Consent Options:**
  - [ ] Verbal assent recorded via voice attestation.
  - [ ] Written signature / thumb impression on physical pilot roster.

---

## 5. Data Privacy & Sovereignty Safeguards

| Privacy Principle | Implementation in KAAMSETU |
|---|---|
| **Zero Phone Exposure** | Worker phone numbers are never rendered in public HTML or JSON API responses. Replaced with privacy-preserving tokens. |
| **Fail-Closed Access** | API routes fail closed (HTTP 401/403) whenever an unauthenticated or unauthorized party queries private booking or identity data. |
| **No Intermediary Lock-in** | The worker owns their canonical Registry ID and can export or share their QR verification URL anywhere without paying platform fees. |
| **Zero Fabricated Metrics** | No artificial percentile claims ("Top 5% in city") are generated. Every point in KAAMSCORE is tied to verifiable evidence. |

---

## 6. Feedback & Bug Collection Protocol

During the field pilot, facilitators and workers must record all observations using the following template:

```markdown
### KAAMSETU Pilot Incident / Feedback Form
- Date & Time:
- Worker Registry ID / Name:
- Device & Browser (e.g. Redmi Note 11, Chrome Mobile 122):
- Network Type (4G Jio / Airtel / 5G / Wi-Fi):
- Language Used (as / bn / hi / en):
- Step Where Issue Occurred (Voice Recording / AI Extraction / Review Form / QR / Booking):
- Worker Observation (Quote in native tongue):
- Technical Symptom (Error message, audio cut-off, misclassified tool):
- Severity (Cosmetic / Usability / Blocking):
```

All feedback must be logged into the pilot issue tracker for engineering triage.
