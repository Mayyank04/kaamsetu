# KAAMSETU — PHASE 41 NAVIGATION RECONSTRUCTION
**Document ID:** `DOC-P41-NAV-003`  
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Permanent Financial Invariant:** `platform_commission_amount = 0.00` on artisan wages  
**Status:** `VERIFIED WORKING`

---

## 1. Problem Statement & Root Cause

Prior to Phase 41, the navigation implementation in `src/components/layout/institutional-header.tsx` suffered from a severe breakpoint mismatch:
- Desktop navigation links container was styled with:
  ```html
  <nav className="hidden xl:flex items-center gap-6 text-sm font-semibold text-charcoal">
  ```
  (`xl:flex` triggers at `1280px` and above).
- The mobile hamburger button was styled with:
  ```html
  <button className="md:hidden flex h-10 w-10 ...">
  ```
  (`md:hidden` hides the button at `768px` and above).

### The Defect
For any viewport width between **768px and 1279px**:
- The hamburger button was hidden (`md:hidden`).
- The desktop links were hidden (`hidden xl:flex`).
- **Result:** Navigation completely vanished on all tablet screens (iPad 768px, iPad Pro 1024px, Surface Pro, Chromebooks, and laptops under 1280px).

---

## 2. Reconstructed Architectural Solution

The entire navigation system was unified around the `lg` (1024px) breakpoint:

```
Screen Width:     0px -------- 767px -------- 1023px -------- 1280px -------- 1920px
Old Nav Links:    [  HIDDEN  ] [   HIDDEN   ] [  HIDDEN  ] [      VISIBLE xl:flex    ]
Old Hamburger:    [ VISIBLE  ] [   HIDDEN   ] [  HIDDEN  ] [          HIDDEN         ]
                               ^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                 DEAD GAP: NO NAVIGATION!

New Nav Links:    [  HIDDEN  ] [   HIDDEN   ] [      VISIBLE lg:flex (1024px+)       ]
New Hamburger:    [       VISIBLE lg:hidden (<1024px)    ] [          HIDDEN         ]
                               ^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                ZERO GAP: FULL NAV ACCESS!
```

### Key Technical Implementation Details:
1. **Desktop Navigation Links:**
   ```tsx
   <nav className="hidden lg:flex items-center gap-4 xl:gap-6 text-xs xl:text-sm font-semibold text-charcoal">
   ```
2. **Mobile / Tablet Hamburger Button:**
   ```tsx
   <button
     type="button"
     onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
     className="lg:hidden flex h-10 w-10 items-center justify-center rounded-sm border border-forest/20 text-forest bg-card hover:bg-forest/5 focus:outline-none focus:ring-2 focus:ring-forest focus:ring-offset-1 transition-colors"
     aria-expanded={mobileMenuOpen}
     aria-controls="mobile-navigation"
     aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
   >
     {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
   </button>
   ```
3. **Background Body Scroll Lock:**
   ```tsx
   React.useEffect(() => {
     if (mobileMenuOpen) {
       const originalOverflow = document.body.style.overflow;
       document.body.style.overflow = "hidden";
       return () => {
         document.body.style.overflow = originalOverflow;
       };
     }
   }, [mobileMenuOpen]);
   ```
4. **Escape Key Dismissal:**
   ```tsx
   React.useEffect(() => {
     const handleKeyDown = (e: KeyboardEvent) => {
       if (e.key === "Escape" && mobileMenuOpen) {
         setMobileMenuOpen(false);
       }
     };
     window.addEventListener("keydown", handleKeyDown);
     return () => window.removeEventListener("keydown", handleKeyDown);
   }, [mobileMenuOpen]);
   ```
5. **Backdrop Overlay & Drawer Scroll Container:**
   - Backdrop overlay closes the menu on tap outside:
     ```tsx
     <div
       className="fixed inset-0 top-18 z-40 bg-forest-950/40 backdrop-blur-xs lg:hidden"
       onClick={() => setMobileMenuOpen(false)}
       aria-hidden="true"
     />
     ```
   - Drawer container constrained to viewport height with scrolling:
     ```tsx
     <div
       id="mobile-navigation"
       className="lg:hidden relative border-t border-forest/15 bg-card p-5 space-y-4 shadow-sovereign-md animate-in slide-in-from-top-2 z-50 max-h-[calc(100dvh-4.5rem)] overflow-y-auto"
     >
     ```

---

## 3. Verification & Proof

- Automated test `InstitutionalHeader uses lg breakpoint for desktop nav links and mobile drawer toggle` **PASSED**.
- Automated test `InstitutionalHeader implements accessibility and drawer lifecycle handlers` **PASSED**.
- Zero dead zones across viewports: 320px, 360px, 390px, 430px, 768px, 1024px, 1280px, 1440px, 1920px.
