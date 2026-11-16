import * as React from "react";
import Link from "next/link";
import { ShieldCheck, FileText, ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Terms of Service | KAAMSETU",
  description:
    "Terms of service, zero-commission guarantee, user responsibilities, and operational guidelines for the KAAMSETU digital skill identity platform.",
};

export default function TermsOfServicePage() {
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
            <FileText className="w-3.5 h-3.5 text-forest" />
            <span>OPERATIONAL POLICY & USER CONTRACT</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-forest font-serif">
            Terms of Service
          </h1>
          <p className="text-sm text-charcoal-muted leading-relaxed max-w-2xl">
            Effective Date: November 2026 • Controlled Pilot Scope: Guwahati Urban (Assam) and Shillong Urban (Meghalaya).
          </p>
          <div className="p-4 rounded-xs bg-sand/20 border border-sand/40 text-xs text-forest-900 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-forest shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold">Draft Operational Document — Subject to Formal Legal Review:</span>
              <p className="text-charcoal-muted leading-relaxed">
                This document sets out the operational terms governing participation in the KAAMSETU controlled rollout. It reflects technical and operational architecture and requires final review by authorized legal counsel prior to commercial general availability.
              </p>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="prose prose-sm max-w-none text-charcoal space-y-8 leading-relaxed">
          {/* 1. Platform Purpose */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-forest">1. Platform Purpose & Scope</h2>
            <p>
              KAAMSETU is a digital skill infrastructure and professional recognition platform designed for India&apos;s vocational workforce. The platform enables skilled craftspeople, master artisans, independent contractors, and customers to establish verified work histories, issue and receive tamper-evident skill attestations, and arrange direct trade engagements without middleman commissions.
            </p>
            <p>
              The platform currently operates under a <strong>Class B Controlled Rollout</strong> strictly limited to municipal boundaries of Guwahati Urban (Kamrup Metropolitan District, Assam) and Shillong Urban (East Khasi Hills District, Meghalaya).
            </p>
          </section>

          {/* 2. Eligibility */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-forest">2. User Eligibility</h2>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>You must be at least 18 years of age to register as a worker, contractor, or customer.</li>
              <li>You must possess a valid Indian mobile number capable of receiving SMS One-Time Passwords (OTP).</li>
              <li>For dispatch-eligible worker registration, you must reside or operate within authorized pilot districts. Non-dispatch worker profiles outside pilot zones may maintain digital portfolios but are not eligible for local direct customer matching.</li>
              <li>Contractors and institutions must register with verifiable business or organizational credentials.</li>
            </ul>
          </section>

          {/* 3. Account Responsibilities */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-forest">3. Account Creation & Security</h2>
            <p>
              Authentication is conducted via cryptographic OTP challenges bound to your registered mobile number. You are responsible for maintaining the confidentiality of verification codes received. You agree to notify KAAMSETU immediately of any unauthorized use of your registered number or mobile device.
            </p>
          </section>

          {/* 4. Worker & Customer Responsibilities */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-forest">4. Worker and Customer Responsibilities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xs border border-forest/10 bg-card space-y-2">
                <h3 className="font-bold text-forest text-sm">For Tradespeople & Workers</h3>
                <p className="text-xs text-charcoal-muted leading-relaxed">
                  Provide truthful self-declarations regarding years of experience, trade tools, and skill categories. Adhere to professional trade standards, agreed schedules, and reasonable workplace safety practices.
                </p>
              </div>
              <div className="p-4 rounded-xs border border-forest/10 bg-card space-y-2">
                <h3 className="font-bold text-forest text-sm">For Homeowners & Customers</h3>
                <p className="text-xs text-charcoal-muted leading-relaxed">
                  Provide safe and accessible work environments. Settle agreed wages promptly upon satisfactory milestone delivery without unauthorized withholding or unfair deductions.
                </p>
              </div>
            </div>
          </section>

          {/* 5. Bookings & Cancellations */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-forest">5. Bookings, Scope Changes & Cancellations</h2>
            <p>
              Direct customer bookings establish a bilateral vocational contract between the customer and the independent tradesperson. Either party may cancel an unconfirmed booking without penalty. Cancellations made after a tradesperson has traveled to the work site may incur a nominal transit reimbursement fee agreed upon in advance.
            </p>
          </section>

          {/* 6. Permanent Zero-Commission Guarantee */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-forest">6. Permanent Zero-Commission Policy</h2>
            <div className="p-4 rounded-xs bg-forest text-ivory space-y-2">
              <div className="flex items-center gap-2 text-sand">
                <ShieldCheck className="w-4 h-4" />
                <span className="font-bold text-xs uppercase tracking-wider">Constitutional Guarantee</span>
              </div>
              <p className="text-xs text-ivory/90 leading-relaxed font-mono">
                platform_commission_amount = 0.00
              </p>
              <p className="text-xs text-ivory/80 leading-relaxed">
                KAAMSETU charges <strong>0.00% commission</strong> on artisan earnings. 100% of the wage agreed upon between the customer and the tradesperson belongs to the worker. KAAMSETU will never deduct referral cuts, marketplace percentage taxes, or discovery fees from worker earnings.
              </p>
            </div>
          </section>

          {/* 7. Verification Limitations */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-forest">7. Verification Scope & Limitations</h2>
            <p>
              KAAMSETU distinguishes clearly between different levels of trust:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li><strong>Self-Declared Testimony:</strong> Information provided by the worker (such as voice recordings, work history descriptions, and claimed tools). Clearly labeled as self-declared.</li>
              <li><strong>Peer Endorsement:</strong> Vouching provided by other registered craftspeople or contractors who have observed the worker&apos;s craftsmanship.</li>
              <li><strong>Institutional Credentials:</strong> Verification records issued by accredited vocational training institutes or industry bodies.</li>
            </ul>
            <p className="text-xs text-charcoal-muted">
              Verification does not constitute an absolute guarantee of craftsmanship on any specific future project. Customers are encouraged to inspect previous portfolio samples and clarify project expectations.
            </p>
          </section>

          {/* 8. Prohibited Conduct */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-forest">8. Prohibited Conduct</h2>
            <p>Users may not:</p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Impersonate any individual or submit false identification credentials.</li>
              <li>Artificially manipulate ratings, peer endorsements, or KAAMSCORE metrics.</li>
              <li>Harass, threaten, or discriminate against workers, customers, or platform staff.</li>
              <li>Attempt to scrape, reverse engineer, or disrupt platform infrastructure.</li>
            </ul>
          </section>

          {/* 9. Grievance & Dispute Redressal */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-forest">9. Grievance Redressal & Disputes</h2>
            <p>
              KAAMSETU provides an internal grievance tracking portal (`/dashboard` and `/api/worker/grievance`). In the event of a payment or workmanship dispute, either party may initiate an appeal. While KAAMSETU assists in mediation through verifiable job logs and milestone receipts, the underlying contractual relationship remains between customer and worker.
            </p>
          </section>

          {/* 10. Suspension & Termination */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-forest">10. Suspension and Termination</h2>
            <p>
              KAAMSETU reserves the right to suspend or terminate access for accounts that violate safety guidelines, engage in fraud, repeatedly fail to deliver agreed commitments, or violate geographic authorization boundaries.
            </p>
          </section>

          {/* 11. Liability & Legal Notice */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-forest">11. Limitation of Liability</h2>
            <p>
              KAAMSETU provides software infrastructure for digital identity and discovery. To the maximum extent permitted by applicable Indian law, KAAMSETU shall not be liable for indirect, incidental, or consequential damages resulting from off-platform trade engagements, site accidents, or contractor-customer disagreements.
            </p>
          </section>

          {/* 12. Contact & Updates */}
          <section className="space-y-3 border-t border-forest/15 pt-6">
            <h2 className="text-xl font-bold text-forest">12. Governance Contact & Amendments</h2>
            <p>
              These Terms of Service may be updated as the controlled rollout expands. Substantive policy changes will be announced across the platform. For questions or grievances, contact the platform governance officer through the support portal.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
