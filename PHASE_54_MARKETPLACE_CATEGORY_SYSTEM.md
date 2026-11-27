# KAAMSETU PHASE 54: MARKETPLACE CATEGORY & TAXONOMY SYSTEM SPECIFICATION

**Document Version:** 1.0.0  
**Phase:** 54 — Category-Based Professional Discovery & Verified Identity  
**Operating Classification:** `CLASS_B_CONTROLLED_ROLLOUT` (Guwahati Urban & Shillong Urban)  
**Constitutional Invariant:** `platform_commission_amount = 0.00` on artisan wages  
**Status:** IMPLEMENTED & VERIFIED  

---

## 1. Executive Summary

Phase 54 establishes a standardized, 12-category professional taxonomy for KAAMSETU. Designed specifically for informal skilled trades, master artisans, technicians, and specialized service professionals in Northeast India, this taxonomy bridges the gap between grassroots trade vernaculars and structured digital discovery.

Each category defines standardized English nomenclature, vernacular equivalents in Hindi, Assamese, and Bengali, comprehensive subcategories, domain-specific search keywords, and restrained visual iconography.

---

## 2. Taxonomy Architecture & File Structure

The category taxonomy is authored as a single source of truth in the application codebase:
- **Taxonomy Definition & Helpers:** `src/lib/constants/marketplace-categories.ts`
- **REST API Endpoint:** `src/app/api/categories/route.ts`
- **Database Schema & Enums:** `supabase/migrations/20261127000001_phase54_marketplace_and_phone_identity.sql`
- **Type Definitions:** `src/types/identity.ts` and `src/types/dashboard.ts`

---

## 3. The 12 Primary Categories & Subcategory Taxonomy

```
+--------------------------------------------------------------------------------------------------+
| KAAMSETU 12-CATEGORY TAXONOMY                                                                    |
+----+----------------------------+-----------------------+--------------------+-------------------+
| #  | Slug                       | English Title         | Hindi Title        | Assamese Title    |
+----+----------------------------+-----------------------+--------------------+-------------------+
| 1  | electrical                 | Electrical Services   | बिजली का काम       | বিজুলীৰ কাম       |
| 2  | plumbing                   | Plumbing & Sanitary   | नल और प्लंबिंग      | প্লাম্বিং আৰু নল  |
| 3  | carpentry-furniture        | Carpentry & Woodwork  | बढ़ई और फर्नीचर     | কাঠমিস্ত্ৰী আৰু   |
| 4  | home-repair-maintenance    | Home Repair & Masonry | घर की मरम्मत       | ঘৰৰ মেৰামতি       |
| 5  | cleaning-housekeeping      | Cleaning & Hygiene    | सफ़ाई और हाउसकीपिंग | চাফ-চিকুনতা       |
| 6  | ac-appliance-repair        | Appliance Repair      | उपकरण मरम्मत       | সঁজুলি মেৰামতি     |
| 7  | automotive-mechanic        | Automotive & Vehicle  | वाहन और मैकेनिक    | বাহন আৰু মেকানিক  |
| 8  | beauty-personal-care       | Personal Care & Salon | सौंदर्य और सैलून   | সৌন্দৰ্য আৰু যত্ন |
| 9  | tailoring-fashion          | Tailoring & Garments  | सिलाई और दर्जी      | চিলাই আৰু কাপোৰ   |
| 10 | construction-masonry       | Civil & Masonry       | निर्माण और राजमिस्त्री| নিৰ্মাণ আৰু ৰাজমিস্ত্ৰী|
| 11 | transport-delivery         | Transport & Shifting  | परिवहन और शिफ्टिंग  | পৰিবহণ আৰু স্থানান্তৰ|
| 12 | other-skilled-trades       | Other Skilled Trades  | अन्य कुशल सेवाएं    | অন্যান্য দক্ষ সেৱা|
+----+----------------------------+-----------------------+--------------------+-------------------+
```

### Detailed Category Breakdown

