"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  ShieldCheck,
  MapPin,
  Sparkles,
  RotateCcw,
  SlidersHorizontal,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProfessionalCard } from "@/components/identity/professional-card";
import { FEATURED_PROFESSIONALS } from "@/lib/data/professionals";
import { PROFESSIONS_DATA } from "@/lib/data/professions";

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("all");
  const [selectedTier, setSelectedTier] = React.useState("all");
  const [selectedLocation, setSelectedLocation] = React.useState("all");

  const locations = ["Jaipur", "Varanasi", "Pune", "Bengaluru", "New Delhi"];

  const filteredProfessionals = FEATURED_PROFESSIONALS.filter((pro) => {
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = pro.fullName.toLowerCase().includes(q);
      const matchTrade = pro.primaryTrade.toLowerCase().includes(q);
      const matchLocation = `${pro.location.city} ${pro.location.state}`.toLowerCase().includes(q);
      const matchSkills = pro.subTrades.some((s) => s.toLowerCase().includes(q));
      if (!matchName && !matchTrade && !matchLocation && !matchSkills) return false;
    }

    // Category filter
    if (selectedCategory !== "all") {
      const catObj = PROFESSIONS_DATA.find((c) => c.slug === selectedCategory);
      if (catObj) {
        const matchesCat =
          pro.primaryTrade.toLowerCase().includes(catObj.title.split("&")[0].trim().toLowerCase()) ||
          pro.subTrades.some((s) => catObj.popularSkills.includes(s));
        if (!matchesCat) return false;
      }
    }

    // Tier filter
    if (selectedTier !== "all") {
      if (selectedTier === "master" && pro.kaamScore.level !== 4) return false;
      if (selectedTier === "institutional" && pro.kaamScore.level !== 3) return false;
    }

    // Location filter
    if (selectedLocation !== "all" && pro.location.city !== selectedLocation) {
      return false;
    }

    return true;
  });

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedTier("all");
    setSelectedLocation("all");
  };

  return (
    <div className="space-y-12 pb-24">
      {/* 1. Header Banner */}
      <section className="relative overflow-hidden border-b border-forest/15 bg-gradient-to-b from-[#FFFFFF] via-[#F7F5F0] to-[#E9EFEA]/40 pt-14 pb-16">
        <div className="absolute inset-0 bg-paper-grid opacity-35 pointer-events-none" />

        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-xs bg-forest/10 px-3 py-1 border border-forest/20 text-xs font-bold text-forest uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4 text-forest" />
            <span>Open National Credential Registry</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-forest leading-tight">
            Explore Verified Indian Craftspeople
          </h1>

          <p className="text-sm sm:text-base text-charcoal-muted max-w-xl mx-auto leading-relaxed">
            Every professional listed holds a verified DigiLocker-linked record,
            quantified KAAMSCORE rating, and peer-attested technical credentials.
          </p>
        </div>
      </section>

      {/* 2. Search & Filters Bar */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="rounded-md border border-forest/15 bg-card p-5 shadow-sovereign-sm space-y-4">
          {/* Main Search Input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-muted" />
            <input
              type="text"
              placeholder="Search by worker name, craft (e.g. Solar, Joinery, Brocade), or tool..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-10 pr-4 rounded-sm border border-forest/20 bg-background text-sm focus:outline-none focus:border-forest focus:ring-2 focus:ring-sand/60"
            />
          </div>

          {/* Secondary Filter Dropdowns & Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {/* Trade Category */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-muted block mb-1">
                Trade Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full h-10 px-3 rounded-xs border border-forest/20 bg-card text-xs text-forest font-semibold focus:outline-none focus:border-forest"
              >
                <option value="all">All 8 National Trades</option>
                {PROFESSIONS_DATA.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            {/* KAAMSCORE Tier */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-muted block mb-1">
                Verification Tier
              </label>
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
                className="w-full h-10 px-3 rounded-xs border border-forest/20 bg-card text-xs text-forest font-semibold focus:outline-none focus:border-forest"
              >
                <option value="all">All Tiers (300–900)</option>
                <option value="master">Sovereign Master (Level 4: 820+)</option>
                <option value="institutional">Institutional Verified (Level 3: 700+)</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-muted block mb-1">
                Hub / Location
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full h-10 px-3 rounded-xs border border-forest/20 bg-card text-xs text-forest font-semibold focus:outline-none focus:border-forest"
              >
                <option value="all">All Indian Cities</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Reset Filters & Active State */}
          <div className="flex items-center justify-between pt-2 border-t border-forest/10 text-xs">
            <span className="text-charcoal-muted">
              Showing <strong className="text-forest">{filteredProfessionals.length}</strong> verified craftspeople
              <span className="ml-2 font-mono text-[10px] text-sand-800 bg-sand/30 px-1.5 py-0.5 rounded-xs">
                [EXPLICIT DEMO DATA]
              </span>
            </span>

            {(searchQuery || selectedCategory !== "all" || selectedTier !== "all" || selectedLocation !== "all") && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-terracotta hover:underline inline-flex items-center gap-1 font-semibold"
              >
                <RotateCcw className="h-3 w-3" />
                Reset all filters
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 3. Professionals Grid */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {filteredProfessionals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProfessionals.map((pro) => (
              <ProfessionalCard key={pro.id} professional={pro} />
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-forest/15 bg-card p-12 text-center space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xs bg-forest/5 text-forest mx-auto">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-forest">No matching verified craftspeople found</h3>
            <p className="text-xs text-charcoal-muted max-w-sm mx-auto">
              Try broadening your search query or reset your filters to view all verified profiles.
            </p>
            <Button variant="default" size="sm" onClick={handleResetFilters} className="bg-forest text-ivory">
              Clear All Filters
            </Button>
          </div>
        )}
      </section>

      {/* 4. Bottom Attestation Notice */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="rounded-sm border border-forest/15 bg-forest/5 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-forest shrink-0" />
            <div>
              <strong className="text-forest block text-sm">
                Need to verify an on-site worker's physical smart card?
              </strong>
              <p className="text-charcoal-muted">
                Scan the QR code on any KAAMSETU Sovereign Card using your phone camera for instant cryptographic verification.
              </p>
            </div>
          </div>

          <Button variant="outline" asChild className="shrink-0 border-forest/20 text-forest">
            <Link href="/how-it-works">
              Read Verification Specs
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
