/**
 * KAAMSETU — Authoritative Feature & Integration Status Registry
 * 
 * Defines the precise operational reality of every platform integration.
 * Prevents simulated or sandbox capabilities from being represented as live production.
 */

export type IntegrationStatus =
  | "IMPLEMENTED"
  | "SANDBOX"
  | "SIMULATED"
  | "PENDING_CREDENTIALS"
  | "PENDING_EXTERNAL_APPROVAL"
  | "NOT_IMPLEMENTED";

export interface IntegrationDescriptor {
  id: string;
  name: string;
  category: "database" | "identity" | "finance" | "communication" | "ai" | "network" | "institutional";
  status: IntegrationStatus;
  isProductionReady: boolean;
  activeProvider: string;
  fallbackBehavior: string;
  evidenceReference: string;
  documentation: string;
}

export const INTEGRATION_REGISTRY: Record<string, IntegrationDescriptor> = {
  supabase_database: {
    id: "supabase_database",
    name: "Supabase PostgreSQL Database & RLS",
    category: "database",
    status: "IMPLEMENTED",
    isProductionReady: true,
    activeProvider: "Supabase Hosted PostgreSQL 15.x",
    fallbackBehavior: "Gracefully falls back to structured offline demo personas when unconfigured.",
    evidenceReference: "Migration 01 to 29; 100/100 public tables enforce Row Level Security.",
    documentation: "Full CRUD, immutable triggers on ledger and consent, monotonic audit chaining.",
  },

  w3c_verifiable_credentials: {
    id: "w3c_verifiable_credentials",
    name: "W3C Verifiable Credentials & Ed25519 Cryptography",
    category: "identity",
    status: "IMPLEMENTED",
    isProductionReady: true,
    activeProvider: "Ed25519 + RFC 8785 Canonical JSON Serialization",
    fallbackBehavior: "Issues tamper-evident local credentials with 72-hour offline freshness validation.",
    evidenceReference: "src/lib/crypto/w3c-vc-ed25519-service.ts; verified in automated test suite.",
    documentation: "Offline camera-scannable QR generation, status list 2026 revocation bitstring.",
  },

  geographic_boundary_service: {
    id: "geographic_boundary_service",
    name: "Geographic Boundary Authorization & Anti-Spoofing",
    category: "network",
    status: "IMPLEMENTED",
    isProductionReady: true,
    activeProvider: "GeographicAuthorizationService (Class B Controlled Boundary)",
    fallbackBehavior: "Rejects out-of-bounds requests with HTTP 403; rejects GPS coordinate spoofing with HTTP 422.",
    evidenceReference: "src/lib/geo/geographic-authorization-service.ts",
    documentation: "Permitted: Guwahati Urban (Assam) & Shillong Urban (Meghalaya). Gated: Siliguri, Tripura, Heavy EPC.",
  },

  ai_voice_extraction: {
    id: "ai_voice_extraction",
    name: "Voice Processing & AI Skill Extraction",
    category: "ai",
    status: "IMPLEMENTED",
    isProductionReady: true,
    activeProvider: "Web Speech API + Gemini AI Structured Extraction Pipeline",
    fallbackBehavior: "Provides immediate seamless manual text typing fallback and multi-lingual prompt options.",
    evidenceReference: "src/app/api/ai/extract-skill/route.ts; verified on 7 native Indian languages.",
    documentation: "Speech input converted to structured draft claims; never treated as automatic verification.",
  },

  sms_otp_verification: {
    id: "sms_otp_verification",
    name: "SMS Authentication & OTP Service",
    category: "communication",
    status: "SANDBOX",
    isProductionReady: false,
    activeProvider: "Twilio / Fast2SMS Sandbox Environment",
    fallbackBehavior: "Accepts verified sandbox development OTP '123456' for tested persona workflows.",
    evidenceReference: "src/app/api/auth/otp/send/route.ts",
    documentation: "Production gateway activation requires commercial DLT telecommunication registration.",
  },

  payment_gateway_payouts: {
    id: "payment_gateway_payouts",
    name: "Commercial Payment Gateway & Worker Payouts",
    category: "finance",
    status: "SANDBOX",
    isProductionReady: false,
    activeProvider: "Razorpay / Cashfree Test Sandbox",
    fallbackBehavior: "Simulates gateway webhooks and records zero-commission internal ledger transfers.",
    evidenceReference: "src/app/api/worker/payouts/route.ts; permanent platform_commission = 0.00.",
    documentation: "Direct clearing bank settlement remains UNVERIFIED pending live production bank API credentials.",
  },

  digilocker_identity: {
    id: "digilocker_identity",
    name: "DigiLocker Citizen Document Verification",
    category: "identity",
    status: "PENDING_CREDENTIALS",
    isProductionReady: false,
    activeProvider: "MeitY DigiLocker Sandbox Partner API",
    fallbackBehavior: "Marks document status as UNVERIFIED in UI; does not fabricate success responses.",
    evidenceReference: "docs/certification/phase-34a/PHASE_34A_GATE_CLOSURE_MATRIX.json",
    documentation: "Production OAuth credentials pending institutional partner registration.",
  },

  ondc_onest_network: {
    id: "ondc_onest_network",
    name: "ONDC / ONest Network Registry & BPP Broadcast",
    category: "network",
    status: "PENDING_EXTERNAL_APPROVAL",
    isProductionReady: false,
    activeProvider: "ONDC Staging Registry (services.ondc.org)",
    fallbackBehavior: "Live BPP network broadcast strictly disabled; staging validated in isolation.",
    evidenceReference: "BLOCKER-02; Ed25519 air-gapped dual-control key ceremony pending.",
    documentation: "Network participant agreement and production certificate pending.",
  },

  tripura_skill_mission: {
    id: "tripura_skill_mission",
    name: "Tripura Skill Development Mission (TSDM) Partnership",
    category: "institutional",
    status: "PENDING_EXTERNAL_APPROVAL",
    isProductionReady: false,
    activeProvider: "Directorate of Skill Development, Govt. of Tripura",
    fallbackBehavior: "Tripura operations strictly BLOCKED (0 workers dispatched; API calls rejected).",
    evidenceReference: "BLOCKER-01; Bilateral MoU and State Cabinet gazetted notification pending.",
    documentation: "Draft term sheet in progress; verbal assurances rejected by anti-masking governance.",
  },

  epc_tripartite_workforce: {
    id: "epc_tripartite_workforce",
    name: "EPC Heavy Construction Workforce Dispatch",
    category: "institutional",
    status: "PENDING_EXTERNAL_APPROVAL",
    isProductionReady: false,
    activeProvider: "EPC Tripartite Infrastructure Partners",
    fallbackBehavior: "Heavy workforce dispatch strictly FROZEN (0 artisans deployed to hazardous sites).",
    evidenceReference: "BLOCKER-03; General counsel execution & underwritten worker indemnity pending.",
    documentation: "Commercial discussions active; worker safety covenants cannot be waived.",
  },
};

/**
 * Returns human-readable summary of integration status for UI and audit logs.
 */
export function getIntegrationStatus(id: string): IntegrationDescriptor | null {
  return INTEGRATION_REGISTRY[id] || null;
}
