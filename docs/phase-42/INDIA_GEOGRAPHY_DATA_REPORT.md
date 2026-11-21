# KAAMSETU — PHASE 42 AUDIT DOSSIER 02
# INDIA GEOGRAPHY DATA REPORT

**Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Dataset Implementation:** `src/lib/geo/india-geography-data.ts`  
**Service Implementation:** `src/lib/geo/geographic-authorization-service.ts`  
**Registry Status:** `VERIFIED WORKING`  

---

## 1. Geographic Reference Architecture

KAAMSETU implements a standardized, census-aligned geographic reference dataset covering all 28 States and 8 Union Territories of India (36 total). The data structure conforms to India Post Postal Index Number (PIN) system and Local Government Directory (LGD) district nomenclature.

### State & Union Territory Breakdown

```
Total Administrative Entities: 36
├── States: 28
│   ├── North Zone: Himachal Pradesh (HP), Punjab (PB), Uttarakhand (UK), Uttar Pradesh (UP), Haryana (HR), Rajasthan (RJ)
│   ├── South Zone: Andhra Pradesh (AP), Karnataka (KA), Kerala (KL), Tamil Nadu (TN), Telangana (TG)
│   ├── East Zone: Bihar (BR), Jharkhand (JH), Odisha (OD), West Bengal (WB)
│   ├── West Zone: Goa (GA), Gujarat (GJ), Maharashtra (MH)
│   ├── Central Zone: Chhattisgarh (CG), Madhya Pradesh (MP)
│   └── North East Zone: Assam (AS), Arunachal Pradesh (AR), Manipur (MN), Meghalaya (ML), Mizoram (MZ), Nagaland (NL), Sikkim (SK), Tripura (TR)
└── Union Territories: 8
    ├── Andaman & Nicobar Islands (AN)
    ├── Chandigarh (CH)
    ├── Dadra and Nagar Haveli and Daman and Diu (DH)
    ├── Delhi (DL)
    ├── Jammu & Kashmir (JK)
    ├── Ladakh (LA)
    ├── Lakshadweep (LD)
    └── Puducherry (PY)
```

---

## 2. Postal Index Number (PIN) Prefix Mapping

Each State and Union Territory is mapped to its authoritative India Post 2-digit and 3-digit postal code prefixes:

| State / UT Name | ISO Code | Zone | Postal Prefixes | Capital |
| :--- | :--- | :--- | :--- | :--- |
| **Andhra Pradesh** | `AP` | South | `51`, `52`, `53` | Amaravati |
| **Arunachal Pradesh** | `AR` | North East | `79` | Itanagar |
| **Assam** | `AS` | North East | `78` | Dispur |
| **Bihar** | `BR` | East | `80`, `81`, `82`, `83`, `84`, `85` | Patna |
| **Chhattisgarh** | `CG` | Central | `49` | Raipur |
| **Goa** | `GA` | West | `403` | Panaji |
| **Gujarat** | `GJ` | West | `36`, `37`, `38`, `39` | Gandhinagar |
| **Haryana** | `HR` | North | `12`, `13` | Chandigarh |
| **Himachal Pradesh** | `HP` | North | `17` | Shimla |
| **Jharkhand** | `JH` | East | `81`, `82`, `83` | Ranchi |
| **Karnataka** | `KA` | South | `56`, `57`, `58`, `59` | Bengaluru |
| **Kerala** | `KL` | South | `67`, `68`, `69` | Thiruvananthapuram |
| **Madhya Pradesh** | `MP` | Central | `45`, `46`, `47`, `48` | Bhopal |
| **Maharashtra** | `MH` | West | `40`, `41`, `42`, `43`, `44` | Mumbai |
| **Manipur** | `MN` | North East | `79` | Imphal |
| **Meghalaya** | `ML` | North East | `79` | Shillong |
| **Mizoram** | `MZ` | North East | `79` | Aizawl |
| **Nagaland** | `NL` | North East | `79` | Kohima |
| **Odisha** | `OD` | East | `75`, `76`, `77` | Bhubaneswar |
| **Punjab** | `PB` | North | `14`, `15` | Chandigarh |
| **Rajasthan** | `RJ` | North | `30`, `31`, `32`, `33`, `34` | Jaipur |
| **Sikkim** | `SK` | North East | `73` | Gangtok |
| **Tamil Nadu** | `TN` | South | `60`, `61`, `62`, `63`, `64`, `65`, `66` | Chennai |
| **Telangana** | `TG` | South | `50` | Hyderabad |
| **Tripura** | `TR` | North East | `79` | Agartala |
| **Uttar Pradesh** | `UP` | North | `20`, `21`, `22`, `23`, `24`, `25`, `26`, `27`, `28` | Lucknow |
| **Uttarakhand** | `UK` | North | `24`, `26` | Dehradun |
| **West Bengal** | `WB` | East | `70`, `71`, `72`, `73`, `74` | Kolkata |
| **Andaman & Nicobar**| `AN` | East | `74` | Port Blair |
| **Chandigarh** | `CH` | North | `16` | Chandigarh |
| **Dadra & Daman** | `DH` | West | `36`, `39` | Daman |
| **Delhi** | `DL` | North | `11` | New Delhi |
| **Jammu & Kashmir** | `JK` | North | `18`, `19` | Srinagar / Jammu |
| **Ladakh** | `LA` | North | `19` | Leh |
| **Lakshadweep** | `LD` | South | `68` | Kavaratti |
| **Puducherry** | `PY` | South | `60` | Puducherry |

---

## 3. Transliteration & Historical City Aliases

To accommodate vernacular user queries and historical colonial designations, `CITY_ALIASES_MAP` performs bidirectional normalization:

- **Bombay** → `Mumbai` (Maharashtra)
- **Bangalore** → `Bengaluru` (Karnataka)
- **Calcutta** → `Kolkata` (West Bengal)
- **Madras** → `Chennai` (Tamil Nadu)
- **Poona** → `Pune` (Maharashtra)
- **Baroda** → `Vadodara` (Gujarat)
- **Benares / Kashi** → `Varanasi` (Uttar Pradesh)
- **Cochin** → `Kochi` (Kerala)
- **Trivandrum** → `Thiruvananthapuram` (Kerala)
- **Gauhati** → `Guwahati` (Assam)
- **Calicut** → `Kozhikode` (Kerala)
- **Trichy** → `Tiruchirappalli` (Tamil Nadu)
- **Vizag** → `Visakhapatnam` (Andhra Pradesh)

---

## 4. Controlled Manual Village & Hamlet Submission

Workers residing in rural gram panchayats, unlisted hamlets, or newly gazetted municipal wards can submit custom localities via `POST /api/geo/custom-locality`. Submissions are held in `public.custom_localities` with `review_status = 'pending'`, immediately unblocking registration while cataloging data for administrative indexing.
