"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  Award,
  Mic,
  Search,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  Layers,
  Zap,
  Hammer,
  Wrench,
  Cpu,
  Building2,
  Users,
  TrendingUp,
  FileText,
  BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SovereignCard } from "@/components/identity/sovereign-card";
import { ProfessionalCard } from "@/components/identity/professional-card";
import { KaamScoreGauge } from "@/components/identity/kaamscore-gauge";
import { PROFESSIONS_DATA } from "@/lib/data/professions";
import { FEATURED_PROFESSIONALS } from "@/lib/data/professionals";

export default function HomePage() {
  const [selectedTradeSlug, setSelectedTradeSlug] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  // Filtered categories for profession discovery
  const filteredProfessions = PROFESSIONS_DATA.filter((p) => {
    if (selectedTradeSlug !== "all" && p.slug !== selectedTradeSlug) return false;
    if (
      searchQuery.trim() &&
      !p.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !p.hindiTitle.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !p.popularSkills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-24 pb-24 overflow-x-hidden">
      {/* =========================================================================
          SECTION 2: HERO SECTION
          Headline: "Every skill deserves to be seen."
          Two CTAs: "Create Your Identity" and "Find a Professional"
         ========================================================================= */}
      <section className="relative overflow-hidden border-b border-forest/15 bg-gradient-to-b from-[#FFFFFF] via-[#F7F5F0] to-[#E9EFEA]/40 pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="absolute inset-0 bg-paper-grid opacity-35 pointer-events-none" />

        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Hero Narrative */}
            <div className="lg:col-span-7 space-y-6">
              {/* Sovereign Sub-badge */}
              <div className="inline-flex items-center gap-2 rounded-xs bg-forest/10 px-3.5 py-1.5 border border-forest/20 text-xs font-bold text-forest uppercase tracking-wider shadow-2xs">
                <ShieldCheck className="h-4 w-4 text-forest" />
                <span>India's Sovereign Digital Workforce Infrastructure</span>
              </div>

              {/* Required Exact Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-forest leading-[1.1]">
                Every skill deserves to be seen.
              </h1>

              {/* Subtitle with Institutional Tone */}
              <p className="text-lg sm:text-xl text-charcoal-muted leading-relaxed max-w-2xl font-normal">
                450 million skilled Indian craftspeople power the nation without proof of craft.
                KAAMSETU bridges informal expertise with sovereign institutional trust—translating
                spoken vernacular claims into unforgeable, DigiLocker-linked credentials.
              </p>

              {/* Section 3: Two Required CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-3">
                <Button
                  variant="default"
                  size="lg"
                  asChild
                  className="bg-forest hover:bg-forest-500 text-ivory shadow-sovereign-sm h-13 px-8 text-base font-semibold"
                >
                  <Link href="/onboarding">
                    <Mic className="mr-2.5 h-5 w-5 text-sand" />
                    Create Your Identity
                  </Link>
                </Button>

                <Button
                  variant="secondary"
                  size="lg"
                  asChild
                  className="bg-sand/30 hover:bg-sand/50 text-forest border border-forest/20 h-13 px-8 text-base font-semibold"
                >
                  <Link href="/explore">
                    <Search className="mr-2.5 h-5 w-5 text-forest" />
                    Find a Professional
                  </Link>
                </Button>
              </div>

              {/* Institutional Assurance Strip */}
              <div className="pt-8 border-t border-forest/15 grid grid-cols-3 gap-6 max-w-xl">
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-forest">300–900</div>
                  <div className="text-xs text-charcoal-muted mt-0.5">KAAMSCORE™ Trust Index</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-forest">100%</div>
                  <div className="text-xs text-charcoal-muted mt-0.5">DigiLocker & Aadhaar VID</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-forest">12+</div>
                  <div className="text-xs text-charcoal-muted mt-0.5">Indian Vernacular Dialects</div>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Anchor (Sovereign Credential Card Preview) */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md">
                {/* Visual accent backdrop */}
                <div className="absolute -inset-2 bg-gradient-to-tr from-sand/30 via-sage/10 to-transparent rounded-lg blur-lg -z-10" />
                <SovereignCard worker={FEATURED_PROFESSIONALS[0]} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: PROFESSION DISCOVERY
         ========================================================================= */}
      <section id="professions" className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-forest/15 pb-6">
          <div className="space-y-2">
            <Badge variant="verified">National Taxonomy</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-forest">
              Discover Certified Master Crafts
            </h2>
            <p className="text-sm text-charcoal-muted max-w-xl">
              Categorized according to NSQF and Ministry of Skill Development standards.
              Each profession is backed by verifiable on-chain attestations.
            </p>
          </div>

          <Button variant="outline" asChild className="shrink-0 border-forest/20 text-forest">
            <Link href="/explore">
              View All 32 National Trades
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Discovery Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-muted" />
            <input
              type="text"
              placeholder="Search trade (e.g. Solar, Joinery, Banarasi Weaving)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-sm border border-forest/20 bg-card text-sm focus:outline-none focus:border-forest focus:ring-1 focus:ring-forest"
            />
          </div>

          <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
            <button
              onClick={() => setSelectedTradeSlug("all")}
              className={`px-3 py-1.5 rounded-xs text-xs font-semibold uppercase tracking-wider transition-colors ${
                selectedTradeSlug === "all"
                  ? "bg-forest text-ivory"
                  : "bg-card border border-forest/15 text-charcoal-muted hover:text-forest"
              }`}
            >
              All Trades
            </button>
            {PROFESSIONS_DATA.slice(0, 4).map((p) => (
              <button
                key={p.slug}
                onClick={() => setSelectedTradeSlug(p.slug)}
                className={`px-3 py-1.5 rounded-xs text-xs font-semibold tracking-wider transition-colors ${
                  selectedTradeSlug === p.slug
                    ? "bg-forest text-ivory"
                    : "bg-card border border-forest/15 text-charcoal-muted hover:text-forest"
                }`}
              >
                {p.title.split("&")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Profession Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredProfessions.map((prof) => (
            <div
              key={prof.id}
              className="rounded-md border border-forest/15 bg-card p-5 hover:border-forest/40 hover:shadow-sovereign-sm transition-all duration-200 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xs bg-sand/25 text-forest border border-sand/40">
                    <Sparkles className="h-5 w-5 text-forest" />
                  </div>
                  <span className="text-[11px] font-bold text-sage">
                    {prof.workerCount.toLocaleString("en-IN")} Verified
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-forest text-base leading-snug">
                    {prof.title}
                  </h3>
                  <span className="text-xs text-charcoal-muted font-medium block mt-0.5">
                    {prof.hindiTitle}
                  </span>
                </div>

                <p className="text-xs text-charcoal-muted leading-relaxed line-clamp-2">
                  {prof.description}
                </p>

                <div className="flex flex-wrap gap-1 pt-1">
                  {prof.popularSkills.slice(0, 2).map((skill, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded-xs bg-forest/5 text-forest border border-forest/10"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-forest/10 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-charcoal-muted block">Avg Daily Earning</span>
                  <strong className="text-forest">
                    ₹{prof.averageDailyRate.min} – ₹{prof.averageDailyRate.max}
                  </strong>
                </div>
                <Link
                  href={`/explore?category=${prof.slug}`}
                  className="font-bold text-forest hover:text-forest-500 inline-flex items-center text-xs"
                >
                  Explore <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: HOW IT WORKS
         ========================================================================= */}
      <section id="how-it-works" className="border-y border-forest/15 bg-gradient-to-b from-[#F7F5F0] via-[#EFF5F0] to-[#F7F5F0] py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <Badge variant="sovereign">Sovereign Trust Pipeline</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-forest">
              From Spoken Word to Unforgeable Credential
            </h2>
            <p className="text-sm sm:text-base text-charcoal-muted leading-relaxed">
              We eliminate paper friction and digital illiteracy barriers.
              Four institutional steps translate hands-on craftsmanship into sovereign economic power.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="rounded-md border border-forest/15 bg-card p-6 shadow-xs space-y-4 relative">
              <div className="flex items-center justify-between">
                <span className="font-mono text-2xl font-black text-sand-700">01</span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xs bg-forest text-sand">
                  <Mic className="h-5 w-5" />
                </div>
              </div>
              <h3 className="font-bold text-forest text-lg">
                Speak in Any Dialect
              </h3>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                Workers speak naturally in Hinglish, Hindi, Bhojpuri, Tamil, or Kannada describing their tools, tenures, and recent projects. No complex forms required.
              </p>
              <div className="pt-2 text-[11px] font-semibold text-forest flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-sage" />
                Audio Voiceprint Stored
              </div>
            </div>

            {/* Step 2 */}
            <div className="rounded-md border border-forest/15 bg-card p-6 shadow-xs space-y-4 relative">
              <div className="flex items-center justify-between">
                <span className="font-mono text-2xl font-black text-sand-700">02</span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xs bg-forest text-sand">
                  <Cpu className="h-5 w-5" />
                </div>
              </div>
              <h3 className="font-bold text-forest text-lg">
                Gemini Domain Extraction
              </h3>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                Domain-trained Gemini models parse vernacular testimonies into structured NSQF skill taxonomies, verified tool proficiencies, and experience metrics.
              </p>
              <div className="pt-2 text-[11px] font-semibold text-forest flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-sage" />
                96% Domain Accuracy
              </div>
            </div>

            {/* Step 3 */}
            <div className="rounded-md border border-forest/15 bg-card p-6 shadow-xs space-y-4 relative">
              <div className="flex items-center justify-between">
                <span className="font-mono text-2xl font-black text-sand-700">03</span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xs bg-forest text-sand">
                  <Users className="h-5 w-5" />
                </div>
              </div>
              <h3 className="font-bold text-forest text-lg">
                Dual Peer Attestation
              </h3>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                Reputable peer craftspeople and licensed site contractors endorse past work. The Web of Trust prevents forged resumes through mutual accountability.
              </p>
              <div className="pt-2 text-[11px] font-semibold text-forest flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-sage" />
                Cryptographic Vouching
              </div>
            </div>

            {/* Step 4 */}
            <div className="rounded-md border border-forest/15 bg-card p-6 shadow-xs space-y-4 relative">
              <div className="flex items-center justify-between">
                <span className="font-mono text-2xl font-black text-sand-700">04</span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xs bg-forest text-sand">
                  <ShieldCheck className="h-5 w-5" />
                </div>
              </div>
              <h3 className="font-bold text-forest text-lg">
                Sovereign ID & KAAMSCORE
              </h3>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                DigiLocker issues a tamper-evident digital card with QR verification and an indexed KAAMSCORE (300–900) unlocking institutional credit and direct hiring.
              </p>
              <div className="pt-2 text-[11px] font-semibold text-forest flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-sage" />
                Govt. & Bank Verifiable
              </div>
            </div>
          </div>

          <div className="text-center pt-2">
            <Button variant="default" size="lg" asChild className="bg-forest hover:bg-forest-500 text-ivory">
              <Link href="/how-it-works">
                Explore Full Verification Architecture
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: FEATURED PROFESSIONALS
         ========================================================================= */}
      <section id="featured-professionals" className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-forest/15 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="verified">Sovereign Registry</Badge>
              <span className="text-[11px] font-bold text-sand-800 uppercase tracking-wider bg-sand/30 px-2 py-0.5 rounded-xs border border-sand/40">
                [EXPLICIT DEMO RECORDS]
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-forest">
              Featured Verified Indian Craftspeople
            </h2>
            <p className="text-sm text-charcoal-muted max-w-xl">
              Authentic independent trades professionals with cryptographically validated
              tenures, DigiLocker credentials, and peer endorsements.
            </p>
          </div>

          <Button variant="outline" asChild className="shrink-0 border-forest/20 text-forest">
            <Link href="/explore">
              Explore All Professionals
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* 4 Featured Professionals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURED_PROFESSIONALS.map((professional) => (
            <ProfessionalCard key={professional.id} professional={professional} />
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: WHY KAAMSETU
         ========================================================================= */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <Badge variant="sand">Civic Dignity & Prosperity</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-forest">
            Closing the Trillion-Dollar Trust Deficit
          </h2>
          <p className="text-sm sm:text-base text-charcoal-muted leading-relaxed">
            India's informal labor ecosystem suffers from middlemen cuts, unproven skill claims,
            and complete financial exclusion. KAAMSETU fixes the root cause: verifiable identity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Pillar 1 */}
          <div className="rounded-md border border-forest/15 bg-card p-7 space-y-4 shadow-sovereign-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xs bg-forest text-sand">
              <TrendingUp className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-forest text-xl">
              Eliminating the Middleman Tax
            </h3>
            <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
              Subcontractors routinely extract 30% to 45% of worker wages simply for "vouching" for reliability.
              With KAAMSETU, workers carry their own unforgeable reputation directly to enterprise contractors.
            </p>
            <div className="pt-2 text-xs font-semibold text-forest">
              Direct Bank Settlements via UPI
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="rounded-md border border-forest/15 bg-card p-7 space-y-4 shadow-sovereign-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xs bg-forest text-sand">
              <BadgeCheck className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-forest text-xl">
              Dignity of Labor & Formalization
            </h3>
            <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
              Informal master craftspeople are treated as unskilled day laborers.
              Sovereign Skill Cards formally document years of specialized mastery,
              bringing institutional respect and formal social security eligibility.
            </p>
            <div className="pt-2 text-xs font-semibold text-forest">
              NSQF & National Registry Linked
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="rounded-md border border-forest/15 bg-card p-7 space-y-4 shadow-sovereign-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xs bg-forest text-sand">
              <Lock className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-forest text-xl">
              Micro-Credit Without Collateral
            </h3>
            <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
              Banks reject workers who lack payslips and tax returns. The KAAMSCORE index acts as an
              alternative credit and trade reliability rating, enabling tool loans and working capital.
            </p>
            <div className="pt-2 text-xs font-semibold text-forest">
              Financial Inclusion for 450M+ Workers
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 8: TRUST AND VERIFICATION
         ========================================================================= */}
      <section className="border-y border-forest/15 bg-forest text-ivory py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-paper-grid opacity-10 pointer-events-none" />

        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-xs bg-forest-700 px-3 py-1 text-xs font-bold text-sand border border-forest-500">
                <ShieldCheck className="h-4 w-4 text-sand" />
                <span>Zero-Knowledge Sovereign Trust Layer</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-ivory leading-tight">
                Institutional Security Built for India’s Digital Public Infrastructure
              </h2>

              <p className="text-sm sm:text-base text-ivory/80 leading-relaxed font-normal">
                KAAMSETU operates seamlessly alongside India Stack (Aadhaar, DigiLocker, UPI, ONDC).
                Worker data remains sovereign: craftspeople maintain complete control over which contractor
                or employer accesses their full verification trail.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="p-4 rounded-xs bg-forest-700/70 border border-forest-500/40 space-y-2">
                  <div className="flex items-center gap-2 text-sand">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="font-bold text-xs uppercase tracking-wider">Aadhaar VID Masking</span>
                  </div>
                  <p className="text-xs text-ivory/70 leading-relaxed">
                    Zero raw Aadhaar numbers stored. Verifications use 16-digit Virtual IDs and DigiLocker XML hash matches.
                  </p>
                </div>

                <div className="p-4 rounded-xs bg-forest-700/70 border border-forest-500/40 space-y-2">
                  <div className="flex items-center gap-2 text-sand">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="font-bold text-xs uppercase tracking-wider">Anti-Fraud Voiceprints</span>
                  </div>
                  <p className="text-xs text-ivory/70 leading-relaxed">
                    Acoustic anti-spoofing algorithms detect synthetic AI voices and verify authentic human trades descriptions.
                  </p>
                </div>

                <div className="p-4 rounded-xs bg-forest-700/70 border border-forest-500/40 space-y-2">
                  <div className="flex items-center gap-2 text-sand">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="font-bold text-xs uppercase tracking-wider">Immutable QR Seals</span>
                  </div>
                  <p className="text-xs text-ivory/70 leading-relaxed">
                    Every digital credential includes an offline-verifiable cryptographic signature readable by any smartphone camera.
                  </p>
                </div>

                <div className="p-4 rounded-xs bg-forest-700/70 border border-forest-500/40 space-y-2">
                  <div className="flex items-center gap-2 text-sand">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="font-bold text-xs uppercase tracking-wider">Audited Peer Vouching</span>
                  </div>
                  <p className="text-xs text-ivory/70 leading-relaxed">
                    Collusion detection flags mutual endorsement clusters, preserving high institutional credibility for employers.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-sm rounded-md border border-sand/30 bg-forest-800/90 p-6 shadow-credential-card space-y-5 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xs bg-sand text-forest font-black">
                  KS
                </div>
                <h3 className="text-xl font-bold text-sand">
                  Verify Any Credential Offline
                </h3>
                <p className="text-xs text-ivory/75 leading-relaxed">
                  Contractors, architects, and homeowners can point any QR reader to validate authenticity in under 500 milliseconds.
                </p>

                <div className="p-4 rounded-xs bg-card text-forest flex flex-col items-center gap-2 border border-sand/40">
                  <div className="text-xs font-mono font-bold text-forest">
                    TEST VERIFICATION ENDPOINT
                  </div>
                  <div className="text-[11px] text-charcoal-muted">
                    Scan or enter registry code:
                  </div>
                  <code className="text-xs font-mono bg-forest/5 px-2 py-1 rounded text-forest font-bold">
                    IN-RJ-2026-4029-KS
                  </code>
                </div>

                <Button variant="sand" asChild className="w-full">
                  <Link href="/explore">
                    Browse Verified Registry
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 9: IMPACT SECTION
         ========================================================================= */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <Badge variant="verified">Nationwide Economic Mobility</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-forest">
            Empowering India at Sovereign Scale
          </h2>
          <p className="text-sm sm:text-base text-charcoal-muted leading-relaxed">
            Measurable, verifiable transformation across urban construction hubs,
            tier-2 industrial clusters, and rural artisanal belts.
          </p>
        </div>

        {/* Quantified Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-md border border-forest/15 bg-card text-center space-y-2 shadow-sovereign-sm">
            <span className="text-4xl sm:text-5xl font-black text-forest block">
              450M+
            </span>
            <span className="font-bold text-charcoal text-sm block">
              Informal Craftspeople Targeted
            </span>
            <p className="text-xs text-charcoal-muted leading-relaxed">
              Representing 93% of India's total working workforce currently uncredentialed.
            </p>
          </div>

          <div className="p-6 rounded-md border border-forest/15 bg-card text-center space-y-2 shadow-sovereign-sm">
            <span className="text-4xl sm:text-5xl font-black text-forest block">
              +38%
            </span>
            <span className="font-bold text-charcoal text-sm block">
              Average Earning Increase
            </span>
            <p className="text-xs text-charcoal-muted leading-relaxed">
              Verified workers command an average monthly uplift of ₹18,400+ through direct contracts.
            </p>
          </div>

          <div className="p-6 rounded-md border border-forest/15 bg-card text-center space-y-2 shadow-sovereign-sm">
            <span className="text-4xl sm:text-5xl font-black text-forest block">
              94%
            </span>
            <span className="font-bold text-charcoal text-sm block">
              Faster Contractor Hiring
            </span>
            <p className="text-xs text-charcoal-muted leading-relaxed">
              Pre-verified skill badges reduce trial periods and on-site mis-hires from weeks to hours.
            </p>
          </div>

          <div className="p-6 rounded-md border border-forest/15 bg-card text-center space-y-2 shadow-sovereign-sm">
            <span className="text-4xl sm:text-5xl font-black text-forest block">
              28 States
            </span>
            <span className="font-bold text-charcoal text-sm block">
              Cross-Border Mobility
            </span>
            <p className="text-xs text-charcoal-muted leading-relaxed">
              Credentials travel seamlessly across state lines without dialect or language friction.
            </p>
          </div>
        </div>

        {/* Bottom Banner Call to Action */}
        <div className="rounded-md border border-forest/20 bg-gradient-to-r from-forest via-forest-600 to-forest-700 text-ivory p-8 sm:p-12 shadow-sovereign-md relative overflow-hidden">
          <div className="absolute inset-0 bg-paper-grid opacity-10 pointer-events-none" />

          <div className="relative flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <div className="space-y-3 max-w-xl">
              <span className="text-xs font-bold uppercase tracking-widest text-sand-300">
                Join the Sovereign Movement
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-ivory">
                Are you a craftsperson, contractor, or homeowner?
              </h3>
              <p className="text-xs sm:text-sm text-ivory/80 leading-relaxed">
                Start building your verified reputation today. Create your sovereign identity in 3 minutes via voice.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Button variant="sand" size="lg" asChild className="h-12 px-6 font-bold shadow-sm">
                <Link href="/how-it-works#voice-registration">
                  <Mic className="mr-2 h-4 w-4" />
                  Claim Identity via Voice
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="h-12 px-6 border-ivory/30 text-ivory hover:bg-ivory/10 hover:text-ivory"
              >
                <Link href="/about">
                  Read Our Mission
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
