import { NextRequest } from "next/server";
import { getCustomerBookings } from "@/lib/supabase/db/bookings";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isConfigured } from "@/lib/env";
import { handleApiError, createSuccessResponse } from "@/lib/error/handler";

export async function GET(request: NextRequest) {
  try {
    let customerId = "22222222-2222-2222-2222-222222220001"; // Default demo customer

    if (isConfigured.supabase) {
      const supabase = await createServerSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        customerId = user.id;
      }
    }

    const bookings = await getCustomerBookings(customerId);

    return createSuccessResponse(bookings, {
      customerId,
      total: bookings.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