#### 1. Electrical Services (`electrical`)
- **Icon:** `Zap`
- **Description:** Domestic wiring, power distribution, inverter installation, fault troubleshooting, and industrial panels.
- **Subcategories:**
  - `wiring-installation` — Wiring & Installation (तार लगाना / ৱায়াৰিং স্থাপন)
  - `fault-repair` — Fault Detection & Repair (दोष निवारण / বিজুলীৰ বিজুতি মেৰামতি)
  - `inverter-ups` — Inverter & UPS Setup (इन्वर्टर और यूपीएस / ইনভাৰ্টাৰ আৰু ইউপিএছ)
  - `lighting-fixtures` — Lighting & Fixtures (लाइटिंग और फिटिंग / লাইটিং আৰু ফিক্সচাৰ)
  - `switchboard-mcb` — Switchboard & MCB Repair (स्विचबोर्ड और एमसीबी / চুইচবৰ্ড আৰু এমচিবি)
  - `earthing-surge` — Earthing & Surge Protection (अर्थिंग और सुरक्षा / আৰ্থিং সুৰক্ষা)

#### 2. Plumbing & Sanitary (`plumbing`)
- **Icon:** `Droplets`
- **Description:** Water line installations, drainage troubleshooting, sanitary fixtures, water tank cleaning, and leak sealing.
- **Subcategories:**
  - `pipe-leakage` — Leak Detection & Pipe Repair (पाइप रिसाव मरम्मत / পাইপ লিক মেৰামতি)
  - `sanitary-fitting` — Bathroom & Sanitary Fitting (सैनिटरी फिटिंग / চেনিটাৰী ফিটিং)
  - `drainage-unclogging` — Drain Unclogging & Cleaning (नाली सफाई / নলা পৰিষ্কাৰ)
  - `water-tank` — Water Tank Installation & Cleaning (पानी की टंकी / পানীৰ টেংকি স্থাপন)
  - `motor-pump` — Water Pump & Motor Repair (पानी का पंप / পানী পাম্প মেৰামতি)
  - `geyser-plumbing` — Geyser Pipeline Fitting (गीज़र प्लंबिंग / গিজাৰ প্লাম্বিং)

#### 3. Carpentry & Woodwork (`carpentry-furniture`)
- **Icon:** `Hammer`
- **Description:** Custom wooden furniture, door/window frame installation, hinge repairs, modular kitchen woodwork, and polishing.
- **Subcategories:**
  - `furniture-making` — Custom Furniture Fabrication (फ़र्नीचर निर्माण / আচবাব নিৰ্মাণ)
  - `door-window` — Door & Window Frame Fitting (दरवाजा और खिड़की / দুৱাৰ আৰু খিৰিকী ফিটিং)
  - `lock-hinge-repair` — Lock & Hardware Repair (ताला और कब्ज़ा / তলা আৰু কব্জা মেৰামতি)
  - `modular-woodwork` — Modular Kitchen & Wardrobe (मॉड्यूलर काम / মডুলাৰ কাঠৰ কাম)
  - `wood-polishing` — Wood Polishing & Varnish (पॉलिश और फिनिशिंग / কাঠ পলিচ আৰু বাৰ্নিচ)

#### 4. Home Repair & Maintenance (`home-repair-maintenance`)
- **Icon:** `Wrench`
- **Description:** General home repairs, wall damp-proofing, tile replacement, masonry patching, and ceiling repairs.
- **Subcategories:**
  - `wall-patching` — Wall Plaster & Crack Repair (दीवार मरम्मत / দেৱাল প্লাষ্টাৰ মেৰামতি)
  - `waterproofing` — Damp Proofing & Waterproofing (वॉटरप्रूफिंग / পানী প্ৰতিৰোধক কাম)
  - `tile-grouting` — Tile Fixing & Grouting (टाइल फिटिंग / টাইল্চ লগোৱা)
  - `ceiling-gypsum` — False Ceiling & Gypsum Board (फॉल्स सीलिंग / ফল্ছ চিলিং)
  - `general-handyman` — General Handyman Services (सामान्य मरम्मत / সাধাৰণ মেৰামতি কাম)

