import { cookies } from "next/headers";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DEMO_PERSONAS, DemoPersona } from "@/lib/auth/personas";
import { isConfigured } from "@/lib/env";
import { AppRole } from "@/types/database.types";

export interface AuthenticatedUser {
  id: string;
  phone: string | null;
  fullName: string;
  role: AppRole;
  avatarUrl?: string | null;
  isDemo: boolean;
  workerProfileId?: string | null;
  slug?: string | null;
}

import { AppError } from "@/lib/error/app-error";

export class AuthError extends AppError {
  constructor(message: string, statusCode: number = 401) {
    super(message, statusCode, statusCode === 403 ? "FORBIDDEN" : "UNAUTHENTICATED");
    this.name = "AuthError";
  }
}

/**
 * Resolves the currently authenticated session with complete security.
 * NEVER returns a default demo user to unauthenticated visitors.
 */
export async function getAuthenticatedSession(): Promise<{
  user: AuthenticatedUser | null;
  isDemo: boolean;
}> {
  // 1. Check real Supabase Authentication via cryptographic SSR cookie
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user: authUser },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authUser && !authErr) {
      // Query verified profile from public.profiles to get authoritative database role
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, role, full_name, phone, avatar_url")
        .eq("id", authUser.id)
        .single();

      // Query worker profile ID if user is a worker
      let workerProfileId: string | null = null;
      let slug: string | null = null;
      if (profile?.role === "worker") {
        const { data: worker } = await supabase
          .from("worker_profiles")
          .select("id, slug")
          .eq("user_id", authUser.id)
          .single();
        if (worker) {
          workerProfileId = worker.id;
          slug = worker.slug;
        }
      }

      return {
        user: {
          id: authUser.id,
          phone: profile?.phone || authUser.phone || null,
          fullName: profile?.full_name || authUser.user_metadata?.full_name || "Verified User",
          role: (profile?.role as AppRole) || "worker",
          avatarUrl: profile?.avatar_url || authUser.user_metadata?.avatar_url || null,
          isDemo: false,
          workerProfileId,
          slug,
        },
        isDemo: false,
      };
    }
  } catch (err) {
    // If Supabase client fails (e.g. unconfigured URL or network error), proceed to demo check
  }

  // 2. Demo Persona Authentication - Strictly isolated behind explicit environment flag
  if (isConfigured.demoAuth) {
    const cookieStore = await cookies();
    const demoPersonaKey = cookieStore.get("kaamsetu_demo_persona")?.value;

    if (demoPersonaKey) {
      const matched = DEMO_PERSONAS.find((p) => p.personaKey === demoPersonaKey);
      if (matched) {
        return {
          user: {
            id: matched.id,
            phone: matched.phone || null,
            fullName: matched.fullName,
            role: matched.role as AppRole,
            avatarUrl: matched.avatarUrl || null,
            isDemo: true,
            workerProfileId: matched.role === "worker" ? `w-pro-01` : null,
            slug: matched.slug || null,
          },
          isDemo: true,
        };
      }
    }
  }

  // 3. Visitor is completely unauthenticated
  return {
    user: null,
    isDemo: false,
  };
}

/**
 * Requires an authenticated user. Throws AuthError(401) if unauthenticated.
 */
export async function requireAuthenticatedUser(): Promise<AuthenticatedUser> {
  const { user } = await getAuthenticatedSession();
  if (!user) {
    throw new AuthError("Authentication required. Please sign in to continue.", 401);
  }
  return user;
}

/**
 * Requires an authenticated worker. Throws AuthError(403) if role is not worker.
 */
export async function requireWorker(): Promise<AuthenticatedUser> {
  const user = await requireAuthenticatedUser();
  if (user.role !== "worker") {
    throw new AuthError("Access denied: Worker role required for this operation.", 403);
  }
  return user;
}

/**
 * Requires an authenticated customer or contractor.
 */
export async function requireCustomerOrContractor(): Promise<AuthenticatedUser> {
  const user = await requireAuthenticatedUser();
  if (user.role !== "contractor" && (user.role as string) !== "customer" && (user.role as string) !== "employer") {
    throw new AuthError("Access denied: Customer or Contractor role required.", 403);
  }
  return user;
}

/**
 * Requires an authenticated contractor or admin.
 */
export async function requireContractor(): Promise<AuthenticatedUser> {
  const user = await requireAuthenticatedUser();
  if (user.role !== "contractor" && user.role !== "admin") {
    throw new AuthError("Access denied: Contractor role required for this operation.", 403);
  }
  return user;
}

/**
 * Requires an authenticated customer or admin.
 */
