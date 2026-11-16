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
  Briefcase,
  Award,
  Clock,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProfessionalCard } from "@/components/identity/professional-card";
import { FEATURED_PROFESSIONALS } from "@/lib/data/professionals";
import { PROFESSIONS_DATA } from "@/lib/data/professions";
import { WorkerProfile } from "@/types/identity";

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("all");
  const [selectedSkill, setSelectedSkill] = React.useState("all");
  const [selectedLocation, setSelectedLocation] = React.useState("all");
  const [selectedExperience, setSelectedExperience] = React.useState("all");
  const [selectedAvailability, setSelectedAvailability] = React.useState("all");

  const [professionals, setProfessionals] = React.useState(FEATURED_PROFESSIONALS);
  const [isLoading, setIsLoading] = React.useState(false);

  const locations = [
    "Guwahati",
    "Dispur",
    "Jaipur",
    "Varanasi",
    "Pune",
    "Bengaluru",
    "New Delhi",
    "Kolkata",
    "Chennai",
    "Amritsar",
  ];

  const popularSkills = [
    "Assam Cane & Bamboo Joinery",
    "Submersible Borewell Pumps",
    "DISCOM Safety Earthing",
    "Rooftop Solar Array",
    "3-Phase Inverters",
    "Pure Silk Brocade",
    "Zardozi Gold Thread",
    "EV Battery Conversion",
    "CRDI Fuel Injection",
    "Closed-Loop Hydroponics",
    "Concealed CPVC Piping",
    "Teak Joinery",
  ];

  // Fetch from /api/workers with debounce
  React.useEffect(() => {
    let active = true;
    const fetchWorkers = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery.trim()) params.set("search", searchQuery.trim());
        if (selectedCategory !== "all") params.set("category", selectedCategory);
        if (selectedSkill !== "all") params.set("skill", selectedSkill);
        if (selectedLocation !== "all") params.set("city", selectedLocation);
        if (selectedAvailability !== "all") params.set("availability", selectedAvailability);

        if (selectedExperience !== "all") {
          const exp = parseInt(selectedExperience, 10);
          if (!isNaN(exp)) params.set("minExp", exp.toString());
        }

        const res = await fetch(`/api/workers?${params.toString()}`);
        if (!res.ok) throw new Error("Search failed");
        const json = await res.json();

        if (active && json.success && Array.isArray(json.data)) {
          // Map backend workers or match with featured professionals
          const mapped = json.data.map((w: any) => {
            const matchedDemo = FEATURED_PROFESSIONALS.find(
              (p) => p.registryId === w.registry_id || p.id === w.id
            );
            if (matchedDemo) {
              return {
                ...matchedDemo,
                availabilityStatus: w.availability_status || matchedDemo.availabilityStatus,
              };
            }

            return {
              id: w.id,
              isDemoRecord: true as const,
              registryId: w.registry_id || "IN-2026-KS",
              fullName: w.fullName || w.headline?.split(" ")[0] || "Master Craftsman",
              photoUrl: w.photoUrl || "https://images.unsplash.com/photo-1508873696983-2df570464756?auto=format&fit=crop&w=400&q=80",
              primaryTrade: w.headline || "Certified Specialist",
              subTrades: w.subTrades || ["Precision Craft", "Safety Certified"],
              yearsExperience: w.years_experience || 5,
              location: {
                city: w.city || "Jaipur",
                state: w.state || "Rajasthan",
                pincode: w.pincode || "302001",
              },
              languages: w.languages || ["Hindi", "English"],
              aadhaarVerified: w.aadhaar_verified ?? true,
              digiLockerLinked: w.digilocker_linked ?? true,
              bio: w.bio || "Certified trade professional on KAAMSETU.",
              kaamScore: {
                totalScore: w.kaamscore || 820,
                tier: (w.kaamscore >= 820 ? "Sovereign Master" : "Institutional Tier") as any,
                level: w.kaamscore_level || 4,
                percentileRank: 95,
                trajectory: "rising" as const,
                lastVerifiedDate: "2026-11-14",
                breakdown: {
                  spokenAudioProof: 140,
                  domainAIExtraction: 140,
                  peerEndorsements: 160,
                  completedJobs: 200,
                  sovereignDigiLocker: 120,
                },
              },
              badges: [],
              experience: [],
              endorsements: [],
              qrVerificationUrl: `https://kaamsetu.gov.in/verify/${w.registry_id}`,
              dailyRateEstimate: {
                min: w.daily_rate_min || 1100,
                max: w.daily_rate_max || 1800,
              },
              availabilityStatus: (w.availability_status as any) || "available",
              createdAt: w.created_at || new Date().toISOString(),
              updatedAt: w.updated_at || new Date().toISOString(),
            };
          });

          setProfessionals(mapped);
        }
      } catch (err) {
        console.error("Explore search error, using client dataset:", err);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchWorkers, 200);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [
    searchQuery,
    selectedCategory,
    selectedSkill,
    selectedLocation,
    selectedExperience,
    selectedAvailability,
  ]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedSkill("all");
    setSelectedLocation("all");
    setSelectedExperience("all");
    setSelectedAvailability("all");
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedCategory !== "all" ||
    selectedSkill !== "all" ||
    selectedLocation !== "all" ||
    selectedExperience !== "all" ||
    selectedAvailability !== "all";

  return (
    <div className="space-y-12 pb-24">
      {/* 1. Header Banner */}
      <section className="relative overflow-hidden border-b border-forest/15 bg-gradient-to-b from-[#FFFFFF] via-[#F7F5F0] to-[#E9EFEA]/40 pt-14 pb-16">
        <div className="absolute inset-0 bg-paper-grid opacity-35 pointer-events-none" />

        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-xs bg-forest/10 px-3 py-1 border border-forest/20 text-xs font-bold text-forest uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4 text-forest" />
            <span>National Credential Registry & Discovery</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-forest leading-tight font-serif">
            Find Skilled Professionals Across Trades
          </h1>

          <p className="text-sm sm:text-base text-charcoal-muted max-w-2xl mx-auto leading-relaxed">
            Every professional profile features documented work experience, peer references, and verifiable trade qualifications.
          </p>

          <div className="pt-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-forest/20 text-forest text-xs"
            >
              <Link href="/customer/bookings">
                <Briefcase className="w-3.5 h-3.5 mr-1.5" />
                View My Bookings
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 2. Search & Filters Bar */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="rounded-2xl border border-forest/15 bg-card p-6 shadow-sovereign-sm space-y-5">
          {/* Main Search Input */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-forest/50" />
            <input
              type="text"
              placeholder="Search by worker name, craft (e.g. Solar, Joinery, Weaving), tool, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-13 pl-12 pr-4 rounded-xl border border-forest/20 bg-background text-sm text-foreground focus:outline-none focus:border-forest focus:ring-2 focus:ring-sand/60 shadow-inner"
            />
          </div>

          {/* Secondary Filter Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-1">
            {/* 1. Profession / Category */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-muted block mb-1">
                Profession / Trade
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-forest/20 bg-card text-xs text-forest font-semibold focus:outline-none focus:border-forest"
              >
                <option value="all">All Professions</option>
                {PROFESSIONS_DATA.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.title}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Location / District */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-muted block mb-1">
                Location (District/City)
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-forest/20 bg-card text-xs text-forest font-semibold focus:outline-none focus:border-forest"
              >
                <option value="all">All Locations (India)</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Skill Filter */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-muted block mb-1">
                Specialized Skill
              </label>
              <select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-forest/20 bg-card text-xs text-forest font-semibold focus:outline-none focus:border-forest"
              >
                <option value="all">All Skills</option>
                {popularSkills.map((sk) => (
                  <option key={sk} value={sk}>
                    {sk}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Experience Filter */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-muted block mb-1">
                Experience
              </label>
              <select
                value={selectedExperience}
                onChange={(e) => setSelectedExperience(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-forest/20 bg-card text-xs text-forest font-semibold focus:outline-none focus:border-forest"
              >
                <option value="all">Any Experience</option>
                <option value="3">3+ Years</option>
                <option value="5">5+ Years (Proven)</option>
                <option value="10">10+ Years (Senior)</option>
                <option value="15">15+ Years (Master)</option>
              </select>
            </div>

            {/* 5. Availability Filter */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-muted block mb-1">
                Availability
              </label>
              <select
                value={selectedAvailability}
                onChange={(e) => setSelectedAvailability(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-forest/20 bg-card text-xs text-forest font-semibold focus:outline-none focus:border-forest"
              >
                <option value="all">All Statuses</option>
                <option value="available">Available for Direct Hire</option>
                <option value="on_site">Currently On-Site</option>
              </select>
            </div>
          </div>

          {/* Filter Status & Reset */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-forest/10 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-forest">
                {isLoading ? "Searching database..." : `${professionals.length} Certified Professionals Found`}
              </span>
              <span className="text-charcoal-muted">•</span>
              <span className="text-[11px] text-charcoal-muted">
                Live Supabase Query with Demo Labelling
              </span>
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="text-xs text-forest hover:text-forest-600 gap-1.5 h-8 px-2.5 font-medium"
              >
                <RotateCcw className="h-3 w-3" />
                Reset All Filters
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* 3. Professionals Results Grid */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {professionals.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-forest/25 p-12 text-center space-y-4 bg-card/50">
            <SlidersHorizontal className="mx-auto h-12 w-12 text-forest/30" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-forest">
                No Certified Professionals Found
              </h3>
              <p className="text-xs text-charcoal-muted max-w-sm mx-auto">
                No workers matched your specific combination of profession, skill, and location filters.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="text-xs border-forest/20 text-forest"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {professionals.map((pro) => (
              <ProfessionalCard key={pro.id} professional={pro} />
            ))}
          </div>
        )}
      </section>

      {/* 4. Trust Assurance Banner */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="rounded-2xl bg-forest-900 text-ivory p-8 sm:p-10 border border-sand/30 shadow-sovereign-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 text-sand text-xs font-mono">
              <ShieldCheck className="w-4 h-4" />
              <span>SOVEREIGN WORKFORCE VERIFICATION GUARANTEE</span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-ivory">
              Need to Contract for Commercial Infrastructure?
            </h3>
            <p className="text-xs sm:text-sm text-sand/80 leading-relaxed">
              Every KAAMSETU artisan carries a cryptographically verifiable Sovereign Credential Card with DigiLocker authentication and tamper-evident work records.
            </p>
          </div>

          <Button
            asChild
            size="lg"
            className="bg-sand text-forest hover:bg-sand-400 font-semibold text-sm h-12 px-7 shrink-0 shadow-sovereign-md"
          >
            <Link href="/onboarding">
              Register as a Skilled Worker
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
