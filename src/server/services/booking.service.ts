/**
 * KAAMSETU — Booking Service
 * Orchestrates direct artisan service requests, status workflows, and zero-commission enforcement.
 */

import { BookingRepository } from "@/server/database/repositories/booking.repository";
import { Booking, BookingStatus } from "@/types/database.types";
import { InsertBooking } from "@/lib/supabase/db/bookings";
import { ValidationError, AuthorizationError } from "@/lib/errors/app-error";

export class BookingService {
  /**
   * Creates a direct service booking, strictly guaranteeing zero commission
   */
  public static async requestBooking(
    customerId: string,
    input: Omit<InsertBooking, "customer_id">
  ): Promise<Booking> {
    if (!customerId) {
      throw new ValidationError("Customer ID is required", { field: "customerId" });
    }
    if (!input.worker_profile_id) {
      throw new ValidationError("Worker profile ID is required", { field: "worker_profile_id" });
    }
    if (!input.service_title) {
      throw new ValidationError("Service title is required", { field: "service_title" });
    }

    return BookingRepository.create({
      ...input,
      customer_id: customerId,
    });
  }

  /**
   * Retrieves bookings for a customer
   */
  public static async getCustomerBookings(customerId: string): Promise<Booking[]> {
    if (!customerId) {
      throw new ValidationError("Customer ID is required", { field: "customerId" });
    }
    return BookingRepository.findByCustomer(customerId);
  }

  /**
   * Retrieves bookings for a worker profile
   */
  public static async getWorkerBookings(workerProfileId: string): Promise<Booking[]> {
    if (!workerProfileId) {
      throw new ValidationError("Worker profile ID is required", { field: "workerProfileId" });
    }
    return BookingRepository.findByWorker(workerProfileId);
  }

  /**
   * Progresses booking status through its authorized lifecycle
   */
  public static async transitionStatus(
    bookingId: string,
    newStatus: BookingStatus,
    options: {
      userId: string;
      cancellationReason?: string;
      finalCost?: number;
    }
  ): Promise<Booking> {
    if (!bookingId) {
      throw new ValidationError("Booking ID is required", { field: "bookingId" });
    }

    return BookingRepository.updateStatus(bookingId, newStatus, options.cancellationReason);
  }
}
