import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton loader matching Worker Profile Card geometry on /explore
 */
export function WorkerCardSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-md border border-forest/10 bg-card p-6 shadow-sovereign-sm space-y-5"
    >
      <span className="sr-only">Loading worker profile...</span>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-3/4 rounded-xs" />
          <Skeleton className="h-4 w-1/2 rounded-xs" />
          <Skeleton className="h-3 w-1/3 rounded-xs" />
        </div>
        <Skeleton className="h-14 w-14 rounded-sm shrink-0" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-5 w-20 rounded-xs" />
        <Skeleton className="h-5 w-24 rounded-xs" />
      </div>
      <div className="pt-2 border-t border-forest/5 flex items-center justify-between">
        <Skeleton className="h-4 w-28 rounded-xs" />
        <Skeleton className="h-9 w-24 rounded-sm" />
      </div>
    </div>
  );
}

/**
 * Grid of worker card skeletons for /explore loading state
 */
export function ExploreGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <span className="sr-only">Loading worker directory...</span>
      {Array.from({ length: count }).map((_, i) => (
        <WorkerCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton loader for Worker Profile Hero on /worker/[slug]
 */
export function ProfileHeroSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-md border border-forest/15 bg-card p-6 sm:p-8 shadow-sovereign-md space-y-6"
    >
      <span className="sr-only">Loading worker profile hero...</span>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <Skeleton className="h-28 w-28 rounded-md shrink-0" />
        <div className="space-y-3 flex-1 w-full">
          <Skeleton className="h-8 w-1/2 rounded-xs" />
          <Skeleton className="h-5 w-1/3 rounded-xs" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-24 rounded-xs" />
            <Skeleton className="h-6 w-32 rounded-xs" />
          </div>
        </div>
        <Skeleton className="h-12 w-36 rounded-sm shrink-0" />
      </div>
    </div>
  );
}

/**
 * Skeleton loader for Dashboard Metrics on /dashboard
 */
export function DashboardMetricsSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      <span className="sr-only">Loading dashboard metrics...</span>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-5 rounded-md border border-forest/10 bg-card space-y-3 shadow-sovereign-sm">
          <Skeleton className="h-4 w-24 rounded-xs" />
          <Skeleton className="h-8 w-16 rounded-xs" />
          <Skeleton className="h-3 w-32 rounded-xs" />
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton loader for Bookings on /bookings
 */
export function BookingCardSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-md border border-forest/10 bg-card p-6 space-y-4 shadow-sovereign-sm"
    >
      <span className="sr-only">Loading booking details...</span>
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32 rounded-xs" />
        <Skeleton className="h-6 w-20 rounded-xs" />
      </div>
      <Skeleton className="h-4 w-48 rounded-xs" />
      <div className="flex items-center justify-between pt-3 border-t border-forest/5">
        <Skeleton className="h-4 w-24 rounded-xs" />
        <Skeleton className="h-8 w-28 rounded-sm" />
      </div>
    </div>
  );
}

/**
 * Skeleton loader for Contractor Rosters
 */
export function ContractorRosterSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-md border border-forest/10 bg-card p-6 space-y-4 shadow-sovereign-sm"
    >
      <span className="sr-only">Loading contractor roster...</span>
      <Skeleton className="h-6 w-48 rounded-xs" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-xs border border-forest/5 bg-forest-900/5">
            <div className="space-y-1">
              <Skeleton className="h-4 w-36 rounded-xs" />
              <Skeleton className="h-3 w-24 rounded-xs" />
            </div>
            <Skeleton className="h-7 w-20 rounded-xs" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton loader for Institutional Cohorts
 */
export function InstitutionalCohortSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-md border border-forest/10 bg-card p-6 space-y-4 shadow-sovereign-sm"
    >
      <span className="sr-only">Loading institutional cohorts...</span>
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-52 rounded-xs" />
        <Skeleton className="h-8 w-28 rounded-sm" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-12 rounded-xs bg-forest-900/5 flex items-center px-4 justify-between">
            <Skeleton className="h-4 w-32 rounded-xs" />
            <Skeleton className="h-4 w-16 rounded-xs" />
            <Skeleton className="h-4 w-24 rounded-xs" />
          </div>
        ))}
      </div>
    </div>
  );
}
