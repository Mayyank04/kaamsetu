import * as React from "react";
import Link from "next/link";
import { ShieldCheck, Lock, Globe, Sparkles } from "lucide-react";

export function InstitutionalFooter() {
  return (
    <footer className="border-t border-forest/15 bg-forest text-ivory">
      {/* Top Banner: Sovereign Authority & Dignity */}
      <div className="border-b border-forest-500/30 bg-forest-700/60 py-4">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 text-xs">
          <div className="flex items-center gap-2 text-sand-300">
            <ShieldCheck className="h-4 w-4 text-sand" />
            <span className="font-semibold tracking-wide">
              National Digital Credential Infrastructure for India's Skilled Workforce
            </span>
          </div>
          <div className="flex items-center gap-4 text-ivory/70 text-[11px]">
            <span>DigiLocker Integrated</span>
            <span>•</span>
            <span>Open Skill Trust Protocol</span>
            <span>•</span>
            <span>Zero-Knowledge Verification</span>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xs bg-sand text-forest font-black text-xs">
                KS
              </div>
              <span className="text-lg font-bold tracking-tight text-ivory">
                KAAMSETU
              </span>
            </div>
            <p className="text-xs text-ivory/70 leading-relaxed">
              Equipping India's 450M+ skilled craftspeople, trades workers, and independent contractors with unforgeable, sovereign digital identities and verifiable creditworthiness.
            </p>
          </div>

          {/* Identity Infrastructure */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold uppercase tracking-widest text-sand-300">
              Identity Protocol
            </h4>
            <ul className="space-y-2 text-ivory/80">
              <li>
                <Link href="/#kaamscore" className="hover:text-sand transition-colors">
                  KAAMSCORE™ Trust Index
                </Link>
              </li>
              <li>
                <Link href="/#voice-simulator" className="hover:text-sand transition-colors">
                  Multilingual Voice Attestation
                </Link>
              </li>
              <li>
                <Link href="/verify" className="hover:text-sand transition-colors">
                  Sovereign QR Credential Check
                </Link>
              </li>
              <li>
                <Link href="/#categories" className="hover:text-sand transition-colors">
                  32 National Trade Classifications
                </Link>
              </li>
            </ul>
          </div>

          {/* For Employers & Contractors */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold uppercase tracking-widest text-sand-300">
              Contractors & Enterprise
            </h4>
            <ul className="space-y-2 text-ivory/80">
              <li>
                <Link href="/#how-it-works" className="hover:text-sand transition-colors">
                  Direct Verification API
                </Link>
              </li>
              <li>
                <Link href="/#explore" className="hover:text-sand transition-colors">
                  Search Master Craftspeople
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="hover:text-sand transition-colors">
                  Enterprise Attestation Portal
                </Link>
              </li>
              <li>
                <Link href="/safety" className="hover:text-sand transition-colors">
                  Fraud Detection & Audit Logs
                </Link>
              </li>
            </ul>
          </div>

          {/* Civic Governance */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold uppercase tracking-widest text-sand-300">
              Governance & Privacy
            </h4>
            <ul className="space-y-2 text-ivory/80">
              <li>
                <Link href="/privacy" className="hover:text-sand transition-colors">
                  Worker Data Sovereignty
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-sand transition-colors">
                  Trust Framework & Ethics
                </Link>
              </li>
              <li>
                <Link href="/accessibility" className="hover:text-sand transition-colors">
                  Vernacular Accessibility Standard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="mt-12 pt-6 border-t border-forest-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-ivory/60">
          <div>
            © {new Date().getFullYear()} KAAMSETU Sovereign Trust Infrastructure. Built for India's Skilled Workforce.
          </div>
          <div className="flex items-center gap-4">
            <span>Server: Supabase SSR</span>
            <span>•</span>
            <span>Intelligence: Google Gemini</span>
            <span>•</span>
            <span>Theme: Forest & Sand</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
