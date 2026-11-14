import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-sm border border-forest/20 bg-card px-4 py-2.5 text-base text-foreground placeholder:text-charcoal-subtle/60 focus-visible:outline-none focus-visible:border-forest focus-visible:ring-2 focus-visible:ring-sand/60 disabled:cursor-not-allowed disabled:opacity-50 transition-colors shadow-xs",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
