import type { Metadata, Viewport } from "next";
import { InstitutionalHeader } from "@/components/layout/institutional-header";
import { InstitutionalFooter } from "@/components/layout/institutional-footer";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth/use-auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "KAAMSETU | India's Universal Digital Skill Identity Platform",
  description:
    "Institutional sovereign identity, verified KAAMSCORE, and multilingual voice-first skill registry for India's 450M+ skilled craftspeople and independent workforce.",
  keywords: [
    "KAAMSETU",
    "Digital Identity",
    "Skill Identity India",
    "KAAMSCORE",
    "Sovereign Credential",
    "DigiLocker",
    "Blue-collar workforce",
    "Voice verification",
  ],
  authors: [{ name: "KAAMSETU Sovereign Trust Protocol" }],
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#153E35",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-background text-foreground font-sans antialiased">
        <AuthProvider>
          <InstitutionalHeader />
          <main className="flex-1">{children}</main>
          <InstitutionalFooter />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
