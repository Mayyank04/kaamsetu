"use client";

import * as React from "react";
import { Star, X, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface CustomerReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  workerProfileId: string;
  workerName: string;
  onReviewSubmitted: () => void;
}

export function CustomerReviewDialog({
  isOpen,
  onClose,
  bookingId,
  workerProfileId,
  workerName,
  onReviewSubmitted,
}: CustomerReviewDialogProps) {
  const [rating, setRating] = React.useState(5);
  const [qualityRating, setQualityRating] = React.useState(5);
  const [punctualityRating, setPunctualityRating] = React.useState(5);
  const [comment, setComment] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          booking_id: bookingId,
          worker_profile_id: workerProfileId,
          rating,
          quality_rating: qualityRating,
          punctuality_rating: punctualityRating,
          comment: comment.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to submit review");
      }

      setSuccess(true);
      setTimeout(() => {
        onReviewSubmitted();
        onClose();
      }, 1800);
    } catch (err: any) {
      setError(err.message || "Error submitting review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-forest-950/75 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card w-full max-w-lg rounded-md border border-forest/20 shadow-sovereign-md p-4 sm:p-6 space-y-4 sm:space-y-5 animate-in zoom-in-95 duration-200 my-auto max-h-[calc(100dvh-2rem)] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-forest/10">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-forest" />
            <h3 className="font-serif text-lg font-bold text-forest">
              Leave Verified Customer Review
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-charcoal-muted hover:text-forest p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="text-center py-6 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h4 className="font-serif text-lg font-bold text-forest">
              Review Anchored to Ledger!
            </h4>
            <p className="text-xs text-charcoal-muted">
              Thank you for verifying {workerName}&apos;s craftsmanship. Your review has been added to their public credential record.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-terracotta/10 border border-terracotta/20 text-xs text-terracotta flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="p-3 rounded-xl bg-forest/5 border border-forest/10 text-xs text-forest">
              Reviewing completed booking with <strong>{workerName}</strong>. Your feedback strengthens their national KAAMSCORE™.
            </div>

            {/* Overall Rating */}
            <div className="space-y-1.5 text-center py-2">
              <label className="text-xs font-bold text-forest uppercase tracking-wider block">
                Overall Workmanship Rating
              </label>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-forest/20"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="font-mono text-xs font-bold text-forest">
                {rating} out of 5 Stars
              </span>
            </div>

            {/* Sub-ratings */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-charcoal block">
                  Technical Quality (1-5)
                </label>
                <div className="flex items-center gap-1 text-amber-500">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setQualityRating(s)}
                      className="p-0.5"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          s <= qualityRating
                            ? "fill-amber-400 text-amber-400"
                            : "text-forest/20"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-charcoal block">
                  Punctuality & Safety (1-5)
                </label>
                <div className="flex items-center gap-1 text-amber-500">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setPunctualityRating(s)}
                      className="p-0.5"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          s <= punctualityRating
                            ? "fill-amber-400 text-amber-400"
                            : "text-forest/20"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Comment */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-forest block">
                Detailed Feedback & Project Notes *
              </label>
              <Textarea
                placeholder="Describe how the technician handled the work, equipment safety, cleanliness, and communication..."
                value={comment}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComment(e.target.value)}
                required
                className="text-xs min-h-[80px] border-forest/20 resize-none"
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
                disabled={isSubmitting || !comment.trim()}
                className="bg-forest hover:bg-forest-600 text-ivory text-xs h-9 px-5 font-semibold"
              >
                {isSubmitting ? "Publishing Review..." : "Submit Verified Review"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
