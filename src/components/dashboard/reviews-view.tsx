"use client";

import * as React from "react";
import {
  Star,
  CheckCircle2,
  Quote,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DashboardReview } from "@/types/dashboard";

interface ReviewsViewProps {
  reviews: DashboardReview[];
}

export function ReviewsView({ reviews }: ReviewsViewProps) {
  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length
        ).toFixed(1)
      : "5.0";

  return (
    <div className="rounded-2xl bg-card border border-forest/15 shadow-sovereign-sm p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-forest/10">
        <div>
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-forest">
              Client & Contractor Reviews
            </h2>
          </div>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Verified post-completion feedback anchored to finished bookings.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-sand/20 px-3.5 py-1.5 rounded-xl border border-sand/40 self-start sm:self-auto">
          <div className="flex items-center text-amber-500">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="font-mono font-bold text-xs text-forest">
            {averageRating} / 5.0
          </span>
          <span className="text-[11px] text-charcoal-muted font-mono">
            ({reviews.length} reviews)
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="p-5 rounded-xl border border-forest/15 bg-card hover:border-forest/30 shadow-sovereign-xs transition-all space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-forest/10 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs sm:text-sm text-forest">
                  {rev.customerName}
                </span>
                {rev.contractorSigned && (
                  <Badge className="bg-forest/10 text-forest border-forest/20 text-[9px] font-mono gap-1">
                    <ShieldCheck className="w-3 h-3 text-sand-700" />
                    CONTRACTOR SEAL
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center text-amber-500">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <span className="font-mono text-xs font-bold text-forest">
                  {rev.rating}.0
                </span>
              </div>
            </div>

            <p className="text-xs text-charcoal leading-relaxed italic flex items-start gap-2">
              <Quote className="w-3.5 h-3.5 text-sand-600 shrink-0 mt-0.5" />
              <span>{rev.comment}</span>
            </p>

            <div className="flex flex-wrap items-center gap-4 text-[11px] text-charcoal-muted font-mono pt-1">
              {rev.qualityRating && (
                <span>Technical Quality: {rev.qualityRating}/5</span>
              )}
              {rev.punctualityRating && (
                <span>Punctuality: {rev.punctualityRating}/5</span>
              )}
              <span>
                {new Date(rev.createdAt).toLocaleDateString("en-IN", {
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
