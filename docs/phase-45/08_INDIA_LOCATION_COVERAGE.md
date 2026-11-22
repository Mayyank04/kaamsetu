# KAAMSETU — PHASE 45 AUDIT DOSSIER 08
# INDIA LOCATION COVERAGE & GEOGRAPHIC RESOLUTION REPORT

**Operating Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Administrative Entities:** 36 (28 States + 8 Union Territories)  
**Districts Covered:** 700+ Official Census & Postal Districts  
**Status:** `VERIFIED WORKING`

---

## 1. Canonical Location Hierarchy

KAAMSETU organizes geographic resolution across a strict 5-level hierarchy:

```text
India (National)
  └── State / Union Territory (36 Entities)
       └── District (700+ Districts in india-geography-data.ts)
            └── City / Town / Village / Hamlet
                 └── Postal PIN Code (6-Digit Validation)
```

---

## 2. Decoupled Capability Architecture

Geographical capabilities are strictly segregated between **Universal Sovereign Identity Rights** and **Controlled Physical Commercial Dispatch**:

```text
+----------------------------------------------------------------------------------------------------+
|                                  TIER 1: NATIONWIDE SOVEREIGN IDENTITY                             |
|                                     (Active in All 36 States & UTs)                                |
|                                                                                                    |
|  • Account Registration & Login (No OTP)          • Sovereign Worker Profile Creation              |
|  • W3C Verifiable Credential Minting             • Digital Skill Card & QR Verification           |
|  • Search & Discovery on /explore                • Direct Inquiries & Messaging                   |
|  • Contractor Opportunity Applications           • Zero Platform Commission (0.00%)               |
+--------------------------------------------------+-------------------------------------------------+
                                                   |
                                                   v
+----------------------------------------------------------------------------------------------------+
|                                TIER 2: CONTROLLED COMMERCIAL DISPATCH                              |
|                                     (CLASS_B_CONTROLLED_ROLLOUT)                                   |
|                                                                                                    |
|  Guwahati Urban Pilot Zone (Assam)                Shillong Urban Pilot Zone (Meghalaya)            |
|  PIN: 781001 – 781039                            PIN: 793001 – 793022                             |
|  • Direct Customer Service Bookings              • On-site Physical Dispatch & Work Orders        |
+----------------------------------------------------------------------------------------------------+
```

---

## 3. Unlisted Rural Village & Hamlet Architecture

To ensure rural workers from uncataloged villages are never excluded:
- When State and District are selected, users can pick a major city or select `"Other / Custom Locality"`.
- Selecting custom locality reveals a dedicated text field for their exact village, gram panchayat, ward, or colony name.
- Custom localities are queued in `custom_localities` for administrative cataloging and geographic clustering without blocking instant profile activation.
