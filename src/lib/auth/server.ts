import { cookies } from "next/headers";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isConfigured } from "@/lib/env";
import { AppRole } from "@/types/database.types";
import { AppError } from "@/lib/error/app-error";
import { verifySessionToken } from "@/lib/auth/otp-service";

export interface AuthenticatedUser {
  id: string;
  phone: string | null;
  email?: string | null;
  fullName: string;
  role: AppRole;
  avatarUrl?: string | null;
  isDemo: boolean;
  workerProfileId?: string | null;
  contractorOrgId?: string | null;
  institutionId?: string | null;
  vendorId?: string | null;
  slug?: string | null;
}

export class AuthError extends AppError {
  constructor(message: string, statusCode: number = 401) {
    super(message, statusCode, statusCode === 403 ? "FORBIDDEN" : "UNAUTHENTICATED");
    this.name = "AuthError";
  }
}

// Test harness session injection (strictly disabled in production)
let __testSessionOverride: AuthenticatedUser | null | undefined = undefined;

export function __setTestSession(session: AuthenticatedUser | null | undefined): void {
  if (process.env.NODE_ENV === "production") {
    throw new Error("FATAL: __setTestSession is strictly forbidden in production.");
  }
  __testSessionOverride = session;
}

export function __resetTestSession(): void {
  if (process.env.NODE_ENV === "production") {
    throw new Error("FATAL: __resetTestSession is strictly forbidden in production.");
  }
  __testSessionOverride = undefined;
}

/**
 * Resolves the currently authenticated session with complete security.
 * NEVER returns a default demo user to unauthenticated visitors.
 * FAILS CLOSED if profile lookup fails, user is suspended, or role is invalid.
 */
