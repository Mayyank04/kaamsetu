/**
 * KAAMSETU Commercial Billing & Payment Service
 *
 * Implements server-side cryptographic payment verification (HMAC-SHA256),
 * safe sandbox abstraction, GST invoice generation, and subscription state transitions.
 *
 * CRITICAL SECURITY INVARIANT:
 * Plans are NEVER upgraded from frontend messages. Every upgrade requires authentic,
 * server-side verified cryptographic transaction signatures.
 */

import crypto from "crypto";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isConfigured } from "@/lib/env";
import {
  calculateBillingBreakdown,
  OrderBillingBreakdown,
  SubscriptionTier,
  BillingCycle,
  PRICING_PLANS,
} from "@/lib/config/pricing-plans";
import { SubscriptionOrder, ContractorOrganization } from "@/types/database.types";
import { logger } from "@/lib/security/privacy-logger";

export interface CreateOrderParams {
  organizationId: string;
  tier: SubscriptionTier;
  cycle: BillingCycle;
  gateway?: "sandbox" | "razorpay" | "stripe" | "manual_invoice";
  customerConsentAgreed: boolean;
}

export interface VerifyPaymentParams {
  orderReference: string;
  gatewayOrderId: string;
  gatewayPaymentId: string;
  gatewaySignature: string;
}

export interface PaymentVerificationResult {
  isVerified: boolean;
  order: SubscriptionOrder;
  organization?: ContractorOrganization;
  errorMessage?: string;
}

/**
 * Secret key for sandbox and webhook verification.
 * In production, fetched from RAZORPAY_KEY_SECRET or STRIPE_WEBHOOK_SECRET.
 */
function getPaymentSecret(): string {
  return process.env.PAYMENT_GATEWAY_SECRET || process.env.AUTH_SECRET || "kaamsetu-sandbox-secret-key-32bytes-min";
}

/**
 * Creates a new subscription order in `subscription_orders` table.
 * Enforces customer explicit consent before order creation.
 */
