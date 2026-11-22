# KAAMSETU — PHASE 42 UX IMPROVEMENTS REPORT
## Simplified Terminology, Guided 12-Step Onboarding & Inclusive Human-Centred Interactions

**Repository:** `Mayyank04/kaamsetu`  
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Permanent Financial Invariant:** `platform_commission_amount = 0.00` on artisan wages  

---

### 1. Plain Language Transformation (Jargon Elimination)

To ensure the platform is intuitive for craftspeople, informal workers, and customers with no prior digital marketplace experience, technical and corporatized jargon has been eradicated across all user-facing interfaces:

| Obsolete Technical Jargon | Plain Human Language Adopted | Hindi Phrasing |
| :--- | :--- | :--- |
| **Create professional identity** | Create your work profile | अपनी कार्य प्रोफ़ाइल बनाएं |
| **Occupation taxonomy** | Choose your work | अपना काम चुनें |
| **Credential verification** | Verify your skills | अपने हुनर को परखें |
| **Submit service request** | Find someone for this work | काम के लिए लोग खोजें |
| **Provider onboarding** | Register as a worker | कामगार के रूप में जुड़ें |
| **Transaction ledger** | Payment history | भुगतान का हिसाब |
| **Geospatial availability** | Choose your area | अपना क्षेत्र चुनें |

---

### 2. Guided 12-Step Worker Onboarding Architecture

Rather than overwhelming the user with a lengthy, dense form, the onboarding journey is structured into 12 short, focused steps with persistent draft auto-saving:

```mermaid
flowchart LR
    S1[1. Language] --> S2[2. Name] --> S3[3. State] --> S4[4. District]
    S4 --> S5[5. Town/Village] --> S6[6. Work Type] --> S7[7. Skills]
    S7 --> S8[8. Experience] --> S9[9. Contact] --> S10[10. Photo]
    S10 --> S11[11. Review] --> S12[12. Save Profile]
```

**Key UX Characteristics of the 12 Steps:**
1. **Step 1 (Language):** Immediate selection of preferred tongue from 18 Indian languages.
2. **Step 2 (Name):** Single input for full name with inline character validation.
3. **Step 3 (State):** Dropdown of all 36 States and UTs with bilingual labels.
4. **Step 4 (District):** Automatically filtered district dropdown based on selected state.
5. **Step 5 (City/Town/Village):** Locality entry with support for unlisted rural villages.
6. **Step 6 (Type of Work):** Service Professional vs. Local Vendor vs. Hybrid Artisan.
7. **Step 7 (Skills):** Dynamic trade skill chips based on selected trade + custom skill entry.
8. **Step 8 (Experience):** Simple year buttons (1 yr, 2-4 yrs, 5-9 yrs, 10+ yrs).
9. **Step 9 (Contact):** Mobile number with transparent privacy note explaining why it is needed.
10. **Step 10 (Photo):** Completely optional photo/avatar step.
11. **Step 11 (Review):** Comprehensive summary card with direct "Edit" links for any field.
12. **Step 12 (Save):** Clear zero-commission covenant and immediate credential minting.

---

### 3. Voice Attestation & Dual-Mode Flexibility

Workers who prefer speaking over typing can toggle to **Voice Attestation** at any point. They speak in their mother tongue into the microphone, Gemini AI extracts the vocational claims, auto-populates the fields, and routes them directly to Step 11 for verification and saving.
