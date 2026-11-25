"use client";

import * as React from "react";
import Link from "next/link";
import { X, CalendarCheck, AlertCircle, CheckCircle2, MapPin } from "lucide-react";
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
  const [serviceTitle, setServiceTitle] = React.useState(prefilledService || "Home or Site Craft Work");
  const [description, setDescription] = React.useState("");
  const [locationAddress, setLocationAddress] = React.useState("");
  const [locationCity, setLocationCity] = React.useState("Guwahati");
  const [locationState, setLocationState] = React.useState("Assam");
  const [locationPincode, setLocationPincode] = React.useState("781001");
  const [scheduledStart, setScheduledStart] = React.useState(
    new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0]
  );
  const [estimatedCost, setEstimatedCost] = React.useState("2500");

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [requiresAuth, setRequiresAuth] = React.useState(false);
  const [successReference, setSuccessReference] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (prefilledService) {
      setServiceTitle(prefilledService);
    }
  }, [prefilledService]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setRequiresAuth(false);

    if (!/^[1-9][0-9]{5}$/.test(locationPincode.trim())) {
      setError("Please enter a valid 6-digit Indian PIN code (for example 781001 in Guwahati or 793001 in Shillong).");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          worker_profile_id: workerProfileId,
          service_title: serviceTitle.trim(),
          description: description.trim(),
          location_address: locationAddress.trim(),
          location_city: locationCity.trim(),
          location_state: locationState.trim(),
          location_pincode: locationPincode.trim(),
          scheduled_start: new Date(scheduledStart).toISOString(),
          estimated_cost: parseInt(estimatedCost, 10) || 2000,
          customer_name: customerName.trim(),
          customer_phone: customerPhone.trim(),
        }),
      });

      const json = await res.json();
      if (res.status === 401) {
        setRequiresAuth(true);
        throw new Error("Please sign in to send a service request so you can track updates.");
      }

      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || json.error || "Failed to send service request.");
      }

      setSuccessReference(json.data?.booking_reference || "BK-CONFIRMED");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not send booking request.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-forest-950/75 flex items-center justify-center p-4 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="booking-dialog-title">
      <div className="bg-card w-full max-w-xl rounded-md border border-forest/20 shadow-sovereign-md p-5 sm:p-6 space-y-4 my-auto max-h-[calc(100dvh-2rem)] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-forest/10">
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-forest" />
            <h3 id="booking-dialog-title" className="text-lg font-bold text-forest">
              Request Work from {workerName}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close booking dialog"
            className="text-charcoal-muted hover:text-forest min-h-[40px] min-w-[40px] flex items-center justify-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 rounded-sm bg-sand/20 border border-sand/50 text-xs text-charcoal flex items-start gap-2">
          <MapPin className="w-4 h-4 text-forest shrink-0 mt-0.5" />
          <span>
            Direct booking dispatch is active in <strong>Guwahati Urban (PIN 781001–781039)</strong> and <strong>Shillong Urban (PIN 793001–793022)</strong>. Workers keep 100% of wages (₹0.00 commission).
          </span>
        </div>

        {successReference ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-800 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xl font-bold text-forest">Service Request Sent</h4>
              <p className="text-sm text-charcoal-muted max-w-md mx-auto">
                Reference ID: <strong className="font-mono text-forest">{successReference}</strong>.{" "}
                {workerName} will review your details and reply soon.
              </p>
            </div>
            <Button onClick={onClose} className="bg-forest text-ivory min-h-[44px] px-6 text-sm font-semibold">
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-sm bg-red-50 border border-red-200 text-xs text-red-900 space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-700" />
                  <span>{error}</span>
                </div>
                {requiresAuth && (
                  <div>
                    <Link
                      href={`/login?redirect=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "/explore")}`}
                      className="inline-block font-bold text-forest underline underline-offset-4"
                    >
                      Sign In or Create a Customer Account →
                    </Link>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="bk-name" className="text-xs font-semibold text-forest block">
                  Your Name *
                </label>
                <Input
                  id="bk-name"
                  placeholder="e.g. Ananya Das"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  className="text-sm h-11 border-forest/20"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="bk-phone" className="text-xs font-semibold text-forest block">
                  Mobile Number *
                </label>
                <Input
                  id="bk-phone"
                  placeholder="98640 12345"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  required
                  className="text-sm h-11 border-forest/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="bk-service" className="text-xs font-semibold text-forest block">
                  Work Needed *
                </label>
                <Input
                  id="bk-service"
                  value={serviceTitle}
                  onChange={(e) => setServiceTitle(e.target.value)}
                  required
                  className="text-sm h-11 border-forest/20"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="bk-budget" className="text-xs font-semibold text-forest block">
                  Estimated Budget (₹)
                </label>
                <Input
                  id="bk-budget"
                  type="number"
                  min={100}
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(e.target.value)}
                  className="text-sm h-11 border-forest/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label htmlFor="bk-city" className="text-xs font-semibold text-forest block">
                  City *
                </label>
                <select
                  id="bk-city"
                  value={locationCity}
                  onChange={(e) => {
                    const c = e.target.value;
                    setLocationCity(c);
                    if (c === "Guwahati") {
                      setLocationState("Assam");
                      setLocationPincode("781001");
                    } else if (c === "Shillong") {
                      setLocationState("Meghalaya");
                      setLocationPincode("793001");
                    }
                  }}
                  className="w-full h-11 px-3 rounded-sm border border-forest/20 bg-card text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-forest"
                >
                  <option value="Guwahati">Guwahati (Assam)</option>
                  <option value="Shillong">Shillong (Meghalaya)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="bk-pin" className="text-xs font-semibold text-forest block">
                  6-Digit PIN Code *
                </label>
                <Input
                  id="bk-pin"
                  maxLength={6}
                  value={locationPincode}
                  onChange={(e) => setLocationPincode(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="781001"
                  required
                  className="text-sm h-11 font-mono border-forest/20"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="bk-date" className="text-xs font-semibold text-forest block">
                  Preferred Date *
                </label>
                <Input
                  id="bk-date"
                  type="date"
                  value={scheduledStart}
                  onChange={(e) => setScheduledStart(e.target.value)}
                  required
                  className="text-sm h-11 border-forest/20"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="bk-addr" className="text-xs font-semibold text-forest block">
                House / Street Address &amp; Landmark *
              </label>
              <Input
                id="bk-addr"
                placeholder="e.g. House 14, GS Road, Paltan Bazaar"
                value={locationAddress}
                onChange={(e) => setLocationAddress(e.target.value)}
                required
                className="text-sm h-11 border-forest/20"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="bk-desc" className="text-xs font-semibold text-forest block">
                Work Details (Optional)
              </label>
              <Textarea
                id="bk-desc"
                placeholder="Describe what needs repair, installation, or work timing..."
                value={description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                className="text-sm min-h-[76px] border-forest/20 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-forest/10">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="min-h-[44px] text-sm border-forest/20 text-forest"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !customerName.trim() || !customerPhone.trim() || !locationAddress.trim() || locationPincode.length !== 6}
                className="bg-forest hover:bg-forest-600 text-ivory min-h-[44px] px-5 text-sm font-semibold"
              >
                {isSubmitting ? "Sending..." : "Send Request"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
