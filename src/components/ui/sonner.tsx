"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border-forest/20 group-[.toaster]:shadow-sovereign-md group-[.toaster]:rounded-sm",
          description: "group-[.toast]:text-charcoal-muted",
          actionButton:
            "group-[.toast]:bg-forest group-[.toast]:text-ivory group-[.toast]:font-semibold",
          cancelButton:
            "group-[.toast]:bg-sand/20 group-[.toast]:text-forest",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