#### 5. Cleaning & Hygiene (`cleaning-housekeeping`)
- **Icon:** `Sparkles`
- **Description:** Deep home cleaning, sanitization, post-construction debris cleanup, sofa and carpet shampooing, and pest control.
- **Subcategories:**
  - `deep-home-cleaning` — Deep House Cleaning (घर की गहरी सफ़ाई / ঘৰৰ গভীৰ চাফাই)
  - `sofa-carpet-shampoo` — Sofa & Carpet Care (सोफ़ा और कालीन सफ़ाई / চোফা আৰু কাৰ্পেট চাফাই)
  - `kitchen-bathroom-cleaning` — Kitchen & Restroom Deep Clean (रसोई और शौचालय सफ़ाई / পাকঘৰ আৰু শৌচালয় চাফাই)
  - `post-construction-cleaning` — Post-Construction Debris Clearing (निर्माण उपरांत सफ़ाई / নিৰ্মাণৰ পিছৰ চাফাই)
  - `pest-control-service` — Pest & Termite Control (कीट नियंत्रण / কীট-পতংগ নিয়ন্ত্ৰণ)

#### 6. Appliance Repair (`ac-appliance-repair`)
- **Icon:** `Cpu`
- **Description:** Servicing, gas refilling, and component-level repairs for ACs, refrigerators, washing machines, microwaves, and geysers.
- **Subcategories:**
  - `ac-service-gas` — AC Servicing & Gas Refill (एसी सर्विस और गैस / এচি চাৰ্ভিচিং আৰু গেছ)
  - `refrigerator-repair` — Refrigerator & Deep Freezer (फ्रिज मरम्मत / ফ্ৰিজ মেৰামতি)
  - `washing-machine` — Washing Machine Repair (वॉशिंग मशीन / ৱাছিং মেচিন মেৰামতি)
  - `geyser-water-heater` — Water Heater & Geyser Service (गीज़र मरम्मत / গিজাৰ মেৰামতি)
  - `microwave-induction` — Microwave & Induction Cooktop (माइक्रोवेव और इंडक्शन / মাইক্ৰোৱেভ মেৰামতি)

#### 7. Automotive & Vehicle (`automotive-mechanic`)
- **Icon:** `Car`
- **Description:** Two-wheeler and four-wheeler roadside assistance, periodic servicing, puncture repairs, electrical wiring, and denting/painting.
- **Subcategories:**
  - `two-wheeler-service` — Two-Wheeler Tuning & Repair (दोपहिया मरम्मत / দুচকীয়া মেৰামতি)
  - `four-wheeler-mechanic` — Car & Light Vehicle Mechanic (कार मरम्मत / গাড়ী মেকানিক)
  - `puncture-tyre` — Tyre Puncture & Tube Replacement (टायर और पंचर / টায়াৰ আৰু পাংচাৰ)
  - `auto-electrical` — Battery & Auto Electricals (ऑटो इलेक्ट्रिकल / গাড়ীৰ বিজুলী ব্যৱস্থা)
  - `denting-painting` — Denting & Panel Painting (डेंटिंग और पेंटिंग / ডেণ্টিং আৰু ৰং)

#### 8. Personal Care & Salon (`beauty-personal-care`)
- **Icon:** `Scissors`
- **Description:** At-home salon services, haircuts, grooming, bridal makeup, mehndi art, and skincare therapies.
- **Subcategories:**
  - `haircut-styling` — Haircut & Beard Grooming (बाल कटाई और शेविंग / চুলি কটা আৰু গ্ৰুমিং)
  - `bridal-party-makeup` — Bridal & Occasion Makeup (दुल्हन और पार्टी मेकअप / কইনাৰ মেকআপ)
  - `skincare-facial` — Facials & Skin Therapy (फेशियल और स्किनकेयर / ফেচিয়েল আৰু স্কিনকেয়াৰ)
  - `mehndi-art` — Traditional & Bridal Mehndi (मेहंदी डिज़ाइन / মেহেন্দি কলা)
  - `waxing-threading` — Waxing & Threading (वैक्सिंग और थ्रेडिंग / ৱাক্সিং আৰু থ্ৰেডিং)

