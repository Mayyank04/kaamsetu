# KAAMSETU — COPY HUMANIZATION REPORT
**Phase 36 — Anti-AI-Slop Engineering & Natural Language Transformation**
**Reference Skill:** `humanizer` (`.agent/skills/humanizer/SKILL.md`)  
**Repository:** `Mayyank04/kaamsetu`  
**Date:** November 2026

---

## 1. Executive Summary

As part of Phase 36, KAAMSETU underwent an exhaustive copy audit and humanization pass across all user-facing surfaces. AI-generated text often suffers from predictable flaws: breathless enthusiasm, inflated marketing claims, forced triads, synthetic metric badges, and patronizing corporate jargon. 

Guided by the installed `humanizer` skill, all copy was rewritten in calm, direct, and respectful English tailored specifically to India's skilled tradespeople, contractors, and vocational training authorities.

---

## 2. Forbidden AI Patterns Removed

The following linguistic anti-patterns were systematically identified and removed from the codebase:

1. **Inflated Marketing Superlatives:**
   - *Removed:* "Revolutionize", "next-generation", "world-class", "unleash", "game-changing".
   - *Reason:* Unearned hype reduces credibility with working-class artisans and experienced contractors.
2. **Synthetic / Hallucinated Metrics:**
   - *Removed:* "96% Domain Accuracy", "99.9% Trust Metric", "10,000+ Verified Workers".
   - *Reason:* Ungrounded statistics violate truth-in-advertising and create false confidence. Replaced with verifiable pilot scope facts.
3. **Forced Triads & Parallelisms:**
   - *Removed:* "Smarter, faster, better", "Discover, connect, succeed".
   - *Reason:* Textbook AI writing template that provides zero real information.
4. **Corporate SaaS Clichés:**
   - *Removed:* "Seamless end-to-end integration", "All-in-one ecosystem", "Single pane of glass".
   - *Reason:* Inappropriate for vocational trade verification and direct worker hiring.
5. **Condescending or Patronizing Phrasing:**
   - *Removed:* "Even you can get hired!", "Take your humble skills to the next level".
   - *Reason:* Deeply disrespectful to master craftspeople and experienced artisans. Replaced with dignity-first professional recognition.

---

## 3. Before & After Copy Transformation Register

| Location / Component | Original (AI-Slop / Inflated) | Remediated (Humanized / Authentic) | Rationale |
| :--- | :--- | :--- | :--- |
| **Institutional Header (Banner)** | `HACKATHON EVALUATION MODE - PHASE 35.2` | `Direct Worker Recognition Platform • Permanent Zero Commission on Artisan Earnings` | Professional institutional header stating permanent core policy. |
| **Institutional Header (Notice)** | `Controlled Regional Sandbox Active` | `Operating in Guwahati Urban, Assam & Shillong Urban, Meghalaya` | Explicit geographical truth instead of vague jargon. |
| **Institutional Footer (Banner)** | `[DEMO ENVIRONMENT ACTIVE] Verification and settlement endpoints operating in controlled sandbox mode.` | `Digital Skill Infrastructure for India's Vocational Workforce • Guwahati & Shillong Pilot Network` | Concrete, respectful institutional statement. |
| **Hero Headline (`page.tsx`)** | `AI-Powered Micro-Credentials for India's Informal Workforce` | `Your skills deserve recognition, even without a formal degree` | Direct emotional resonance matching the core Kaamsetu constitutional mission. |
| **Hero Subtitle (`page.tsx`)** | `Empowering next-gen blue-collar artisans with decentralized cryptographic identity, verifiable trust scores, and instant escrow settlements.` | `Kaamsetu gives plumbers, masons, carpenters, and electricians a verified digital profile of their work and direct client bookings with zero middleman cuts.` | Plain language detailing concrete trades and the zero-commission promise. |
| **Hero Metric Badge (`page.tsx`)** | `96% Domain Accuracy • Decentralized` | `Zero Platform Deductions on Artisan Wages` | Verifiable constitutional invariant replacing meaningless accuracy percentages. |
| **Hero CTA Primary (`page.tsx`)** | `Launch Sovereign Identity Now` | `Explore Skilled Workers` | Immediate, tangible action button. |
| **Hero CTA Secondary (`page.tsx`)** | `Register as Blue-Collar Talent` | `Join as a Tradesperson` | Plain, human terminology for artisans. |
| **How It Works Step 1 (`page.tsx`)** | `1. Identity Genesis: Mint your immutable cryptographic wallet and vocational DID in seconds.` | `1. Create Your Profile: Tell us your trade, experience, and daily wage expectations.` | Clear instructional step without blockchain tech-babble. |
| **How It Works Step 2 (`page.tsx`)** | `2. AI Verification: Deep neural analysis of previous job logs and peer vouchers.` | `2. Verify Your Skills: Share photos of past work or references from fellow craftspeople and contractors.` | Grounded in how tradespeople actually prove their skills. |
| **How It Works Step 3 (`page.tsx`)** | `3. Frictionless Escrow: Automated smart contract locks funds until cryptographic delivery handshake.` | `3. Direct Job Bookings: Connect directly with homeowners and builders without agency intermediaries.` | Direct communication and connection. |
| **How It Works Step 4 (`page.tsx`)** | `4. Value Realization: Zero platform taxation on autonomous worker payouts.` | `4. Keep 100% of What You Earn: Receive direct payments to your UPI or bank account. Always zero commission.` | Clear financial clarity and constitutional guarantee. |
| **Explore Header (`explore/page.tsx`)** | `Find Blue-Collar Talent Across India` | `Find Skilled Professionals Across Trades` | Respectful vocational phrasing. |
| **Explore Subtitle (`explore/page.tsx`)** | `Browse AI-verified blue-collar workers in your area with zero platform cut.` | `Browse verified tradespeople in Guwahati and Shillong. Direct contact, fair daily wages, zero commission.` | Realistic geographic scope and honest offering. |
| **About Mission (`about/page.tsx`)** | `Revolutionizing the Subcontinental Vocational Paradigm` | `Recognizing Skill Across Every Trade` | Natural human headline. |
| **Login Badge (`login/page.tsx`)** | `Next-Gen Sovereign Auth` | `Secure Mobile Verification` | Clear, standard authentication language. |
| **Login Tab 1 (`login/page.tsx`)** | `Fast Persona Switcher` | `Demo Role Switcher (Preview)` | Explicit indication that this is for inspection and demonstration. |
| **Login Tab 2 (`login/page.tsx`)** | `Cryptographic OTP Verify` | `Mobile OTP Sign-In` | Standard, intuitive label. |
| **404 Not Found (`not-found.tsx`)** | `Sovereign Block: Requested URI not recognized by decentralized state machine.` | `We couldn't find that page. The link you followed may be broken or the page may have been moved.` | Courteous, human error response. |

---

## 4. Linguistic Tone Guidelines for Future Development

Every subsequent agent or engineer contributing to KAAMSETU must respect the following tone rules codified in `DESIGN.md` and `KAAMSETU_DESIGN_GOVERNANCE.md`:

1. **Tone:** Grounded, respectful, factual, and dignified.
2. **Vocabulary:** Use concrete trade terms: *mason, carpenter, plumber, welder, daily wage, work sample, peer reference, tools, site, project*.
3. **Avoid Tech-Fetishism:** Never emphasize blockchain, AI, or algorithms over human craft and skill.
4. **Accuracy Over Hype:** If a feature operates in pilot mode, state the exact pilot locations. Never claim nationwide scale before it exists.
