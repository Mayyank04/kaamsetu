"use client";

import * as React from "react";
import { WorkerDashboardData } from "@/types/dashboard";
import { ProfileHero } from "@/components/profile/profile-hero";
import { ProfileSkills } from "@/components/profile/profile-skills";
import { ProfileServices } from "@/components/profile/profile-services";
import { ProfilePortfolio } from "@/components/profile/profile-portfolio";
import { WorkHistoryView } from "@/components/dashboard/work-history-view";
import { ReviewsView } from "@/components/dashboard/reviews-view";
import { BookingRequestDialog } from "@/components/profile/booking-request-dialog";
import { QRDialog } from "@/components/profile/qr-dialog";

interface PublicProfileContainerProps {
  data: WorkerDashboardData;
}

export function PublicProfileContainer({ data }: PublicProfileContainerProps) {
  const [isBookingOpen, setIsBookingOpen] = React.useState(false);
  const [isQROpen, setIsQROpen] = React.useState(false);
  const [selectedService, setSelectedService] = React.useState<string | undefined>();

  const handleOpenBooking = (serviceTitle?: string) => {
    setSelectedService(serviceTitle);
    setIsBookingOpen(true);
  };

  const profileUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `https://kaamsetu.in/profile/${data.profile.slug}`;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in duration-500">
      {/* 1. Hero Identity & Trust Card */}
      <ProfileHero
        profile={data.profile}
        onRequestBooking={() => handleOpenBooking()}
        onOpenQR={() => setIsQROpen(true)}
      />

      {/* 2. Skills & Credentials (Distinguishing Verified vs Self-Declared) */}
      <ProfileSkills skills={data.skills} />

      {/* 3. Services Offered & Rates */}
      <ProfileServices
        dailyRateMin={data.profile.dailyRateMin}
        dailyRateMax={data.profile.dailyRateMax}
        onRequestBooking={handleOpenBooking}
        occupation={data.profile.occupation}
        category={data.profile.category}
        skills={data.skills.map((s) => s.name)}
        productCatalog={data.profile.productCatalog}
      />

      {/* 4. Portfolio Projects Gallery */}
      <ProfilePortfolio portfolio={data.portfolio} />

      {/* 5. Immutable Work History */}
      <WorkHistoryView workRecords={data.workRecords} />

      {/* 6. Customer & Contractor Reviews */}
      <ReviewsView reviews={data.reviews} />

      {/* Booking Dialog Modal */}
      <BookingRequestDialog
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        workerProfileId={data.profile.id}
        workerName={data.profile.fullName}
        prefilledService={selectedService}
      />

      {/* QR Verification Modal */}
      <QRDialog
        isOpen={isQROpen}
        onClose={() => setIsQROpen(false)}
        registryId={data.profile.registryId}
        fullName={data.profile.fullName}
        profileUrl={profileUrl}
      />
    </div>
  );
}
