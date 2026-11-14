# KAAMSETU — ASSAM REGIONAL EXPANSION PLAYBOOK
## Kamrup Metropolitan to 5-District Cluster Rollout

---

## 1. Ground Context & Demographic Realities

The state of Assam represents a uniquely diverse and vital informal labor ecosystem:
- **Urban Hub (Guwahati / Kamrup Metro)**: Rapid commercial infrastructure development, solar energy retrofitting, residential electrical/plumbing demand, and heavy contractor operations.
- **Handicrafts & Heritage Crafts (Kamrup Rural, Sualkuchi, Barpeta)**: World-renowned Eri and Muga silk weaving, cane and bamboo architectural construction, and bell-metal casting.
- **Agricultural & Mechanical Trades (Nagaon, Darrang, Udalguri, Sonitpur)**: Heavy machinery, pump repair, tea garden maintenance technicians, and automotive EV transition.

### Linguistic Imperatives
Informal workers in Assam navigate a multilingual reality:
- Primary: **Assamese (অসমীয়া)**
- Widely spoken in urban & trade corridors: **Bengali (বাংলা)**, **Hindi (हिन्दी)**
- Technical equipment loan words: **English (wiring, MCB, inverter, pump, bearing)**

KAAMSETU's voice-first onboarding engine natively supports code-switching across Assamese, Bengali, and Hindi with zero loss of extraction accuracy (verified in `test/ai-accuracy-ground-truth.test.ts`).

---

## 2. District-by-District Phased Rollout

```
+---------------------------------------------------------------------------------+
|                               ASSAM ROLLOUT CLUSTERS                            |
+---------------------------------------------------------------------------------+
| STAGE 1: METRO CORE      | Kamrup Metropolitan (Guwahati, Dispur, Beltola, Jalukbari)|
| STAGE 2: ARTISAN CLUSTER | Kamrup Rural (Hajo, Sualkuchi, Changsari)                |
| STAGE 3: AGRI-INDUSTRIAL | Nagaon & Darrang (Mangaldai, Kaliabor)                   |
| STAGE 4: NORTH BANK HUB  | Sonitpur (Tezpur) & Udalguri BTR Corridor               |
+---------------------------------------------------------------------------------+
```

### 2.1 Cluster Profiles

#### 1. Kamrup Metropolitan (Current Pilot Market)
- **Primary Trades**: Rooftop Solar & Electrical, Modular Cabinetry, Commercial Plumbing, Masonry.
- **Worker Gathering Nodes (Naka Chowks)**:
  - Beltola Tiniali Naka Chowk (Early morning labor muster: 6:30 AM – 8:30 AM).
  - Maligaon Chariali (Construction & carpentry crew muster).
  - Paltan Bazaar / Ulubari (Electrical, fabrication, and HVAC specialists).
- **Key Hardware Partners**: S.J. Electricals (Paltan Bazaar), Assam Timber Traders (Bharalumukh).

#### 2. Kamrup Rural & Sualkuchi Textile Corridor
- **Primary Trades**: Handloom Silk Weaving (Muga/Eri), Bamboo Architecture, Wood Carving.
- **Community Anchors**: Sualkuchi Tant Silpa Samity, Hajo Brass & Bell Metal Artisans.
- **Focus**: Converting heritage master artisan reputation into verifiable civic tiers (Civic Tier 7 - Master Artisan).

#### 3. Nagaon & Darrang Agricultural-Mechanical Belt
- **Primary Trades**: Submersible Pump Repair, Drip Irrigation Plumbing, Tractor Diesel Overhaul, Cold Storage HVAC.
- **Anchor Partner**: Nagaon Polytechnic Institute, Mangaldai Skill Training Center.

#### 4. Sonitpur (Tezpur) & Udalguri BTR Corridor
- **Primary Trades**: Tea Factory Electrical Maintenance, Welding & Structural Metalcraft, Masonry.
- **Community Anchors**: Assam Chah Mazdoor Sangha (ACMS) vocational cells, Tezpur ITI.

---

## 3. Physical Community Touchpoints & Worker Activation Playbook

Online performance marketing fails in the informal sector. Workers adopt tools through trusted physical and social touchpoints:

### Touchpoint 1: Naka Chowk Morning Demonstrations (6:30 AM – 8:30 AM)
- Operations teams set up a mobile demo kiosk with an acoustic windscreen mic and thermal QR identity card printer.
- A volunteer master electrician (e.g. Deepak Kalita from the pilot cohort) demonstrates speaking in Assamese:
  `"মই ১২ বছৰ ধৰি বেলতলাত ৱায়াৰিং আৰু চাবমাৰ্চিবল পাম্পৰ কাম কৰি আছো..."`
- Within 45 seconds, his generated digital skill card and camera-scannable QR code are displayed and printed.
- Workers witness immediate tangible utility: their skills are codified without requiring a written exam or paper CV.

### Touchpoint 2: Hardware Store Referral Network
- Informal workers visit neighborhood electrical and sanitary hardware stores daily for materials.
- Store owners are onboarded as trusted referral nodes. When homeowners ask store owners for "a reliable electrician", store owners point to the printed KAAMSETU QR roster on the counter.
- Hardware merchants receive zero kickbacks (preserving trust); instead, they benefit because verified workers bring repeat commercial trade.

### Touchpoint 3: Physical Sovereign NFC / PVC Skill Cards (₹99 Option)
- While the digital profile is permanently free, field research proves informal workers treasure a **physical credential card** carrying the Ashok-inspired Sovereign Trust design, photo, trade, and QR code.
- PVC smart cards are produced on durable 0.8mm waterproof plastic with embedded NTAG213 NFC chips. Tapping the card against any smartphone instantly opens the worker's live cryptographic verification dossier.
