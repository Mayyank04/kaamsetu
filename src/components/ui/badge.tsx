import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-sm px-2.5 py-0.5 text-xs font-semibold tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-forest focus:ring-offset-2 select-none uppercase",
  {
    variants: {
      variant: {
        // Institutional Deep Forest Badge
        default:
          "border border-forest/30 bg-forest text-ivory shadow-xs",
        // Muted Sage Verified Badge
        verified:
          "border border-sage/40 bg-sage/15 text-forest-700 font-bold",
        // Warm Sand Badge
        sand:
          "border border-sand-600/30 bg-sand/25 text-sand-800 font-bold",
        // Sovereign Gold Prestige Badge
        sovereign:
          "border border-sand-500/50 bg-forest text-sand font-bold shadow-xs",
        // Provisional / Pending
        provisional:
          "border border-terracotta/30 bg-terracotta/10 text-terracotta-dark font-medium",
        // Subtle Gray / Outline
        outline:
          "border border-forest/15 bg-transparent text-charcoal-muted",
        // Destructive / Revoked
        destructive:
          "border border-destructive/30 bg-destructive/10 text-destructive font-medium",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
