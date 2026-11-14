"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Wrench,
  Award,
  MapPin,
  Calendar,
  IndianRupee,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Star,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface CustomerBookingItem {
  id: string;
  booking_reference: string;
  customer_id: string;
  worker_profile_id: string;
  service_title: string;
  description: string | null;
  location_address: string;
  location_city: string;
  scheduled_start: string;
  scheduled_end?: string | null;
  estimated_cost: number | null;
  final_cost: number | null;
  status: "requested" | "confirmed" | "in_progress" | "completed" | "cancelled";
  cancellation_reason?: string | null;
  created_at: string;
  worker_profile?: {
    id: string;
    full_name: string;
    headline: string;
    registry_id: string;
    city: string;
    state?: string;
    kaamscore?: number;
    avatar_url?: string | null;
  };
}

interface BookingCardProps {
  booking: CustomerBookingItem;
  onTransitionStatus: (
    bookingId: string,
    newStatus: "requested" | "confirmed" | "in_progress" | "completed" | "cancelled",
    reason?: string
  ) => Promise<void>;
  onOpenReviewModal: (booking: CustomerBookingItem) => void;
}

export function BookingCard({
  booking,
  onTransitionStatus,
  onOpenReviewModal,
}: BookingCardProps) {
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [showCancelPrompt, setShowCancelPrompt] = React.useState(false);
  const [cancelReason, setCancelReason] = React.useState("");

  const worker = booking.worker_profile || {
    id: booking.worker_profile_id,
    full_name: "Verified Trade Professional",
    headline: "Licensed Technical Craftsman",
    registry_id: "IN-2026-KS",
    city: booking.location_city,
    kaamscore: 820,
    avatar_url: null,
  };

  const workerSlug =
    worker.full_name.toLowerCase().replace(/\s+/g, "-") +
    "-" +
    booking.location_city.toLowerCase();

  const handleAction = async (
    status: "requested" | "confirmed" | "in_progress" | "completed" | "cancelled"
  ) => {
    setIsUpdating(true);
    try {
      await onTransitionStatus(booking.id, status, cancelReason);
      setShowCancelPrompt(false);
    } finally {
      setIsUpdating(false);
    }
  };

  // Status mapping to 4 visual steps
  const steps = [
    { key: "requested", label: "Pending Approval", icon: Clock },
    { key: "confirmed", label: "Accepted by Worker", icon: CheckCircle2 },
    { key: "in_progress", label: "Work In-Progress", icon: Wrench },
    { key: "completed", label: "Completed & Verified", icon: Award },
  ];

  const getStepIndex = (st: string) => {
    if (st === "requested") return 0;
    if (st === "confirmed") return 1;
    if (st === "in_progress") return 2;
    if (st === "completed") return 3;
    return -1; // cancelled
  };

  const currentStepIdx = getStepIndex(booking.status);

  return (
    <div className="rounded-2xl border border-forest/15 bg-card hover:border-forest/30 shadow-sovereign-sm transition-all overflow-hidden space-y-5 p-5 sm:p-7">
      {/* 1. Header: Reference & Status Stepper */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-forest/10">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold text-forest">
            {booking.booking_reference}
          </span>
          <span className="text-charcoal-muted text-xs">•</span>
          <span className="text-xs text-charcoal-muted font-mono">
            Booked on {new Date(booking.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </span>
        </div>

        <div>
          {booking.status === "cancelled" ? (
            <Badge variant="outline" className="bg-terracotta/10 text-terracotta border-terracotta/30 text-xs font-mono">
              <XCircle className="w-3.5 h-3.5 mr-1" />
              CANCELLED
            </Badge>
          ) : (
            <Badge
              className={`text-xs font-mono ${
                booking.status === "completed"
                  ? "bg-forest text-sand border-forest"
                  : booking.status === "in_progress"
                  ? "bg-emerald-500/15 text-emerald-800 border-emerald-500/30"
                  : booking.status === "confirmed"
                  ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
                  : "bg-sand/30 text-sand-800 border-sand/40"
              }`}
            >
              {booking.status === "requested" && "PENDING WORKER CONFIRMATION"}
              {booking.status === "confirmed" && "ACCEPTED • DISPATCH READY"}
              {booking.status === "in_progress" && "ON-SITE ACTIVE"}
              {booking.status === "completed" && "COMPLETED"}
            </Badge>
          )}
        </div>
      </div>

      {/* 2. Visual Progression Stepper (if not cancelled) */}
      {booking.status !== "cancelled" && (
        <div className="py-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {steps.map((st, i) => {
              const isPast = currentStepIdx > i;
              const isCurrent = currentStepIdx === i;
              const Icon = st.icon;

              return (
                <div
                  key={st.key}
                  className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 transition-all ${
                    isCurrent
                      ? "bg-forest text-ivory border-forest shadow-sovereign-xs font-bold"
                      : isPast
                      ? "bg-forest/5 text-forest border-forest/20 font-medium"
                      : "bg-forest/2 text-charcoal-muted border-forest/10 opacity-60"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isCurrent ? "text-sand" : isPast ? "text-emerald-600" : ""}`} />
                  <span className="truncate text-[11px]">{st.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Assigned Worker Card & Project Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center p-4 rounded-xl bg-forest/5 border border-forest/10">
        {/* Worker Summary */}
        <div className="flex items-center gap-3.5 md:border-r border-forest/10 md:pr-4">
          <div className="relative h-14 w-14 shrink-0 rounded-xl overflow-hidden border border-sand/50 bg-forest-900 shadow-xs">
            {worker.avatar_url ? (
              <Image
                src={worker.avatar_url}
                alt={worker.full_name}
                fill
                className="object-cover"
                sizes="56px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-forest text-sand font-bold text-base">
                {worker.full_name.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>

          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="font-serif font-bold text-sm text-forest truncate">
                {worker.full_name}
              </h4>
              <CheckCircle2 className="w-3.5 h-3.5 text-sage shrink-0" />
            </div>

            <p className="text-[11px] text-charcoal-muted truncate">
              {worker.headline}
            </p>

            <div className="flex items-center gap-2 text-[10px] font-mono text-forest/70 pt-0.5">
              <span>{worker.registry_id}</span>
              {worker.kaamscore && (
                <>
                  <span>•</span>
                  <span className="font-bold text-forest">{worker.kaamscore} pts</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Project Details */}
        <div className="md:col-span-2 space-y-2">
          <h5 className="font-serif font-bold text-sm sm:text-base text-forest">
            {booking.service_title}
          </h5>

          {booking.description && (
            <p className="text-xs text-charcoal-muted leading-relaxed line-clamp-2">
              {booking.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 text-xs text-charcoal-muted pt-1">
            <span className="inline-flex items-center gap-1 bg-card px-2 py-0.5 rounded border border-forest/10 font-mono text-[11px]">
              <Calendar className="w-3 h-3 text-forest" />
              {new Date(booking.scheduled_start).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>

            <span className="inline-flex items-center gap-1 bg-card px-2 py-0.5 rounded border border-forest/10 text-[11px]">
              <MapPin className="w-3 h-3 text-forest" />
              {booking.location_address}, {booking.location_city}
            </span>

            {booking.estimated_cost && (
              <span className="inline-flex items-center gap-1 bg-sand/20 px-2 py-0.5 rounded border border-sand/30 font-bold text-forest text-[11px]">
                <IndianRupee className="w-3 h-3" />
                ₹{booking.estimated_cost.toLocaleString("en-IN")}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 4. Action Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="border-forest/20 text-forest hover:bg-forest/5 text-xs h-8"
        >
          <Link href={`/profile/${workerSlug}`}>
            <span>View Worker Credential</span>
            <ExternalLink className="w-3 h-3 ml-1.5" />
          </Link>
        </Button>

        <div className="flex flex-wrap items-center gap-2">
          {/* Cancel button if pending or accepted */}
          {(booking.status === "requested" || booking.status === "confirmed") && (
            <>
              {showCancelPrompt ? (
                <div className="flex items-center gap-2 animate-in fade-in">
                  <input
                    type="text"
                    placeholder="Cancellation reason..."
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="h-8 text-xs px-2.5 rounded-lg border border-forest/20 bg-card"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isUpdating}
                    onClick={() => handleAction("cancelled")}
                    className="text-xs h-8 border-terracotta text-terracotta hover:bg-terracotta/10"
                  >
                    Confirm Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowCancelPrompt(false)}
                    className="text-xs h-8 text-charcoal-muted"
                  >
                    Keep
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCancelPrompt(true)}
                  className="text-xs h-8 text-terracotta hover:bg-terracotta/10"
                >
                  Cancel Booking
                </Button>
              )}
            </>
          )}

          {/* Mark in progress if confirmed */}
          {booking.status === "confirmed" && !showCancelPrompt && (
            <Button
              size="sm"
              disabled={isUpdating}
              onClick={() => handleAction("in_progress")}
              className="bg-forest hover:bg-forest-600 text-ivory text-xs h-8 px-4 font-semibold"
            >
              <Wrench className="w-3.5 h-3.5 mr-1.5 text-sand" />
              Technician Arrived (Start Job)
            </Button>
          )}

          {/* Mark completed if in progress */}
          {booking.status === "in_progress" && (
            <Button
              size="sm"
              disabled={isUpdating}
              onClick={() => handleAction("completed")}
              className="bg-forest hover:bg-forest-600 text-ivory text-xs h-8 px-4 font-semibold"
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-300" />
              Confirm Job Completed
            </Button>
          )}

          {/* Leave review if completed */}
          {booking.status === "completed" && (
            <Button
              size="sm"
              onClick={() => onOpenReviewModal(booking)}
              className="bg-forest hover:bg-forest-600 text-ivory text-xs h-8 px-4 font-semibold"
            >
              <Star className="w-3.5 h-3.5 mr-1.5 text-sand fill-sand" />
              Leave Verified Review
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