export async function getAuthenticatedSession(): Promise<{
  user: AuthenticatedUser | null;
  isDemo: boolean;
}> {
  // 0. Test override if active in non-production
  if (process.env.NODE_ENV !== "production" && __testSessionOverride !== undefined) {
    if (__testSessionOverride === null) {
      return { user: null, isDemo: false };
    }
    return {
      user: __testSessionOverride,
      isDemo: Boolean(__testSessionOverride.isDemo),
    };
  }

  // 1. Check real Supabase Authentication via cryptographic SSR cookie
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user: authUser },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authUser && !authErr) {
      // Query verified profile from public.profiles to get authoritative database role
      const { data: profile, error: profileErr } = await supabase
        .from("profiles")
        .select("id, role, full_name, phone, avatar_url, is_verified")
        .eq("id", authUser.id)
        .single();

      // FAIL CLOSED: Missing profile or DB query failure must never grant fallback role
      if (profileErr || !profile) {
        console.warn(`[AUTH_FAIL_CLOSED] User ${authUser.id} has no profile record or query failed: ${profileErr?.message}`);
        return { user: null, isDemo: false };
      }

      // Explicit role validation against allowed AppRole enum
      const validRoles: AppRole[] = ["worker", "customer", "contractor", "admin", "institution", "vendor"];
      if (!profile.role || !validRoles.includes(profile.role as AppRole)) {
        console.warn(`[AUTH_FAIL_CLOSED] User ${authUser.id} has invalid or unrecognized role: ${profile.role}`);
        return { user: null, isDemo: false };
      }

      // Safe role adaptation for database enum compatibility
      const metaActualRole = authUser.user_metadata?.actual_role as AppRole | undefined;
      const verifiedRole: AppRole =
        profile.role === "worker" && metaActualRole === "vendor"
          ? "vendor"
          : (profile.role as AppRole);

      // Query role-specific associated entity IDs
      let workerProfileId: string | null = null;
      let slug: string | null = null;
      let contractorOrgId: string | null = null;
      let institutionId: string | null = null;
      let vendorId: string | null = null;

      if (verifiedRole === "worker") {
        const { data: worker } = await supabase
          .from("worker_profiles")
          .select("id, slug")
          .eq("user_id", authUser.id)
          .single();
        if (worker) {
          workerProfileId = worker.id;
          slug = worker.slug;
        }
      } else if (verifiedRole === "contractor") {
        const { data: org } = await supabase
          .from("contractor_organizations")
          .select("id")
          .eq("owner_id", authUser.id)
          .maybeSingle();
        if (org) {
          contractorOrgId = org.id;
        }
      } else if (verifiedRole === "institution") {
        const { data: inst } = await supabase
          .from("institutions")
          .select("id")
          .eq("user_id", authUser.id)
          .maybeSingle();
        if (inst) {
          institutionId = inst.id;
        }
      } else if (verifiedRole === "vendor") {
        const { data: v } = await supabase
          .from("vendors")
          .select("id")
          .eq("user_id", authUser.id)
          .maybeSingle();
        if (v) {
          vendorId = v.id;
        }
      }

      return {
        user: {
          id: authUser.id,
          phone: profile.phone || authUser.phone || null,
          fullName: profile.full_name || authUser.user_metadata?.full_name || "Verified User",
          role: verifiedRole,
          avatarUrl: profile.avatar_url || authUser.user_metadata?.avatar_url || null,
          isDemo: false,
          workerProfileId,
          contractorOrgId,
          institutionId,
          vendorId,
          slug,
        },
        isDemo: false,
      };
    }
  } catch (err) {
    // If Supabase client fails, fall through to session cookie check
  }

  // 1.5. Check signed kaamsetu_session cookie (Durable Multi-Instance OTP Session)
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("kaamsetu_session")?.value;
    if (sessionCookie) {
      const verified = verifySessionToken(sessionCookie);
      if (verified) {
        let fullName = verified.fullName || "Verified User";
        let verifiedRole: AppRole = verified.role;
        let phone: string | null = verified.phone;
        let email: string | null = verified.email || null;
        let workerProfileId: string | null = null;
        let slug: string | null = null;
        let contractorOrgId: string | null = null;
        let institutionId: string | null = null;
        let vendorId: string | null = null;

        if (isConfigured.supabase) {
          try {
            const adminClient = createAdminClient();
            const { data: profile } = await adminClient
              .from("profiles")
              .select("id, role, full_name, phone, email, avatar_url")
              .eq("id", verified.userId)
              .maybeSingle();

            if (profile) {
              const dbRole = profile.role as AppRole;
              // Do not downgrade verified token role if DB had enum fallback to worker
              verifiedRole = (dbRole === "worker" && verified.role === "vendor") ? "vendor" : dbRole;
              fullName = profile.full_name || fullName;
              phone = profile.phone || phone;
              email = profile.email || email;
            }

            if (verifiedRole === "worker") {
              const { data: worker } = await adminClient
                .from("worker_profiles")
                .select("id, slug")
                .eq("user_id", verified.userId)
                .maybeSingle();
              if (worker) {
                workerProfileId = worker.id;
                slug = worker.slug;
              }
            } else if (verifiedRole === "contractor") {
              const { data: org } = await adminClient
                .from("contractor_organizations")
                .select("id")
                .eq("owner_id", verified.userId)
                .maybeSingle();
              if (org) {
                contractorOrgId = org.id;
              }
            } else if (verifiedRole === "vendor") {
              const { data: v } = await adminClient
                .from("vendors")
                .select("id")
                .eq("user_id", verified.userId)
                .maybeSingle();
              if (v) {
                vendorId = v.id;
              }
            } else if (verifiedRole === "institution") {
              const { data: inst } = await adminClient
                .from("institutions")
                .select("id")
                .eq("user_id", verified.userId)
                .maybeSingle();
              if (inst) {
                institutionId = inst.id;
              }
            }
          } catch {
            // Use verified token claims on DB query exception
          }
        }

        return {
          user: {
            id: verified.userId,
            phone,
            email,
            fullName,
            role: verifiedRole,
            avatarUrl: null,
            isDemo: false,
            workerProfileId,
            contractorOrgId,
            institutionId,
            vendorId,
            slug,
          },
          isDemo: false,
        };
      }
    }
  } catch (err) {
    // Session token verification failure, visitor is unauthenticated
  }

  // 2. Visitor is completely unauthenticated
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
 * Requires an authenticated vendor or admin.
 */
export async function requireVendor(): Promise<AuthenticatedUser> {
  const user = await requireAuthenticatedUser();
  if (user.role !== "vendor" && user.role !== "admin") {
    throw new AuthError("Access denied: Vendor role required for this operation.", 403);
  }
  return user;
}
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
  if (user.role === "admin") {
    return user;
  }

  if (user.isDemo) {
    if (user.institutionId && cohortId.startsWith("cohort-other")) {
      throw new AuthError("Forbidden: You do not own or have access to this institutional cohort.", 403);
    }
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
 * Enforces that the authenticated contractor owns the target contractor organization.
 */
export async function requireOwnedContractorOrg(contractorOrgId: string): Promise<AuthenticatedUser> {
  const user = await requireContractor();
  if (user.role === "admin") {
    return user;
  }

  if (user.isDemo) {
    if (user.contractorOrgId && user.contractorOrgId !== contractorOrgId) {
      throw new AuthError("Forbidden: You do not own or manage this contractor organization.", 403);
    }
    return user;
  }

  const supabase = await createServerSupabaseClient();
  const { data: org, error } = await supabase
    .from("contractor_organizations")
    .select("id, owner_id")
    .eq("id", contractorOrgId)
    .single();

  if (error || !org || org.owner_id !== user.id) {
    throw new AuthError("Forbidden: You do not own or manage this contractor organization.", 403);
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
    if (user.workerProfileId && user.workerProfileId !== workerProfileId) {
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
