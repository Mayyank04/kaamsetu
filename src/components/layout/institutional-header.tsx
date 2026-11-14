"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, Mic, Search, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function InstitutionalHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/explore", label: "Explore Professions" },
    { href: "/customer/bookings", label: "My Bookings" },
    { href: "/dashboard", label: "Worker Dashboard" },
    { href: "/how-it-works", label: "How It Works" },
    { href: "/about", label: "About" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-forest/15 bg-[#F7F5F0]/95 backdrop-blur-md shadow-xs transition-all">
      {/* Top Sovereign Status Bar */}
      <div className="bg-forest text-ivory text-[11px] py-1.5 px-4 hidden sm:block border-b border-forest-500/20">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-1.5 w-1.5 rounded-full bg-sand animate-pulse" />
            <span className="font-semibold text-sand-300">
              National Sovereign Skill Identity Protocol
            </span>
            <span className="text-ivory/60">•</span>
            <span className="text-ivory/80">
              Aadhaar & DigiLocker Linked Open Infrastructure
            </span>
          </div>
          <div className="flex items-center gap-4 text-ivory/80 text-[10px]">
            <span className="bg-sand/20 text-sand px-2 py-0.5 rounded-xs font-semibold">
              DEMO SIMULATION ACTIVE
            </span>
            <span>ENG / हिन्दी</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto flex h-18 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Sovereign Mark */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xs bg-forest text-sand font-black text-sm border border-forest-700 shadow-xs group-hover:bg-forest-500 transition-colors">
            KS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-forest">
                KAAMSETU
              </span>
              <span className="text-xs font-semibold text-sand-800 px-1.5 py-0.5 rounded-xs bg-sand/30 border border-sand/40">
                कामसेतु
              </span>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-charcoal-muted">
              Digital Sovereign Identity
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-charcoal">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "transition-colors relative py-1",
                  isActive
                    ? "text-forest font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-forest"
                    : "text-charcoal-muted hover:text-forest"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Dual CTA Actions */}
        <div className="hidden lg:flex items-center gap-3">
          <Button variant="outline" size="sm" asChild className="border-forest/20 text-forest hover:bg-forest/5">
            <Link href="/explore">
              <Search className="mr-1.5 h-3.5 w-3.5 text-forest" />
              Find a Professional
            </Link>
          </Button>

          <Button variant="default" size="sm" asChild className="bg-forest text-ivory hover:bg-forest-500 shadow-sm">
            <Link href="/onboarding">
              <Mic className="mr-1.5 h-3.5 w-3.5 text-sand" />
              Create Your Identity
            </Link>
          </Button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden flex h-10 w-10 items-center justify-center rounded-sm border border-forest/20 text-forest bg-card"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-forest/15 bg-card p-5 space-y-4 shadow-sovereign-md animate-in slide-in-from-top-2">
          <nav className="flex flex-col space-y-2 text-sm font-medium">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "px-3 py-2.5 rounded-xs transition-colors",
                    isActive
                      ? "bg-forest/10 text-forest font-bold border-l-2 border-forest"
                      : "text-charcoal hover:bg-forest/5"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-forest/10 flex flex-col gap-2.5">
            <Button variant="outline" className="w-full justify-center" asChild>
              <Link href="/explore" onClick={() => setMobileMenuOpen(false)}>
                <Search className="mr-2 h-4 w-4" />
                Find a Professional
              </Link>
            </Button>
            <Button variant="default" className="w-full justify-center" asChild>
              <Link href="/onboarding" onClick={() => setMobileMenuOpen(false)}>
                <Mic className="mr-2 h-4 w-4 text-sand" />
                Create Your Identity
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
