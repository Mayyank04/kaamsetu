/**
 * KAAMSETU — Centralized Server Authentication & Session Verification
 * Validates session cookies, enforces RBAC, and fails closed safely.
 */

import {
  getAuthenticatedSession,
  requireAuthenticatedUser,
  AuthenticatedUser,
  AuthError,
  __setTestSession,
  __resetTestSession,
} from "@/lib/auth/server";
import { AppRole } from "@/types/database.types";
import { AuthenticationError, AuthorizationError } from "@/lib/errors/app-error";

export type { AuthenticatedUser };
export { AuthError, __setTestSession, __resetTestSession };

/**
 * Retrieves the current session user or null if anonymous
 */
export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const { user } = await getAuthenticatedSession();
  return user;
}

/**
 * Asserts that the caller is authenticated, throwing AuthenticationError if not
 */
export async function requireAuth(): Promise<AuthenticatedUser> {
  try {
    return await requireAuthenticatedUser();
  } catch (err) {
    if (err instanceof AuthError) {
      throw new AuthenticationError(err.message);
    }
    throw err;
  }
}

/**
 * Asserts that the caller has one of the allowed roles, throwing AuthorizationError if not
 */
export async function requireUserRole(allowedRoles: AppRole | AppRole[]): Promise<AuthenticatedUser> {
  const user = await requireAuth();
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  if (!roles.includes(user.role)) {
    throw new AuthorizationError(
      `Access denied: required role ${roles.join(" or ")}, but current role is ${user.role}`
    );
  }
  return user;
}
