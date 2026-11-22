# KAAMSETU — PHASE 42 AUDIT DOSSIER 8
# INDIA LOCATION COVERAGE & GEOGRAPHIC RESOLUTION REPORT

**Operating Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Administrative Entities Covered:** 36 (28 States + 8 Union Territories)  
**Districts Cataloged:** 700+ Official Census & Postal Districts  
**PIN Code Resolution:** 6-Digit Prefix Hierarchy Engine  
**Status:** `VERIFIED WORKING`

---

## 1. Administrative Jurisdiction Matrix

KAAMSETU maintains complete geographical coverage across all 36 Indian States and Union Territories in `src/lib/geo/india-geography-data.ts`:

### 28 States
1. Andhra Pradesh (AP)
2. Arunachal Pradesh (AR)
3. Assam (AS)
4. Bihar (BR)
5. Chhattisgarh (CG)
6. Goa (GA)
7. Gujarat (GJ)
8. Haryana (HR)
9. Himachal Pradesh (HP)
10. Jharkhand (JH)
11. Karnataka (KA)
12. Kerala (KL)
13. Madhya Pradesh (MP)
14. Maharashtra (MH)
15. Manipur (MN)
16. Meghalaya (ML)
17. Mizoram (MZ)
18. Nagaland (NL)
19. Odisha (OD)
20. Punjab (PB)
21. Rajasthan (RJ)
22. Sikkim (SK)
23. Tamil Nadu (TN)
24. Telangana (TS)
25. Tripura (TR)
26. Uttar Pradesh (UP)
27. Uttarakhand (UK)
28. West Bengal (WB)

### 8 Union Territories
1. Andaman and Nicobar Islands (AN)
2. Chandigarh (CH)
3. Dadra and Nagar Haveli and Daman and Diu (DN)
4. Delhi / National Capital Territory (DL)
5. Jammu and Kashmir (JK)
6. Ladakh (LA)
7. Lakshadweep (LD)
8. Puducherry (PY)

---

## 2. Decoupled Capability Architecture

Geographical capabilities are strictly segregated between **Universal Sovereign Identity Rights** and **Controlled Physical Commercial Dispatch**:

```text
+----------------------------------------------------------------------------------------------------+
|                                    TIER 1: UNIVERSAL NATIONWIDE RIGHTS                             |
|                                     (All 36 States & Union Territories)                            |
|                                                                                                    |
|   • Account Registration (No OTP)                 • Sovereign Worker Profile Creation              |
|   • W3C Verifiable Credential Minting             • Digital Skill Card & QR Verification           |
|   • Search & Discovery on /explore                • Direct Inquiries & Messaging                   |
|   • Contractor Opportunity Applications           • Zero Platform Commission (0.00%)               |
+--------------------------------------------------+-------------------------------------------------+
                                                   |
                                                   v
+----------------------------------------------------------------------------------------------------+
|                                 TIER 2: CONTROLLED COMMERCIAL DISPATCH                             |
|                                      (CLASS_B_CONTROLLED_ROLLOUT)                                  |
|                                                                                                    |
|   Guwahati Urban Pilot Zone (Assam)               Shillong Urban Pilot Zone (Meghalaya)            |
|   PIN: 781001 – 781039                            PIN: 793001 – 793022                             |
|   • Direct Customer Service Bookings              • On-site Physical Dispatch & Work Orders        |
+----------------------------------------------------------------------------------------------------+
```

---

## 3. Unlisted Rural Village & Locality Fallback

India contains over 600,000 villages and hamlets. To ensure no rural artisan is excluded because their village is omitted from a pre-compiled dropdown:
1. **Dynamic Custom Locality Architecture:** When an artisan selects their State and District, they can choose from pre-populated major cities/towns or select `"Other / Custom Locality"`.
2. **Text Field Ingestion:** Selecting custom locality reveals a dedicated text field for their exact village, gram panchayat, ward, or colony name.
3. **Database Audit Table (`custom_localities`):** Custom locality entries are persisted alongside the profile and queued for administrative cataloging and geographic clustering without blocking instant profile activation.

---

## 4. PIN Code Resolution Engine

The geographical engine provides bi-directional PIN validation:
- Validates 6-digit postal codes against state-level postal circles (e.g., `11xxxx` for Delhi, `78xxxx` for Assam, `40xxxx` for Maharashtra).
- Auto-suggests the corresponding State and District upon PIN entry to reduce manual typing for semi-literate users.
- Enforces strict Class B boundaries when customer booking workflows are initiated.
