import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Booking, BookingStatus, Database } from "@/types/database.types";
import { isConfigured } from "@/lib/env";

export type InsertBooking = Database["public"]["Tables"]["bookings"]["Insert"];

/**
 * Create a new service booking.
 * Enforced by RLS: caller must be authenticated customer.
 */
export async function createBooking(input: InsertBooking): Promise<Booking> {
  const reference = input.booking_reference || `BK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  if (!isConfigured.supabase) {
    return {
      id: "booking-demo-01",
      booking_reference: reference,
      customer_id: input.customer_id,
      worker_profile_id: input.worker_profile_id,
      service_title: input.service_title,
      description: input.description || null,
      location_address: input.location_address,
      location_city: input.location_city,
      scheduled_start: input.scheduled_start,
      scheduled_end: input.scheduled_end || null,
      estimated_cost: input.estimated_cost || 5000,
      final_cost: null,
      status: "requested",
      cancellation_reason: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("bookings")
    .insert({
      ...input,
      booking_reference: reference,
    })
    .select("*")
    .single();

  if (error) {
    console.error("Error creating booking:", error);
    throw error;
  }

  return data;
}

/**
 * Fetch bookings created by a specific customer.
 */
export async function getCustomerBookings(customerId: string): Promise<Booking[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("bookings")
    .select(`
      *,
      worker_profile:worker_profiles(id, headline, registry_id, city, user_id)
    `)
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching customer bookings:", error);
    throw error;
  }

  return (data as unknown as Booking[]) || [];
}

/**
 * Fetch bookings assigned to a worker profile.
 */
export async function getWorkerBookings(workerProfileId: string): Promise<Booking[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("worker_profile_id", workerProfileId)
    .order("scheduled_start", { ascending: true });

  if (error) {
    console.error("Error fetching worker bookings:", error);
    throw error;
  }

  return data || [];
}

/**
 * Update the status of a booking.
 */
export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus,
  cancellationReason?: string
): Promise<Booking> {
  if (!isConfigured.supabase) {
    return {
      id: bookingId,
      booking_reference: "BK-2026-4821",
      customer_id: "22222222-2222-2222-2222-222222220001",
      worker_profile_id: "w-pro-01",
      service_title: "Solar Array Annual Inverter Inspection & Earthing",
      description: null,
      location_address: "Plot C-14, Sitapura Industrial Area, Phase II",
      location_city: "Jaipur",
      scheduled_start: "2026-11-18T10:00:00Z",
      scheduled_end: null,
      estimated_cost: 3500,
      final_cost: status === "completed" ? 3500 : null,
      status,
      cancellation_reason: cancellationReason || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("bookings")
    .update({
      status,
      cancellation_reason: cancellationReason || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingId)
    .select("*")
    .single();

  if (error) {
    console.error("Error updating booking status:", error);
    throw error;
  }

  return data;
}
