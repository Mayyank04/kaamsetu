# KAAMSETU — PHASE 42 AUDIT DOSSIER 06
# NATIONWIDE WORKER DISCOVERY REPORT

**Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Endpoint:** `GET /api/workers` & Client Route `/explore`  
**Discovery Scope:** All 28 States & 8 Union Territories  
**Status:** `VERIFIED WORKING`  

---

## 1. Discovery Architecture

In Phase 42, worker discovery was upgraded from a localized single-city query into a nationwide multi-tier search engine capable of filtering by:
- **State / Union Territory:** Full dropdown supporting all 36 Indian administrative entities.
- **District:** Dynamically populated based on the selected state.
- **City / Metro Hub:** Major urban economic clusters.
- **6-Digit Postal PIN Code:** Exact locality precision.
- **Trade Category:** 22 vocational professions across 6 sectors.
- **Specialized Skills:** Granular competencies (e.g. "3-Phase Inverters", "BMS Diagnostics", "Large Format Tile Cutting").
- **Experience Bracket:** 3+, 5+, 10+, 15+ years.
- **Availability State:** `available` for direct hire or `on_site`.

---

## 2. API Specification: `GET /api/workers`

### Query Parameters

| Parameter | Type | Required | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `search` | `string` | Optional | Free-text keyword query matching name, bio, craft, or city | `Solar` |
| `state` | `string` | Optional | State or Union Territory name | `Assam` |
| `district` | `string` | Optional | Official census district | `Kamrup Metropolitan` |
| `city` | `string` | Optional | Urban center or municipality | `Guwahati` |
| `pincode` | `string` | Optional | 6-digit postal PIN code | `781001` |
| `category` | `string` | Optional | Profession category slug | `electrical-solar` |
| `skill` | `string` | Optional | Granular competency name | `3-Phase Inverters` |
| `minExp` | `number` | Optional | Minimum years of trade experience | `5` |
| `availability`| `string` | Optional | `all` \| `available` \| `on_site` | `available` |
| `limit` | `number` | Optional | Results per page (default: 24) | `24` |
| `offset` | `number` | Optional | Pagination offset (default: 0) | `0` |

### Sample Response Envelope

```json
{
  "success": true,
  "data": [
    {
      "id": "33333333-3333-3333-3333-333333330001",
      "registryId": "IN-RJ-2026-4029-KS",
      "fullName": "Rameshwar Sharma",
      "headline": "Master Industrial Electrician & Rooftop Solar Grid Specialist",
      "city": "Jaipur",
      "state": "Rajasthan",
      "pincode": "302001",
      "yearsExperience": 14,
      "kaamScore": { "totalScore": 842, "level": 4, "tier": "Sovereign Master" },
      "subTrades": ["3-Phase Inverters", "Rooftop Solar Array", "DISCOM Safety Earthing"],
      "availabilityStatus": "available",
      "isPublished": true
    }
  ],
  "meta": {
    "total": 1,
    "filters": {
      "state": "Rajasthan",
      "city": "Jaipur",
      "categorySlug": "electrical-solar"
    }
  }
}
```

---

## 3. UI/UX Verification: `/explore`

The `/explore` page was refactored with the following design enhancements:
1. **Responsive 7-Column Filter Grid:** Scales gracefully from a 1-column vertical stack on mobile (320px–390px) to a compact multi-column layout on desktop (1440px).
2. **Dependent Dropdown State Machine:** Selecting a State instantly recalculates and populates the District dropdown. Selecting "All States & UTs" disables the District selector with a helpful prompt.
3. **No Slop Visual Polish:** Solid `#F7F5F0` warm ivory card backgrounds, `#153E35` deep forest green headers, tactile hairline borders (`border-forest/20`), and zero decorative glowing blur blobs.
