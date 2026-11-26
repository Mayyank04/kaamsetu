import type { Metadata, Viewport } from "next";
import {
  Plus_Jakarta_Sans,
  Noto_Sans_Devanagari,
  Noto_Sans_Bengali,
  Noto_Sans_Tamil,
  Noto_Sans_Telugu,
} from "next/font/google";
import { InstitutionalHeader } from "@/components/layout/institutional-header";
import { InstitutionalFooter } from "@/components/layout/institutional-footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { PlatformRuntimeBridge } from "@/components/pwa/platform-runtime-bridge";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth/use-auth";
import { I18nProvider } from "@/lib/i18n/i18n-context";
import { PwaRegister } from "@/components/pwa/pwa-register";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-devanagari",
  display: "swap",
});

const notoBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-bengali",
  display: "swap",
});

const notoTamil = Noto_Sans_Tamil({
  subsets: ["tamil"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-tamil",
  display: "swap",
});

const notoTelugu = Noto_Sans_Telugu({
  subsets: ["telugu"],
  weight: ["400", "500", "600", "700"],
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
