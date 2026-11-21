import type { Metadata } from "next";
import {
  getInstitutions,
  getInstitutionCohorts,
  getInstitutionalAggregateMetrics,
} from "@/lib/supabase/db/institutions";
import { InstitutionDashboardView } from "@/components/dashboard/institution-dashboard-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Institutional Partnerships & Vocational Cohorts | KAAMSETU Digital Identity",
  description:
    "Institutional training cohorts, outcome verification, trainee progress tracking, and privacy-preserving consent management for ASDM and vocational ITIs.",
};

export default async function InstitutionDashboardPage() {
  const [institutions, aggregateMetrics] = await Promise.all([
    getInstitutions(),
    getInstitutionalAggregateMetrics(),
  ]);

  const activeInstitution = institutions[0];
  const cohorts = await getInstitutionCohorts(activeInstitution.id);

  return (
    <div className="min-h-screen bg-background">
      <InstitutionDashboardView
        institution={activeInstitution}
        cohorts={cohorts}
        aggregateMetrics={aggregateMetrics}
      />
    </div>
  );
}