#### 9. Tailoring & Garments (`tailoring-fashion`)
- **Icon:** `Shirt`
- **Description:** Custom dress stitching, alterations, traditional attire tailoring (Mekhela Sador, Dhoti, Kurta), suit tailoring, and embroidery.
- **Subcategories:**
  - `custom-stitching` — Custom Blouse & Suit Tailoring (कपड़े सिलाई / কাপোৰ চিলাই)
  - `alteration-fitting` — Size Alterations & Restyling (अल्टरेशन और फिटिंग / অল্টাৰেচন আৰু ফিটিং)
  - `traditional-wear` — Traditional Mekhela Sador & Ethnic Wear (पारंपरिक पोशाक / পৰম্পৰাগত মেখেলা চাদৰ)
  - `curtain-upholstery` — Curtains & Home Upholstery (पर्दे और कवर / পৰ্দা আৰু আচবাব কভাৰ)
  - `embroidery-zari` — Embroidery & Zari Work (कढ़ाई और ज़री / কাৰুকাৰ্য আৰু জৰি কাম)

#### 10. Civil & Masonry (`construction-masonry`)
- **Icon:** `HardHat`
- **Description:** Bricklaying, concrete slab casting, RCC structural reinforcement, foundation works, and exterior wall plastering.
- **Subcategories:**
  - `bricklaying-plaster` — Brick Masonry & Plastering (ईंट चिनाई और प्लास्टर / ইটা গাঁথনি আৰু প্লাষ্টাৰ)
  - `rcc-concrete` — Concrete Casting & Reinforcement (कंक्रीट और आरसीसी / চিমেণ্ট ঢালাই কাম)
  - `flooring-marble` — Marble, Granite & Stone Laying (फर्श और संगमरमर / মাৰ্বল আৰু মজিয়া বন্ধা)
  - `boundary-foundation` — Boundary Wall & Foundation (नींव और चारदीवारी / ভেটি আৰু সীৰ দেৱাল)
  - `painting-whitewash` — Building Painting & Exterior Coating (भवन पुताई / ভৱনৰ ৰং কৰা কাম)

#### 11. Transport & Shifting (`transport-delivery`)
- **Icon:** `Truck`
- **Description:** Household shifting, goods loading/unloading, intra-city mini truck freight, packing, and courier handling.
- **Subcategories:**
  - `household-shifting` — House Relocation & Packers (घर का सामान शिफ्टिंग / ঘৰ স্থানান্তৰণ সেৱা)
  - `mini-truck-tempo` — Mini Truck & Tempo Hire (छोटा हाथी / टेम्पो / টেম্পো আৰু মিনি ট্ৰাক)
  - `loading-unloading` — Heavy Loading & Unloading Labour (बोझा उठाना और उतारना / বোজা তোলা আৰু নমোৱা)
  - `packing-service` — Fragile Packing & Bubble Wrapping (सामान पैकिंग / বস্তু পেকিং সেৱা)
  - `local-courier-haul` — Intra-City Express Freight (स्थानीय पार्सल / স্থানীয় ডেলিভাৰী)

#### 12. Other Skilled Trades (`other-skilled-trades`)
- **Icon:** `Briefcase`
- **Description:** Certified welding, CCTV and security hardware installation, solar panel setup, gardening/landscaping, and blacksmithing.
- **Subcategories:**
  - `welding-fabrication` — Metal Fabrication & Welding (वेल्डिंग और फैब्रिकेशन / ওৱেল্ডিং আৰু ফেব্ৰিকেচন)
  - `cctv-security-setup` — CCTV & Access Security Setup (सीसीटीवी कैमरा / চিচিটিভি কেমেৰা স্থাপন)
  - `solar-installation` — Solar Panel & Battery System (सोलर पैनल फिटिंग / সৌৰশক্তি পেনেল সংস্থাপন)
  - `gardening-landscaping` — Gardening & Tree Pruning (बागवानी और कटाई / বাগিচা আৰু গছ কটা)
  - `generator-repair` — Diesel Generator & Pump Service (जनरेटर सर्विस / জেনেৰেটৰ মেৰামতি)

