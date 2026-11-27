import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { InstitutionalHeader } from "@/components/layout/institutional-header";
import { InstitutionalFooter } from "@/components/layout/institutional-footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { PlatformRuntimeBridge } from "@/components/pwa/platform-runtime-bridge";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth/use-auth";
import { I18nProvider } from "@/lib/i18n/i18n-context";
import { PwaRegister } from "@/components/pwa/pwa-register";
import "./globals.css";

// Self-hosted typography: Plus_Jakarta_Sans and Indic Noto fonts (Noto_Sans_Devanagari, Noto_Sans_Bengali, Noto_Sans_Tamil, Noto_Sans_Telugu)
// Preloaded locally via next/font/local to eliminate all external Google Fonts runtime & CI build network dependencies.

const plusJakarta = localFont({
  src: [
    { path: "../fonts/plus-jakarta-sans-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../fonts/plus-jakarta-sans-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../fonts/plus-jakarta-sans-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../fonts/plus-jakarta-sans-latin-700-normal.woff2", weight: "700", style: "normal" },
    { path: "../fonts/plus-jakarta-sans-latin-800-normal.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-jakarta",
  display: "swap",
});

const notoDevanagari = localFont({
  src: [
    { path: "../fonts/noto-sans-devanagari-devanagari-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../fonts/noto-sans-devanagari-devanagari-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../fonts/noto-sans-devanagari-devanagari-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../fonts/noto-sans-devanagari-devanagari-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-devanagari",
  display: "swap",
});

const notoBengali = localFont({
  src: [
    { path: "../fonts/noto-sans-bengali-bengali-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../fonts/noto-sans-bengali-bengali-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../fonts/noto-sans-bengali-bengali-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../fonts/noto-sans-bengali-bengali-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-bengali",
  display: "swap",
});

const notoTamil = localFont({
  src: [
    { path: "../fonts/noto-sans-tamil-tamil-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../fonts/noto-sans-tamil-tamil-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../fonts/noto-sans-tamil-tamil-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../fonts/noto-sans-tamil-tamil-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-tamil",
  display: "swap",
});

const notoTelugu = localFont({
  src: [
    { path: "../fonts/noto-sans-telugu-telugu-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../fonts/noto-sans-telugu-telugu-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../fonts/noto-sans-telugu-telugu-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../fonts/noto-sans-telugu-telugu-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-telugu",
  display: "swap",
});

export const metadata: Metadata = {
  title: "KAAMSETU | India's Skill Identity & Workforce Platform",
  description:
    "Every skill deserves to be seen, even without a degree. Digital skill profiles, multilingual voice translation, and direct work discovery across India.",
  keywords: [
    "KAAMSETU",
    "Digital Skill Identity",
    "Vocational Workforce India",
    "KAAMSCORE",
    "Multilingual Translator",
    "Artisan Recognition",
  ],
  authors: [{ name: "KAAMSETU Platform" }],
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/icon-512.svg",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "KAAMSETU",
  },
};

export const viewport: Viewport = {
  themeColor: "#153E35",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${notoDevanagari.variable} ${notoBengali.variable} ${notoTamil.variable} ${notoTelugu.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-background text-foreground font-sans antialiased">
        <I18nProvider>
          <AuthProvider>
            <InstitutionalHeader />
            <main className="flex-1 pb-20 md:pb-0">{children}</main>
            <InstitutionalFooter />
            <MobileBottomNav />
            <Toaster />
            <PwaRegister />
            <PlatformRuntimeBridge />
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
