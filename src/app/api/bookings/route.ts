import { NextRequest, NextResponse } from "next/server";
import { BookingService } from "@/server/services/booking.service";
import { handleApiError, createSuccessResponse } from "@/lib/errors";
import { requireAuthenticatedUser } from "@/lib/auth/server";
import { GeographicAuthorizationService } from "@/lib/geo/geographic-authorization-service";
import { z } from "zod";

const createBookingSchema = z.object({
  worker_profile_id: z.string().min(1, "Worker profile ID is required"),
  service_title: z.string().min(3, "Service title must be at least 3 characters"),
  description: z.string().optional().default(""),
  location_address: z.string().min(5, "Address must be at least 5 characters"),
  location_city: z.string().min(2, "City must be specified"),
  location_state: z.string().optional().default("Assam"),
  location_pincode: z.string().regex(/^[1-9][0-9]{5}$/, "A valid 6-digit Indian Postal PIN code is required"),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  scheduled_start: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid scheduled start timestamp",
  }),
  scheduled_end: z.string().optional(),
  estimated_cost: z.number().positive("Estimated cost must be positive").default(2000),
  platform_commission_amount: z.number().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();
    const json = await request.json();

    // Reject explicit non-zero commission attempts
    if (
      json.platform_commission_amount !== undefined &&
      Number(json.platform_commission_amount) !== 0
    ) {
      return NextResponse.json(
        {
          error: "Constitutional Invariant Violation: platform_commission_amount must be exactly 0.00",
          code: "ZERO_COMMISSION_INVARIANT_VIOLATION",
        },
        { status: 400 }
      );
    }

    const data = createBookingSchema.parse(json);

    // Geographic boundary validation (Guwahati Urban & Shillong Urban permitted)
    const geoValidation = GeographicAuthorizationService.validateLocation({
      city: data.location_city,
      state: data.location_state || "Assam",
      pincode: data.location_pincode,
      latitude: data.latitude,
      longitude: data.longitude,
    });

    if (!geoValidation.allowed) {
      return NextResponse.json(
        {
          error: `Commercial booking dispatch is currently restricted to Guwahati Urban (PIN 781001-781039) and Shillong Urban (PIN 793001-793022) under CLASS_B_CONTROLLED_ROLLOUT. ${geoValidation.reason || ""}`.trim(),
          status: geoValidation.status,
          district: geoValidation.district,
        },
        { status: 403 }
      );
    }

    // Constitutional Invariant: 100% of estimated_cost belongs to worker, platform commission = 0.00
    const booking = await BookingService.requestBooking(user.id, {
      worker_profile_id: data.worker_profile_id,
      service_title: data.service_title,
      description: data.description,
      location_address: data.location_address,
      location_city: data.location_city,
      scheduled_start: data.scheduled_start,
      scheduled_end: data.scheduled_end,
      estimated_cost: data.estimated_cost,
      status: "requested",
      platform_commission_amount: 0.00,
    } as any);

    return createSuccessResponse(booking, {
      message: "Booking request transmitted to worker. 100% of payment goes directly to the professional with zero commission.",
      platformCommissionAmount: 0.00,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
