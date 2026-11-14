import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Review, Database } from "@/types/database.types";
import { isConfigured } from "@/lib/env";

export type InsertReview = Database["public"]["Tables"]["reviews"]["Insert"];

/**
 * Checks whether a customer is legally eligible to submit a review for a worker.
 * Rule: Customer must have at least one booking with `status = 'completed'` with the worker
 * that has not already been reviewed!
 */
export async function checkReviewEligibility(
  customerId: string,
  workerProfileId: string
): Promise<{ eligible: boolean; eligibleBookingId: string | null; message: string }> {
  if (!isConfigured.supabase) {
    return {
      eligible: true,
      eligibleBookingId: "66666666-6666-6666-6666-666666660001",
      message: "Eligible: Verified completed service contract found.",
    };
  }

  const supabase = await createServerSupabaseClient();

  // Find completed bookings for this customer & worker
  const { data: completedBookings, error: bookingErr } = await supabase
    .from("bookings")
    .select("id")
    .eq("customer_id", customerId)
    .eq("worker_profile_id", workerProfileId)
    .eq("status", "completed");

  if (bookingErr || !completedBookings || completedBookings.length === 0) {
    return {
      eligible: false,
      eligibleBookingId: null,
      message: "Ineligible: You must have a completed booking with this worker to submit a review.",
    };
  }

  // Check if any of these completed bookings already have a review
  const bookingIds = completedBookings.map((b) => b.id);
  const { data: existingReviews } = await supabase
    .from("reviews")
    .select("booking_id")
    .in("booking_id", bookingIds);

  const reviewedBookingIds = new Set((existingReviews || []).map((r) => r.booking_id));
  const unreviewedBooking = completedBookings.find((b) => !reviewedBookingIds.has(b.id));

  if (!unreviewedBooking) {
    return {
      eligible: false,
      eligibleBookingId: null,
      message: "Ineligible: All completed bookings for this worker have already been reviewed.",
    };
  }

  return {
    eligible: true,
    eligibleBookingId: unreviewedBooking.id,
    message: "Eligible to review.",
  };
}

/**
 * Create a review for a worker profile.
 * Policy enforces that the booking belongs to the customer and is completed.
 */
export async function createReview(input: InsertReview): Promise<Review> {
  const supabase = await createServerSupabaseClient();

  // Pre-validate eligibility before insert
  const eligibility = await checkReviewEligibility(input.customer_id, input.worker_profile_id);
  if (!eligibility.eligible && isConfigured.supabase) {
    throw new Error(eligibility.message);
  }

  const { data, error } = await supabase
    .from("reviews")
    .insert(input)
    .select("*")
    .single();

  if (error) {
    console.error("Error creating review:", error);
    throw error;
  }

  return data;
}

/**
 * Fetch public reviews for a worker profile.
 */
export async function getWorkerReviews(workerProfileId: string): Promise<Review[]> {
  if (!isConfigured.supabase) {
    return [
      {
        id: "rev-demo-1",
        booking_id: "66666666-6666-6666-6666-666666660001",
        customer_id: "44444444-4444-4444-4444-444444440001",
        worker_profile_id: workerProfileId,
        rating: 5,
        quality_rating: 5,
        punctuality_rating: 5,
        comment:
          "Rameshwarji completed the inverter synchronization in record time. Zero leakage current detected by DISCOM engineers. Highest level of professionalism.",
        contractor_signed: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("reviews")
    .select(`
      *,
      customer:profiles(full_name, avatar_url)
    `)
    .eq("worker_profile_id", workerProfileId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching worker reviews:", error);
    throw error;
  }

  return (data as unknown as Review[]) || [];
}
