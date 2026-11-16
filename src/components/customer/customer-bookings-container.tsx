"use client";

import * as React from "react";
import Link from "next/link";
import {
  BookingCard,
  CustomerBookingItem,
} from "@/components/customer/booking-card";
import { CustomerReviewDialog } from "@/components/customer/customer-review-dialog";
import {
  Briefcase,
  Search,
  CheckCircle2,
  Clock,
  Award,
  Filter,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface CustomerBookingsContainerProps {
  initialBookings: CustomerBookingItem[];
}

export function CustomerBookingsContainer({
  initialBookings,
}: CustomerBookingsContainerProps) {
  const [bookings, setBookings] =
    React.useState<CustomerBookingItem[]>(initialBookings);
  const [filter, setFilter] = React.useState<
    "all" | "active" | "completed" | "cancelled"
  >("all");
  const [reviewBooking, setReviewBooking] =
    React.useState<CustomerBookingItem | null>(null);

  // Status transition handler
  const handleTransitionStatus = async (
    bookingId: string,
    newStatus: "requested" | "confirmed" | "in_progress" | "completed" | "cancelled",
    reason?: string
  ) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          cancellation_reason: reason,
        }),
      });

      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
        );
      }
    } catch (err) {
      console.error("Failed to transition booking status:", err);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filter === "all") return true;
    if (filter === "active")
      return (
        b.status === "requested" ||
        b.status === "confirmed" ||
        b.status === "in_progress"
      );
    if (filter === "completed") return b.status === "completed";
    if (filter === "cancelled") return b.status === "cancelled";
    return true;
  });

  const activeCount = bookings.filter(
    (b) =>
      b.status === "requested" ||
      b.status === "confirmed" ||
      b.status === "in_progress"
  ).length;
  const completedCount = bookings.filter((b) => b.status === "completed").length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in duration-500">
      {/* 1. Header Banner */}
      <div className="rounded-md bg-card border border-forest/15 shadow-sovereign-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-forest/10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-forest/5 px-3 py-1 border border-forest/15 text-xs font-mono font-medium text-forest mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-sand" />
              <span>CUSTOMER SOVEREIGN TRUST PORTAL</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-forest tracking-tight">
              My Service Bookings & Projects
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-muted mt-1">
              Track project milestones, verify technical completion, and leave cryptographically signed reviews.
            </p>
          </div>

          <Button
            asChild
            className="bg-forest hover:bg-forest-600 text-ivory h-10 px-5 font-semibold text-xs shadow-sovereign-xs self-start sm:self-auto"
          >
            <Link href="/explore">
              <Search className="w-3.5 h-3.5 mr-2 text-sand" />
              Find More Craftsmen
            </Link>
          </Button>
        </div>

        {/* Metric Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-1">
          <div className="p-4 rounded-xl bg-forest/5 border border-forest/10 space-y-1">
            <span className="text-[10px] font-mono uppercase text-charcoal-muted font-bold block">
              Active Projects
            </span>
            <div className="font-serif text-2xl font-black text-forest">
              {activeCount}
            </div>
            <span className="text-[11px] text-emerald-700 font-medium">
              In-Progress & Dispatched
            </span>
          </div>

          <div className="p-4 rounded-xl bg-forest/5 border border-forest/10 space-y-1">
            <span className="text-[10px] font-mono uppercase text-charcoal-muted font-bold block">
              Completed Jobs
            </span>
            <div className="font-serif text-2xl font-black text-forest">
              {completedCount}
            </div>
            <span className="text-[11px] text-charcoal-muted font-medium">
              Eligible for Verified Review
            </span>
          </div>

          <div className="p-4 rounded-xl bg-forest/5 border border-forest/10 space-y-1 col-span-2 sm:col-span-1">
            <span className="text-[10px] font-mono uppercase text-charcoal-muted font-bold block">
              Total Engagements
            </span>
            <div className="font-serif text-2xl font-black text-forest">
              {bookings.length}
            </div>
            <span className="text-[11px] text-forest/80 font-medium">
              Protected by Sovereign RLS
            </span>
          </div>
        </div>
      </div>

      {/* 2. Filter Pills */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-forest/15">
        <div className="flex items-center gap-1.5 bg-forest/5 p-1 rounded-xl border border-forest/10 text-xs">
          {(
            [
              { id: "all", label: `All (${bookings.length})` },
              { id: "active", label: `Active (${activeCount})` },
              { id: "completed", label: `Completed (${completedCount})` },
              {
                id: "cancelled",
                label: `Cancelled (${
                  bookings.filter((b) => b.status === "cancelled").length
                })`,
              },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-all text-xs ${
                filter === tab.id
                  ? "bg-forest text-ivory shadow-xs font-bold"
                  : "text-charcoal-muted hover:text-forest"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-charcoal-muted font-mono">
          Showing {filteredBookings.length} bookings
        </span>
      </div>

      {/* 3. Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-16 rounded-md bg-card border border-forest/15 space-y-4">
          <Briefcase className="w-12 h-12 text-forest/30 mx-auto" />
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-bold text-forest">
              No Bookings Found in This View
            </h3>
            <p className="text-xs text-charcoal-muted max-w-sm mx-auto">
              Ready to hire verified Indian master craftsmen? Explore certified professionals across electrical, solar, handloom, and engineering.
            </p>
          </div>
          <Button asChild className="bg-forest text-ivory text-xs h-9 px-5">
            <Link href="/explore">
              Explore Available Professionals
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onTransitionStatus={handleTransitionStatus}
              onOpenReviewModal={(b) => setReviewBooking(b)}
            />
          ))}
        </div>
      )}

      {/* Review Dialog Modal */}
      {reviewBooking && (
        <CustomerReviewDialog
          isOpen={Boolean(reviewBooking)}
          onClose={() => setReviewBooking(null)}
          bookingId={reviewBooking.id}
          workerProfileId={reviewBooking.worker_profile_id}
          workerName={
            reviewBooking.worker_profile?.full_name || "Assigned Professional"
          }
          onReviewSubmitted={() => {
            // refresh
          }}
        />
      )}
    </div>
  );
}
