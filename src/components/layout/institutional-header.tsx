"use client";

import * as React from "react";
import Link from "next/link";
import { ShieldCheck, Award, Mic, Globe, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InstitutionalHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-forest/15 bg-card/95 backdrop-blur-md shadow-xs">
      <div className="container mx-auto flex h-18 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Sovereign Tag */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xs bg-forest text-sand font-black text-sm border border-forest-700 shadow-xs group-hover:bg-forest-500 transition-colors">
            KS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-forest">
                KAAMSETU
              </span>
              <span className="hidden sm:inline-block text-xs font-semibold text-sand-700 px-1.5 py-0.5 rounded-xs bg-sand/20 border border-sand/40">
                कामसेतु
              </span>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-charcoal-muted">
              Universal Digital Skill Identity
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-charcoal">
          <Link
            href="/#categories"
            className="hover:text-forest transition-colors"
          >
            Craft Registry
          </Link>
          <Link
            href="/#kaamscore"
            className="hover:text-forest transition-colors"
          >
            KAAMSCORE™
          </Link>
          <Link
            href="/#voice-simulator"
            className="hover:text-forest transition-colors flex items-center gap-1.5"
          >
            <Mic className="h-4 w-4 text-terracotta" />
            <span>Voice Registration</span>
          </Link>
          <Link
            href="/#explore"
            className="hover:text-forest transition-colors"
          >
            Verified Workers
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs font-semibold text-forest-700 px-2 py-1 rounded-xs bg-forest/5 border border-forest/10">
            <Globe className="h-3.5 w-3.5 text-forest" />
            <span>EN / हिन्दी</span>
          </div>
          <Button variant="secondary" size="sm" asChild>
            <Link href="/auth/login">Access Registry</Link>
          </Button>
          <Button variant="default" size="sm" asChild>
            <Link href="/onboarding/voice">Claim Identity</Link>
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden flex h-10 w-10 items-center justify-center rounded-sm border border-forest/20 text-forest"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-forest/10 bg-card p-4 space-y-3">
          <nav className="flex flex-col space-y-2 text-sm font-medium">
            <Link
              href="/#categories"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xs hover:bg-forest/5 text-charcoal"
            >
              Craft Registry
            </Link>
            <Link
              href="/#kaamscore"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xs hover:bg-forest/5 text-charcoal"
            >
              KAAMSCORE™
            </Link>
            <Link
              href="/#voice-simulator"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xs hover:bg-forest/5 text-terracotta font-semibold"
            >
              Voice Registration
            </Link>
            <Link
              href="/#explore"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xs hover:bg-forest/5 text-charcoal"
            >
              Verified Workers
            </Link>
          </nav>
          <div className="pt-2 flex flex-col gap-2">
            <Button variant="secondary" className="w-full" asChild>
              <Link href="/auth/login">Access Registry</Link>
            </Button>
            <Button variant="default" className="w-full" asChild>
              <Link href="/onboarding/voice">Claim Identity</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