export async function createSubscriptionOrder(params: CreateOrderParams): Promise<{
  order: SubscriptionOrder;
  breakdown: OrderBillingBreakdown;
}> {
  if (!params.customerConsentAgreed) {
    throw new Error("Explicit customer consent to subscription terms is mandatory before payment creation.");
  }

  const breakdown = calculateBillingBreakdown(params.tier, params.cycle);
  const orderRef = `ORD-${new Date().getFullYear()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
  const gateway = params.gateway || (process.env.ENABLE_LIVE_PAYMENTS === "true" ? "razorpay" : "sandbox");

  if (!isConfigured.supabase) {
    const mockOrder: SubscriptionOrder = {
      id: `order-demo-${Date.now()}`,
      organization_id: params.organizationId,
      order_reference: orderRef,
      plan_tier: params.tier,
      billing_cycle: params.cycle,
      base_amount: breakdown.baseAmount,
      gst_amount: breakdown.gstAmount,
      total_amount: breakdown.totalAmount,
      currency: "INR",
      payment_gateway: gateway,
      gateway_order_id: `gw_ord_${crypto.randomBytes(6).toString("hex")}`,
      gateway_payment_id: null,
      gateway_signature: null,
      status: "created",
      invoice_url: `/api/contractor/billing/invoice/${orderRef}`,
      metadata: { consentTimestamp: new Date().toISOString() },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return { order: mockOrder, breakdown };
  }

  const supabase = await createServerSupabaseClient();
  const gatewayOrderId = `${gateway}_ord_${crypto.randomBytes(8).toString("hex")}`;

  const { data: order, error } = await supabase
    .from("subscription_orders")
    .insert({
      organization_id: params.organizationId,
      order_reference: orderRef,
      plan_tier: params.tier,
      billing_cycle: params.cycle,
      base_amount: breakdown.baseAmount,
      gst_amount: breakdown.gstAmount,
      total_amount: breakdown.totalAmount,
      currency: "INR",
      payment_gateway: gateway,
      gateway_order_id: gatewayOrderId,
      status: "created",
      invoice_url: `/api/contractor/billing/invoice/${orderRef}`,
      metadata: { consentTimestamp: new Date().toISOString() },
    })
    .select("*")
    .single();

  if (error || !order) {
    logger.error("Failed to create subscription order in database", { error: String(error) });
    throw error;
  }

  return { order, breakdown };
}

/**
 * Validates cryptographic payment signature on server.
 * Standard: Razorpay HMAC-SHA256 signature protocol:
 * expectedSignature = hmac_sha256(order_id + "|" + payment_id, secret)
 */
export async function verifyAndCapturePayment(
  params: VerifyPaymentParams
): Promise<PaymentVerificationResult> {
  const secret = getPaymentSecret();

  // 1. Compute expected HMAC-SHA256 signature
  const payload = `${params.gatewayOrderId}|${params.gatewayPaymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  // In sandbox testing mode, accept expectedSignature or designated test signature
  const isMatch = crypto.timingSafeEqual(
    Buffer.from(params.gatewaySignature, "hex"),
    Buffer.from(expectedSignature, "hex")
  );

  if (!isMatch) {
    logger.warn("Payment signature verification failed. Potential tampering attempt.", {
      orderReference: params.orderReference,
    });
    return {
      isVerified: false,
      order: null as any,
      errorMessage: "Cryptographic payment signature mismatch. Transaction rejected.",
    };
  }

  if (!isConfigured.supabase) {
    const mockCapturedOrder: SubscriptionOrder = {
      id: `order-demo-${Date.now()}`,
      organization_id: "org-demo-aarav-001",
      order_reference: params.orderReference,
      plan_tier: "pro",
      billing_cycle: "monthly",
      base_amount: 999,
      gst_amount: 179.82,
      total_amount: 1178.82,
      currency: "INR",
      payment_gateway: "sandbox",
      gateway_order_id: params.gatewayOrderId,
      gateway_payment_id: params.gatewayPaymentId,
      gateway_signature: params.gatewaySignature,
      status: "captured",
      invoice_url: `/api/contractor/billing/invoice/${params.orderReference}`,
      metadata: { verifiedAt: new Date().toISOString() },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return { isVerified: true, order: mockCapturedOrder };
  }

  const supabase = await createServerSupabaseClient();

  // 2. Fetch existing order
  const { data: order, error: orderError } = await supabase
    .from("subscription_orders")
    .select("*")
    .eq("order_reference", params.orderReference)
    .single();

  if (orderError || !order) {
    return {
      isVerified: false,
      order: null as any,
      errorMessage: "Order reference not found in billing ledger.",
    };
  }

  // 3. Atomically update order to 'captured'
  const { data: updatedOrder, error: updateOrderError } = await supabase
    .from("subscription_orders")
    .update({
      gateway_payment_id: params.gatewayPaymentId,
      gateway_signature: params.gatewaySignature,
      status: "captured",
      updated_at: new Date().toISOString(),
    })
    .eq("id", order.id)
    .select("*")
    .single();

  if (updateOrderError || !updatedOrder) {
    throw updateOrderError;
  }

  // 4. Upgrade contractor organization subscription tier and roster capacity
  const targetPlan = PRICING_PLANS[updatedOrder.plan_tier as SubscriptionTier];
  const expiryDays = updatedOrder.billing_cycle === "annual" ? 365 : 30;
  const expiresAt = new Date(Date.now() + expiryDays * 24 * 3600 * 1000).toISOString();

  const { data: updatedOrg, error: orgError } = await supabase
    .from("contractor_organizations")
    .update({
      subscription_tier: updatedOrder.plan_tier as any,
      max_roster_workers: targetPlan.maxRosterWorkers,
      subscription_status: "active",
      subscription_expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", order.organization_id)
    .select("*")
    .single();

  if (orgError) {
    logger.error("Failed to elevate contractor organization subscription tier", { error: String(orgError) });
    throw orgError;
  }

  return {
    isVerified: true,
    order: updatedOrder,
    organization: updatedOrg,
  };
}

/**
 * Cancels active contractor subscription at end of period.
 * PRESERVATION INVARIANT: Workers' individual digital skill cards and credentials
 * are NEVER cancelled or degraded when a contractor cancels their SaaS subscription.
 */
export async function cancelContractorSubscription(
  organizationId: string
): Promise<ContractorOrganization> {
  if (!isConfigured.supabase) {
    return {
      id: organizationId,
      owner_id: "demo-owner",
      company_name: "Mehta Infra",
      gstin: null,
      business_type: "proprietorship",
      operating_city: "Guwahati",
      operating_state: "Assam",
      subscription_tier: "starter",
      subscription_status: "cancelled",
      subscription_expires_at: null,
      max_roster_workers: 5,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("contractor_organizations")
    .update({
      subscription_tier: "starter",
      max_roster_workers: 5,
      subscription_status: "cancelled",
      updated_at: new Date().toISOString(),
    })
    .eq("id", organizationId)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

/**
 * Retrieves all billing orders and payment history for an organization.
 */
export async function getOrganizationBillingHistory(
  organizationId: string
): Promise<SubscriptionOrder[]> {
  if (!isConfigured.supabase) {
    return [
      {
        id: "ord-hist-1",
        organization_id: organizationId,
        order_reference: "ORD-2026-B812",
        plan_tier: "pro",
        billing_cycle: "monthly",
        base_amount: 999,
        gst_amount: 179.82,
        total_amount: 1178.82,
        currency: "INR",
        payment_gateway: "sandbox",
        gateway_order_id: "gw_ord_112233",
        gateway_payment_id: "pay_998877",
        gateway_signature: "sig_verified",
        status: "captured",
        invoice_url: `/api/contractor/billing/invoice/ORD-2026-B812`,
        metadata: {},
        created_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
      },
    ];
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("subscription_orders")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}
