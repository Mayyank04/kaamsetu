"use client";

import * as React from "react";
import {
  Briefcase,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Phone,
  IndianRupee,
  Layers,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardBooking } from "@/types/dashboard";

interface JobRequestsProps {
  bookings: DashboardBooking[];
  onUpdateStatus: (bookingId: string, status: "confirmed" | "completed" | "cancelled") => Promise<void>;
}

export function JobRequests({ bookings, onUpdateStatus }: JobRequestsProps) {
  const [filter, setFilter] = React.useState<"all" | "requested" | "confirmed" | "completed">("all");
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);

  const filteredBookings = bookings.filter((b) => {
    if (filter === "all") return true;
    return b.status === filter;
  });

  const handleAction = async (
    bookingId: string,
    status: "confirmed" | "completed" | "cancelled"
  ) => {
    setUpdatingId(bookingId);
    try {
      await onUpdateStatus(bookingId, status);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: DashboardBooking["status"]) => {
    switch (status) {
      case "requested":
        return (
          <Badge className="bg-sand/30 text-sand-800 border-sand/40 text-[10px] font-mono">
            PENDING APPROVAL
          </Badge>
        );
      case "confirmed":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-800 border-emerald-500/30 text-[10px] font-mono">
            CONFIRMED
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-forest/15 text-forest border-forest/30 text-[10px] font-mono">
            COMPLETED
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="outline" className="text-charcoal-muted text-[10px] font-mono">
            DECLINED
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="rounded-md bg-card border border-forest/15 shadow-sovereign-sm p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-forest/10">
        <div>
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-forest" />
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-forest">
              Client Service Inquiries
            </h2>
          </div>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Manage incoming direct service requests from clients and commercial contractors.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-forest/5 p-1 rounded-md border border-forest/10 self-start sm:self-auto text-xs">
          {(["all", "requested", "confirmed", "completed"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all capitalize text-xs ${
                filter === tab
                  ? "bg-forest text-ivory shadow-xs"
                  : "text-charcoal-muted hover:text-forest"
              }`}
            >
              {tab === "all" ? "All Inquiries" : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="p-8 text-center rounded-md bg-forest/5 border border-forest/10 text-xs text-charcoal-muted">
          No bookings matching &quot;{filter}&quot; filter.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => (
            <div
              key={b.id}
              className="p-5 rounded-md border border-forest/15 bg-card hover:border-forest/30 shadow-sovereign-xs transition-all space-y-3"
            >
              {/* Top Meta */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-forest/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-forest">
                    {b.bookingReference}
                  </span>
                  <span className="text-charcoal-muted text-xs">•</span>
                  <span className="font-semibold text-xs text-forest">
                    {b.clientName}
                  </span>
                </div>
                <div>{getStatusBadge(b.status)}</div>
              </div>

              {/* Service Details */}
              <div className="space-y-1">
                <h4 className="font-serif font-bold text-base text-forest">
                  {b.serviceTitle}
                </h4>
                {b.description && (
                  <p className="text-xs text-charcoal-muted leading-relaxed">
                    {b.description}
                  </p>
                )}
              </div>

              {/* Info Chips */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-charcoal-muted pt-1">
                <span className="inline-flex items-center gap-1.5 bg-forest/5 px-2.5 py-1 rounded border border-forest/10 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-forest" />
                  {new Date(b.scheduledStart).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>

                <span className="inline-flex items-center gap-1.5 bg-forest/5 px-2.5 py-1 rounded border border-forest/10">
                  <MapPin className="w-3.5 h-3.5 text-forest" />
                  {b.locationAddress}, {b.locationCity}
                </span>

                {b.estimatedCost && (
                  <span className="inline-flex items-center gap-1.5 bg-sand/20 px-2.5 py-1 rounded border border-sand/30 font-bold text-forest">
                    <IndianRupee className="w-3.5 h-3.5 text-forest" />
                    Est. ₹{b.estimatedCost.toLocaleString("en-IN")}
                  </span>
                )}

                {b.clientPhone && b.status === "confirmed" && (
                  <a
                    href={`tel:${b.clientPhone}`}
                    className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-800 px-2.5 py-1 rounded border border-emerald-500/20 hover:bg-emerald-500/20 font-medium"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {b.clientPhone}
                  </a>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-2 justify-end">
                {b.status === "requested" && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={updatingId === b.id}
                      onClick={() => handleAction(b.id, "cancelled")}
                      className="border-forest/20 text-terracotta hover:bg-terracotta/10 h-8 text-xs"
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1.5" />
                      Decline
                    </Button>
                    <Button
                      size="sm"
                      disabled={updatingId === b.id}
                      onClick={() => handleAction(b.id, "confirmed")}
                      className="bg-forest hover:bg-forest-600 text-ivory h-8 text-xs px-4"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-sand" />
                      Accept Booking
                    </Button>
                  </>
                )}

                {b.status === "confirmed" && (
                  <Button
                    size="sm"
                    disabled={updatingId === b.id}
                    onClick={() => handleAction(b.id, "completed")}
                    className="bg-forest hover:bg-forest-600 text-ivory h-8 text-xs px-4"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-300" />
                    Mark Job Completed
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
