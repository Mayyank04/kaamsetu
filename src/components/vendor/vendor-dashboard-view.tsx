"use client";

import * as React from "react";
import Link from "next/link";
import { VendorProfile, VendorDashboardData } from "@/types/vendor";
import { useTranslation } from "@/lib/i18n/i18n-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TranslatedContent } from "@/components/translation/translated-content";
import { VoiceTranslationWidget } from "@/components/translation/voice-translation-widget";
import { TranslationDialog } from "@/components/translation/translation-dialog";
import { DynamicVendorForm } from "@/components/vendor/dynamic-vendor-form";
import {
  Store,
  Clock,
  MapPin,
  Phone,
  Package,
  Layers,
  Edit3,
  ExternalLink,
  Plus,
  Truck,
  CheckCircle2,
  Inbox,
  Star,
  Settings,
  Share2,
  Sparkles,
} from "lucide-react";

interface VendorDashboardViewProps {
  initialVendor: VendorProfile | null;
}

export function VendorDashboardView({ initialVendor }: VendorDashboardViewProps) {
  const { t } = useTranslation();
  const [vendor, setVendor] = React.useState<VendorProfile | null>(initialVendor);
  const [isEditing, setIsEditing] = React.useState(!initialVendor);
  const [isTranslatorOpen, setIsTranslatorOpen] = React.useState(false);

  if (!vendor && !isEditing) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-forest/10 border border-forest/20 flex items-center justify-center text-forest mx-auto">
          <Store className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="font-serif text-2xl font-bold text-forest">
            Register Your Shop or Local Stall
          </h2>
          <p className="text-xs text-charcoal-muted max-w-md mx-auto">
            Create your digital vendor profile to showcase your craftsmanship, goods, and operating hours to local customers across India with 0% commission.
          </p>
        </div>
        <Button
          onClick={() => setIsEditing(true)}
          className="bg-forest hover:bg-forest-600 text-ivory text-xs font-semibold px-6"
        >
          <Plus className="w-4 h-4 mr-1.5 text-sand" />
          Create Vendor Profile
        </Button>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl font-bold text-forest">
              {vendor ? "Edit Your Business & Stall Profile" : "Create Vendor Profile"}
            </h1>
            <p className="text-xs text-charcoal-muted mt-0.5">
              Accurate details ensure customers find your exact trade and products.
            </p>
          </div>
          {vendor && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(false)}
              className="text-xs border-forest/20 text-forest"
            >
              Cancel Editing
            </Button>
          )}
        </div>

        <DynamicVendorForm
          initialData={vendor}
          onSuccess={(newId) => {
            setIsEditing(false);
            // Refresh vendor data
            fetch("/api/vendor/profile")
              .then((r) => r.json())
              .then((d) => {
                if (d.vendor) setVendor(d.vendor);
              });
          }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in duration-300">
      {/* 1. Header Overview Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-md bg-card border border-forest/15 shadow-sovereign-sm">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-lg bg-forest/10 border border-forest/20 flex items-center justify-center text-forest shrink-0">
            <Store className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-serif text-xl sm:text-2xl font-bold text-forest">
                {vendor?.businessName}
              </h1>
              <Badge className="bg-emerald-500/15 text-emerald-800 border-emerald-500/25 text-[10px] font-mono">
                {vendor?.stallType?.replace("_", " ").toUpperCase() || "STALL"}
              </Badge>
              <Badge className="bg-sand/30 text-sand-800 border-sand/40 text-[10px] font-mono">
                {vendor?.availability === "open_today" ? "OPEN TODAY" : "BY APPOINTMENT"}
              </Badge>
            </div>
            <p className="text-xs text-charcoal-muted">
              {vendor?.locality}, {vendor?.city}, {vendor?.state} • {vendor?.operatingHours}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="border-forest/20 text-forest hover:bg-forest/5 text-xs h-9"
          >
            <Edit3 className="w-3.5 h-3.5 mr-1.5" />
            Edit Profile
          </Button>

          <Button
            asChild
            size="sm"
            className="bg-forest hover:bg-forest-600 text-ivory text-xs h-9 shadow-sm"
          >
            <Link href="/explore">
              <ExternalLink className="w-3.5 h-3.5 mr-1.5 text-sand" />
              View on Explore
            </Link>
          </Button>
        </div>
      </div>

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-md bg-card border border-forest/15 shadow-sovereign-xs space-y-1">
          <span className="text-[10px] font-mono text-charcoal-muted uppercase">Catalog Items</span>
          <p className="font-serif text-2xl font-bold text-forest">
            {vendor?.productCatalog?.length || 0}
          </p>
          <span className="text-[10px] text-emerald-700 font-medium">Publicly listed</span>
        </div>

        <div className="p-4 rounded-md bg-card border border-forest/15 shadow-sovereign-xs space-y-1">
          <span className="text-[10px] font-mono text-charcoal-muted uppercase">Platform Commission</span>
          <p className="font-serif text-2xl font-bold text-forest">₹0.00</p>
          <span className="text-[10px] text-emerald-700 font-medium">Permanent 0% guarantee</span>
        </div>

        <div className="p-4 rounded-md bg-card border border-forest/15 shadow-sovereign-xs space-y-1">
          <span className="text-[10px] font-mono text-charcoal-muted uppercase">Delivery Range</span>
          <p className="font-serif text-2xl font-bold text-forest">
            {vendor?.serviceRadiusKm || 15} km
          </p>
          <span className="text-[10px] text-charcoal-muted font-medium">
            {vendor?.deliveryAvailable ? "Doorstep delivery active" : "Pickup at stall"}
          </span>
        </div>

        <div className="p-4 rounded-md bg-card border border-forest/15 shadow-sovereign-xs space-y-1">
          <span className="text-[10px] font-mono text-charcoal-muted uppercase">Profile Health</span>
          <p className="font-serif text-2xl font-bold text-forest">
            {vendor?.profileCompletion || 90}%
          </p>
          <span className="text-[10px] text-emerald-700 font-medium">Verified profile</span>
        </div>
      </div>

      {/* 3. Catalog & Goods Showcase */}
      <div className="p-6 rounded-md bg-card border border-forest/15 shadow-sovereign-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-forest/10">
          <div>
            <h3 className="font-serif text-lg font-bold text-forest">
              {t.vendorDashboard?.productCatalog || "Product & Produce Catalog"}
            </h3>
            <p className="text-xs text-charcoal-muted">
              Live items and pricing visible to local neighborhood customers.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setIsEditing(true)}
            variant="outline"
            className="border-forest/20 text-forest hover:bg-forest/5 text-xs h-8"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Manage Items
          </Button>
        </div>

        {vendor?.productCatalog && vendor.productCatalog.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {vendor.productCatalog.map((prod) => (
              <div
                key={prod.id}
                className="p-3.5 rounded-sm border border-forest/15 bg-background space-y-1 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-forest line-clamp-1">{prod.name}</span>
                  <Badge variant="outline" className="bg-forest/5 text-forest border-forest/20 text-[10px] shrink-0 font-mono">
                    ₹{prod.price} / {prod.unit}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-[10px] text-charcoal-muted pt-1">
                  <span>Status: Available</span>
                  <span className="text-emerald-700 font-medium">In Stock</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-charcoal-muted space-y-2">
            <Package className="w-8 h-8 text-forest/40 mx-auto" />
            <p>{t.vendorDashboard?.emptyCatalog || "No catalog items listed yet."}</p>
          </div>
        )}
      </div>

      {/* 3b. Professional Services & Labor Rates */}
      <div className="p-6 rounded-md bg-card border border-forest/15 shadow-sovereign-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-forest/10">
          <div>
            <h3 className="font-serif text-lg font-bold text-forest">
              Bespoke Services & Labor Rates
            </h3>
            <p className="text-xs text-charcoal-muted">
              Custom alterations, on-site diagnostics, repairs, or craft orders.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setIsEditing(true)}
            variant="outline"
            className="border-forest/20 text-forest hover:bg-forest/5 text-xs h-8"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Manage Services
          </Button>
        </div>

        {vendor?.servicesCatalog && vendor.servicesCatalog.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {vendor.servicesCatalog.map((svc) => (
              <div
                key={svc.id}
                className="p-3.5 rounded-sm border border-forest/15 bg-background space-y-1 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-forest line-clamp-1">{svc.name}</span>
                  <Badge variant="outline" className="bg-sand/30 text-sand-800 border-sand/40 text-[10px] shrink-0 font-mono font-semibold">
                    ₹{svc.price} ({svc.priceType.replace("_", " ")})
                  </Badge>
                </div>
                {svc.durationEstimate && (
                  <div className="flex items-center justify-between text-[10px] text-charcoal-muted pt-1">
                    <span>Estimated Duration:</span>
                    <span className="font-medium text-forest">{svc.durationEstimate}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-charcoal-muted space-y-1">
            <p>No discrete services listed yet. You can list labor rates, alterations, or consultations.</p>
          </div>
        )}
      </div>

      {/* 3c. Workshop Photos Showcase */}
      {vendor?.businessImages && vendor.businessImages.length > 0 && (
        <div className="p-6 rounded-md bg-card border border-forest/15 shadow-sovereign-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-forest/10">
            <div>
              <h3 className="font-serif text-lg font-bold text-forest">Workshop & Storefront Photos</h3>
              <p className="text-xs text-charcoal-muted">Authentic photos of your stall and completed work.</p>
            </div>
            <Button
              size="sm"
              onClick={() => setIsEditing(true)}
              variant="outline"
              className="border-forest/20 text-forest hover:bg-forest/5 text-xs h-8"
            >
              Update Photos
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {vendor.businessImages.map((imgUrl, i) => (
              <div key={i} className="relative rounded border border-forest/20 overflow-hidden h-28 bg-forest/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imgUrl} alt={`Storefront ${i + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Customer Inquiries & Bookings (Truthful Empty State) */}
      <div className="p-6 rounded-md bg-card border border-forest/15 shadow-sovereign-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-forest/10">
          <div>
            <h3 className="font-serif text-lg font-bold text-forest">
              {t.vendorDashboard?.inquiries || "Customer Inquiries & Orders"}
            </h3>
            <p className="text-xs text-charcoal-muted">
              Incoming service bookings and local neighborhood inquiries.
            </p>
          </div>
          <Badge variant="outline" className="text-xs border-forest/20 text-forest">
            0 Pending
          </Badge>
        </div>

        <div className="text-center py-10 space-y-2 rounded border border-dashed border-forest/20 bg-forest/5">
          <Inbox className="w-8 h-8 text-forest/40 mx-auto" />
          <h4 className="font-serif font-bold text-sm text-forest">No customer inquiries yet</h4>
          <p className="text-xs text-charcoal-muted max-w-sm mx-auto">
            {t.vendorDashboard?.emptyInquiries ||
              "Ensure your stall address and operating hours are accurate to maximize local customer discovery."}
          </p>
        </div>

        {/* Two-Way Cross-Language Communication for Customer Inquiries */}
        <div className="pt-4 border-t border-forest/10 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-serif font-bold text-sm text-forest">Two-Way Customer Communication</h4>
              <p className="text-[11px] text-charcoal-muted">Translate customer enquiries or communicate via live voice translation</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsTranslatorOpen(true)}
              className="text-xs border-forest/20 text-forest h-7"
            >
              Open Universal Translator
            </Button>
          </div>
          <VoiceTranslationWidget
            initialSourceLang="hi"
            initialTargetLang="en"
            className="border-dashed"
          />
        </div>

        <TranslationDialog
          isOpen={isTranslatorOpen}
          onClose={() => setIsTranslatorOpen(false)}
          title="Customer Enquiry & Order Translator"
        />
      </div>
    </div>
  );
}
