# KAAMSETU — PHASE 36.1 HUMANIZED COPY AUDIT

**Programme:** KAAMSETU Digital Identity & Worker Empowerment Platform  
**Workstream:** Phase 36.1 — Copywriting Humanization & Editorial Discipline  
**Skill Reference:** `.agent/skills/humanizer/SKILL.md`  
**Governing Standard:** Antigravity Global Agent Instructions & Anti-AI-Slop Directive  
**Date:** 16 November 2026  

---

## 1. Editorial Mission & Humanizer Principles

The informal craftspeople of India—joiners, master weavers, electricians, plumbers, masons—have historically been patronized by corporate tech platforms as "leads", "gig workers", or "commoditized capacity". 

Under KAAMSETU's governing mission:
> *"Every skill deserves to be seen, even without a degree."*

All product text, micro-copy, onboarding instructions, error notifications, and legal terms must reflect **Tactile Dignity, Plain Speech, and Uninflated Reality**.

---

## 2. Audit Against the 8 Common AI Writing Tells

### Tell 1: Not-X-But-Y Rhetorical Contrasts
- **Definition:** AI models frequently use artificial contrasts (e.g. *"Not a platform, but a movement"* or *"Not just an identity, but sovereign freedom"*).
- **Audit Finding:** Audited across `src/app/page.tsx`, `src/app/about/page.tsx`, and `src/app/how-it-works/page.tsx`. Zero instances found.
- **Enforced Standard:** Statements describe the platform directly: *"Build a verified profile around the craft you practice—electrician, carpenter, plumber or technician. Share your work with customers and contractors."*

### Tell 2: Forced Triads (3-Part Bullet Stacks)
- **Definition:** AI models uniformly force every argument into sets of three parallel bullet points.
- **Audit Finding:** Inspected across all feature descriptions.
- **Enforced Standard:** Features use domain-authentic grouping (e.g., 4 steps for onboarding, 2 parties in direct contracting, 12 sections in terms of service).

### Tell 3: One-Line Chatbot Closers
- **Definition:** Cheesy summary sentences tacked onto the end of paragraphs (e.g. *"Because your future is worth building"* or *"Welcome to the revolution"*).
- **Audit Finding:** Several modal dialogs contained conversational closers.
- **Remediation:** Removed completely. Replaced with direct operational action labels ("Confirm Booking", "Save Changes", "Send OTP").

### Tell 4: Startup Marketing Hype & Buzzwords
- **Definition:** Words like "revolutionize", "game-changing", "seamless", "synergy", "cutting-edge", "unleash".
- **Audit Finding:** Previous phrases like `"VOICE-ATTESTED AI"` were present in `skills-manager.tsx`.
- **Remediation:** Replaced with clear, factual language: `"VOICE ATTESTATION"`. Verified that no promotional marketing buzzwords exist in public copy.

### Tell 5: Stock AI Words & Filler Phrases
- **Definition:** "In today's fast-paced digital world", "delve into", "tapestry", "beacon of hope".
- **Audit Finding:** Completely absent from all narrative sections.
- **Enforced Standard:** Grounded descriptions of real Indian vocational trades, NSQF levels, NCO 2015 taxonomy, and urban municipal pilots (Guwahati Urban and Shillong Urban).

### Tell 6: Em Dash (`—`) Overuse
- **Definition:** AI models frequently insert em dashes in UI badges and labels where colons or parentheticals are standard.
- **Audit Finding:** `src/components/onboarding/extraction-editor.tsx` contained *"Trade suggestion — review and edit"*.
- **Remediation:** Normalized to colon: *"Trade suggestion: review and edit"*.

### Tell 7: Fabricated Social Proof & Testimonials
- **Definition:** Artificial testimonials with corporate titles or generic smiling stock photos.
- **Audit Finding:** Verified that zero fake testimonials exist in `src/app/` or `src/components/`. All reviews are linked to cryptographically confirmed completed bookings.

### Tell 8: Robotic Error & Rate Limit Messaging
- **Definition:** Raw variable dumps or machine-code exceptions shown to users.
- **Audit Finding:** Previous rate limiter failures exposed internal variable names.
- **Remediation:** Replaced with respectful, calm messaging: *"We're temporarily unable to process this request. Please try again shortly."*

---

## 3. Key Humanized Copy Revisions

| Surface | Previous Phrasing | Humanized Revision | Rationale |
|---|---|---|---|
| Skill Editor Badge | `Trade suggestion — review and edit` | `Trade suggestion: review and edit` | Eliminates em dash punctuation tell |
| Skill Manager Header | `VOICE-ATTESTED AI` | `VOICE ATTESTATION` | Removes corporate AI buzzword |
| Login Error Message | `FATAL SECURITY CONFIGURATION: RATE_LIMIT_HMAC_SECRET is missing...` | `We're temporarily unable to process this request. Please try again shortly.` | Respectful, safe, zero variable leakage |
| Terms of Service Intro | *N/A (Missing)* | `KAAMSETU is a digital skill infrastructure and professional recognition platform designed for India's vocational workforce...` | Clear, plain-language institutional scope |
| Privacy Policy Scope | *N/A (Missing)* | `KAAMSETU never stores raw 12-digit Aadhaar numbers on any database...` | Direct cryptographic guarantee |

---

## 4. Vernacular & Multilingual Respect

All copy across the platform accounts for multi-script rendering in Hindi (`हिन्दी`), Assamese (`অসমীয়া`), and English. Typography tokens maintain generous line heights (`leading-relaxed` or `leading-normal`) to ensure that Devanagari vowel matras and conjuncts render without vertical clipping.
