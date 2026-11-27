"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Mic,
  Search,
  Menu,
  X,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  Globe,
  Check,
  Languages,
} from "lucide-react";
import { TranslationDialog } from "@/components/translation/translation-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/use-auth";
import { useTranslation } from "@/lib/i18n/i18n-context";
import { SUPPORTED_LOCALES_METADATA } from "@/lib/i18n/translations";

function getDashboardForRole(role?: string | null) {
  switch (role) {
    case "contractor":
      return { href: "/contractor/dashboard", label: "Contractor Workspace" };
    case "vendor":
      return { href: "/vendor/dashboard", label: "Vendor Hub" };
    case "institution":
      return { href: "/institution/dashboard", label: "Institute Registry" };
    case "customer":
      return { href: "/customer/bookings", label: "My Bookings" };
    default:
      return { href: "/dashboard", label: "Worker Dashboard" };
  }
}

export function InstitutionalHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [isTranslationDialogOpen, setIsTranslationDialogOpen] = React.useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const { locale, setLocale, t, textSize, setTextSize } = useTranslation();

  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    if (mobileMenuOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [mobileMenuOpen]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  const roleDashboard = getDashboardForRole(user?.role);

  const primaryNavLinks = React.useMemo(() => {
    const base = [
      { href: "/", label: t.header?.home || "Home" },
      { href: "/find-professionals", label: t.header?.findProfessionals || "Find Professionals" },
      { href: "/translate", label: "Translator" },
      { href: "/how-it-works", label: t.header?.howItWorks || "How It Works" },
    ];
    if (isAuthenticated && user) {
      base.push({ href: roleDashboard.href, label: roleDashboard.label });
    }
    return base;
  }, [t, isAuthenticated, user, roleDashboard]);

  const partnerLinks = [
    {
      href: "/vendor/dashboard",
      label: t.header?.vendorHub || "Local Vendors & Shops",
      desc: "Manage shop catalogue & trade hours",
    },
    {
      href: "/contractor/dashboard",
      label: t.header?.contractorPro || "Contractor Pro",
      desc: "Crew invitations & site projects",
    },
    {
      href: "/institution/dashboard",
      label: t.header?.institutions || "Training Institutes",
      desc: "Trainee cohorts & skill certificates",
    },
    {
      href: "/about",
      label: t.header?.about || "About KAAMSETU",
      desc: "Mission, zero commission & pilot zones",
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-forest/15 bg-ivory safe-area-top">
      {/* Top Status Bar */}
      <div className="bg-forest text-ivory text-xs py-1.5 px-4 hidden sm:block border-b border-forest-500/20">
        <div className="container mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0 truncate">
            <span className="font-semibold text-sand-300 shrink-0">
              {t.header?.bannerTitle || "Direct Worker Recognition Platform"}
            </span>
            <span className="text-ivory/60 hidden md:inline" aria-hidden="true">•</span>
            <span className="text-ivory/85 truncate hidden md:inline">
              {t.header?.bannerSub || "0% Commission on Worker Earnings"}
            </span>
          </div>
          <div className="flex items-center gap-4 text-ivory/90 text-xs shrink-0">
            <span className="bg-sand/20 text-sand px-2 py-0.5 rounded-xs font-medium">
              {t.header?.controlledNotice || "Dispatch Pilot: Guwahati & Shillong"}
            </span>
            {!isAuthenticated && (
              <Link
                href="/login"
                className="text-sand underline underline-offset-4 hover:text-sand-300 font-semibold"
              >
                {t.header?.signIn || "Sign In"}
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto flex h-16 sm:h-18 items-center justify-between px-4 sm:px-6 lg:px-8 gap-3">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest rounded-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-forest text-sand font-extrabold text-sm border border-forest-700">
            KS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl font-bold tracking-tight text-forest leading-none">
                KAAMSETU
              </span>
              <span className="hidden xs:inline-block text-xs font-semibold text-sand-800 px-1.5 py-0.5 rounded-xs bg-sand/30 border border-sand/40 leading-none">
                कामसेतु
              </span>
            </div>
            <p className="text-[11px] font-semibold text-charcoal-muted leading-tight mt-0.5">
              Skill Identity &amp; Recognition
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav aria-label="Primary Navigation" className="hidden lg:flex items-center gap-5 xl:gap-6 text-sm font-semibold text-charcoal">
          {primaryNavLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "transition-colors relative py-1.5 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest rounded-xs",
                  isActive
                    ? "text-forest font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-forest"
                    : "text-charcoal-muted hover:text-forest"
                )}
              >
                {link.label}
              </Link>
            );
          })}

          {!isAuthenticated && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "flex items-center gap-1 transition-colors relative py-1.5 outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-forest rounded-xs",
                    partnerLinks.some((p) => pathname === p.href)
                      ? "text-forest font-bold"
                      : "text-charcoal-muted hover:text-forest"
                  )}
                >
                  <span>Partners</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64 p-2 shadow-sovereign-md">
                <DropdownMenuLabel className="text-xs font-bold text-charcoal-muted px-2 py-1">
                  Partner &amp; Community Portals
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {partnerLinks.map((p) => (
                  <DropdownMenuItem key={p.href} asChild className="cursor-pointer py-2 px-2.5 rounded-xs">
                    <Link href={p.href} className="flex flex-col gap-0.5">
                      <span className="font-bold text-xs text-forest">{p.label}</span>
                      <span className="text-xs text-charcoal-muted">{p.desc}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>

        {/* Right Actions & User Menu */}
        <div className="hidden md:flex items-center gap-2 lg:gap-2.5 shrink-0">
          {/* Accessibility: Text Size Toggle */}
          <button
            type="button"
            onClick={() => setTextSize(textSize === "normal" ? "large" : "normal")}
            className={cn(
              "min-h-[40px] px-2.5 rounded-sm border text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest",
              textSize === "large"
                ? "border-forest bg-forest text-ivory"
                : "border-forest/20 bg-card hover:bg-forest/5 text-forest"
            )}
            title={textSize === "normal" ? t.accessibility?.textSizeLarge : t.accessibility?.textSizeNormal}
            aria-label={textSize === "normal" ? t.accessibility?.textSizeLarge : t.accessibility?.textSizeNormal}
          >
            <span>{textSize === "large" ? "A+" : "A"}</span>
          </button>

          {/* Language Switcher (All 39 Languages) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="min-h-[40px] flex items-center gap-1.5 px-3 rounded-sm border border-forest/20 bg-card hover:bg-forest/5 text-xs text-forest font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
                aria-label="Select interface language"
              >
                <Globe className="w-4 h-4 text-forest/80" />
                <span className="font-bold">
                  {SUPPORTED_LOCALES_METADATA.find((m) => m.code === locale)?.nativeName || "English"}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-forest/60" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60 max-h-80 overflow-y-auto p-1.5">
              <DropdownMenuLabel className="text-xs font-bold text-charcoal-muted px-2 py-1">
                {t.accessibility?.languageSelector || "39 Indian Languages"}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {SUPPORTED_LOCALES_METADATA.map((meta) => {
                const isSelected = locale === meta.code;
                return (
                  <DropdownMenuItem
                    key={meta.code}
                    onClick={() => setLocale(meta.code)}
                    className={cn(
                      "text-xs flex items-center justify-between cursor-pointer py-2 px-2.5 rounded-xs",
                      isSelected ? "bg-forest/10 font-bold text-forest" : "text-charcoal hover:bg-forest/5"
                    )}
                  >
                    <div className="flex flex-col">
                      <span className="font-bold">{meta.nativeName}</span>
                      <span className="text-[11px] text-charcoal-muted">{meta.name}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-forest shrink-0 ml-2" />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsTranslationDialogOpen(true)}
            className="hidden lg:inline-flex min-h-[40px] border-forest/20 text-forest hover:bg-forest/5 text-xs"
            title="Open Universal Content & Voice Translator"
          >
            <Languages className="mr-1.5 h-4 w-4 text-forest" />
            <span>Translate</span>
          </Button>

          {!isAuthenticated && (
            <Button variant="default" size="sm" asChild className="min-h-[40px] bg-forest text-ivory hover:bg-forest-500 text-xs">
              <Link href="/onboarding">
                <Mic className="mr-1.5 h-4 w-4 text-sand" />
                {t.header?.register || "Create Profile"}
              </Link>
            </Button>
          )}

          {/* Role-Scoped User Auth Menu */}
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="min-h-[40px] flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-sm border border-forest/20 hover:border-forest/40 bg-card hover:bg-forest/5 transition-colors text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
                >
                  <div className="w-7 h-7 rounded-sm bg-forest text-ivory font-bold text-xs flex items-center justify-center overflow-hidden shrink-0 border border-forest-600">
                    {user.avatarUrl ? (
                      <Image src={user.avatarUrl} alt={user.fullName} width={28} height={28} unoptimized className="w-full h-full object-cover" />
                    ) : (
                      user.fullName.slice(0, 1)
                    )}
                  </div>
                  <div className="text-left hidden lg:block leading-tight">
                    <div className="font-bold text-forest truncate max-w-[110px]">
                      {user.fullName.split(" ")[0]}
                    </div>
                    <div className="text-[11px] text-charcoal-muted capitalize">
                      {user.role}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-forest/60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2">
                <DropdownMenuLabel className="space-y-1">
                  <div className="font-bold text-forest text-xs">{user.fullName}</div>
                  <div className="text-xs text-charcoal-muted font-mono">{user.phone || user.email || "Signed In"}</div>
                  <Badge variant="outline" className="text-[11px] bg-forest/5 text-forest capitalize font-semibold border-forest/15">
                    {user.role}
                  </Badge>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={roleDashboard.href} className="flex items-center gap-2 py-2">
                    <LayoutDashboard className="w-4 h-4 text-forest" />
                    <span>{roleDashboard.label}</span>
                  </Link>
                </DropdownMenuItem>
                {(user.role === "worker" || user.role === "vendor") && (
                  <DropdownMenuItem asChild>
                    <Link href="/onboarding" className="flex items-center gap-2 py-2">
                      <Mic className="w-4 h-4 text-forest" />
                      <span>Update Profile by Voice</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-700 focus:text-red-800 flex items-center gap-2 py-2 cursor-pointer">
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="sm" asChild className="min-h-[40px] text-xs text-forest hover:bg-forest/5 font-bold">
              <Link href="/login">Sign In</Link>
            </Button>
          )}
        </div>

        {/* Mobile / Tablet Hamburger Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden flex min-h-[44px] min-w-[44px] items-center justify-center rounded-sm border border-forest/20 text-forest bg-card hover:bg-forest/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest transition-colors"
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation"
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer Menu & Backdrop */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 top-16 z-40 bg-forest-950/45 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          <div
            id="mobile-navigation"
            className="lg:hidden relative border-t border-forest/15 bg-card p-5 space-y-4 shadow-sovereign-md z-50 max-h-[calc(100dvh-4rem)] overflow-y-auto"
          >
            {user && (
              <div className="p-3 rounded-md bg-forest/5 border border-forest/15 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-sm bg-forest text-ivory font-bold text-sm flex items-center justify-center overflow-hidden shrink-0">
                    {user.avatarUrl ? (
                      <Image src={user.avatarUrl} alt={user.fullName} width={40} height={40} unoptimized className="w-full h-full object-cover" />
                    ) : (
                      user.fullName.slice(0, 1)
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-sm text-forest truncate">{user.fullName}</div>
                    <div className="text-xs text-charcoal-muted capitalize">{user.role}</div>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild className="min-h-[40px] text-xs border-forest/20 text-forest shrink-0">
                  <Link href={roleDashboard.href} onClick={() => setMobileMenuOpen(false)}>
                    Open Hub
                  </Link>
                </Button>
              </div>
            )}

            {/* Vernacular & Text Size Controls */}
            <div className="p-3.5 bg-forest/5 rounded-md border border-forest/10 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-charcoal flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-forest" />
                  Language (39 Languages)
                </span>
                <button
                  type="button"
                  onClick={() => setTextSize(textSize === "normal" ? "large" : "normal")}
                  className={cn(
                    "min-h-[36px] px-2.5 rounded-sm border text-xs font-bold transition-colors",
                    textSize === "large"
                      ? "bg-forest text-ivory border-forest"
                      : "bg-card text-forest border-forest/20"
                  )}
                  aria-label={textSize === "normal" ? t.accessibility?.textSizeLarge : t.accessibility?.textSizeNormal}
                >
                  {textSize === "large" ? "Text: A+" : "Text: A"}
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto pr-1 text-xs">
                {SUPPORTED_LOCALES_METADATA.map((meta) => {
                  const isSelected = locale === meta.code;
                  return (
                    <button
                      key={meta.code}
                      type="button"
                      onClick={() => setLocale(meta.code)}
                      className={cn(
                        "min-h-[44px] py-1.5 px-2.5 rounded-sm border text-left font-medium transition-colors flex items-center justify-between",
                        isSelected
                          ? "bg-forest text-ivory border-forest font-bold"
                          : "bg-card text-charcoal border-forest/15 hover:bg-forest/5"
                      )}
                    >
                      <div className="truncate">
                        <span className="block font-bold">{meta.nativeName}</span>
                        <span className="block text-[11px] opacity-80">{meta.name}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-sand shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <nav className="flex flex-col space-y-1 text-sm font-medium">
              {primaryNavLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "px-3 min-h-[44px] flex items-center rounded-sm transition-colors text-sm font-semibold",
                      isActive
                        ? "bg-forest/10 text-forest font-bold"
                        : "text-charcoal hover:bg-forest/5"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}

              {!isAuthenticated && (
                <>
                  <span className="text-xs font-bold text-charcoal-muted px-3 pt-3 pb-1">
                    Partners &amp; Info
                  </span>
                  {partnerLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2.5 rounded-sm transition-colors text-xs text-charcoal hover:bg-forest/5 block"
                    >
                      <div className="font-bold text-forest text-sm">{link.label}</div>
                      <div className="text-xs text-charcoal-muted">{link.desc}</div>
                    </Link>
                  ))}
                </>
              )}
            </nav>

            <div className="pt-3 border-t border-forest/10 flex flex-col gap-2.5">
              <Button variant="outline" className="w-full min-h-[44px] justify-center text-sm" asChild>
                <Link href="/find-professionals" onClick={() => setMobileMenuOpen(false)}>
                  <Search className="mr-2 h-4 w-4" />
                  {t.header?.findProfessionals || "Find Professionals"}
                </Link>
              </Button>
              <Button variant="default" className="w-full min-h-[44px] justify-center text-sm bg-forest text-ivory" asChild>
                <Link href="/onboarding" onClick={() => setMobileMenuOpen(false)}>
                  <Mic className="mr-2 h-4 w-4 text-sand" />
                  {t.header?.register || "Create Profile"}
                </Link>
              </Button>
              {isAuthenticated ? (
                <Button
                  variant="ghost"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full min-h-[44px] justify-center text-sm text-red-700 hover:bg-red-50"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              ) : (
                <Button variant="outline" className="w-full min-h-[44px] justify-center text-sm" asChild>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    Sign In
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </>
      )}

      <TranslationDialog
        isOpen={isTranslationDialogOpen}
        onClose={() => setIsTranslationDialogOpen(false)}
        title="Universal Content & Spoken Translator"
      />
    </header>
  );
}
