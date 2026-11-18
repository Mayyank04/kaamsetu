"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  Award,
  Mic,
  Search,
  QrCode,
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
              {/* Mission Sub-badge */}
              <div className="inline-flex items-center gap-2 rounded-xs bg-forest/10 px-3.5 py-1.5 border border-forest/20 text-xs font-bold text-forest uppercase tracking-wider shadow-2xs">
                <ShieldCheck className="h-4 w-4 text-forest" />
                <span>Every skill deserves to be seen, even without a degree</span>
              </div>

              {/* Approved Primary Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-forest leading-[1.1]">
                Your skills deserve recognition.
              </h1>

              {/* Approved Supporting Copy */}
              <p className="text-lg sm:text-xl text-charcoal-muted leading-relaxed max-w-2xl font-normal">
                Whether you are an electrician, carpenter, weaver or technician, KAAMSETU helps you build a professional identity around the work you know. Showcase your experience, share your work and connect with people looking for your skills.
              </p>

              {/* Two Direct CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-3">
                <Button
                  variant="default"
                  size="lg"
                  asChild
                  className="bg-forest hover:bg-forest-500 text-ivory shadow-sovereign-sm h-13 px-8 text-base font-semibold"
                >
                  <Link href="/onboarding">
                    <Mic className="mr-2.5 h-5 w-5 text-sand" />
                    Create Your Skill Profile
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
              <div className="pt-8 border-t border-forest/15 grid grid-cols-3 gap-3 sm:gap-6 max-w-xl">
                <div>
                  <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-forest">300–900</div>
                  <div className="text-[10px] sm:text-xs text-charcoal-muted mt-0.5">KAAMSCORE™ Trust Index</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-forest">₹0.00</div>
                  <div className="text-[10px] sm:text-xs text-charcoal-muted mt-0.5">Zero Platform Commission</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-forest">100%</div>
                  <div className="text-[10px] sm:text-xs text-charcoal-muted mt-0.5">Direct Worker Entitlement</div>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Anchor (Sovereign Credential Card Preview) */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md">
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
            <Badge variant="outline" className="text-xs bg-forest/5 text-forest border-forest/20">
              National Taxonomy
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-forest">
              Explore Recognized Vocational Trades
            </h2>
            <p className="text-sm text-charcoal-muted max-w-xl">
              Categorized according to recognized vocational trades.
              Each professional profile is backed by documented work and genuine customer reviews.
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
                    <Wrench className="h-5 w-5 text-forest" />
                  </div>
                  <span className="text-[11px] font-bold text-forest/70 font-mono">
                    Recognized Trade
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
            <Badge variant="outline" className="text-xs bg-forest/5 text-forest border-forest/20">
              How It Works
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-forest">
              From Spoken Testimony to Verifiable Credential
            </h2>
            <p className="text-sm sm:text-base text-charcoal-muted leading-relaxed">
              We remove paper friction and digital literacy barriers.
              Four straightforward steps translate hands-on craftsmanship into recognized professional standing.
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
                Describe Your Craft in Any Language
              </h3>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                Workers speak naturally in Hindi, Assamese, Bengali, Tamil, or English describing their tools, tenures, and recent projects. No complex forms required.
              </p>
              <div className="pt-2 text-[11px] font-semibold text-forest flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-sage" />
                Spoken attestation recorded
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
                Structured Trade Classification
              </h3>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                Voice descriptions are converted into structured vocational skill categories, equipment proficiencies, and experience tenures for artisan review.
              </p>
              <div className="pt-2 text-[11px] font-semibold text-forest flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-sage" />
                Self-declared draft created
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
                Peer & Contractor References
              </h3>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                Fellow craftspeople and site contractors add independent verification of completed work, building mutual credibility.
              </p>
              <div className="pt-2 text-[11px] font-semibold text-forest flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-sage" />
                Documented work references
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
                Digital Skill Card & QR Verification
              </h3>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                Receive a digital skill card with instant camera-scannable QR verification and a trust score reflecting documented experience.
              </p>
              <div className="pt-2 text-[11px] font-semibold text-forest flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-sage" />
                Verifiable digital credential
              </div>
            </div>
          </div>

          <div className="text-center pt-2">
            <Button variant="default" size="lg" asChild className="bg-forest hover:bg-forest-500 text-ivory">
              <Link href="/how-it-works">
                Learn How Verification Works
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
              <Badge variant="outline" className="text-xs bg-forest/5 text-forest border-forest/20">
                Featured Professionals
              </Badge>
              <span className="text-[11px] font-bold text-sand-800 uppercase tracking-wider bg-sand/30 px-2 py-0.5 rounded-xs border border-sand/40">
                [ILLUSTRATIVE PROFILES]
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-forest">
              Featured Craftspeople & Technicians
            </h2>
            <p className="text-sm text-charcoal-muted max-w-xl">
              Skilled independent professionals with documented experience, peer references, and verifiable work history.
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
          <Badge variant="outline" className="text-xs bg-sand/20 text-sand-800 border-sand/40">
            Direct Recognition
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-forest">
            Direct Recognition for Honest Craft
          </h2>
          <p className="text-sm sm:text-base text-charcoal-muted leading-relaxed">
            Middlemen and informal brokers often skim 30% to 45% of worker earnings simply for introductions. KAAMSETU gives craftspeople their own portable reputation with zero platform commissions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Pillar 1 */}
          <div className="rounded-md border border-forest/15 bg-card p-7 space-y-4 shadow-sovereign-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xs bg-forest text-sand">
              <TrendingUp className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-forest text-xl">
              Zero Middleman Commissions
            </h3>
            <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
              Workers keep 100% of their agreed wage. Direct payouts go straight to the artisan&apos;s bank account with zero platform deduction.
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
              Documented Craftsmanship
            </h3>
            <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
              Years of specialized carpentry, electrical wiring, or civil masonry are formally recorded so workers are recognized as master tradespeople, not anonymous day laborers.
            </p>
            <div className="pt-2 text-xs font-semibold text-forest">
              Recognized Vocational Taxonomy
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="rounded-md border border-forest/15 bg-card p-7 space-y-4 shadow-sovereign-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xs bg-forest text-sand">
              <Lock className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-forest text-xl">
              Portable Professional Reputation
            </h3>
            <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
              A digital skill profile travels across project sites, cities, and states, unlocking direct client inquiries and tool financing without starting from scratch.
            </p>
            <div className="pt-2 text-xs font-semibold text-forest">
              Independent Sovereign Identity
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
                <span>Privacy-Preserving Verification</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-ivory leading-tight">
                Built on India’s Digital Public Infrastructure
              </h2>

              <p className="text-sm sm:text-base text-ivory/80 leading-relaxed font-normal">
                KAAMSETU operates alongside India Stack protocols (DigiLocker, UPI, ONDC). Craftspeople maintain complete control over which contractors or employers access their full verification details.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="p-4 rounded-xs bg-forest-700/70 border border-forest-500/40 space-y-2">
                  <div className="flex items-center gap-2 text-sand">
                    <Lock className="h-4 w-4" />
                    <span className="font-bold text-xs uppercase tracking-wider">Aadhaar VID Privacy</span>
                  </div>
                  <p className="text-xs text-ivory/70 leading-relaxed">
                    Zero raw Aadhaar numbers stored. Verifications use masked Virtual IDs and DigiLocker XML hash matching.
                  </p>
                </div>

                <div className="p-4 rounded-xs bg-forest-700/70 border border-forest-500/40 space-y-2">
                  <div className="flex items-center gap-2 text-sand">
                    <Mic className="h-4 w-4" />
                    <span className="font-bold text-xs uppercase tracking-wider">Authentic Voice Attestation</span>
                  </div>
                  <p className="text-xs text-ivory/70 leading-relaxed">
                    Artisans describe their craft in their own voice, recording an unalterable self-declaration of work experience.
                  </p>
                </div>

                <div className="p-4 rounded-xs bg-forest-700/70 border border-forest-500/40 space-y-2">
                  <div className="flex items-center gap-2 text-sand">
                    <QrCode className="h-4 w-4" />
                    <span className="font-bold text-xs uppercase tracking-wider">Camera-Scannable QR Codes</span>
                  </div>
                  <p className="text-xs text-ivory/70 leading-relaxed">
                    Every skill profile features an offline-verifiable QR code readable by any smartphone camera without special software.
                  </p>
                </div>

                <div className="p-4 rounded-xs bg-forest-700/70 border border-forest-500/40 space-y-2">
                  <div className="flex items-center gap-2 text-sand">
                    <Users className="h-4 w-4" />
                    <span className="font-bold text-xs uppercase tracking-wider">Accountable References</span>
                  </div>
                  <p className="text-xs text-ivory/70 leading-relaxed">
                    Peer endorsements link to verified contractor or artisan profiles, creating a genuine web of professional trust.
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
                  Verify Any Profile Offline
                </h3>
                <p className="text-xs text-ivory/75 leading-relaxed">
                  Contractors, architects, and homeowners can point any QR camera to validate identity and experience in seconds.
                </p>

                <div className="p-4 rounded-xs bg-card text-forest flex flex-col items-center gap-2 border border-sand/40">
                  <div className="text-xs font-mono font-bold text-forest">
                    SAMPLE PROFILE REGISTRY CODE
                  </div>
                  <div className="text-[11px] text-charcoal-muted">
                    Scan or enter registry code:
                  </div>
                  <code className="text-xs font-mono bg-forest/5 px-2 py-1 rounded text-forest font-bold">
                    IN-AS-2026-4029-KS
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
          <Badge variant="outline" className="text-xs bg-forest/5 text-forest border-forest/20">
            Workforce Inclusion
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-forest">
            Built for India&apos;s Skilled Workforce
          </h2>
          <p className="text-sm sm:text-base text-charcoal-muted leading-relaxed">
            Grounding digital identity in verified craftsmanship across urban construction centers, industrial corridors, and traditional artisan clusters.
          </p>
        </div>

        {/* Quantified Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-md border border-forest/15 bg-card text-center space-y-2 shadow-sovereign-sm relative">
            <span className="text-[10px] font-mono uppercase bg-forest/5 text-forest px-2 py-0.5 rounded-xs inline-block mb-1">
              National Census / PLFS
            </span>
            <span className="text-4xl sm:text-5xl font-black text-forest block font-serif">
              450M+
            </span>
            <span className="font-bold text-charcoal text-sm block">
              Informal Craftspeople
            </span>
            <p className="text-xs text-charcoal-muted leading-relaxed">
              Representing over 90% of India&apos;s non-agricultural workforce building homes, networks, and infrastructure.
            </p>
          </div>

          <div className="p-6 rounded-md border border-forest/15 bg-card text-center space-y-2 shadow-sovereign-sm relative">
            <span className="text-[10px] font-mono uppercase bg-sand/30 text-sand-800 px-2 py-0.5 rounded-xs inline-block mb-1 font-semibold">
              Constitutional Invariant
            </span>
            <span className="text-4xl sm:text-5xl font-black text-forest block font-serif">
              ₹0.00
            </span>
            <span className="font-bold text-charcoal text-sm block">
              Platform Commission
            </span>
            <p className="text-xs text-charcoal-muted leading-relaxed">
              Permanent zero-commission guarantee on worker earnings across all vocational trades.
            </p>
          </div>

          <div className="p-6 rounded-md border border-forest/15 bg-card text-center space-y-2 shadow-sovereign-sm relative">
            <span className="text-[10px] font-mono uppercase bg-forest/5 text-forest px-2 py-0.5 rounded-xs inline-block mb-1">
              Direct Settlement
            </span>
            <span className="text-4xl sm:text-5xl font-black text-forest block font-serif">
              100%
            </span>
            <span className="font-bold text-charcoal text-sm block">
              Direct Payouts
            </span>
            <p className="text-xs text-charcoal-muted leading-relaxed">
              Earnings disburse directly to worker accounts via UPI with transparent transaction audit logs.
            </p>
          </div>

          <div className="p-6 rounded-md border border-forest/15 bg-card text-center space-y-2 shadow-sovereign-sm relative">
            <span className="text-[10px] font-mono uppercase bg-forest/5 text-forest px-2 py-0.5 rounded-xs inline-block mb-1">
              Class B Rollout
            </span>
            <span className="text-4xl sm:text-5xl font-black text-forest block font-serif">
              2 Cities
            </span>
            <span className="font-bold text-charcoal text-sm block">
              Active Pilot Scope
            </span>
            <p className="text-xs text-charcoal-muted leading-relaxed">
              Controlled regional operations in Guwahati Urban, Assam and Shillong Urban, Meghalaya.
            </p>
          </div>
        </div>

        {/* Bottom Banner Call to Action */}
        <div className="rounded-md border border-forest/20 bg-forest text-ivory p-8 sm:p-12 shadow-sovereign-md relative overflow-hidden">
          <div className="absolute inset-0 bg-paper-grid opacity-10 pointer-events-none" />

          <div className="relative flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <div className="space-y-3 max-w-xl">
              <span className="text-xs font-bold uppercase tracking-widest text-sand-300">
                Start Your Profile
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-ivory">
                Ready to showcase your skills?
              </h3>
              <p className="text-xs sm:text-sm text-ivory/80 leading-relaxed">
                Create your profile in 3 minutes by describing your work, or explore skilled professionals in your city.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Button variant="sand" size="lg" asChild className="h-12 px-6 font-bold shadow-sm">
                <Link href="/onboarding">
                  <Mic className="mr-2 h-4 w-4" />
                  Create Your Skill Profile
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="h-12 px-6 border-ivory/30 text-ivory hover:bg-ivory/10 hover:text-ivory"
              >
                <Link href="/how-it-works">
                  Learn How It Works
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