export async function requireCustomer(): Promise<AuthenticatedUser> {
  const user = await requireAuthenticatedUser();
  if (user.role !== "customer" && user.role !== "admin") {
    throw new AuthError("Access denied: Customer role required for this operation.", 403);
  }
  return user;
}

/**
 * Requires an authenticated institutional partner or admin.
 */
export async function requireInstitution(): Promise<AuthenticatedUser> {
  const user = await requireAuthenticatedUser();
  if (user.role !== "institution" && user.role !== "admin") {
    throw new AuthError("Access denied: Institutional partner role required.", 403);
  }
  return user;
}

export const requireInstitutionMember = requireInstitution;

/**
 * Requires an authenticated moderator, ombudsperson, or administrator.
 */
export async function requireModerator(): Promise<AuthenticatedUser> {
  const user = await requireAuthenticatedUser();
  if (user.role !== "admin" && (user.role as string) !== "moderator" && (user.role as string) !== "ombudsperson") {
    throw new AuthError("Access denied: Moderator or Ombudsperson role required.", 403);
  }
  return user;
}

/**
 * Requires an authenticated admin.
 */
export async function requireAdmin(): Promise<AuthenticatedUser> {
  const user = await requireAuthenticatedUser();
  if (user.role !== "admin") {
    throw new AuthError("Access denied: Administrative privileges required.", 403);
  }
  return user;
}

export const requireAdministrator = requireAdmin;

/**
 * Enforces that the authenticated institution owns the target cohort.
 */
export async function requireInstitutionCohortOwnership(cohortId: string): Promise<AuthenticatedUser> {
  const user = await requireInstitution();
  if (user.isDemo || user.role === "admin") {
    return user;
  }

  const supabase = await createServerSupabaseClient();
  const { data: institution } = await supabase
    .from("institutions")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!institution) {
    throw new AuthError("Forbidden: Institutional profile not found.", 403);
  }

  const { data: cohort, error } = await supabase
    .from("institutional_cohorts")
    .select("id, institution_id")
    .eq("id", cohortId)
    .single();

  if (error || !cohort || cohort.institution_id !== institution.id) {
    throw new AuthError("Forbidden: You do not own or have access to this institutional cohort.", 403);
  }

  return user;
}

/**
 * Enforces generic resource ownership based on user_id or worker_profile_id.
 */
export async function requireResourceOwnership(
  tableName: string,
  resourceId: string,
  ownerColumn: "user_id" | "worker_profile_id" = "user_id"
): Promise<AuthenticatedUser> {
  const user = await requireAuthenticatedUser();
  if (user.isDemo || user.role === "admin") {
    return user;
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from(tableName as any)
    .select(ownerColumn)
    .eq("id", resourceId)
    .single();

  if (error || !data) {
    throw new AuthError("Resource not found or inaccessible.", 404);
  }

  const ownerVal = (data as any)[ownerColumn];
  const expectedVal = ownerColumn === "user_id" ? user.id : user.workerProfileId;

  if (ownerVal !== expectedVal) {
    throw new AuthError("Forbidden: You do not own this resource.", 403);
  }

  return user;
}

/**
 * Validates permission against user role capabilities.
 */
export async function requirePermission(permission: "manage_payouts" | "moderate_disputes" | "export_governance" | "manage_system"): Promise<AuthenticatedUser> {
  const user = await requireAuthenticatedUser();
  const rolePermissions: Record<string, string[]> = {
    admin: ["manage_payouts", "moderate_disputes", "export_governance", "manage_system"],
    worker: [],
    customer: [],
    contractor: ["manage_payouts"],
    institution: ["export_governance"],
  };

  const allowed = rolePermissions[user.role] || [];
  if (!allowed.includes(permission)) {
    throw new AuthError(`Forbidden: Missing required permission '${permission}'.`, 403);
  }

  return user;
}

/**
 * Enforces that the authenticated worker owns the target workerProfileId.
 */
export async function requireOwnedWorkerProfile(workerProfileId: string): Promise<AuthenticatedUser> {
  const user = await requireWorker();

  // In demo mode with demo persona, check demo ownership
  if (user.isDemo) {
    if (user.workerProfileId && user.workerProfileId !== workerProfileId && workerProfileId !== "w-pro-01") {
      throw new AuthError("Forbidden: You do not own this worker profile.", 403);
    }
    return user;
  }

  // In production, verify ownership directly in the database
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("worker_profiles")
    .select("id, user_id")
    .eq("id", workerProfileId)
    .single();

  if (error || !data || data.user_id !== user.id) {
    throw new AuthError("Forbidden: You do not have permission to manage this worker profile.", 403);
  }

  return user;
}
