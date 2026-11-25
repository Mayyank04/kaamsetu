"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Languages, LayoutDashboard, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/use-auth";
import { useTranslation } from "@/lib/i18n/i18n-context";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();

  const dashboardHref = React.useMemo(() => {
    if (!isAuthenticated || !user) return "/onboarding";
    switch (user.role) {
      case "contractor":
        return "/contractor/dashboard";
      case "vendor":
        return "/vendor/dashboard";
      case "institution":
        return "/institution/dashboard";
      case "customer":
        return "/customer/bookings";
      default:
        return "/dashboard";
    }
  }, [isAuthenticated, user]);

  const items = [
    {
      href: "/",
      label: t.header?.home || "Home",
      icon: Home,
      active: pathname === "/",
    },
    {
      href: "/explore",
      label: "Find Work",
      icon: Search,
      active: pathname.startsWith("/explore"),
    },
    {
      href: "/translate",
      label: "Translate",
      icon: Languages,
      active: pathname.startsWith("/translate"),
    },
    {
      href: dashboardHref,
      label: isAuthenticated ? "My Hub" : "Join",
      icon: isAuthenticated ? LayoutDashboard : UserCheck,
      active:
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/vendor") ||
        pathname.startsWith("/contractor") ||
        pathname.startsWith("/institution") ||
        pathname.startsWith("/customer") ||
        pathname.startsWith("/onboarding"),
    },
  ];

  return (
    <nav
      aria-label="Mobile Primary Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-forest/15 safe-area-bottom"
    >
      <div className="grid grid-cols-4 h-16">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 min-h-[44px] text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-inset",
                item.active
                  ? "text-forest font-bold bg-forest/5 border-t-2 border-forest"
                  : "text-charcoal-muted hover:text-forest"
              )}
            >
              <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
              <span className="truncate max-w-[76px] leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
