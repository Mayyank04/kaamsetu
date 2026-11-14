import * as React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Award,
  Users,
  Lock,
  Building2,
  HeartHandshake,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Scale,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "About KAAMSETU | The Sovereign Trust Infrastructure for Indian Craft",
  description:
    "Learn why KAAMSETU was engineered: to eliminate the trust deficit, restore dignity to manual labor, and equip 450 million skilled Indian workers with unforgeable digital identity.",
};

export default function AboutPage() {
  return (
    <div className="space-y-20 pb-24">
      {/* 1. Header Banner */}
      <section className="relative overflow-hidden border-b border-forest/15 bg-gradient-to-b from-[#FFFFFF] via-[#F7F5F0] to-[#E9EFEA]/40 pt-16 pb-20">
        <div className="absolute inset-0 bg-paper-grid opacity-35 pointer-events-none" />

        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center space-y-6">
          <Badge variant="verified">Institutional Mission</Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-forest leading-[1.15]">
            Bridging Informal Mastery With Sovereign Trust.
          </h1>
          <p className="text-lg sm:text-xl text-charcoal-muted leading-relaxed font-normal max-w-2xl mx-auto">
            KAAMSETU is India’s open digital public infrastructure engineered to give
            every craftsperson sovereign ownership over their skill reputation.
          </p>
        </div>
      </section>

      {/* 2. The Structural Reality & The Problem */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-6 space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-sand-800">
              The Informal Workforce Dilemma
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-forest">
              93% of India&apos;s skilled hands operate without proof.
            </h2>
            <p className="text-sm text-charcoal-muted leading-relaxed">
              In India, a carpenter with two decades of master joinery experience is treated by banks
              and large contractors the exact same way as an untrained day laborer. Because their work
              history exists only in verbal memory, they cannot prove their credibility across town lines.
            </p>
            <p className="text-sm text-charcoal-muted leading-relaxed">
              This structural lack of credentialing forces workers into predatory reliance on
              local contractors who skim 30% to 45% of daily wages simply for vouching for their presence.
            </p>
          </div>

          <div className="md:col-span-6 rounded-md border border-forest/15 bg-card p-6 shadow-sovereign-sm space-y-5">
            <h3 className="font-bold text-forest text-lg border-b border-forest/10 pb-3">
              The Cost of the Trust Deficit
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-xs bg-terracotta/15 text-terracotta shrink-0 mt-0.5">
                  ✕
                </div>
                <div>
                  <strong className="text-charcoal block">Financial Invisibility</strong>
                  <span className="text-charcoal-muted">
                    No formal payslips means micro-lenders classify skilled craftspeople as high-risk, charging 36%+ annual interest.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-xs bg-terracotta/15 text-terracotta shrink-0 mt-0.5">
                  ✕
                </div>
                <div>
                  <strong className="text-charcoal block">Zero Cross-Border Portability</strong>
                  <span className="text-charcoal-muted">
                    When a skilled artisan moves from Uttar Pradesh or Bihar to Delhi or Bengaluru, their hard-won local reputation resets to zero.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-xs bg-terracotta/15 text-terracotta shrink-0 mt-0.5">
                  ✕
                </div>
                <div>
                  <strong className="text-charcoal block">Contractor Mis-hire Friction</strong>
                  <span className="text-charcoal-muted">
                    Builders spend weeks testing workers on-site because resumes are easily fabricated and cannot be checked against objective benchmarks.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. The 4 Sovereign Principles */}
      <section className="border-y border-forest/15 bg-forest text-ivory py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-paper-grid opacity-10 pointer-events-none" />

        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <Badge variant="sovereign">Civic Design Ethics</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-ivory">
              Our Sovereign Architectural Principles
            </h2>
            <p className="text-sm text-ivory/80 leading-relaxed">
              KAAMSETU is designed not as a predatory gig-work aggregator,
              but as an enduring civic utility modeled after India Stack.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-md bg-forest-700/80 border border-forest-500/40 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xs bg-sand text-forest font-bold">
                <Compass className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sand text-lg">Vernacular-First</h3>
              <p className="text-xs text-ivory/70 leading-relaxed">
                Literacy or English proficiency cannot be a prerequisite for dignity. Audio voice inputs in any Indian dialect allow authentic, unassisted self-declaration.
              </p>
            </div>

            <div className="p-6 rounded-md bg-forest-700/80 border border-forest-500/40 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xs bg-sand text-forest font-bold">
                <Lock className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sand text-lg">Worker Sovereignty</h3>
              <p className="text-xs text-ivory/70 leading-relaxed">
                Workers own their cryptographic keys and credential records. No private corporation can delete, confiscate, or de-platform their verified livelihood.
              </p>
            </div>

            <div className="p-6 rounded-md bg-forest-700/80 border border-forest-500/40 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xs bg-sand text-forest font-bold">
                <Scale className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sand text-lg">Transparent Scoring</h3>
              <p className="text-xs text-ivory/70 leading-relaxed">
                The KAAMSCORE protocol is completely open. Five deterministic criteria replace opaque proprietary algorithms that trap workers in dark rating traps.
              </p>
            </div>

            <div className="p-6 rounded-md bg-forest-700/80 border border-forest-500/40 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xs bg-sand text-forest font-bold">
                <HeartHandshake className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sand text-lg">Dignity of Labor</h3>
              <p className="text-xs text-ivory/70 leading-relaxed">
                We celebrate technical craft, masonry, textile weaving, and precision trades with the exact same prestige reserved for formal engineering degrees.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. National Alignment & Institutional Partners */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-forest">
            Sovereign Integration Framework
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-forest">
            Aligned with National Civic Infrastructure
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
          <div className="rounded-sm border border-forest/15 bg-card p-5 text-center space-y-2 shadow-xs">
            <Building2 className="h-6 w-6 text-forest mx-auto" />
            <h4 className="font-bold text-forest text-sm">DigiLocker Ecosystem</h4>
            <p className="text-xs text-charcoal-muted leading-relaxed">
              Official document hashes stored securely within sovereign government citizen lockers.
            </p>
          </div>

          <div className="rounded-sm border border-forest/15 bg-card p-5 text-center space-y-2 shadow-xs">
            <Award className="h-6 w-6 text-forest mx-auto" />
            <h4 className="font-bold text-forest text-sm">NSDC & NSQF Matrix</h4>
            <p className="text-xs text-charcoal-muted leading-relaxed">
              Skill descriptions mapped directly to Ministry of Skill Development qualification packs.
            </p>
          </div>

          <div className="rounded-sm border border-forest/15 bg-card p-5 text-center space-y-2 shadow-xs">
            <ShieldCheck className="h-6 w-6 text-forest mx-auto" />
            <h4 className="font-bold text-forest text-sm">Zero-Knowledge Verification</h4>
            <p className="text-xs text-charcoal-muted leading-relaxed">
              Employers verify background checks without workers needing to expose sensitive Aadhaar numbers.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="pt-8 text-center">
          <Button variant="default" size="lg" asChild className="bg-forest hover:bg-forest-500 text-ivory">
            <Link href="/explore">
              Explore Verified Craftspeople
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
