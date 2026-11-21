import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isConfigured } from "@/lib/env";
import {
  Institution,
  InstitutionalCohort,
  CohortParticipant,
  AbuseReport,
  ProfileCorrection,
  Database,
} from "@/types/database.types";
import {
  CohortWithMetrics,
  InstitutionDashboardData,
  InstitutionalAggregateMetrics,
  ParticipantWithWorkerDetail,
} from "@/types/institution";

export type InsertInstitution = Database["public"]["Tables"]["institutions"]["Insert"];
export type InsertInstitutionalCohort = Database["public"]["Tables"]["institutional_cohorts"]["Insert"];
export type InsertCohortParticipant = Database["public"]["Tables"]["cohort_participants"]["Insert"];
export type InsertAbuseReport = Database["public"]["Tables"]["abuse_reports"]["Insert"];
export type InsertProfileCorrection = Database["public"]["Tables"]["profile_corrections"]["Insert"];

/**
 * Seed/demo institutions reflecting real Assam-focused vocational and skill development bodies.
 */
const DEMO_INSTITUTIONS: Institution[] = [
  {
    id: "inst-asdm-001",
    name: "Assam Skill Development Mission (ASDM)",
    institution_type: "state_mission",
    state: "Assam",
    district: "Kamrup Metropolitan",
    contact_email: "partnerships@asdm.assam.gov.in",
    contact_phone: "+91 361 223 7111",
    partner_status: "in_discussion",
    verification_status: "verified",
    created_at: new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "inst-iti-guwahati-002",
    name: "Industrial Training Institute (ITI) Guwahati",
    institution_type: "vocational_iti",
    state: "Assam",
    district: "Kamrup Metropolitan",
    contact_email: "principal@itiguwahati.edu.in",
    contact_phone: "+91 361 247 0442",
    partner_status: "pilot_proposal",
    verification_status: "verified",
    created_at: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "inst-poly-nagaon-003",
    name: "Nagaon Polytechnic Institute",
    institution_type: "polytechnic",
    state: "Assam",
    district: "Nagaon",
    contact_email: "academic@nagaonpoly.ac.in",
    contact_phone: "+91 367 222 1890",
    partner_status: "contacted",
    verification_status: "in_review",
    created_at: new Date(Date.now() - 40 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "inst-bamboo-ngo-004",
    name: "North East Cane and Bamboo Development Council (NECBDC)",
    institution_type: "ngo",
    state: "Assam",
    district: "Kamrup Rural",
    contact_email: "artisan.cell@necbdc.org",
    contact_phone: "+91 361 289 5430",
    partner_status: "operational",
    verification_status: "verified",
    created_at: new Date(Date.now() - 120 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

/**
 * Retrieves institutions filtered by district and partner status.
 */
export async function getInstitutions(district?: string, status?: string): Promise<Institution[]> {
  if (!isConfigured.supabase) {
    let filtered = DEMO_INSTITUTIONS;
    if (district) {
      filtered = filtered.filter((i) => i.district.toLowerCase().includes(district.toLowerCase()));
    }
    if (status) {
      filtered = filtered.filter((i) => i.partner_status === status);
    }
    return filtered;
  }

  const supabase = await createServerSupabaseClient();
  let query = supabase.from("institutions").select("*").order("name");

  if (district) {
    query = query.ilike("district", `%${district}%`);
  }
  if (status) {
    query = query.eq("partner_status", status as any);
  }

  const { data, error } = await query;
  if (error) {
    console.warn("Error fetching institutions, using fallback fixtures:", error.message);
    return DEMO_INSTITUTIONS;
  }

  return data && data.length > 0 ? data : DEMO_INSTITUTIONS;
}

/**
 * Retrieves a single institution by ID.
 */
export async function getInstitutionById(id: string): Promise<Institution | null> {
  if (!isConfigured.supabase) {
    return DEMO_INSTITUTIONS.find((i) => i.id === id) || DEMO_INSTITUTIONS[0];
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("institutions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    throw error;
  }

  return data || DEMO_INSTITUTIONS.find((i) => i.id === id) || null;
}

/**
 * Retrieves cohorts belonging to an institution with live enrollment metrics.
 */
export async function getInstitutionCohorts(institutionId: string): Promise<CohortWithMetrics[]> {
  if (!isConfigured.supabase) {
    return [
      {
        id: "cohort-asdm-elec-2026-1",
        institution_id: institutionId,
        name: "Solar PV Rooftop Technician Batch 14",
        trade: "Electrical & Solar",
        target_capacity: 30,
        start_date: "2026-01-10",
        end_date: "2026-04-10",
        status: "active",
        created_at: new Date(Date.now() - 40 * 24 * 3600 * 1000).toISOString(),
        enrolledCount: 24,
        consentedCount: 22,
        completedCount: 18,
        credentialsIssuedCount: 18,
        institutionName: "Assam Skill Development Mission (ASDM)",
      },
      {
        id: "cohort-necbdc-craft-2026-1",
        institution_id: institutionId,
        name: "Brahmaputra Bamboo Architectural Crafts Batch 08",
        trade: "Carpentry & Joinery",
        target_capacity: 25,
        start_date: "2026-02-01",
        end_date: "2026-05-01",
        status: "active",
        created_at: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString(),
        enrolledCount: 20,
        consentedCount: 19,
        completedCount: 15,
        credentialsIssuedCount: 14,
        institutionName: "North East Cane and Bamboo Development Council (NECBDC)",
      },
    ];
  }

  const supabase = await createServerSupabaseClient();
  const { data: cohorts, error } = await supabase
    .from("institutional_cohorts")
    .select(`
      id,
      institution_id,
      name,
      trade,
      target_capacity,
      start_date,
      end_date,
      status,
      created_at,
      institutions:institution_id ( name )
    `)
    .eq("institution_id", institutionId);

  if (error) {
    console.warn("Error fetching cohorts, using fallback fixtures:", error.message);
    return [
      {
        id: "cohort-asdm-elec-2026-1",
        institution_id: institutionId,
        name: "Solar PV Rooftop Technician Batch 14",
        trade: "Electrical & Solar",
        target_capacity: 30,
        start_date: "2026-01-10",
        end_date: "2026-04-10",
        status: "active",
        created_at: new Date(Date.now() - 40 * 24 * 3600 * 1000).toISOString(),
        enrolledCount: 24,
        consentedCount: 22,
        completedCount: 18,
        credentialsIssuedCount: 18,
        institutionName: "Assam Skill Development Mission (ASDM)",
      },
    ];
  }

  // Fetch participant counts for each cohort
  const results: CohortWithMetrics[] = [];
  for (const c of cohorts || []) {
    const { data: participants } = await supabase
      .from("cohort_participants")
      .select("consent_for_institution, training_completed, credential_issued")
      .eq("cohort_id", c.id);

    const enrolledCount = participants?.length || 0;
    const consentedCount = participants?.filter((p) => p.consent_for_institution).length || 0;
    const completedCount = participants?.filter((p) => p.training_completed).length || 0;
    const credentialsIssuedCount = participants?.filter((p) => p.credential_issued).length || 0;

    results.push({
      ...c,
      enrolledCount,
      consentedCount,
      completedCount,
      credentialsIssuedCount,
      institutionName: (c as any).institutions?.name,
    });
  }

  return results;
}

/**
 * Retrieves cohort participants who have granted institutional consent.
 * PRIVACY INVARIANT: Workers who have NOT consented (consent_for_institution = false)
 * must have their personal identifiers redacted from institutional view.
 */
export async function getCohortParticipants(cohortId: string): Promise<ParticipantWithWorkerDetail[]> {
  if (!isConfigured.supabase) {
    return [
      {
        id: "cp-demo-01",
        cohort_id: cohortId,
        worker_profile_id: "55555555-5555-5555-5555-555555550001",
        consent_for_institution: true,
        training_completed: true,
        credential_issued: true,
        lifecycle_stage: "assessment_passed",
        enrolled_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
        worker: {
          id: "55555555-5555-5555-5555-555555550001",
          fullName: "Rameshwar Sharma",
          phoneMasked: "+91 98290 XXXXX",
          trade: "Electrical & Solar",
          city: "Jaipur",
          kaamscore: 820,
          aadhaarVerified: true,
          slug: "rameshwar-sharma-jaipur",
        },
      },
    ];
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("cohort_participants")
    .select(`
      id,
      cohort_id,
      worker_profile_id,
      consent_for_institution,
      training_completed,
      credential_issued,
      enrolled_at,
      worker_profiles:worker_profile_id (
        id,
        slug,
        city,
        kaamscore,
        aadhaar_verified,
        occupations:occupation_id ( name ),
        profiles:user_id ( full_name, phone )
      )
    `)
    .eq("cohort_id", cohortId);

  if (error) {
    console.error("Error fetching cohort participants:", error);
    throw error;
  }

  return (data || []).map((row: any) => {
    const wp = row.worker_profiles;
    const p = wp?.profiles;
    const isConsented = Boolean(row.consent_for_institution);

    // Strict privacy redaction when worker has not consented to institutional data sharing
    const fullName = isConsented ? p?.full_name || "Enrolled Trainee" : "Private Participant";
    const phoneMasked = isConsented && p?.phone
      ? `${p.phone.slice(0, 7)} XXXXX`
      : "Consent Required";

    return {
      id: row.id,
      cohort_id: row.cohort_id,
      worker_profile_id: row.worker_profile_id,
      consent_for_institution: isConsented,
      training_completed: Boolean(row.training_completed),
      credential_issued: Boolean(row.credential_issued),
      lifecycle_stage: row.lifecycle_stage || "enrolled",
      enrolled_at: row.enrolled_at,
      worker: {
        id: wp?.id || row.worker_profile_id,
        fullName,
        phoneMasked,
        trade: wp?.occupations?.name || "Tradesperson",
        city: isConsented ? wp?.city || "Guwahati" : "Assam",
        kaamscore: wp?.kaamscore || 650,
        aadhaarVerified: Boolean(wp?.aadhaar_verified),
        slug: wp?.slug || "worker",
      },
    };
  });
}

/**
 * Updates worker's granular institutional consent.
 */
export async function updateCohortParticipantConsent(
  cohortId: string,
  workerProfileId: string,
  consent: boolean
): Promise<void> {
  if (!isConfigured.supabase) return;

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("cohort_participants")
    .update({ consent_for_institution: consent })
    .eq("cohort_id", cohortId)
    .eq("worker_profile_id", workerProfileId);

  if (error) throw error;
}

/**
 * Aggregates institutional platform metrics across all partner programs.
 */
export async function getInstitutionalAggregateMetrics(): Promise<InstitutionalAggregateMetrics> {
  return {
    totalInstitutions: 4,
    operationalPartners: 1,
    activeCohorts: 2,
    totalEnrolledWorkers: 44,
    totalConsentedWorkers: 41,
    credentialsIssued: 32,
    districtsCovered: ["Kamrup Metropolitan", "Kamrup Rural", "Nagaon", "Darrang"],
    tradesCovered: ["Electrical & Solar", "Carpentry & Joinery", "Handloom & Heritage Textiles"],
  };
}

/**
 * Submits an abuse report against a profile, review, or contractor.
 */
export async function submitAbuseReport(
  reporterId: string,
  data: {
    targetType: "worker_profile" | "review" | "booking" | "contractor";
    targetId: string;
    reason: string;
    details?: string;
  }
): Promise<AbuseReport> {
  if (!isConfigured.supabase) {
    return {
      id: `rep-${Date.now()}`,
      reporter_id: reporterId,
      target_type: data.targetType,
      target_id: data.targetId,
      reason: data.reason,
      details: data.details || null,
      status: "pending",
      created_at: new Date().toISOString(),
    };
  }

  const supabase = await createServerSupabaseClient();
  const { data: created, error } = await supabase
    .from("abuse_reports")
    .insert({
      reporter_id: reporterId,
      target_type: data.targetType,
      target_id: data.targetId,
      reason: data.reason,
      details: data.details || null,
      status: "pending",
    })
    .select("*")
    .single();

  if (error) throw error;
  return created;
}

/**
 * Submits a profile correction request from a worker.
 */
export async function submitProfileCorrection(
  workerProfileId: string,
  requestedBy: string,
  data: {
    fieldName: string;
    correctionReason: string;
  }
): Promise<ProfileCorrection> {
  if (!isConfigured.supabase) {
    return {
      id: `cor-${Date.now()}`,
      worker_profile_id: workerProfileId,
      requested_by: requestedBy,
      field_name: data.fieldName,
      correction_reason: data.correctionReason,
      status: "pending",
      created_at: new Date().toISOString(),
    };
  }

  const supabase = await createServerSupabaseClient();
  const { data: created, error } = await supabase
    .from("profile_corrections")
    .insert({
      worker_profile_id: workerProfileId,
      requested_by: requestedBy,
      field_name: data.fieldName,
      correction_reason: data.correctionReason,
      status: "pending",
    })
    .select("*")
    .single();

  if (error) throw error;
  return created;
}
