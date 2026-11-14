import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind and conditional class names safely.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format Indian Rupee currency (e.g. ₹45,000).
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date in institutional Indian format (e.g., 14 Nov 2026).
 */
export function formatDate(dateInput: string | Date | number): string {
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "N/A";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

/**
 * Mask Aadhaar number or Sovereign VID for privacy & security (e.g. •••• •••• 4589)
 */
export function maskIdentifier(id: string): string {
  const clean = id.replace(/\s+/g, "");
  if (clean.length < 4) return clean;
  const lastFour = clean.slice(-4);
  return `•••• •••• ${lastFour}`;
}

/**
 * Mask mobile number (e.g. +91 98••• ••421)
 */
export function maskMobile(phone: string): string {
  const clean = phone.replace(/[^\d+]/g, "");
  if (clean.length < 5) return clean;
  const prefix = clean.startsWith("+91") ? "+91 " : "";
  const num = clean.replace("+91", "");
  if (num.length >= 10) {
    return `${prefix}${num.slice(0, 2)}••• ••${num.slice(-3)}`;
  }
  return clean;
}

/**
 * Returns tier metadata based on the numeric KAAMSCORE (300 - 900 scale).
 */
export function getKaamScoreTier(score: number): {
  tier: "Sovereign Master" | "Institutional Verified" | "Apprentice Verified" | "Provisional";
  level: number;
  color: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
} {
  if (score >= 820) {
    return {
      tier: "Sovereign Master",
      level: 4,
      color: "#153E35",
      badgeBg: "bg-forest/10",
      badgeBorder: "border-forest/20",
      badgeText: "text-forest",
    };
  }
  if (score >= 700) {
    return {
      tier: "Institutional Verified",
      level: 3,
      color: "#3E665B",
      badgeBg: "bg-sage/15",
      badgeBorder: "border-sage/30",
      badgeText: "text-forest-700",
    };
  }
  if (score >= 550) {
    return {
      tier: "Apprentice Verified",
      level: 2,
      color: "#725B34",
      badgeBg: "bg-sand/20",
      badgeBorder: "border-sand/40",
      badgeText: "text-sand-800",
    };
  }
  return {
    tier: "Provisional",
    level: 1,
    color: "#C46849",
    badgeBg: "bg-terracotta/10",
    badgeBorder: "border-terracotta/20",
    badgeText: "text-terracotta-dark",
  };
}
