"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  Mic,
  Search,
  Menu,
  X,
  User,
  LogOut,
  Sparkles,
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

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/explore", label: "Explore Professions" },
    { href: "/contractor/dashboard", label: "Contractor Pro" },
    { href: "/institution/dashboard", label: "Institutions" },
    { href: "/customer/bookings", label: "My Bookings" },
    { href: "/dashboard", label: "Worker Dashboard" },
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
              HACKATHON EVALUATION MODE
            </span>
            <Link
              href="/login"
              className="text-sand underline hover:text-sand-300 font-medium"
            >
              Switch Demo Persona
            </Link>
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
        <nav className="hidden xl:flex items-center gap-6 text-sm font-semibold text-charcoal">
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
        <div className="hidden md:flex items-center gap-3">
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
                      <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
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
                <DropdownMenuItem asChild>
                  <Link href="/login" className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-sand-800" />
                    <span>Switch Demo Persona</span>
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
          {/* Active User Card in Mobile Drawer */}
          {user && (
            <div className="p-3 rounded-xl bg-forest/5 border border-forest/15 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-forest text-ivory font-bold text-xs flex items-center justify-center overflow-hidden shrink-0">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
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
                  Sign In / Switch Persona
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
