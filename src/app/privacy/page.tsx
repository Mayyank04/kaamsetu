import * as React from "react";
import Link from "next/link";
import { ShieldCheck, Lock, ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Privacy Policy | KAAMSETU",
  description:
    "Privacy policy, cryptographic data safeguards, voice attestation privacy, and data subject rights for the KAAMSETU digital skill identity platform.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Back Link */}
        <div>
          <Button variant="ghost" size="sm" asChild className="text-forest hover:text-forest-700">
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
          </Button>
        </div>

        {/* Page Header */}
        <div className="space-y-4 border-b border-forest/15 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xs bg-forest/5 border border-forest/15 text-forest text-xs font-mono font-semibold">
            <Lock className="w-3.5 h-3.5 text-forest" />
            <span>DATA PROTECTION & PRIVACY ARCHITECTURE</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-forest font-serif">
            Privacy Policy
          </h1>
          <p className="text-sm text-charcoal-muted leading-relaxed max-w-2xl">
            Effective Date: November 2026 • Controlled Pilot Scope: Guwahati Urban (Assam) and Shillong Urban (Meghalaya).
          </p>
          <div className="p-4 rounded-xs bg-sand/20 border border-sand/40 text-xs text-forest-900 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-forest shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold">Draft Operational Document — Subject to Formal Legal Review:</span>
              <p className="text-charcoal-muted leading-relaxed">
                This document describes how data is technically processed, hashed, and protected in the KAAMSETU application. Formal alignment with the Digital Personal Data Protection (DPDP) Act, 2023 requires final review and ratification by the designated Data Protection Officer.
              </p>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="prose prose-sm max-w-none text-charcoal space-y-8 leading-relaxed">
          {/* 1. Information Collected */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-forest">1. Information We Collect</h2>
            <p>
              KAAMSETU collects only the minimum information necessary to establish authentic trade credentials and facilitate direct bookings:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>
                <strong>Identity & Contact Details:</strong> Full name, telephone number (for SMS OTP authentication). Telephone numbers are hashed with server-side HMAC-SHA256 secrets for rate-limiting and privacy-preserving indexing.
              </li>
              <li>
                <strong>Skill & Trade Profile:</strong> Primary trade classification (NCO-aligned), secondary skills, tools handled, years of trade experience, and daily wage expectations.
              </li>
              <li>
                <strong>Voice Recordings & Transcripts:</strong> Audio recordings submitted during voice onboarding, along with text transcripts. Audio files are processed for trade entity extraction and preserved as worker-owned voice attestations.
              </li>
              <li>
                <strong>Geographic Information:</strong> City, state, district, and postal code. Real-time GPS coordinates are used solely to verify eligibility within authorized Class B pilot boundaries (Guwahati and Shillong) and are not broadcast to third parties.
              </li>
              <li>
                <strong>Booking & Payout Metadata:</strong> Job request dates, agreed milestone amounts, payment completion status, and bank/UPI identifiers used for direct payouts.
              </li>
            </ul>
          </section>

          {/* 2. Zero Raw Aadhaar Policy */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-forest">2. Cryptographic Security & Zero Raw Aadhaar Storage</h2>
            <div className="p-4 rounded-xs bg-forest text-ivory space-y-2">
              <div className="flex items-center gap-2 text-sand">
                <ShieldCheck className="w-4 h-4" />
                <span className="font-bold text-xs uppercase tracking-wider">Aadhaar Privacy Guarantee</span>
              </div>
              <p className="text-xs text-ivory/80 leading-relaxed">
                KAAMSETU <strong>never stores raw 12-digit Aadhaar numbers</strong> on any database, log file, or server instance. Aadhaar verification is conducted exclusively through masked Virtual IDs (VID) or DigiLocker XML consent exchanges. All rate-limiting and session tokens use SHA-256 HMAC cryptographic hashing.
              </p>
            </div>
          </section>

          {/* 3. Purpose & Lawful Basis */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-forest">3. Purpose and Lawful Basis for Processing</h2>
            <p>We process personal and vocational data for the following lawful purposes:</p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>To create and authenticate user accounts via SMS OTP.</li>
              <li>To generate sovereign QR skill credentials that workers can present to contractors and customers.</li>
              <li>To match customers with nearby verified tradespeople in pilot districts.</li>
              <li>To maintain immutable audit logs of peer endorsements and completed job milestones.</li>
              <li>To enforce platform safety, prevent fraud, and handle disputes.</li>
            </ul>
          </section>

          {/* 4. Data Sharing & Third-Party Interfaces */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-forest">4. Data Sharing & Ecosystem Interfaces</h2>
            <p>
              KAAMSETU does not sell, rent, or monetize user data. Data is shared strictly within authorized functional flows:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li><strong>Public Worker Directory:</strong> Only worker-approved profile details (name, trade, city, verified badges, rating, daily wage) are visible on `/explore`. Private phone numbers are revealed only when a booking is confirmed.</li>
              <li><strong>India Stack Integrations:</strong> DigiLocker and NPCI/UPI gateways for direct bank settlements, operating under applicable public infrastructure protocols.</li>
              <li><strong>Infrastructure Providers:</strong> Supabase (PostgreSQL hosting with Row-Level Security) and SMS gateway providers for OTP delivery.</li>
            </ul>
          </section>

          {/* 5. Retention & Deletion */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-forest">5. Data Retention & Account Deletion</h2>
            <p>
              Account profiles and vocational records are retained as long as the account remains active. Workers may request full account deletion and cryptographic credential revocation at any time through account settings (`/settings`). Audit logs of completed financial settlements are retained in an anonymized form to comply with regulatory tax and dispute obligations.
            </p>
          </section>

          {/* 6. User Rights */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-forest">6. User Rights Under Indian Data Protection Standards</h2>
            <p>You have the following rights regarding your personal data:</p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li><strong>Right to Access:</strong> You can export a portable JSON or PDF summary of your entire vocational profile and attestations.</li>
              <li><strong>Right to Correction:</strong> You can edit self-declared skills, wage expectations, and portfolio media at any time.</li>
              <li><strong>Right to Withdraw Consent:</strong> You can toggle profile visibility off from public directory search while maintaining your private credential passbook.</li>
              <li><strong>Right to Grievance Redressal:</strong> Submit inquiries or complaints through the grievance redressal portal.</li>
            </ul>
          </section>

          {/* 7. Children's Privacy */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-forest">7. Children&apos;s Data</h2>
            <p>
              KAAMSETU is strictly intended for individuals 18 years of age or older. We do not knowingly collect or process data from minors.
            </p>
          </section>

          {/* 8. Cookies & Local Storage */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-forest">8. Cookies and Local Storage</h2>
            <p>
              We use secure, HttpOnly, SameSite session cookies for authentication persistence and localStorage solely for onboarding draft resilience (so artisans do not lose their typed or spoken progress during multi-step registration). We do not use third-party advertising tracking cookies.
            </p>
          </section>

          {/* 9. Contact */}
          <section className="space-y-3 border-t border-forest/15 pt-6">
            <h2 className="text-xl font-bold text-forest">9. Privacy Contact & Grievance Officer</h2>
            <p>
              For privacy-related inquiries, data access requests, or grievance redressal regarding the controlled rollout, contact the platform governance officer at: <code>privacy@kaamsetu.org</code>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
