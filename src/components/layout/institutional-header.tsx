"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  Mic,
  Search,
  Menu,
  X,
  User,
  UserCheck,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  CalendarCheck,
  CheckCircle2,
} from "lucide-react";
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

export function InstitutionalHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

  // Close mobile drawer on route navigation
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Lock background scroll when mobile drawer is open
  React.useEffect(() => {
    if (mobileMenuOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [mobileMenuOpen]);

  // Close mobile drawer on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/explore", label: "Find Professionals" },
    { href: "/how-it-works", label: "How It Works" },
    { href: "/contractor/dashboard", label: "Contractor Pro" },
    { href: "/institution/dashboard", label: "Institutions" },
    { href: "/about", label: "About" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-forest/15 bg-[#F7F5F0]/95 backdrop-blur-xs shadow-xs transition-all">
      {/* Top Status Bar */}
      <div className="bg-forest text-ivory text-[11px] py-1.5 px-4 hidden sm:block border-b border-forest-500/20">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-1.5 w-1.5 rounded-full bg-sand animate-pulse" />
            <span className="font-semibold text-sand-300">
              Direct Worker Recognition Platform
            </span>
            <span className="text-ivory/60">•</span>
            <span className="text-ivory/80">
              Permanent Zero Commission on Artisan Earnings
            </span>
          </div>
          <div className="flex items-center gap-4 text-ivory/80 text-[10px]">
            <span className="bg-sand/20 text-sand px-2 py-0.5 rounded-xs font-semibold">
              Class B Controlled Rollout: Guwahati & Shillong
            </span>
            <Link
              href="/login"
              className="text-sand underline hover:text-sand-300 font-medium"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto flex h-18 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
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
              Skill Identity & Recognition
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links (Visible on lg 1024px and above) */}
        <nav className="hidden lg:flex items-center gap-4 xl:gap-6 text-xs xl:text-sm font-semibold text-charcoal">
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

        {/* Right Actions & User Menu */}
        <div className="hidden md:flex items-center gap-2 lg:gap-3">
          <Button variant="outline" size="sm" asChild className="border-forest/20 text-forest hover:bg-forest/5 text-xs">
            <Link href="/explore">
              <Search className="mr-1.5 h-3.5 w-3.5 text-forest" />
              Find a Professional
            </Link>
          </Button>

          <Button variant="default" size="sm" asChild className="bg-forest text-ivory hover:bg-forest-500 shadow-sm text-xs">
            <Link href="/onboarding">
              <Mic className="mr-1.5 h-3.5 w-3.5 text-sand" />
              Create Identity
            </Link>
          </Button>

          {/* User Auth Persona Dropdown */}
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl border border-forest/20 hover:border-forest/40 bg-card hover:bg-forest/5 transition-all text-xs outline-none"
                >
                  <div className="w-7 h-7 rounded-lg bg-forest text-ivory font-bold text-xs flex items-center justify-center overflow-hidden shrink-0 border border-forest-600">
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
                    <div className="text-[10px] text-charcoal-muted capitalize">
                      {user.role}
                    </div>
                  </div>
                  <ChevronDown className="w-3 h-3 text-forest/50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2">
                <DropdownMenuLabel className="space-y-0.5">
                  <div className="font-bold text-forest text-xs">{user.fullName}</div>
                  <div className="text-[10px] text-charcoal-muted font-mono">{user.phone || "Verified User"}</div>
                  <div className="pt-1">
                    <Badge variant="outline" className="text-[10px] bg-forest/5 text-forest capitalize font-semibold border-forest/15">
                      Role: {user.role}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center gap-2">
                    <LayoutDashboard className="w-3.5 h-3.5 text-forest" />
                    <span>Worker Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/contractor/dashboard" className="flex items-center gap-2">
                    <LayoutDashboard className="w-3.5 h-3.5 text-forest" />
                    <span>Contractor Pro SaaS</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/institution/dashboard" className="flex items-center gap-2">
                    <LayoutDashboard className="w-3.5 h-3.5 text-forest" />
                    <span>Institutional Hub</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/customer/bookings" className="flex items-center gap-2">
                    <CalendarCheck className="w-3.5 h-3.5 text-forest" />
                    <span>Customer Bookings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-700 focus:text-red-800 flex items-center gap-2">
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="sm" asChild className="text-xs text-forest hover:bg-forest/5 font-bold">
              <Link href="/login">
                Sign In
              </Link>
            </Button>
          )}
        </div>

        {/* Mobile / Tablet Hamburger Button (Visible on screens below lg 1024px) */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden flex h-10 w-10 items-center justify-center rounded-sm border border-forest/20 text-forest bg-card hover:bg-forest/5 focus:outline-none focus:ring-2 focus:ring-forest focus:ring-offset-1 transition-colors"
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
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 top-18 z-40 bg-forest-950/40 backdrop-blur-xs lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Container */}
          <div
            id="mobile-navigation"
            className="lg:hidden relative border-t border-forest/15 bg-card p-5 space-y-4 shadow-sovereign-md animate-in slide-in-from-top-2 z-50 max-h-[calc(100dvh-4.5rem)] overflow-y-auto"
          >
            {/* Active User Card in Mobile Drawer */}
            {user && (
              <div className="p-3 rounded-xl bg-forest/5 border border-forest/15 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-forest text-ivory font-bold text-xs flex items-center justify-center overflow-hidden shrink-0">
                    {user.avatarUrl ? (
                      <Image src={user.avatarUrl} alt={user.fullName} width={36} height={36} unoptimized className="w-full h-full object-cover" />
                    ) : (
                      user.fullName.slice(0, 1)
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-forest">{user.fullName}</div>
                    <div className="text-[10px] text-charcoal-muted capitalize">Role: {user.role}</div>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild className="text-[11px] h-7 px-2 border-forest/20 text-forest">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    Switch
                  </Link>
                </Button>
              </div>
            )}

            <nav className="flex flex-col space-y-1 text-sm font-medium">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "px-3 py-2.5 rounded-lg transition-colors text-xs font-semibold",
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

            <div className="pt-3 border-t border-forest/10 flex flex-col gap-2">
              <Button variant="outline" className="w-full justify-center text-xs" asChild>
                <Link href="/explore" onClick={() => setMobileMenuOpen(false)}>
                  <Search className="mr-2 h-4 w-4" />
                  Find a Professional
                </Link>
              </Button>
              <Button variant="default" className="w-full justify-center text-xs bg-forest text-ivory" asChild>
                <Link href="/onboarding" onClick={() => setMobileMenuOpen(false)}>
                  <Mic className="mr-2 h-4 w-4 text-sand" />
                  Create Your Identity
                </Link>
              </Button>
              {isAuthenticated ? (
                <Button
                  variant="ghost"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full justify-center text-xs text-red-700 hover:bg-red-50"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              ) : (
                <Button variant="outline" className="w-full justify-center text-xs" asChild>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    Sign In / Register
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
}
