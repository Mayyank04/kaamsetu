"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  ShieldCheck,
  MapPin,
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
import { GeographicAuthorizationService } from "@/lib/geo/geographic-authorization-service";
import { WorkerProfile } from "@/types/identity";
import { useTranslation } from "@/lib/i18n/i18n-context";
import { Store, ShoppingBag, Mic } from "lucide-react";
import { IntelligentVoiceAssistant, ExtractedVoiceIntent } from "@/components/voice/intelligent-voice-assistant";

export default function ExplorePage() {
  const { t } = useTranslation();
  const [isVoiceOpen, setIsVoiceOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedProfileType, setSelectedProfileType] = React.useState<"all" | "service_professional" | "goods_vendor">("all");
  const [selectedCategory, setSelectedCategory] = React.useState("all");
  const [selectedSkill, setSelectedSkill] = React.useState("all");
  const [selectedState, setSelectedState] = React.useState("all");
  const [selectedDistrict, setSelectedDistrict] = React.useState("all");
  const [selectedLocation, setSelectedLocation] = React.useState("all");
  const [selectedExperience, setSelectedExperience] = React.useState("all");
  const [selectedAvailability, setSelectedAvailability] = React.useState("all");

  const allStates = React.useMemo(() => GeographicAuthorizationService.getAllStates(), []);
  const availableDistricts = React.useMemo(() => {
    return selectedState !== "all" ? GeographicAuthorizationService.getDistrictsForState(selectedState) : [];
  }, [selectedState]);

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
        if (selectedProfileType !== "all") params.set("profileType", selectedProfileType);
        if (selectedCategory !== "all") params.set("category", selectedCategory);
        if (selectedSkill !== "all") params.set("skill", selectedSkill);
        if (selectedState !== "all") params.set("state", selectedState);
        if (selectedDistrict !== "all") params.set("district", selectedDistrict);
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
              qrVerificationUrl: `/verify/${w.registry_id}`,
              dailyRateEstimate: {
                min: w.daily_rate_min || 1100,
                max: w.daily_rate_max || 1800,
              },
              profileType: w.profile_type || "service_professional",
              businessName: w.business_name || undefined,
              vendorType: w.vendor_type || undefined,
              stallType: w.stall_type || undefined,
              operatingHours: w.operating_hours || undefined,
              productCatalog: w.product_catalog || [],
              deliveryAvailable: Boolean(w.delivery_available),
              contactPreference: w.contact_preference || "phone",
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
    selectedProfileType,
    selectedCategory,
    selectedSkill,
    selectedState,
    selectedDistrict,
    selectedLocation,
    selectedExperience,
    selectedAvailability,
  ]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedProfileType("all");
    setSelectedCategory("all");
    setSelectedSkill("all");
    setSelectedState("all");
    setSelectedDistrict("all");
    setSelectedLocation("all");
    setSelectedExperience("all");
    setSelectedAvailability("all");
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedProfileType !== "all" ||
    selectedCategory !== "all" ||
    selectedSkill !== "all" ||
    selectedState !== "all" ||
    selectedDistrict !== "all" ||
    selectedLocation !== "all" ||
    selectedExperience !== "all" ||
    selectedAvailability !== "all";

  return (
    <div className="space-y-12 pb-24">
      {/* 1. Header Banner */}
      <section className="relative overflow-hidden border-b border-forest/15 bg-card pt-14 pb-16">
        <div className="absolute inset-0 bg-paper-grid opacity-35 pointer-events-none" />

        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-xs bg-forest/10 px-3 py-1 border border-forest/20 text-xs font-bold text-forest uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4 text-forest" />
            <span>National Credential Registry & Discovery</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-forest leading-tight font-serif">
            {t.explore?.pageTitle || "Find Skilled Professionals Across Trades"}
          </h1>

          <p className="text-sm sm:text-base text-charcoal-muted max-w-2xl mx-auto leading-relaxed">
            {t.explore?.pageSubtitle || "Every professional profile features documented work experience, peer references, and verifiable trade qualifications."}
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
        <div className="rounded-md border border-forest/15 bg-card p-4 sm:p-6 shadow-sovereign-sm space-y-5">
          {/* Profile Type Navigation: All vs Services vs Vendors */}
          <div className="flex flex-wrap items-center gap-2 border-b border-forest/10 pb-4">
            <button
              type="button"
              onClick={() => setSelectedProfileType("all")}
              className={`px-3 py-1.5 rounded-xs text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                selectedProfileType === "all"
                  ? "bg-forest text-ivory shadow-xs font-bold"
                  : "bg-forest/5 text-forest hover:bg-forest/10"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>{t.explore?.allListings || "All Listings"}</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedProfileType("service_professional")}
              className={`px-3 py-1.5 rounded-xs text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                selectedProfileType === "service_professional"
                  ? "bg-forest text-ivory shadow-xs font-bold"
                  : "bg-forest/5 text-forest hover:bg-forest/10"
              }`}
            >
              <Briefcase className="h-3.5 w-3.5" />
              <span>{t.explore?.serviceProfessionals || "Service Professionals"}</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedProfileType("goods_vendor")}
              className={`px-3 py-1.5 rounded-xs text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                selectedProfileType === "goods_vendor"
                  ? "bg-forest text-ivory shadow-xs font-bold"
                  : "bg-forest/5 text-forest hover:bg-forest/10"
              }`}
            >
              <Store className="h-3.5 w-3.5" />
              <span>{t.explore?.vendorsAndArtisans || "Local Vendors & Goods"}</span>
            </button>
          </div>

          {/* Main Search Input & Voice Trigger */}
          <div className="space-y-3">
            <div className="relative flex items-center">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-forest/50" />
              <input
                type="text"
                placeholder={t.explore?.searchPlaceholder || "Search by worker name, craft, tool, or city..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-13 pl-12 pr-28 rounded-sm border border-forest/20 bg-background text-sm text-foreground focus:outline-none focus:border-forest focus:ring-2 focus:ring-sand/60 shadow-inner"
              />
              <button
                type="button"
                onClick={() => setIsVoiceOpen((prev) => !prev)}
                className={`absolute right-2.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isVoiceOpen
                    ? "bg-forest text-ivory shadow-xs"
                    : "bg-forest/10 text-forest hover:bg-forest/15"
                }`}
                aria-label="Voice Search"
              >
                <Mic className="h-3.5 w-3.5" />
                <span>Voice</span>
              </button>
            </div>

            {/* Collapsible Voice Assistant */}
            {isVoiceOpen && (
              <div className="p-1 animate-in fade-in slide-in-from-top-2 duration-300">
                <IntelligentVoiceAssistant
                  targetMode="search"
                  onIntentConfirmed={(intent: ExtractedVoiceIntent) => {
                    if (intent.primaryTrade) setSearchQuery(intent.primaryTrade);
                    if (intent.city && intent.city !== "Guwahati") setSelectedLocation(intent.city);
                    if (intent.state && intent.state !== "Assam") setSelectedState(intent.state);
                    setIsVoiceOpen(false);
                  }}
                />
              </div>
            )}
          </div>

          {/* Secondary Filter Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 gap-3 pt-1">
            {/* 1. Profession / Category */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-muted block mb-1">
                Profession / Trade
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full h-10 px-2 rounded-xs border border-forest/20 bg-card text-xs text-forest font-semibold focus:outline-none focus:border-forest"
              >
                <option value="all">All Professions</option>
                {PROFESSIONS_DATA.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.title}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. State / UT (Nationwide 36 entities) */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-muted block mb-1">
                State / UT (36)
              </label>
              <select
                value={selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value);
                  setSelectedDistrict("all");
                }}
                className="w-full h-10 px-2 rounded-xs border border-forest/20 bg-card text-xs text-forest font-semibold focus:outline-none focus:border-forest"
              >
                <option value="all">All States & UTs</option>
                {allStates.map((st) => (
                  <option key={st.code} value={st.name}>
                    {st.name} {st.isUnionTerritory ? "(UT)" : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. District (Dynamic) */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-muted block mb-1">
                District
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                disabled={selectedState === "all" || availableDistricts.length === 0}
                className="w-full h-10 px-2 rounded-xs border border-forest/20 bg-card text-xs text-forest font-semibold focus:outline-none focus:border-forest disabled:opacity-50"
              >
                <option value="all">
                  {selectedState === "all" ? "Select State First" : "All Districts"}
                </option>
                {availableDistricts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Location (City / Metro Hub) */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-muted block mb-1">
                City / Metro Hub
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full h-10 px-2 rounded-xs border border-forest/20 bg-card text-xs text-forest font-semibold focus:outline-none focus:border-forest"
              >
                <option value="all">All Cities</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* 5. Skill Filter */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-muted block mb-1">
                Specialized Skill
              </label>
              <select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className="w-full h-10 px-2 rounded-xs border border-forest/20 bg-card text-xs text-forest font-semibold focus:outline-none focus:border-forest"
              >
                <option value="all">All Skills</option>
                {popularSkills.map((sk) => (
                  <option key={sk} value={sk}>
                    {sk}
                  </option>
                ))}
              </select>
            </div>

            {/* 6. Experience Filter */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-muted block mb-1">
                Experience
              </label>
              <select
                value={selectedExperience}
                onChange={(e) => setSelectedExperience(e.target.value)}
                className="w-full h-10 px-2 rounded-xs border border-forest/20 bg-card text-xs text-forest font-semibold focus:outline-none focus:border-forest"
              >
                <option value="all">Any Experience</option>
                <option value="3">3+ Years</option>
                <option value="5">5+ Years (Proven)</option>
                <option value="10">10+ Years (Senior)</option>
                <option value="15">15+ Years (Master)</option>
              </select>
            </div>

            {/* 7. Availability Filter */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-charcoal-muted block mb-1">
                Availability
              </label>
              <select
                value={selectedAvailability}
                onChange={(e) => setSelectedAvailability(e.target.value)}
                className="w-full h-10 px-2 rounded-xs border border-forest/20 bg-card text-xs text-forest font-semibold focus:outline-none focus:border-forest"
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
          <div className="rounded-md border border-dashed border-forest/25 p-12 text-center space-y-4 bg-card/50">
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
        <div className="rounded-md bg-forest-900 text-ivory p-8 sm:p-10 border border-sand/30 shadow-sovereign-md flex flex-col md:flex-row items-center justify-between gap-6">
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
