"use client";

import * as React from "react";
import { CheckCircle2, ShieldCheck, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type PhoneVerificationStatus =
  | "sms_verified"
  | "sandbox_verified"
  | "not_verified"
  | string;

interface VerifiedPhoneBadgeProps {
  status?: PhoneVerificationStatus | null;
  className?: string;
  size?: "sm" | "md";
  showTooltip?: boolean;
}

/**
 * Restrained Verified Phone Badge
 * Reflects genuine database verification state.
 *
 * Invariant: Never claim government ID, background check, or certification.
 * Only represents verified access to the declared phone number.
 */
export function VerifiedPhoneBadge({
  status,
  className,
  size = "sm",
  showTooltip = true,
}: VerifiedPhoneBadgeProps) {
  if (!status || status === "not_verified") {
    return null;
  }

  const isReal = status === "sms_verified";
  const isSandbox = status === "sandbox_verified";

  if (!isReal && !isSandbox) {
    return null;
  }

  const isSmall = size === "sm";

  if (isReal) {
    return (
      <span
        title={showTooltip ? "Worker mobile access verified via carrier SMS OTP" : undefined}
        className={cn(
          "inline-flex items-center gap-1 font-mono font-medium rounded-xs border transition-colors",
          "bg-emerald-50/90 text-emerald-800 border-emerald-600/25 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-600/40",
          isSmall ? "text-[10px] px-1.5 py-0.5 leading-tight" : "text-xs px-2 py-1",
          className
        )}
        data-testid="badge-phone-verified"
      >
        <CheckCircle2
          className={cn("shrink-0 text-emerald-700 dark:text-emerald-400", isSmall ? "w-3 h-3" : "w-3.5 h-3.5")}
          aria-hidden="true"
        />
        <span>Phone verified</span>
      </span>
    );
  }

  return (
    <span
      title={showTooltip ? "Phone verified in test sandbox mode (non-carrier)" : undefined}
      className={cn(
        "inline-flex items-center gap-1 font-mono font-medium rounded-xs border transition-colors",
        "bg-amber-50/90 text-amber-900 border-amber-600/25 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-600/40",
        isSmall ? "text-[10px] px-1.5 py-0.5 leading-tight" : "text-xs px-2 py-1",
        className
      )}
      data-testid="badge-test-verified"
    >
      <AlertCircle
        className={cn("shrink-0 text-amber-700 dark:text-amber-400", isSmall ? "w-3 h-3" : "w-3.5 h-3.5")}
        aria-hidden="true"
      />
      <span>Test verified</span>
    </span>
  );
}
