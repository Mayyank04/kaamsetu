/**
 * KAAMSETU — Booking Repository
 * Encapsulates booking lifecycle queries and strictly enforces zero commission.
 */

import {
  createBooking as dbCreateBooking,
  getCustomerBookings,
  getWorkerBookings,
  updateBookingStatus as dbUpdateBookingStatus,
  InsertBooking,
} from "@/lib/supabase/db/bookings";
import { Booking, BookingStatus } from "@/types/database.types";
import { NotFoundError, ValidationError } from "@/lib/errors/app-error";

export class BookingRepository {
  /**
   * Creates a service booking, strictly enforcing platform_commission_amount = 0.00
   */
  public static async create(input: InsertBooking): Promise<Booking> {
    // Permanent Constitutional Invariant check
    const rawInput = input as Record<string, unknown>;
    if (
      "platform_commission_amount" in rawInput &&
      rawInput.platform_commission_amount !== undefined &&
      Number(rawInput.platform_commission_amount) !== 0
    ) {
      throw new ValidationError(
        "Constitutional Invariant Violation: platform_commission_amount must be exactly 0.00"
      );
    }

    return dbCreateBooking(input);
  }

  /**
   * Retrieves bookings for a customer
   */
  public static async findByCustomer(customerId: string): Promise<Booking[]> {
    return getCustomerBookings(customerId);
  }

  /**
   * Retrieves bookings for a worker
   */
  public static async findByWorker(workerProfileId: string): Promise<Booking[]> {
    return getWorkerBookings(workerProfileId);
  }

  /**
   * Updates booking status
   */
  public static async updateStatus(
    id: string,
    status: BookingStatus,
    cancellationReason?: string
  ): Promise<Booking> {
    const updated = await dbUpdateBookingStatus(id, status, cancellationReason);
    if (!updated) {
      throw new NotFoundError("Booking", id);
    }
    return updated;
  }
}
