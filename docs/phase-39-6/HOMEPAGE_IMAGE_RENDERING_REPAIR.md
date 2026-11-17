# HOMEPAGE IMAGE RENDERING & LAYOUT HARDENING

**Document ID:** `KAAMSETU-DOC-39-6-04`  
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Status:** `VERIFIED LOCALLY`

---

## 1. Problem Description

On `localhost:3001`, the homepage was observed rendering a massive blurred image occupying almost the entire browser viewport. The underlying cause was traced to an unconstrained Next.js `<Image fill />` component nested inside an avatar container with undefined CSS dimensions (`h-18 w-18`), which caused the image to expand across the nearest positioned viewport container.

---

## 2. Engineering Remediation

### Component Hardening: `src/components/identity/professional-card.tsx`
The portrait wrapper was updated from fluid `fill` styling to explicit, intrinsic dimensions:

```tsx
// Before (Vulnerable to layout collapse):
<div className="relative h-18 w-18 min-w-[72px] min-h-[72px] shrink-0 overflow-hidden rounded-sm border-2 border-forest/15 bg-forest/5 shadow-xs">
  {professional.photoUrl ? (
    <Image
      src={professional.photoUrl}
      alt={`Dignified portrait of ${professional.fullName}, ${professional.primaryTrade}`}
      fill
      className="object-cover group-hover:scale-105 transition-transform duration-500"
      sizes="72px"
    />
  ) : ...}
</div>

// After (Hardened against any layout or CSS failure):
<div className="relative w-[72px] h-[72px] min-w-[72px] min-h-[72px] max-w-[72px] max-h-[72px] shrink-0 overflow-hidden rounded-sm border-2 border-forest/15 bg-forest/5 shadow-xs">
  {professional.photoUrl ? (
    <Image
      src={professional.photoUrl}
      alt={`Dignified portrait of ${professional.fullName}, ${professional.primaryTrade}`}
      width={72}
      height={72}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
    />
  ) : ...}
</div>
```

### Component Hardening: `src/components/identity/credential-dialog.tsx`
Identical dimension hardening was applied to the master credential dialog:

```tsx
<div className="relative w-[96px] h-[96px] min-w-[96px] min-h-[96px] max-w-[96px] max-h-[96px] rounded-sm overflow-hidden border-2 border-forest/20 shrink-0 bg-forest/5 shadow-sovereign-sm">
  <Image
    src={worker.photoUrl}
    alt={worker.fullName}
    width={96}
    height={96}
    className="w-full h-full object-cover"
  />
</div>
```

### Tailwind Configuration Extension
In `tailwind.config.ts`, explicit custom spacing was added to the theme extension scale:

```typescript
extend: {
  spacing: {
    13: "3.25rem", // 52px
    18: "4.5rem",  // 72px
  },
}
```

---

## 3. Rendered Output Verification

Verification against the active server on port 3001 via `curl -s http://localhost:3001`:

```html
<img alt="Dignified portrait of Rameshwar Sharma, Master Industrial Electrician &amp; Solar Installer" 
     loading="lazy" 
     width="72" 
     height="72" 
     decoding="async" 
     data-nimg="1" 
     class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
     style="color:transparent" ... />
```

The intrinsic attributes `width="72"` and `height="72"` ensure that even before CSS sheets are downloaded or in the event of partial network delivery, the image remains bounded to a 72px square.
