"use client";

import * as React from "react";
import { Layers, CheckCircle2, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/i18n-context";

interface ProfileServicesProps {
  dailyRateMin?: number | null;
  dailyRateMax?: number | null;
  onRequestBooking: (serviceTitle?: string) => void;
}

export function ProfileServices({
  dailyRateMin,
  dailyRateMax,
  onRequestBooking,
}: ProfileServicesProps) {
  const { t } = useTranslation();
  const minRateStr = dailyRateMin ? `₹${dailyRateMin} / day` : "Scope-Based Consultation";
  const maxRateStr = dailyRateMax ? `₹${dailyRateMax} / day` : "Custom Project Contracting";

  const defaultServices = [
    {
      title: "Commercial Rooftop Solar Grid Synchronization",
      description:
        "Complete 3-phase grid tie-in, DC/AC cabling, inverter parameter setup, and DISCOM net-metering inspection readiness.",
      indicativeRate: maxRateStr,
    },
    {
      title: "Industrial Distribution Panel & Busbar Assembly",
      description:
        "Busbar chamber installation, MCCB/MCB sizing, ferrule labeling, phase balancing, and thermal imaging verification.",
      indicativeRate: minRateStr,
    },
    {
      title: "Substation Earthing Pit Testing & Certification",
      description:
        "Chemical earthing electrode testing with calibrated Megger meters, soil resistivity reporting, and compliance certification.",
      indicativeRate: "₹1,800 / test",
    },
    {
      title: "Emergency Fault Tracing & Power Quality Audit",
      description:
        "Rapid diagnosis of ground faults, nuisance tripping, capacitor bank failure, and phase loss in commercial facilities.",
      indicativeRate: "₹1,500 / visit",
    },
  ];

  return (
    <div className="rounded-md bg-card border border-forest/15 shadow-sovereign-sm p-6 sm:p-8 space-y-6">
      <div className="pb-4 border-b border-forest/10 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-forest" />
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-forest">
              {t.profile?.bookService ? "Services Offered & Transparent Rates" : "Services & Rates"}
            </h2>
          </div>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Standard scope of work and indicative contracting rates for direct hire.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {defaultServices.map((svc, i) => (
          <div
            key={i}
            className="p-5 rounded-xl border border-forest/15 bg-card hover:border-forest/30 shadow-sovereign-xs flex flex-col justify-between space-y-3 transition-all"
          >
            <div className="space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-serif font-bold text-sm sm:text-base text-forest">
                  {svc.title}
                </h4>
                <span className="font-mono text-xs font-bold text-forest bg-sand/30 px-2 py-0.5 rounded shrink-0">
                  {svc.indicativeRate}
                </span>
              </div>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                {svc.description}
              </p>
            </div>

            <div className="pt-2 border-t border-forest/10 flex items-center justify-between">
              <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Zero Commission Applied
              </span>

              <Button
                size="sm"
                variant="outline"
                onClick={() => onRequestBooking(svc.title)}
                className="text-xs border-forest/20 text-forest hover:bg-forest/5 h-8 font-medium"
              >
                {t.profile?.bookService || "Request Service"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
