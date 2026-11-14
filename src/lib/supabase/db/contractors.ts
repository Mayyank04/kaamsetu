import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isConfigured } from "@/lib/env";
import {
  ContractorOrganization,
  ContractorWorkforce,
  ContractorProject,
  Database,
} from "@/types/database.types";
import {
  CONTRACTOR_PLANS,
  ContractorDashboardData,
  SubscriptionTier,
  WorkforceMemberWithDetails,
} from "@/types/contractor";

export type InsertContractorOrg = Database["public"]["Tables"]["contractor_organizations"]["Insert"];
export type InsertContractorWorkforce = Database["public"]["Tables"]["contractor_workforce"]["Insert"];
export type InsertContractorProject = Database["public"]["Tables"]["contractor_projects"]["Insert"];

/**
 * Retrieves the contractor organization owned by the given user.
 */
export async function getContractorOrganization(ownerId: string): Promise<ContractorOrganization | null> {
  if (!isConfigured.supabase) {
    // Deterministic mock organization for Aarav Mehta (demo persona)
    return {
      id: "org-demo-aarav-001",
      owner_id: ownerId,
      company_name: "Mehta Infra & Solar Engineering",
      gstin: "08AABCM1234F1Z5",
      business_type: "proprietorship",
      operating_city: "Guwahati",
      operating_state: "Assam",
      subscription_tier: "pro",
      subscription_status: "active",
      subscription_expires_at: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
      max_roster_workers: 25,
      created_at: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("contractor_organizations")
    .select("*")
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching contractor organization:", error);
    throw error;
  }

  return data;
}

/**
 * Creates a new contractor organization.
 */
export async function createContractorOrganization(
  data: Omit<InsertContractorOrg, "id" | "created_at" | "updated_at">
): Promise<ContractorOrganization> {
  const maxWorkers = CONTRACTOR_PLANS[data.subscription_tier || "starter"].maxRosterWorkers;

  if (!isConfigured.supabase) {
    return {
      id: `org-${Date.now()}`,
      owner_id: data.owner_id,
      company_name: data.company_name,
      gstin: data.gstin || null,
      business_type: data.business_type || "proprietorship",
      operating_city: data.operating_city,
      operating_state: data.operating_state || "Assam",
      subscription_tier: data.subscription_tier || "starter",
      subscription_status: "active",
      subscription_expires_at: null,
      max_roster_workers: maxWorkers,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  const supabase = await createServerSupabaseClient();
  const { data: created, error } = await supabase
    .from("contractor_organizations")
    .insert({
      ...data,
      max_roster_workers: maxWorkers,
    })
    .select("*")
    .single();

  if (error) {
    console.error("Error creating contractor organization:", error);
    throw error;
  }

  return created;
}

/**
 * Updates contractor organization subscription tier.
 */
export async function updateContractorSubscription(
  orgId: string,
  tier: SubscriptionTier
): Promise<ContractorOrganization> {
  const maxWorkers = CONTRACTOR_PLANS[tier].maxRosterWorkers;

  if (!isConfigured.supabase) {
    return {
      id: orgId,
      owner_id: "demo-owner",
      company_name: "Mehta Infra & Solar Engineering",
      gstin: "08AABCM1234F1Z5",
      business_type: "proprietorship",
      operating_city: "Guwahati",
      operating_state: "Assam",
      subscription_tier: tier,
      subscription_status: "active",
      subscription_expires_at: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
      max_roster_workers: maxWorkers,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  const supabase = await createServerSupabaseClient();
  const { data: updated, error } = await supabase
    .from("contractor_organizations")
    .update({
      subscription_tier: tier,
      max_roster_workers: maxWorkers,
      subscription_status: "active",
      updated_at: new Date().toISOString(),
    })
    .eq("id", orgId)
    .select("*")
    .single();

  if (error) {
    console.error("Error updating contractor subscription:", error);
    throw error;
  }

  return updated;
}

/**
 * Retrieves the full roster of workers assigned to a contractor organization.
 */
export async function getContractorWorkforce(orgId: string): Promise<WorkforceMemberWithDetails[]> {
  if (!isConfigured.supabase) {
    return [
      {
        id: "wf-demo-1",
        organization_id: orgId,
        worker_profile_id: "55555555-5555-5555-5555-555555550001",
        status: "active",
        project_role: "Lead Solar Electrician",
        daily_wage_rate: 1500,
        is_public_on_roster: true,
        invitation_id: null,
        joined_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
        added_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
        worker: {
          id: "55555555-5555-5555-5555-555555550001",
          fullName: "Rameshwar Sharma",
          phoneMasked: "+91 98290 XXXXX",
          trade: "Electrical & Solar",
          city: "Jaipur",
          kaamscore: 820,
          kaamscoreLevel: 4,
          aadhaarVerified: true,
          digilockerLinked: true,
          slug: "rameshwar-sharma-jaipur",
        },
      },
      {
        id: "wf-demo-2",
        organization_id: orgId,
        worker_profile_id: "55555555-5555-5555-5555-555555550002",
        status: "active",
        project_role: "Master Artisan",
        daily_wage_rate: 1800,
        is_public_on_roster: true,
        invitation_id: null,
        joined_at: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
        added_at: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
        worker: {
          id: "55555555-5555-5555-5555-555555550002",
          fullName: "Sunita Devi",
          phoneMasked: "+91 94500 XXXXX",
          trade: "Handloom & Heritage Textiles",
          city: "Varanasi",
          kaamscore: 790,
          kaamscoreLevel: 3,
          aadhaarVerified: true,
          digilockerLinked: true,
          slug: "sunita-devi-varanasi",
        },
      },
    ];
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("contractor_workforce")
    .select(`
      id,
      organization_id,
      worker_profile_id,
      status,
      project_role,
      daily_wage_rate,
      added_at,
      worker_profiles:worker_profile_id (
        id,
        slug,
        city,
        kaamscore,
        kaamscore_level,
        aadhaar_verified,
        digilocker_linked,
        occupations:occupation_id (
          name
        ),
        profiles:user_id (
          full_name,
          phone,
          avatar_url
        )
      )
    `)
    .eq("organization_id", orgId);

  if (error) {
    console.error("Error fetching contractor workforce:", error);
    throw error;
  }

  return (data || []).map((row: any) => {
    const wp = row.worker_profiles;
    const p = wp?.profiles;
    const phone = p?.phone || "";
    const phoneMasked = phone.length >= 10
      ? `${phone.slice(0, 7)} XXXXX`
      : "Protected";

    return {
      id: row.id,
      organization_id: row.organization_id,
      worker_profile_id: row.worker_profile_id,
      status: row.status,
      project_role: row.project_role,
      daily_wage_rate: row.daily_wage_rate,
      is_public_on_roster: row.is_public_on_roster ?? true,
      invitation_id: row.invitation_id || null,
      joined_at: row.joined_at || row.added_at,
      added_at: row.added_at,
      worker: {
        id: wp?.id || row.worker_profile_id,
        fullName: p?.full_name || "Verified Worker",
        phoneMasked,
        trade: wp?.occupations?.name || "Skilled Tradesperson",
        city: wp?.city || "Guwahati",
        kaamscore: wp?.kaamscore || 650,
        kaamscoreLevel: wp?.kaamscore_level || 2,
        aadhaarVerified: Boolean(wp?.aadhaar_verified),
        digilockerLinked: Boolean(wp?.digilocker_linked),
        avatarUrl: p?.avatar_url,
        slug: wp?.slug || "worker",
      },
    };
  });
}

/**
 * Adds a worker to the contractor workforce roster, strictly enforcing subscription limits.
 */
export async function addWorkerToWorkforce(
  orgId: string,
  workerProfileId: string,
  projectRole: string = "Crew Member",
  dailyWageRate?: number
): Promise<ContractorWorkforce> {
  if (!isConfigured.supabase) {
    return {
      id: `wf-${Date.now()}`,
      organization_id: orgId,
      worker_profile_id: workerProfileId,
      status: "active",
      project_role: projectRole,
      daily_wage_rate: dailyWageRate || 1200,
      is_public_on_roster: true,
      invitation_id: null,
      joined_at: new Date().toISOString(),
      added_at: new Date().toISOString(),
    };
  }

  const supabase = await createServerSupabaseClient();

  // 1. Check organization subscription tier and current workforce count
  const { data: org, error: orgError } = await supabase
    .from("contractor_organizations")
    .select("max_roster_workers, subscription_tier")
    .eq("id", orgId)
    .single();

  if (orgError || !org) {
    throw new Error("Contractor organization not found.");
  }

  const { count, error: countError } = await supabase
    .from("contractor_workforce")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", orgId)
    .eq("status", "active");

  if (countError) {
    throw countError;
  }

  const currentCount = count || 0;
  if (currentCount >= org.max_roster_workers) {
    throw new Error(
      `Plan roster quota reached (${org.max_roster_workers} workers on ${org.subscription_tier} plan). Please upgrade your subscription.`
    );
  }

  // 2. Add worker to workforce
  const { data: created, error: insertError } = await supabase
    .from("contractor_workforce")
    .insert({
      organization_id: orgId,
      worker_profile_id: workerProfileId,
      project_role: projectRole,
      daily_wage_rate: dailyWageRate || null,
      status: "active",
    })
    .select("*")
    .single();

  if (insertError) {
    if (insertError.code === "23505") {
      throw new Error("This worker is already registered on your organization's roster.");
    }
    throw insertError;
  }

  return created;
}

/**
 * Removes a worker from the contractor workforce roster.
 */
export async function removeWorkerFromWorkforce(
  orgId: string,
  workerProfileId: string
): Promise<void> {
  if (!isConfigured.supabase) {
    return;
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("contractor_workforce")
    .delete()
    .eq("organization_id", orgId)
    .eq("worker_profile_id", workerProfileId);

  if (error) {
    throw error;
  }
}

/**
 * Retrieves projects for an organization.
 */
export async function getContractorProjects(orgId: string): Promise<ContractorProject[]> {
  if (!isConfigured.supabase) {
    return [
      {
        id: "proj-demo-1",
        organization_id: orgId,
        title: "Guwahati Smart City Solar Microgrid",
        client_name: "Assam Power Distribution Company Ltd (APDCL)",
        location: "Paltan Bazaar, Guwahati",
        status: "in_progress",
        budget: 450000,
        start_date: "2026-01-15",
        end_date: "2026-04-30",
        created_at: new Date(Date.now() - 45 * 24 * 3600 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "proj-demo-2",
        organization_id: orgId,
        title: "Brahmaputra Heritage Cultural Pavilion",
        client_name: "Directorate of Cultural Affairs, Assam",
        location: "Uzanbazar Ghat, Guwahati",
        status: "planning",
        budget: 320000,
        start_date: "2026-03-01",
        end_date: "2026-06-15",
        created_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("contractor_projects")
    .select("*")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

/**
 * Creates a new project under the contractor organization.
 */
export async function createContractorProject(
  orgId: string,
  project: Omit<InsertContractorProject, "id" | "organization_id" | "created_at" | "updated_at">
): Promise<ContractorProject> {
  if (!isConfigured.supabase) {
    return {
      id: `proj-${Date.now()}`,
      organization_id: orgId,
      title: project.title,
      client_name: project.client_name,
      location: project.location,
      status: project.status || "planning",
      budget: project.budget || null,
      start_date: project.start_date,
      end_date: project.end_date || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  const supabase = await createServerSupabaseClient();
  const { data: created, error } = await supabase
    .from("contractor_projects")
    .insert({
      ...project,
      organization_id: orgId,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return created;
}

/**
 * Aggregates complete dashboard data for a contractor organization.
 */
export async function getContractorDashboardData(ownerId: string): Promise<ContractorDashboardData | null> {
  let org = await getContractorOrganization(ownerId);

  // If no org exists yet, create default starter org for the user
  if (!org) {
    org = await createContractorOrganization({
      owner_id: ownerId,
      company_name: "My Contracting Enterprise",
      operating_city: "Guwahati",
      operating_state: "Assam",
      subscription_tier: "starter",
    });
  }

  const plan = CONTRACTOR_PLANS[org.subscription_tier];
  const workforce = await getContractorWorkforce(org.id);
  const projects = await getContractorProjects(org.id);

  const activeWorkforce = workforce.filter((w) => w.status === "active");
  const activeProjects = projects.filter((p) => p.status === "in_progress" || p.status === "planning");

  return {
    organization: org,
    plan,
    workforceCount: activeWorkforce.length,
    activeProjectsCount: activeProjects.length,
    rosterUsagePercent: Math.min(100, Math.round((activeWorkforce.length / org.max_roster_workers) * 100)),
    workforce,
    projects,
  };
}
