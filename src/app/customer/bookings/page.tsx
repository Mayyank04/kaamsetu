import type { Metadata } from "next";
import { getCustomerBookings } from "@/lib/supabase/db/bookings";
import { CustomerBookingsContainer } from "@/components/customer/customer-bookings-container";

export const metadata: Metadata = {
  title: "Customer Service Bookings | KAAMSETU Sovereign Trust",
  description:
    "Track active technical projects, review milestone transitions, and leave verified ratings for hired Indian skilled craftspeople.",
};

export default async function CustomerBookingsPage() {
  const customerId = "22222222-2222-2222-2222-222222220001";
  const initialBookings = await getCustomerBookings(customerId);

  return (
    <div className="min-h-screen bg-gradient-to-b from-ivory-50 via-background to-ivory-100/40">
      <CustomerBookingsContainer initialBookings={initialBookings} />
    </div>
  );
}
