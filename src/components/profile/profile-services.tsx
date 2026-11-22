"use client";

import * as React from "react";
import { Layers, CheckCircle2, IndianRupee, Store, Wrench, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/i18n-context";
import { TranslatedContent } from "@/components/translation/translated-content";

interface ServiceItem {
  title: string;
  description: string;
  indicativeRate: string;
}

interface ProfileServicesProps {
  dailyRateMin?: number | null;
  dailyRateMax?: number | null;
  onRequestBooking: (serviceTitle?: string) => void;
  occupation?: string;
  category?: string;
  skills?: string[];
  productCatalog?: Array<{
    name: string;
    category?: string;
    unitPrice?: number;
    unit?: string;
    description?: string;
  }>;
  servicesCatalog?: Array<{
    title: string;
    description: string;
    rate?: string | number;
    unit?: string;
  }>;
}

export function ProfileServices({
  dailyRateMin,
  dailyRateMax,
  onRequestBooking,
  occupation = "",
  category = "",
  skills = [],
  productCatalog = [],
  servicesCatalog = [],
}: ProfileServicesProps) {
  const { t } = useTranslation();
  const minRateStr = dailyRateMin ? `₹${dailyRateMin} / day` : "Scope-Based Consultation";
  const maxRateStr = dailyRateMax ? `₹${dailyRateMax} / day` : "Custom Project Contracting";

  const resolvedServices = React.useMemo<ServiceItem[]>(() => {
    // 1. If explicit services catalog exists (from vendor profile), use it
    if (servicesCatalog && servicesCatalog.length > 0) {
      return servicesCatalog.map((s) => ({
        title: s.title,
        description: s.description,
        indicativeRate: s.rate ? `₹${s.rate}${s.unit ? ` / ${s.unit}` : ""}` : minRateStr,
      }));
    }

    const occ = (occupation + " " + category).toLowerCase();

    // 2. Tailor / Stitching
    if (occ.includes("tailor") || occ.includes("fashion") || occ.includes("cloth") || occ.includes("textile")) {
      return [
        {
          title: "Custom Garment Tailoring & Fitting",
          description: "Bespoke pattern drafting, cutting, and stitching for formal shirts, trousers, suits, and ethnic kurtas with trial fittings.",
          indicativeRate: minRateStr,
        },
        {
          title: "Blouse, Kurti & Festive Attire Customization",
          description: "Detailed neckline styling, padded linings, piping, hook-and-eye fastenings, and intricate traditional festive wear adjustments.",
          indicativeRate: "₹650 / garment",
        },
        {
          title: "Precision Alterations & Zipper Restoration",
          description: "Waist resizing, sleeve tapering, length hemming, invisible zipper replacement, and restoration of expensive vintage garments.",
          indicativeRate: "₹250 / alteration",
        },
        {
          title: "Uniform & Batch Institutional Stitching",
          description: "Bulk pattern cut-and-sew production for school, hospitality, and corporate uniforms with standardized sizing and fast turnaround.",
          indicativeRate: maxRateStr,
        },
      ];
    }

    // 3. Carpenter / Woodwork
    if (occ.includes("carpenter") || occ.includes("wood") || occ.includes("furniture")) {
      return [
        {
          title: "Custom Solid Hardwood Furniture Joinery",
          description: "Handcrafted teak, sal, and rosewood dining tables, beds, and consoles built with mortise-and-tenon joints for multi-decade durability.",
          indicativeRate: maxRateStr,
        },
        {
          title: "Modular Kitchen & Wardrobe Carcass Fitting",
          description: "Precision installation of water-resistant BWR plywood carcass, soft-close hydraulic hinges, telescopic channels, and acrylic shutters.",
          indicativeRate: minRateStr,
        },
        {
          title: "Wooden Door Frames, Flush Doors & Lock Fitting",
          description: "Plumb installation of main entry chowkhats, sound-damped flush doors, multi-point mortise locks, and concealed magnetic door stoppers.",
          indicativeRate: "₹1,200 / door",
        },
        {
          title: "Antique Wood Restoration & French PU Polishing",
          description: "Careful scratch removal, termite resistance treatment, grain filler application, and hand-rubbed French polish or matte PU finishing.",
          indicativeRate: "₹350 / sq.ft",
        },
      ];
    }

    // 4. Plumber / Sanitary
    if (occ.includes("plumb") || occ.includes("pipe") || occ.includes("sanitary") || occ.includes("drain")) {
      return [
        {
          title: "Concealed CPVC/UPVC Pipeline & Pressure Testing",
          description: "Concealed wall routing of hot and cold water pressure lines, leak-proof solvent welding, and pneumatic pressure gauge testing.",
          indicativeRate: minRateStr,
        },
        {
          title: "Submersible Borewell Pump Installation & Overhaul",
          description: "Lowering and hoisting of multi-stage submersible pumps, non-return valve fitting, dry-run protection wiring, and discharge calibration.",
          indicativeRate: "₹2,200 / pump",
        },
        {
          title: "Drainage Blockage De-Clogging & Camera Inspection",
          description: "Motorized spiral cable and pressure flushing of choked main soil lines, floor traps, grease traps, and bathroom gully chambers.",
          indicativeRate: "₹1,100 / clearance",
        },
        {
          title: "Sanitary Ware & Premium Diverter Fitting",
          description: "Wall-hung commode bracket framing, concealed cistern tanks, thermostatic diverters, rain showers, and sensor faucets.",
          indicativeRate: maxRateStr,
        },
      ];
    }

    // 5. Mechanic / Automobile
    if (occ.includes("mechanic") || occ.includes("auto") || occ.includes("vehicle") || occ.includes("car")) {
      return [
        {
          title: "Computerized Engine Diagnostics & ECU Scan",
          description: "OBD-II scanner fault code extraction, sensor data logging, misfire detection, throttle body cleaning, and ECU adaptive resets.",
          indicativeRate: "₹850 / scan",
        },
        {
          title: "Complete Brake Caliper, Disc & Fluid Servicing",
          description: "Disc rotor skimming, ceramic brake pad replacement, hydraulic caliper bleeding with DOT4 fluid, and handbrake tensioning.",
          indicativeRate: minRateStr,
        },
        {
          title: "Suspension Overhaul & Steering Strut Assembly",
          description: "MacPherson strut replacement, lower control arm bushing press, tie-rod end alignment, and sway bar link replacement.",
          indicativeRate: maxRateStr,
        },
        {
          title: "Emergency Roadside Breakdown & Starter Rescue",
          description: "On-site jump starting, alternator output verification, fuel pump relay checking, flat tyre change, and emergency roadside recovery.",
          indicativeRate: "₹1,200 / callout",
        },
      ];
    }

    // 6. Handloom / Artisan
    if (occ.includes("loom") || occ.includes("weav") || occ.includes("artisan") || occ.includes("craft") || occ.includes("bamboo")) {
      return [
        {
          title: "Authentic Handloom Muga & Eri Silk Weaving",
          description: "Traditional throw-shuttle and fly-shuttle handloom weaving using 100% genuine GI-tagged Golden Muga and Ahimsa Eri wild silks.",
          indicativeRate: maxRateStr,
        },
        {
          title: "Artisan Bamboo & Cane Architectural Fabrication",
          description: "Treated bamboo furniture, ornamental partition screens, hanging luminaires, and eco-friendly structural gazebos.",
          indicativeRate: minRateStr,
        },
        {
          title: "Heritage Bell Metal & Brass Casting Works",
          description: "Lost-wax cast bronze tableware, traditional Xorai, brass lamps, and ceremonial urns polished with historic non-toxic techniques.",
          indicativeRate: "Scope-Based Pricing",
        },
        {
          title: "Custom Motif Design & Heritage Gift Commissions",
          description: "Bespoke corporate gifting, framed woven tapestries, cultural artifacts, and certified handcrafted collector pieces.",
          indicativeRate: "On Consultation",
        },
      ];
    }

    // 7. Farmer / Agriculture
    if (occ.includes("farm") || occ.includes("agri") || occ.includes("crop") || occ.includes("produce")) {
      return [
        {
          title: "Direct Farm Fresh Produce Wholesale Supply",
          description: "Daily harvested seasonal vegetables, native grains, and fresh pulses dispatched directly from farm-gate to buyers with zero middlemen.",
          indicativeRate: minRateStr,
        },
        {
          title: "Certified Organic Harvest Crates & Bulk Grains",
          description: "Chemical-free certified organic produce, heirloom rice varieties, and cold-pressed mustard oil sorted and packed to institutional specifications.",
          indicativeRate: "₹1,500 / crate batch",
        },
        {
          title: "Contract Agricultural Farming & Cultivation",
          description: "Structured land preparation, drip-irrigation management, organic soil enrichment, and planned crop cycle management.",
          indicativeRate: maxRateStr,
        },
        {
          title: "Farm Seedling, Sapling & Agro-forestry Supply",
          description: "High-yield disease-resistant fruit saplings, vegetable nursery seedlings, and medicinal plant saplings ready for planting.",
          indicativeRate: "₹45 / sapling",
        },
      ];
    }

    // 8. Default: Electrical & Solar Specialist or General Trade
    return [
      {
        title: "Commercial Rooftop Solar Grid Synchronization",
        description: "Complete 3-phase grid tie-in, DC/AC cabling, inverter parameter setup, and DISCOM net-metering inspection readiness.",
        indicativeRate: maxRateStr,
      },
      {
        title: "Industrial Distribution Panel & Busbar Assembly",
        description: "Busbar chamber installation, MCCB/MCB sizing, ferrule labeling, phase balancing, and thermal imaging verification.",
        indicativeRate: minRateStr,
      },
      {
        title: "Substation Earthing Pit Testing & Certification",
        description: "Chemical earthing electrode testing with calibrated Megger meters, soil resistivity reporting, and compliance certification.",
        indicativeRate: "₹1,800 / test",
      },
      {
        title: "Emergency Fault Tracing & Power Quality Audit",
        description: "Rapid diagnosis of ground faults, nuisance tripping, capacitor bank failure, and phase loss in commercial facilities.",
        indicativeRate: "₹1,500 / visit",
      },
    ];
  }, [servicesCatalog, occupation, category, minRateStr, maxRateStr]);

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

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {resolvedServices.map((svc, i) => (
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
              <TranslatedContent
                content={svc.description}
                contentType="service_description"
                textClassName="text-xs text-charcoal-muted leading-relaxed"
              />
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

      {/* If products catalog exists (for local vendors, food stalls, artisan shops) */}
      {productCatalog && productCatalog.length > 0 && (
        <div className="pt-6 border-t border-forest/15 space-y-4">
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-forest" />
            <h3 className="font-serif text-lg font-bold text-forest">
              Goods & Products Available Direct
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {productCatalog.map((prod, pIdx) => (
              <div
                key={pIdx}
                className="p-3.5 rounded-lg border border-forest/15 bg-forest/5 flex flex-col justify-between space-y-2"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-xs text-forest">{prod.name}</span>
                    {prod.unitPrice && (
                      <span className="font-mono text-xs font-bold text-forest bg-sand/30 px-1.5 py-0.5 rounded">
                        ₹{prod.unitPrice}{prod.unit ? ` / ${prod.unit}` : ""}
                      </span>
                    )}
                  </div>
                  {prod.description && (
                    <p className="text-[11px] text-charcoal-muted line-clamp-2 mt-1">
                      {prod.description}
                    </p>
                  )}
                </div>
                <div className="text-[10px] text-emerald-700 font-medium">
                  Direct artisan sale • 0% commission
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