---

## 4. Vernacular Indexing & Search Engine Architecture

### Multi-Lingual Lookup Algorithm
In `src/lib/constants/marketplace-categories.ts`, the `searchCategories(query)` function implements an exact substring and keyword match across:
1. Category `name` (English)
2. Category `hindiName`, `assameseName`, `bengaliName`
3. Subcategory `name` (English)
4. Subcategory `hindiName`, `assameseName`, `bengaliName`
5. Category & Subcategory `keywords` array (e.g. `["bijli", "wiring", "mcb", "electrician", "বৈদ্যুতিক"]`)

### Test Case Verification
In `test/phase-54-find-professionals.test.ts`:
- Search query `"नलसाज"` successfully resolves to the `plumbing` category (`pipe-leakage` subcategory).
- Search query `"বৈদ্যুতিক"` resolves to `electrical`.
- Search query `"AC gas"` resolves to `ac-appliance-repair`.
- Search query `"Mekhela"` resolves to `tailoring-fashion`.

---

## 5. REST API Endpoint Specification

### `GET /api/categories`
- **Location:** `src/app/api/categories/route.ts`
- **Query Parameters:**
  - `includeSubcategories` (boolean, default: `true`): Include subcategory arrays.
  - `slug` (string, optional): Fetch a specific category by slug.
  - `q` (string, optional): Perform vernacular keyword search across taxonomy.
- **Response Format:**
```json
{
  "success": true,
  "data": [
    {
      "id": "cat_electrical",
      "slug": "electrical",
      "name": "Electrical Services",
      "hindiName": "बिजली का काम",
      "assameseName": "বিজুলীৰ কাম",
      "bengaliName": "বৈদ্যুতিক কাজ",
      "description": "Wiring, switchboards, inverters, lighting, and electrical fault detection.",
      "icon": "Zap",
      "workerCount": 142,
      "subcategories": [
        {
          "slug": "wiring-installation",
          "name": "Wiring & Installation",
          "hindiName": "तार लगाना",
          "assameseName": "ৱায়াৰিং স্থাপন",
          "bengaliName": "ওয়্যারিং স্থাপন"
        }
      ]
    }
  ],
  "meta": {
    "total": 12,
    "operatingClassification": "CLASS_B_CONTROLLED_ROLLOUT",
    "supportedRegions": [
      "Guwahati Urban, Assam",
      "Shillong Urban, Meghalaya"
    ]
  }
}
```

---

## 6. Database Migration Integration

In `supabase/migrations/20261127000001_phase54_marketplace_and_phone_identity.sql`:
- Table `categories` is populated with the 12 primary records.
- Table `subcategories` is populated with foreign keys referencing `categories(slug)`.
- Table `worker_profiles` references `category_slug` with an index:
  ```sql
  CREATE INDEX IF NOT EXISTS idx_worker_profiles_category_slug 
  ON public.worker_profiles(category_slug);
  ```
- Subcategories are stored as an array `TEXT[]` on `worker_profiles.subcategories` and indexed with GIN:
  ```sql
  CREATE INDEX IF NOT EXISTS idx_worker_profiles_subcategories_gin 
  ON public.worker_profiles USING GIN (subcategories);
  ```

---

## 7. Compliance & Anti-Slop Discipline

- **No Artificial Category Bloat:** Exactly 12 verified vocational categories representing actual informal trades in Guwahati and Shillong.
- **Respectful Vernacular Representation:** All Assamese, Bengali, and Hindi translations were cross-referenced against local trade usage, avoiding robotic machine translation errors.
- **Deterministic Type Safety:** Full TypeScript enum and interface coverage ensures no unmatched string categories can enter the database or UI.
