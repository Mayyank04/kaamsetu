"use client";

import * as React from "react";
import Link from "next/link";
import {
  Mic,
  Search,
  QrCode,
  ArrowRight,
  Wrench,
  ShieldCheck,
  Languages,
  MapPin,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SovereignCard } from "@/components/identity/sovereign-card";
import { ProfessionalCard } from "@/components/identity/professional-card";
import { PROFESSIONS_DATA } from "@/lib/data/professions";
import { FEATURED_PROFESSIONALS } from "@/lib/data/professionals";
import { useTranslation } from "@/lib/i18n/i18n-context";

export default function HomePage() {
  const { t } = useTranslation();
  const [selectedTradeSlug, setSelectedTradeSlug] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");

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
    <div className="space-y-16 sm:space-y-20 pb-16 sm:pb-24 overflow-x-hidden">
      {/* 1. HERO: Dignified worker identity & clear entry paths */}
      <section className="border-b border-forest/15 bg-card pt-10 pb-12 sm:pt-14 sm:pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-forest leading-[1.14]">
                {t.home?.heroTitle || "Every skill deserves to be seen, even without a degree."}
              </h1>

              <p className="text-base sm:text-lg text-charcoal-muted leading-relaxed max-w-2xl">
                {t.home?.heroSubtitle ||
                  "If you work as an electrician, carpenter, mason, plumber, weaver, or repair technician, KAAMSETU helps you record your craft in your own language, keep 100% of what you earn, and share a scannable skill profile with customers."}
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                <Button
                  variant="default"
                  size="lg"
                  asChild
                  className="bg-forest hover:bg-forest-500 text-ivory min-h-[48px] px-7 text-base font-semibold"
                >
                  <Link href="/onboarding">
                    <Mic className="mr-2 h-5 w-5 text-sand" />
                    {t.home?.createProfileBtn || "Create Your Skill Profile"}
                  </Link>
                </Button>

                <Button
                  variant="secondary"
                  size="lg"
                  asChild
                  className="bg-sand/35 hover:bg-sand/55 text-forest border border-forest/20 min-h-[48px] px-7 text-base font-semibold"
                >
                  <Link href="/find-professionals">
                    <Search className="mr-2 h-5 w-5 text-forest" />
                    {t.home?.findCraftspersonBtn || "Find a Professional"}
                  </Link>
                </Button>
              </div>

              {/* Grounded constitutional & capability summary */}
              <div className="pt-6 border-t border-forest/15 grid grid-cols-3 gap-4 max-w-xl">
                <div>
                  <div className="text-lg sm:text-2xl font-bold text-forest font-mono tabular-nums">₹0.00</div>
                  <div className="text-xs text-charcoal-muted mt-0.5">Platform Commission</div>
                </div>
                <div>
                  <div className="text-lg sm:text-2xl font-bold text-forest font-mono tabular-nums">39</div>
                  <div className="text-xs text-charcoal-muted mt-0.5">Indian Languages</div>
                </div>
                <div>
                  <div className="text-lg sm:text-2xl font-bold text-forest">Guwahati &amp; Shillong</div>
                  <div className="text-xs text-charcoal-muted mt-0.5">Active Dispatch Pilot</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center">
              <SovereignCard worker={FEATURED_PROFESSIONALS[0]} />
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS: Plain editorial sequence */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="max-w-2xl space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-forest">
            How KAAMSETU works in four steps
          </h2>
          <p className="text-sm sm:text-base text-charcoal-muted leading-relaxed">
            Built so any craftsperson can register on an entry-level phone without filling out complicated English forms.
          </p>
        </div>

        <div className="border-t border-b border-forest/15 bg-card rounded-md divide-y md:divide-y-0 md:divide-x divide-forest/15 grid grid-cols-1 md:grid-cols-4">
          <div className="p-6 space-y-2.5">
            <div className="flex items-center justify-between text-forest">
              <span className="font-mono text-sm font-bold text-sand-800">Step 1</span>
              <Mic className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-forest text-base">Speak or type your craft</h3>
            <p className="text-sm text-charcoal-muted leading-relaxed">
              Describe your trade, tools, and years of work in Assamese, Hindi, Bengali, Tamil, Telugu, or any of 39 languages.
            </p>
          </div>

          <div className="p-6 space-y-2.5">
            <div className="flex items-center justify-between text-forest">
              <span className="font-mono text-sm font-bold text-sand-800">Step 2</span>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-forest text-base">Review your draft profile</h3>
            <p className="text-sm text-charcoal-muted leading-relaxed">
              Edit your daily rate, service locality, and spoken languages before publishing. Self-declared items stay clearly labeled.
            </p>
          </div>

          <div className="p-6 space-y-2.5">
            <div className="flex items-center justify-between text-forest">
              <span className="font-mono text-sm font-bold text-sand-800">Step 3</span>
              <QrCode className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-forest text-base">Share your QR skill card</h3>
            <p className="text-sm text-charcoal-muted leading-relaxed">
              Show customers and site supervisors your digital card. Any phone camera can scan the QR code to verify your work record.
            </p>
          </div>

          <div className="p-6 space-y-2.5">
            <div className="flex items-center justify-between text-forest">
              <span className="font-mono text-sm font-bold text-sand-800">Step 4</span>
              <Languages className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-forest text-base">Talk across languages</h3>
            <p className="text-sm text-charcoal-muted leading-relaxed">
              Use the built-in voice and text translator with slow audio playback so worker and customer understand each other clearly.
            </p>
          </div>
        </div>
      </section>

      {/* 3. RECOGNIZED TRADES & QUICK SEARCH */}
      <section id="professions" className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-forest">
              Browse craft &amp; repair trades
            </h2>
            <p className="text-sm text-charcoal-muted max-w-xl">
              Find electricians, carpenters, plumbers, tailors, mechanics, and local workshops by trade and locality.
            </p>
          </div>

          <Button variant="outline" asChild className="shrink-0 min-h-[44px] border-forest/25 text-forest">
            <Link href="/find-professionals">
              Search All Professionals
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-muted" />
            <input
              type="text"
              aria-label="Filter trades"
              placeholder="Search trade (e.g. Solar, Carpentry, Tailoring)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-sm border border-forest/20 bg-card text-sm focus:outline-none focus:ring-2 focus:ring-forest"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setSelectedTradeSlug("all")}
              className={`min-h-[40px] px-3.5 rounded-sm text-xs font-semibold whitespace-nowrap border transition-colors ${
                selectedTradeSlug === "all"
                  ? "bg-forest text-ivory border-forest"
                  : "bg-card border-forest/15 text-charcoal hover:border-forest/40"
              }`}
            >
              All Trades
            </button>
            {PROFESSIONS_DATA.slice(0, 4).map((p) => (
              <button
                key={p.slug}
                type="button"
                onClick={() => setSelectedTradeSlug(p.slug)}
                className={`min-h-[40px] px-3.5 rounded-sm text-xs font-semibold whitespace-nowrap border transition-colors ${
                  selectedTradeSlug === p.slug
                    ? "bg-forest text-ivory border-forest"
                    : "bg-card border-forest/15 text-charcoal hover:border-forest/40"
                }`}
              >
                {p.title.split("&")[0]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredProfessions.map((prof) => (
            <Link
              key={prof.id}
              href={`/explore?category=${prof.slug}`}
              className="rounded-md border border-forest/15 bg-card p-5 hover:border-forest/40 hover:shadow-sovereign-sm transition-colors flex flex-col justify-between space-y-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-sand/25 text-forest border border-sand/40">
                    <Wrench className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-mono font-semibold text-forest tabular-nums">
                    ₹{prof.averageDailyRate.min}–₹{prof.averageDailyRate.max}/day
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-forest text-base leading-snug">{prof.title}</h3>
                  <span className="text-xs text-charcoal-muted font-medium block mt-0.5">{prof.hindiTitle}</span>
                </div>

                <p className="text-xs text-charcoal-muted leading-relaxed line-clamp-2">
                  {prof.description}
                </p>
              </div>

              <div className="pt-2 border-t border-forest/10 flex items-center justify-between text-xs font-semibold text-forest">
                <span>Browse specialists</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. ILLUSTRATIVE PROFESSIONALS */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-forest">
                Example worker profiles
              </h2>
              <span className="text-xs font-mono font-semibold text-sand-800 bg-sand/30 px-2 py-0.5 rounded-xs border border-sand/40">
                ILLUSTRATIVE PROFILES
              </span>
            </div>
            <p className="text-sm text-charcoal-muted max-w-xl">
              How documented work history, languages spoken, and verification status appear to homeowners and site contractors.
            </p>
          </div>

          <Button variant="outline" asChild className="shrink-0 min-h-[44px] border-forest/25 text-forest">
            <Link href="/find-professionals">
              Open Full Directory
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURED_PROFESSIONALS.map((professional) => (
            <ProfessionalCard key={professional.id} professional={professional} />
          ))}
        </div>
      </section>

      {/* 5. TRUST, PRIVACY & REGIONAL AVAILABILITY */}
      <section className="border-t border-b border-forest/15 bg-forest text-ivory py-14 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-7 space-y-5">
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-ivory leading-tight">
              Your wages stay yours. Your records stay yours.
            </h2>
            <p className="text-sm sm:text-base text-ivory/85 leading-relaxed max-w-2xl">
              Brokers frequently take 30% to 45% of a worker&apos;s wage just for an introduction. KAAMSETU charges zero commission on worker wages and protects raw Aadhaar privacy through cryptographic hashes.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-sm bg-forest-700/70 border border-forest-500/40 space-y-1.5">
                <div className="flex items-center gap-2 text-sand font-bold text-sm">
                  <Lock className="h-4 w-4" />
                  <span>Privacy-Preserving Verification</span>
                </div>
                <p className="text-xs text-ivory/80 leading-relaxed">
                  No raw Aadhaar numbers are stored. Workers choose whether their profile is public or private at any time.
                </p>
              </div>

              <div className="p-4 rounded-sm bg-forest-700/70 border border-forest-500/40 space-y-1.5">
                <div className="flex items-center gap-2 text-sand font-bold text-sm">
                  <MapPin className="h-4 w-4" />
                  <span>Where Commercial Service Runs</span>
                </div>
                <p className="text-xs text-ivory/80 leading-relaxed">
                  Digital profiles and search work across all 36 States &amp; UTs. Direct booking dispatch is active in Guwahati Urban and Shillong Urban.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-forest-800 border border-sand/30 rounded-md p-6 space-y-5">
            <div className="space-y-2">
              <div className="text-xs font-mono uppercase tracking-wider text-sand">
                Ready in 3 Minutes
              </div>
              <h3 className="text-xl font-bold text-ivory">
                Verify a skill card or register your trade
              </h3>
              <p className="text-sm text-ivory/80 leading-relaxed">
                Start with voice or simple steps on mobile, or try the 39-language voice translator right now.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="sand" asChild className="min-h-[44px] flex-1 font-bold">
                <Link href="/onboarding">Create Skill Profile</Link>
              </Button>
              <Button
                variant="outline"
                asChild
                className="min-h-[44px] flex-1 border-ivory/35 text-ivory hover:bg-ivory/10 hover:text-ivory bg-transparent"
              >
                <Link href="/translate">Open Translator</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
