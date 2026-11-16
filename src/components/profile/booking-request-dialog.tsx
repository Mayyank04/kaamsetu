"use client";

import * as React from "react";
import { X, CalendarCheck, AlertCircle, CheckCircle2, Calendar, MapPin, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface BookingRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  workerProfileId: string;
  workerName: string;
  prefilledService?: string;
}

export function BookingRequestDialog({
  isOpen,
  onClose,
  workerProfileId,
  workerName,
  prefilledService,
}: BookingRequestDialogProps) {
  const [customerName, setCustomerName] = React.useState("");
  const [customerPhone, setCustomerPhone] = React.useState("");
  const [serviceTitle, setServiceTitle] = React.useState(prefilledService || "Site Technical Inspection & Wiring");
  const [description, setDescription] = React.useState("");
  const [locationAddress, setLocationAddress] = React.useState("");
  const [locationCity, setLocationCity] = React.useState("Jaipur");
  const [scheduledStart, setScheduledStart] = React.useState(
    new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0]
  );
  const [estimatedCost, setEstimatedCost] = React.useState("2500");

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successReference, setSuccessReference] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (prefilledService) {
      setServiceTitle(prefilledService);
    }
  }, [prefilledService]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          worker_profile_id: workerProfileId,
          service_title: serviceTitle,
          description,
          location_address: locationAddress,
          location_city: locationCity,
          scheduled_start: new Date(scheduledStart).toISOString(),
          estimated_cost: parseInt(estimatedCost, 10) || 2000,
          customer_name: customerName,
          customer_phone: customerPhone,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to submit booking request");
      }

      setSuccessReference(json.data?.booking_reference || "BK-2026-CONFIRMED");
    } catch (err: any) {
      setError(err.message || "Error submitting booking request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-forest-950/75 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card w-full max-w-xl rounded-md border border-forest/20 shadow-sovereign-md p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-forest/10">
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-forest" />
            <h3 className="font-serif text-lg font-bold text-forest">
              Request Service from {workerName}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-charcoal-muted hover:text-forest p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successReference ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="font-serif text-xl font-bold text-forest">
                Booking Request Dispatched!
              </h4>
              <p className="text-xs text-charcoal-muted max-w-md mx-auto">
                Reference ID: <strong className="font-mono text-forest">{successReference}</strong>.
                {workerName} will review your request and confirm via SMS shortly.
              </p>
            </div>
            <Button
              onClick={onClose}
              className="bg-forest text-ivory text-xs h-9 px-6 font-semibold"
            >
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-terracotta/10 border border-terracotta/20 text-xs text-terracotta flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Client Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-forest block">
                  Your Full Name *
                </label>
                <Input
                  placeholder="e.g. Vikram Singhania"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  className="text-xs h-10 border-forest/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-forest block">
                  Mobile Number (For SMS confirmation) *
                </label>
                <Input
                  placeholder="+91 98290 12345"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  required
                  className="text-xs h-10 border-forest/20"
                />
              </div>
            </div>

            {/* Service & Budget */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-forest block">
                  Service Required *
                </label>
                <Input
                  value={serviceTitle}
                  onChange={(e) => setServiceTitle(e.target.value)}
                  required
                  className="text-xs h-10 border-forest/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-forest block">
                  Estimated Budget (₹)
                </label>
                <Input
                  type="number"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(e.target.value)}
                  className="text-xs h-10 border-forest/20"
                />
              </div>
            </div>

            {/* Address & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-forest block">
                  Site Address / Landmark *
                </label>
                <Input
                  placeholder="e.g. Plot C-14, Sitapura Industrial Area"
                  value={locationAddress}
                  onChange={(e) => setLocationAddress(e.target.value)}
                  required
                  className="text-xs h-10 border-forest/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-forest block">
                  Preferred Date *
                </label>
                <Input
                  type="date"
                  value={scheduledStart}
                  onChange={(e) => setScheduledStart(e.target.value)}
                  required
                  className="text-xs h-10 border-forest/20"
                />
              </div>
            </div>

            {/* Technical Scope */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-forest block">
                Work Scope / Special Instructions
              </label>
              <Textarea
                placeholder="Describe project details, building access hours, power supply availability, etc..."
                value={description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                className="text-xs min-h-[70px] border-forest/20 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-forest/10">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="text-xs h-9 border-forest/20 text-forest"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !customerName || !customerPhone || !locationAddress}
                className="bg-forest hover:bg-forest-600 text-ivory text-xs h-9 px-5 font-semibold"
              >
                {isSubmitting ? "Transmitting..." : "Submit Booking Request"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
