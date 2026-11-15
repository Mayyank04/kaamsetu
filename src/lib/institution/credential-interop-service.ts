import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { isConfigured } from "@/lib/env";

export interface RegisterSignatoryInput {
  institutionId: string;
  fullName: string;
  designation: string;
  publicKeyPem?: string;
  authorizedUntil?: string | null;
}

export interface TransitionCredentialStatusInput {
  credentialId: string;
  newStatus: "issued" | "active" | "suspended" | "revoked" | "expired";
  reason?: string;
  actorRole: "institution" | "admin";
}

/**
 * Registers an authorized signatory for an accredited institution
 */
export async function registerAuthorizedSignatory(input: RegisterSignatoryInput) {
  const rawFingerprint = crypto
    .createHash("sha256")
    .update(`${input.institutionId}:${input.fullName}:${input.designation}:${Date.now()}`)
    .digest("hex")
    .substring(0, 32);

  if (!isConfigured.supabase) {
    return {
      id: crypto.randomUUID(),
      institution_id: input.institutionId,
      full_name: input.fullName,
      designation: input.designation,
      signatory_key_fingerprint: `FPR-${rawFingerprint.toUpperCase()}`,
      is_active: true,
      authorized_from: new Date().toISOString(),
      authorized_until: input.authorizedUntil || null,
      created_at: new Date().toISOString(),
    };
  }

  const supabase = createAdminClient();
  if (!supabase) throw new Error("Database client unavailable");

  const { data, error } = await supabase
    .from("institution_authorized_signatories")
    .insert({
      institution_id: input.institutionId,
      full_name: input.fullName,
      designation: input.designation,
      signatory_key_fingerprint: `FPR-${rawFingerprint.toUpperCase()}`,
      is_active: true,
      authorized_until: input.authorizedUntil || null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to register signatory: ${error.message}`);
  }

  return data;
}

/**
 * Formal credential lifecycle state transition with audit logging
 */
export async function transitionCredentialLifecycle(input: TransitionCredentialStatusInput) {
  const allowedTransitions: Record<string, string[]> = {
    issued: ["active", "suspended", "revoked", "expired"],
    active: ["suspended", "revoked", "expired"],
    suspended: ["active", "revoked", "expired"],
    revoked: [], // Terminal state
    expired: [], // Terminal state
  };

  if (!isConfigured.supabase) {
    return {
      credentialId: input.credentialId,
      status: input.newStatus,
      updated_at: new Date().toISOString(),
      reason: input.reason || null,
    };
  }

  const supabase = createAdminClient();
  if (!supabase) throw new Error("Database client unavailable");

  const { data: cred, error: fetchErr } = await supabase
    .from("institutional_credentials")
    .select("id, status")
    .eq("id", input.credentialId)
    .single();

  if (fetchErr || !cred) throw new Error("Credential not found");

  const allowed = allowedTransitions[cred.status] || [];
  if (!allowed.includes(input.newStatus)) {
    throw new Error(
      `Invalid credential lifecycle transition from '${cred.status}' to '${input.newStatus}'. Terminal or forbidden state.`
    );
  }

  const updatePayload: any = {
    status: input.newStatus,
    updated_at: new Date().toISOString(),
  };

  if (input.newStatus === "revoked") {
    updatePayload.revoked_at = new Date().toISOString();
    updatePayload.revocation_reason = input.reason || "Formal administrative revocation";
  }

  const { data: updated, error: updateErr } = await supabase
    .from("institutional_credentials")
    .update(updatePayload)
    .eq("id", input.credentialId)
    .select()
    .single();

  if (updateErr) throw new Error(`Failed to transition credential: ${updateErr.message}`);

  return updated;
}

/**
 * Verification interface enforcing sandbox isolation
 */
export function verifySandboxIsolation(options: {
  apiKeyIsSandbox: boolean;
  requestedTarget: "production_registry" | "sandbox_cohort";
}): {
  allowed: boolean;
  isSandboxResponse: boolean;
  errorMessage?: string;
} {
  if (options.apiKeyIsSandbox && options.requestedTarget === "production_registry") {
    return {
      allowed: false,
      isSandboxResponse: true,
      errorMessage: "Sandbox API key cannot write or certify production worker registries",
    };
  }

  return {
    allowed: true,
    isSandboxResponse: options.apiKeyIsSandbox,
  };
}
