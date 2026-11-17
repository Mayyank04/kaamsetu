# KAAMSETU — PHASE 39.5 HOMEPAGE RENDERING REPAIR SPECIFICATION

**Target Route:** `/` (`src/app/page.tsx`)  
**Components Inspected:** `InstitutionalHeader`, `InstitutionalFooter`, `SovereignCard`, `ProfessionalCard`  
**Status:** VERIFIED LOCALLY

---

## 1. Problem Analysis & Forensic Discovery

On `http://localhost:3001/`, an enlarged blurred image was displayed over the viewport instead of the intended layout.

### Root Cause
1. **Missing Tailwind Spacing Utilities:**
   `src/components/identity/professional-card.tsx` declared:
   ```tsx
   <div className="relative h-18 w-18 shrink-0 overflow-hidden rounded-sm border-2 border-forest/15 bg-forest/5 shadow-xs">
     <Image
       src={professional.photoUrl}
       fill
       sizes="72px"
       className="object-cover group-hover:scale-105 transition-transform duration-500"
     />
   </div>
   ```
   Neither `h-18` nor `w-18` (nor `h-13` used in buttons on the homepage and explore page) existed in the Tailwind default spacing scale. Consequently, no height or width CSS declarations were emitted for the portrait container.
2. **Next.js `<Image fill>` Behavior:**
   In Next.js, an `<Image fill />` applies `position: absolute; inset: 0; width: 100%; height: 100%`. When its immediate parent has an unconstrained dimensions (0px by 0px), the image can expand to the nearest positioned ancestor (such as the entire card or screen). When a 72px thumbnail is scaled across a large container with `object-fit: cover`, it renders as a heavily pixelated, blurred image.
3. **Missing `public/` Directory:**
   The workspace lacked a `public/` folder, causing asset lookups (`/favicon.ico`) to fail.

---

## 2. Technical Remediation

1. **Configured Tailwind Spacing Scale (`tailwind.config.ts`):**
   ```typescript
   extend: {
     spacing: {
       13: "3.25rem", // 52px (used for institutional CTA buttons)
       18: "4.5rem",  // 72px (used for artisan avatar containers)
     },
   }
   ```
2. **Hardened Container Boundaries (`src/components/identity/professional-card.tsx`):**
   ```tsx
   <div className="relative h-18 w-18 min-w-[72px] min-h-[72px] shrink-0 overflow-hidden rounded-sm border-2 border-forest/15 bg-forest/5 shadow-xs">
   ```
3. **Scaffolded Public Assets:**
   Created `public/` directory with `favicon.ico`.

---

## 3. Visual Verification

The homepage at `http://localhost:3001/` renders all sections with crisp 1px hairline borders:
- **Section 2:** Hero with narrative, trust index (300–900), ₹0.00 commission badge, and Sovereign Card preview.
- **Section 4:** Vocational trade taxonomy discovery with search filter and trade badges.
- **Section 5:** 4-step voice-to-credential explanation.
- **Section 6:** Featured Professionals grid with properly proportioned 72px avatar thumbnails.
- **Section 7:** Three core pillars of direct worker recognition.
- **Section 8:** Digital Public Infrastructure trust architecture (DigiLocker, UPI, QR).
- **Section 9:** PLFS workforce impact metrics and final onboarding CTA.
