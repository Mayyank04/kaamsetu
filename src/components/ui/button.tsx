import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-sm text-sm font-semibold tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.99]",
  {
    variants: {
      variant: {
        // Primary Institutional Button: Forest Green with Warm Ivory text
        default:
          "bg-forest text-ivory shadow-sm hover:bg-forest-500 border border-forest-700/30",
        // Secondary Endorsement Button: Warm Sand tint with Forest text
        secondary:
          "bg-sand/30 text-forest-700 border border-forest/20 hover:bg-sand/45",
        // Sovereign Gold Accent Button
        sand:
          "bg-sand text-forest-900 font-bold border border-sand-600/40 hover:bg-sand-400 shadow-sm",
        // Outline Button: 1px micro-border with subtle hover lift
        outline:
          "border border-forest/20 bg-card text-foreground hover:bg-forest/5 hover:text-forest hover:border-forest/40",
        // Ghost Button
        ghost:
          "text-foreground hover:bg-forest/5 hover:text-forest",
        // Terracotta Accent Button: For urgent or distinct actions
        terracotta:
          "bg-terracotta text-white hover:bg-terracotta-light border border-terracotta-dark/30 shadow-sm",
        // Destructive
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
        // Link
        link:
          "text-forest underline-offset-4 hover:underline p-0 h-auto font-medium",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 rounded-sm px-3.5 text-xs",
        lg: "h-12 rounded-sm px-7 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
