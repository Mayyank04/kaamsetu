"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  MapPin,
  X,
  SlidersHorizontal,
  RotateCcw,
  Zap,
  Wrench,
  Hammer,
  Home,
  Brush,
  Fan,
  Car,
  Scissors,
  Shirt,
  HardHat,
  Truck,
  Briefcase,
  CheckCircle2,
  PhoneCall,
  ExternalLink,
  ChevronDown,
  Navigation,
  CalendarCheck,
  Building2,
  Shield,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { VerifiedPhoneBadge } from "@/components/ui/verified-phone-badge";
import { BookingRequestDialog } from "@/components/profile/booking-request-dialog";
import {
  MARKETPLACE_CATEGORIES,
  MarketplaceCategory,
  getAllCategories,
  getCategoryBySlug,
} from "@/lib/constants/marketplace-categories";
import { FEATURED_PROFESSIONALS } from "@/lib/data/professionals";
import { formatINR } from "@/lib/utils";

// Map Lucide icons to category iconName
const CATEGORY_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Zap,
  Wrench,
  Hammer,
  Home,
  Brush,
  Fan,
  Car,
  Scissors,
  Shirt,
  HardHat,
  Truck,
  Briefcase,
};

export default function FindProfessionalsPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  const [selectedSubcategory, setSelectedSubcategory] = React.useState<string>("all");
  const [selectedCity, setSelectedCity] = React.useState<string>("all");
  const [phoneFilter, setPhoneFilter] = React.useState<string>("all"); // 'all' | 'sms_verified' | 'sandbox_verified' | 'verified_any'
  const [minExperience, setMinExperience] = React.useState<number>(0);
  const [availabilityFilter, setAvailabilityFilter] = React.useState<string>("all");
  const [sortBy, setSortBy] = React.useState<"recommended" | "score" | "experience">("recommended");
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [workers, setWorkers] = React.useState(FEATURED_PROFESSIONALS);
  const [activeWorkerForBooking, setActiveWorkerForBooking] = React.useState<{
    id: string;
    name: string;
    service?: string;
  } | null>(null);

  // Search input suggestions state
  const [isSearchFocused, setIsSearchFocused] = React.useState(false);

  // Popular search tags grounded in real platform categories
  const popularKeywords = [
    "Electrician",
    "Plumber",
    "AC repair",
    "Carpenter",
    "Deep cleaning",
    "Mason",
    "Mechanic",
    "Tailor",
  ];

  // Authorized rollout locations
  const locations = [
    { label: "All Pilot Zones", value: "all" },
    { label: "Guwahati Urban", value: "Guwahati" },
    { label: "Dispur", value: "Dispur" },
    { label: "Shillong Urban", value: "Shillong" },
  ];

  // Fetch or filter workers
  const fetchWorkers = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
      if (selectedCategory !== "all") params.set("category", selectedCategory);
      if (selectedSubcategory !== "all") params.set("subcategory", selectedSubcategory);
      if (selectedCity !== "all") params.set("city", selectedCity);
      if (phoneFilter !== "all") params.set("phoneStatus", phoneFilter);
      if (minExperience > 0) params.set("minExp", String(minExperience));
      if (availabilityFilter !== "all") params.set("availability", availabilityFilter);

      const res = await fetch(`/api/workers?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          // Map API workers to UI items
          const mapped = json.data.map((w: any) => ({
            id: w.id,
            registryId: w.registry_id || w.registryId || "IN-AS-2026-KS",
            fullName: w.fullName || w.headline?.split("•")[0]?.trim() || "Artisan",
            primaryTrade: w.headline || w.primaryTrade || "Trade Artisan",
            subTrades: w.subTrades || [],
            yearsExperience: w.years_experience || w.yearsExperience || 5,
            location: {
              city: w.city || "Guwahati",
              state: w.state || "Assam",
              pincode: w.pincode || "781001",
            },
            languages: w.languages || ["Hindi", "Assamese"],
            aadhaarVerified: Boolean(w.aadhaar_verified ?? w.aadhaarVerified),
            digiLockerLinked: Boolean(w.digilocker_linked ?? w.digiLockerLinked),
            phoneVerificationStatus: w.phone_verification_status || w.phoneVerificationStatus || "not_verified",
            categorySlug: w.category_slug || w.categorySlug || "electrical",
            dailyRateEstimate: {
              min: w.daily_rate_min || 800,
              max: w.daily_rate_max || 1600,
            },
            photoUrl: w.photoUrl || null,
            kaamScore: {
              totalScore: w.kaamscore || w.kaamScore?.totalScore || 750,
              level: w.kaamscore_level || 3,
              tier: w.kaamscore >= 820 ? "Sovereign Master" : "Institutional Verified",
            },
            bio: w.bio || "",
          }));

          // Sort in memory
          if (sortBy === "score") {
            mapped.sort((a: any, b: any) => b.kaamScore.totalScore - a.kaamScore.totalScore);
          } else if (sortBy === "experience") {
            mapped.sort((a: any, b: any) => b.yearsExperience - a.yearsExperience);
          }

          setWorkers(mapped);
          return;
        }
      }

      // Fallback local filtering if API has no network
      let fallback = [...FEATURED_PROFESSIONALS];
      if (selectedCategory !== "all") {
        fallback = fallback.filter((w: any) => w.categorySlug === selectedCategory || w.primaryTrade.toLowerCase().includes(selectedCategory.replace(/-/g, " ")));
      }
      if (selectedCity !== "all") {
        fallback = fallback.filter((w) => w.location.city.toLowerCase() === selectedCity.toLowerCase());
      }
      if (phoneFilter !== "all") {
        if (phoneFilter === "verified_any") {
          fallback = fallback.filter((w: any) => w.phoneVerificationStatus === "sms_verified" || w.phoneVerificationStatus === "sandbox_verified");
        } else {
          fallback = fallback.filter((w: any) => w.phoneVerificationStatus === phoneFilter);
        }
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        fallback = fallback.filter(
          (w) =>
            w.fullName.toLowerCase().includes(q) ||
            w.primaryTrade.toLowerCase().includes(q) ||
            w.subTrades.some((s) => s.toLowerCase().includes(q))
        );
      }
      setWorkers(fallback);
    } catch {
      // Local graceful fallback
      setWorkers(FEATURED_PROFESSIONALS);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedSubcategory, selectedCity, phoneFilter, minExperience, availabilityFilter, sortBy]);

  // Debounced search trigger
  React.useEffect(() => {
    const timer = setTimeout(() => {
      fetchWorkers();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchWorkers]);

  // Active Category details
  const activeCategory = React.useMemo(() => {
    if (selectedCategory === "all") return null;
    return getCategoryBySlug(selectedCategory);
  }, [selectedCategory]);

  const handleCategoryClick = (slug: string) => {
    if (selectedCategory === slug) {
      setSelectedCategory("all");
      setSelectedSubcategory("all");
    } else {
      setSelectedCategory(slug);
      setSelectedSubcategory("all");
    }
  };

  const resetAllFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedSubcategory("all");
    setSelectedCity("all");
    setPhoneFilter("all");
    setMinExperience(0);
    setAvailabilityFilter("all");
    setSortBy("recommended");
  };

  // Optional GPS Request (graceful, non-mandatory)
  const [gpsLoading, setGpsLoading] = React.useState(false);
  const [gpsNotice, setGpsNotice] = React.useState<string | null>(null);

  const handleRequestGps = () => {
    if (!navigator.geolocation) {
      setGpsNotice("Geolocation not supported by your browser.");
      return;
    }
    setGpsLoading(true);
    setGpsNotice(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGpsLoading(false);
        // Controlled rollout boundary check: Guwahati (approx 26.14, 91.73), Shillong (approx 25.57, 91.89)
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        if (lat >= 25.8 && lat <= 26.4 && lon >= 91.4 && lon <= 92.1) {
          setSelectedCity("Guwahati");
          setGpsNotice("Located in Guwahati Urban pilot zone.");
        } else if (lat >= 25.3 && lat <= 25.8 && lon >= 91.6 && lon <= 92.2) {
          setSelectedCity("Shillong");
          setGpsNotice("Located in Shillong Urban pilot zone.");
        } else {
          setGpsNotice("Outside current pilot zones. Showing all verified professionals.");
        }
      },
      () => {
        setGpsLoading(false);
        setGpsNotice("Location permission declined. You can select your city manually.");
      },
      { timeout: 8000 }
    );
  };

  return (
    <div className="min-h-screen bg-ivory text-charcoal pb-16">
      {/* 1. Dignified Marketplace Header */}
      <section className="bg-forest text-ivory border-b border-forest-700/60 pt-10 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Pilot Badge & Breadcrumb */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sand font-bold tracking-wider uppercase text-[11px] bg-sand/15 px-2 py-0.5 rounded-xs border border-sand/30">
                CLASS_B_CONTROLLED_ROLLOUT
              </span>
              <span className="text-ivory/70 hidden sm:inline">•</span>
              <span className="text-ivory/85 hidden sm:inline">
                Guwahati Urban & Shillong Urban
              </span>
            </div>
            <span className="text-sand/90 text-xs font-mono font-medium">
              0% Commission on Worker Wages
            </span>
          </div>

          {/* Heading */}
          <div className="space-y-2 max-w-3xl">
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-ivory">
              Find the right professional
            </h1>
            <p className="text-sm sm:text-base text-ivory/80 leading-relaxed font-sans">
              Connect directly with verified plumbers, electricians, carpenters, AC technicians and skilled trade artisans. Direct phone contacts, no middlemen, zero platform deductions.
            </p>
          </div>

          {/* Search & Location Bar */}
          <div className="bg-ivory rounded-md p-2.5 sm:p-3 shadow-sovereign-md border border-forest/20 grid grid-cols-1 md:grid-cols-12 gap-2 text-charcoal">
            {/* Search Input */}
            <div className="relative md:col-span-7 flex items-center">
              <Search className="w-5 h-5 text-forest/60 ml-3 shrink-0" aria-hidden="true" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                placeholder="What service do you need? Try electrician, plumber, carpenter..."
                className="w-full pl-3 pr-8 py-2.5 bg-transparent text-sm text-charcoal placeholder:text-charcoal-muted/70 focus:outline-none"
                aria-label="Search professions, skills, or service keywords"
                data-testid="input-marketplace-search"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="p-1 mr-2 text-charcoal-muted hover:text-forest"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Suggestions Dropdown */}
              {isSearchFocused && !searchQuery && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-ivory border border-forest/20 rounded-md shadow-sovereign-md z-30 p-3 space-y-2 animate-in fade-in">
                  <span className="text-[11px] font-mono font-bold text-forest uppercase tracking-wider block">
                    Popular Services
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {popularKeywords.map((kw) => (
                      <button
                        key={kw}
                        type="button"
                        onMouseDown={() => setSearchQuery(kw)}
                        className="text-xs px-2.5 py-1 rounded-xs bg-forest/5 hover:bg-forest/10 border border-forest/15 text-forest font-medium transition-colors"
                      >
                        {kw}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* City Selector */}
            <div className="relative md:col-span-3 flex items-center border-t md:border-t-0 md:border-l border-forest/15 pt-2 md:pt-0 md:pl-2">
              <MapPin className="w-4 h-4 text-forest/70 ml-2 shrink-0" aria-hidden="true" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full pl-2 pr-6 py-2 bg-transparent text-xs sm:text-sm font-medium text-forest focus:outline-none cursor-pointer"
                aria-label="Filter by locality or city"
                data-testid="select-city"
              >
                {locations.map((loc) => (
                  <option key={loc.value} value={loc.value}>
                    {loc.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Action / GPS Button */}
            <div className="md:col-span-2 flex items-center gap-1.5">
              <Button
                type="button"
                onClick={() => fetchWorkers()}
                className="w-full bg-forest text-ivory hover:bg-forest-600 text-xs sm:text-sm font-semibold h-10 shadow-xs"
                data-testid="btn-search-professionals"
              >
                Search
              </Button>
              <button
                type="button"
                onClick={handleRequestGps}
                title="Optional: Detect location in Guwahati or Shillong"
                aria-label="Optional GPS location detection"
                className="p-2.5 rounded-sm border border-forest/20 text-forest hover:bg-forest/5 shrink-0"
              >
                <Navigation className={`w-4 h-4 ${gpsLoading ? "animate-spin text-forest" : ""}`} />
              </button>
            </div>
          </div>

          {/* GPS feedback notice */}
          {gpsNotice && (
            <div className="text-xs text-sand/90 font-mono bg-forest-900/60 px-3 py-1.5 rounded-xs border border-sand/20 inline-block">
              {gpsNotice}
            </div>
          )}

          {/* Quick Popular Service Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-ivory/70 text-[11px] font-mono uppercase tracking-wider">
              Popular services near you:
            </span>
            {popularKeywords.slice(0, 6).map((kw) => (
              <button
                key={kw}
                type="button"
                onClick={() => setSearchQuery(kw)}
                className="text-xs px-2.5 py-0.5 rounded-xs bg-forest-600/70 hover:bg-forest-500 border border-forest-400/30 text-ivory font-medium transition-colors"
              >
                {kw}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Structured Category Discovery Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between border-b border-forest/15 pb-3">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-forest">
              Browse by Profession
            </h2>
            <p className="text-xs text-charcoal-muted">
              12 structured trade categories with verified local service providers
            </p>
          </div>
          {selectedCategory !== "all" && (
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("all");
                setSelectedSubcategory("all");
              }}
              className="text-xs text-forest underline hover:text-forest-600 font-medium flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Category
            </button>
          )}
        </div>

        {/* 12 Category Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3" data-testid="category-grid">
          {MARKETPLACE_CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICON_MAP[cat.iconName] || Briefcase;
            const isSelected = selectedCategory === cat.slug;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryClick(cat.slug)}
                className={`group relative flex flex-col items-center justify-center p-3.5 rounded-md border text-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest ${
                  isSelected
                    ? "bg-forest text-ivory border-forest shadow-sovereign-sm"
                    : "bg-card text-charcoal border-forest/15 hover:border-forest/40 hover:bg-forest/5"
                }`}
                data-testid={`category-card-${cat.slug}`}
                aria-pressed={isSelected}
              >
                <div
                  className={`w-10 h-10 rounded-sm flex items-center justify-center mb-2 border transition-colors ${
                    isSelected
                      ? "bg-sand text-forest border-sand"
                      : "bg-forest/5 text-forest border-forest/15 group-hover:bg-forest/10"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="font-semibold text-xs leading-snug line-clamp-1">
                  {cat.title}
                </span>
                <span
                  className={`text-[10px] mt-0.5 line-clamp-1 ${
                    isSelected ? "text-sand font-medium" : "text-charcoal-muted"
                  }`}
                >
                  {cat.hindiTitle}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Category Filter Banner & Subcategories */}
        {activeCategory && (
          <div className="bg-forest/5 border border-forest/20 rounded-md p-4 space-y-3 animate-in fade-in">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-forest font-mono">
                  Filtered by Category:
                </span>
                <span className="text-sm font-bold text-forest">
                  {activeCategory.title} ({activeCategory.hindiTitle})
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("all");
                  setSelectedSubcategory("all");
                }}
                className="text-xs text-charcoal-muted hover:text-forest underline"
              >
                Clear Category Filter
              </button>
            </div>

            <p className="text-xs text-charcoal-muted leading-relaxed">
              {activeCategory.description}
            </p>

            {/* Subcategories Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-mono text-charcoal-muted mr-1">
                Specializations:
              </span>
              <button
                type="button"
                onClick={() => setSelectedSubcategory("all")}
                className={`text-xs px-2.5 py-1 rounded-xs border font-medium transition-colors ${
                  selectedSubcategory === "all"
                    ? "bg-forest text-ivory border-forest"
                    : "bg-card text-charcoal border-forest/15 hover:bg-forest/5"
                }`}
              >
                All {activeCategory.title}
              </button>
              {activeCategory.subcategories.map((sub) => {
                const isSubSelected = selectedSubcategory === sub.name;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() =>
                      setSelectedSubcategory(isSubSelected ? "all" : sub.name)
                    }
                    className={`text-xs px-2.5 py-1 rounded-xs border font-medium transition-colors ${
                      isSubSelected
                        ? "bg-forest text-ivory border-forest"
                        : "bg-card text-charcoal border-forest/15 hover:bg-forest/5"
                    }`}
                  >
                    {sub.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* 3. Filter Controls & Results Area */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-card border border-forest/15 rounded-md p-3.5 shadow-xs">
          {/* Left: Total counter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-forest" data-testid="results-count">
              {isLoading ? "Searching..." : `${workers.length} professionals found`}
            </span>
            {selectedCity !== "all" && (
              <Badge variant="outline" className="border-forest/20 text-forest text-[10px]">
                in {selectedCity}
              </Badge>
            )}
            {phoneFilter !== "all" && (
              <Badge variant="outline" className="border-forest/20 text-forest text-[10px]">
                {phoneFilter === "sms_verified"
                  ? "Carrier Phone Verified"
                  : phoneFilter === "sandbox_verified"
                  ? "Test Verified"
                  : "Verified Only"}
              </Badge>
            )}
          </div>

          {/* Right: Quick Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Phone Verification Toggle */}
            <div className="flex items-center gap-1.5 text-xs">
              <label htmlFor="phone-filter-select" className="text-charcoal-muted text-[11px] font-mono">
                Verification:
              </label>
              <select
                id="phone-filter-select"
                value={phoneFilter}
                onChange={(e) => setPhoneFilter(e.target.value)}
                className="bg-card border border-forest/20 rounded-xs px-2 py-1 text-xs text-forest focus:outline-none"
                data-testid="filter-phone-verification"
              >
                <option value="all">All Verification States</option>
                <option value="sms_verified">Phone Verified (SMS OTP)</option>
                <option value="sandbox_verified">Test Verified (Sandbox)</option>
                <option value="verified_any">Any Verified Phone</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 text-xs">
              <label htmlFor="sort-select" className="text-charcoal-muted text-[11px] font-mono">
                Sort:
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-card border border-forest/20 rounded-xs px-2 py-1 text-xs text-forest focus:outline-none"
                data-testid="sort-select"
              >
                <option value="recommended">Recommended</option>
                <option value="score">Highest KaamScore</option>
                <option value="experience">Most Experienced</option>
              </select>
            </div>

            {/* Toggle Filter Drawer button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="text-xs border-forest/20 text-forest hover:bg-forest/5 h-8 gap-1.5"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
            </Button>

            {/* Reset All Filters button */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={resetAllFilters}
              className="text-xs text-charcoal-muted hover:text-forest h-8"
              title="Reset all filters"
            >
              Reset
            </Button>
          </div>
        </div>

        {/* Collapsible Detailed Filter Drawer */}
        {isFilterOpen && (
          <div className="bg-card border border-forest/20 rounded-md p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs animate-in fade-in">
            {/* Minimum Experience */}
            <div className="space-y-1.5">
              <label className="font-semibold text-forest block">Minimum Experience</label>
              <select
                value={minExperience}
                onChange={(e) => setMinExperience(Number(e.target.value))}
                className="w-full bg-card border border-forest/20 rounded-xs p-2 text-xs text-forest focus:outline-none"
              >
                <option value={0}>Any Experience Level</option>
                <option value={3}>3+ Years</option>
                <option value={5}>5+ Years</option>
                <option value={10}>10+ Years (Senior Master)</option>
              </select>
            </div>

            {/* Availability */}
            <div className="space-y-1.5">
              <label className="font-semibold text-forest block">Work Availability</label>
              <select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
                className="w-full bg-card border border-forest/20 rounded-xs p-2 text-xs text-forest focus:outline-none"
              >
                <option value="all">Any Availability</option>
                <option value="available">Available Now</option>
                <option value="on_site">On-Site / Assigned</option>
              </select>
            </div>

            {/* Reset Action in Drawer */}
            <div className="flex items-end">
              <Button
                type="button"
                variant="outline"
                onClick={resetAllFilters}
                className="w-full border-forest/20 text-forest text-xs h-9"
              >
                Clear All Criteria
              </Button>
            </div>
          </div>
        )}

        {/* 4. Professional Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="rounded-md border border-forest/15 bg-card p-5 space-y-4 animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-sm bg-forest/10" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-forest/10 rounded w-3/4" />
                    <div className="h-3 bg-forest/10 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-12 bg-forest/5 rounded" />
                <div className="h-4 bg-forest/10 rounded w-full" />
              </div>
            ))}
          </div>
        ) : workers.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 px-4 bg-card rounded-md border border-forest/15 shadow-xs space-y-4 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-sm bg-forest/10 border border-forest/20 flex items-center justify-center text-forest mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-forest">
              No matching professionals found
            </h3>
            <p className="text-xs text-charcoal-muted leading-relaxed">
              We could not find any professionals matching your current search and filter combination in Guwahati or Shillong. Try broadening your criteria or resetting filters.
            </p>
            <div className="pt-2">
              <Button
                type="button"
                onClick={resetAllFilters}
                className="bg-forest text-ivory hover:bg-forest-600 text-xs"
              >
                Reset All Filters
              </Button>
            </div>
          </div>
        ) : (
          /* Search Results Grid */
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            data-testid="professionals-results-grid"
          >
            {workers.map((worker) => {
              const workerSlug = `${worker.fullName
                .toLowerCase()
                .replace(/\s+/g, "-")}-${worker.location.city.toLowerCase()}`;

              return (
                <div
                  key={worker.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-md border border-forest/15 bg-card shadow-sovereign-sm hover:shadow-sovereign-md hover:border-forest/35 transition-all duration-300"
                  data-testid={`professional-card-${worker.id}`}
                >
                  {/* Card Top Ribbon */}
                  <div className="bg-forest/5 px-4 py-2 border-b border-forest/10 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 font-mono text-forest-700">
                      <Shield className="h-3 w-3 text-forest" />
                      <span>{worker.registryId}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <VerifiedPhoneBadge status={worker.phoneVerificationStatus} size="sm" />
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 space-y-4 flex-1 flex flex-col">
                    {/* Portrait & Details */}
                    <div className="flex items-start gap-4">
                      <div className="relative w-16 h-16 min-w-16 min-h-16 shrink-0 overflow-hidden rounded-sm border border-forest/20 bg-forest/5 shadow-xs">
                        {worker.photoUrl ? (
                          <Image
                            src={worker.photoUrl}
                            alt={worker.fullName}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-forest text-sand font-bold text-base">
                            {worker.fullName.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/profile/${workerSlug}`}
                            className="font-bold text-forest text-base leading-snug truncate hover:underline hover:text-forest-600 transition-colors"
                          >
                            {worker.fullName}
                          </Link>
                          {worker.aadhaarVerified && (
                            <CheckCircle2
                              className="h-3.5 w-3.5 text-emerald-700 shrink-0"
                              aria-label="Aadhaar Verified"
                            />
                          )}
                        </div>

                        <p className="text-xs font-semibold text-charcoal line-clamp-1">
                          {worker.primaryTrade}
                        </p>

                        <div className="flex items-center gap-1 text-[11px] text-charcoal-muted">
                          <MapPin className="h-3 w-3 text-forest shrink-0" />
                          <span className="truncate">
                            {worker.location.city}, {worker.location.state} • {worker.yearsExperience} yrs exp
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* KaamScore Pill */}
                    <div className="rounded-xs bg-forest/5 p-2 border border-forest/10 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-muted block font-mono">
                          KAAMSCORE™
                        </span>
                        <span className="text-[11px] font-semibold text-forest">
                          {worker.kaamScore.tier}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-base font-black text-forest">
                          {worker.kaamScore.totalScore}
                        </span>
                        <span className="text-[10px] text-charcoal-muted font-mono">/900</span>
                      </div>
                    </div>

                    {/* Bio Snippet */}
                    {worker.bio && (
                      <p className="text-xs text-charcoal-muted line-clamp-2 leading-relaxed">
                        {worker.bio}
                      </p>
                    )}

                    {/* Skills Chips */}
                    <div className="space-y-1 pt-1 flex-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-muted block font-mono">
                        Specialized Skills
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {worker.subTrades.slice(0, 3).map((trade, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-2 py-0.5 rounded-xs bg-card border border-forest/15 text-forest font-medium"
                          >
                            {trade}
                          </span>
                        ))}
                        {worker.subTrades.length > 3 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-xs bg-forest/5 text-charcoal-muted">
                            +{worker.subTrades.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Rates & Actions */}
                  <div className="p-4 pt-3 border-t border-forest/10 mt-auto bg-card flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-charcoal-muted block font-mono">
                        Estimated Day Rate
                      </span>
                      <span className="text-xs font-bold text-forest">
                        {formatINR(worker.dailyRateEstimate?.min || 900)} – {formatINR(worker.dailyRateEstimate?.max || 1600)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() =>
                          setActiveWorkerForBooking({
                            id: worker.id,
                            name: worker.fullName,
                            service: worker.primaryTrade,
                          })
                        }
                        className="bg-forest text-ivory hover:bg-forest-600 text-xs h-8 px-3 font-medium shadow-xs"
                        data-testid={`btn-request-service-${worker.id}`}
                      >
                        Request Service
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="border-forest/20 text-forest hover:bg-forest/5 text-xs h-8 px-2"
                      >
                        <Link href={`/profile/${workerSlug}`} aria-label={`View ${worker.fullName}'s profile`}>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 5. Booking Request Dialog Integration */}
      {activeWorkerForBooking && (
        <BookingRequestDialog
          isOpen={Boolean(activeWorkerForBooking)}
          onClose={() => setActiveWorkerForBooking(null)}
          workerProfileId={activeWorkerForBooking.id}
          workerName={activeWorkerForBooking.name}
          prefilledService={activeWorkerForBooking.service}
        />
      )}
    </div>
  );
}
