import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
      },
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // KAAMSETU Sovereign Trust Brand Palette
        forest: {
          DEFAULT: "#153E35",
          50: "#F0F6F4",
          100: "#DEEBE6",
          200: "#BDD8CE",
          300: "#80A99D",
          400: "#3E665B",
          500: "#1A4B40",
          600: "#153E35", // Core brand primary
          700: "#002820",
          800: "#00201A",
          900: "#001814",
        },
        sand: {
          DEFAULT: "#E8C999",
          50: "#FCF9F3",
          100: "#F9F2E6",
          200: "#F4E3C9",
          300: "#E8C999", // Core brand secondary
          400: "#E1C293",
          500: "#D3AA6E",
          600: "#B88E50",
          700: "#725B34",
          800: "#58431F",
          900: "#271900",
        },
        ivory: {
          DEFAULT: "#F7F5F0",
          light: "#FDFDFB",
          dark: "#EDEAE1",
        },
        terracotta: {
          DEFAULT: "#C46849",
          light: "#EA8665",
          dark: "#652107",
        },
        sage: {
          DEFAULT: "#5E8271",
          light: "#A5CFC3",
          dark: "#264E44",
        },
        charcoal: {
          DEFAULT: "#171D1A",
          muted: "#414846",
          subtle: "#717976",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", "system-ui", "sans-serif"],
        display: ["var(--font-plus-jakarta)", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        "sovereign-sm": "0 1px 3px 0 rgba(21, 62, 53, 0.04), 0 1px 2px -1px rgba(21, 62, 53, 0.04)",
        "sovereign-md": "0 4px 12px -2px rgba(21, 62, 53, 0.06), 0 2px 6px -1px rgba(21, 62, 53, 0.03)",
        "sovereign-lg": "0 12px 28px -6px rgba(21, 62, 53, 0.09), 0 4px 10px -2px rgba(21, 62, 53, 0.04)",
        "credential-card": "0 16px 36px -8px rgba(21, 62, 53, 0.12), 0 0 0 1px rgba(21, 62, 53, 0.08)",
      },
      keyframes: {
        "pulse-subtle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        "hologram-shimmer": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      },
      animation: {
        "pulse-subtle": "pulse-subtle 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "hologram": "hologram-shimmer 4s ease infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
