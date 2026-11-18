"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Briefcase,
  ShieldCheck,
  Building2,
  Crown,
  Plus,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  MapPin,
  Mail,
  FileText,
  Clock,
  CreditCard,
  Download,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import {
  ContractorDashboardData,
  CONTRACTOR_PLANS,
  SubscriptionTier,
} from "@/types/contractor";
import { PRICING_PLANS, BillingCycle, calculateBillingBreakdown } from "@/features/contractors/services/billing-calculator";

interface ContractorDashboardViewProps {
  initialData: ContractorDashboardData;
}

interface InvitationItem {
  id: string;
  workerName: string;
  workerTrade: string;
  proposed_role: string;
  proposed_daily_wage: number | null;
  status: string;
  created_at: string;
}

export function ContractorDashboardView({ initialData }: ContractorDashboardViewProps) {
  const [data, setData] = useState<ContractorDashboardData>(initialData);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showInviteWorkerModal, setShowInviteWorkerModal] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);

  // Billing Cycle state in modal
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>(data.organization.subscription_tier);
  const [selectedCycle, setSelectedCycle] = useState<BillingCycle>("monthly");
  const [billingConsentAgreed, setBillingConsentAgreed] = useState(false);
  const [paymentGateway, setPaymentGateway] = useState<"sandbox" | "razorpay">("sandbox");

  // New Invitation Form
  const [inviteWorkerId, setInviteWorkerId] = useState("");
  const [inviteRole, setInviteRole] = useState("Crew Specialist");
  const [inviteDailyWage, setInviteDailyWage] = useState("1500");
  const [inviteMessage, setInviteMessage] = useState("Join our commercial site crew in Guwahati.");
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [invitations, setInvitations] = useState<InvitationItem[]>([]);

  // New Project Form
  const [projectTitle, setProjectTitle] = useState("");
  const [clientName, setClientName] = useState("");
  const [location, setLocation] = useState("Guwahati, Assam");
  const [budget, setBudget] = useState("250000");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  // Fetch pending invitations
  useEffect(() => {
    fetch("/api/contractor/invitations")
      .then((res) => res.json())
      .then((res) => {
        if (res.data) setInvitations(res.data);
      })
      .catch(() => {});
  }, []);

  // Server-Verified Payment Flow (Workstream A.3)
  const handleProceedPayment = async () => {
    if (!billingConsentAgreed) {
      toast.error("Please agree to the subscription billing and worker sovereignty terms.");
      return;
    }

    setIsUpgrading(true);
    try {
      // 1. Create order on server
      const orderRes = await fetch("/api/contractor/billing/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier: selectedTier,
          cycle: selectedCycle,
          customerConsentAgreed: true,
        }),
      });

      const orderJson = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderJson.error?.message || "Failed to create order");
      }

      const { order } = orderJson.data;

      // 2. Simulate gateway authorization & compute expected signature for sandbox
      const testPaymentId = `pay_sbx_${Date.now()}`;
      // In sandbox mode, secret matches default sandbox key
      const payload = `${order.gateway_order_id}|${testPaymentId}`;
      const secret = "kaamsetu-sandbox-secret-key-32bytes-min";
      const encoder = new TextEncoder();
      const keyData = encoder.encode(secret);
      const cryptoKey = await window.crypto.subtle.importKey(
        "raw",
        keyData,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );
      const signatureBuffer = await window.crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(payload));
      const gatewaySignature = Array.from(new Uint8Array(signatureBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      // 3. Server-side payment capture & signature verification
      const verifyRes = await fetch("/api/contractor/billing/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderReference: order.order_reference,
          gatewayOrderId: order.gateway_order_id,
          gatewayPaymentId: testPaymentId,
          gatewaySignature,
        }),
      });

      const verifyJson = await verifyRes.json();
      if (!verifyRes.ok) {
        throw new Error(verifyJson.error?.message || "Payment verification failed");
      }

      toast.success(
        `Subscription activated! Plan elevated to ${PRICING_PLANS[selectedTier].name}. Invoice: ${order.order_reference}`
      );

      // Refresh state
      setData((prev) => ({
        ...prev,
        organization: verifyJson.data.organization,
        plan: CONTRACTOR_PLANS[selectedTier],
        rosterUsagePercent: Math.min(
          100,
          Math.round((prev.workforceCount / verifyJson.data.organization.max_roster_workers) * 100)
        ),
      }));
      setShowUpgradeModal(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to complete subscription payment");
    } finally {
      setIsUpgrading(false);
    }
  };

  // Send two-sided invitation (Workstream B)
  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteWorkerId) {
      toast.error("Please provide a valid Worker Profile ID");
      return;
    }
    setIsSendingInvite(true);
    try {
      const res = await fetch("/api/contractor/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workerProfileId: inviteWorkerId,
          proposedRole: inviteRole,
          proposedDailyWage: inviteDailyWage ? Number(inviteDailyWage) : undefined,
          message: inviteMessage,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || "Failed to send invitation");
      }
      toast.success(
        "Workforce invitation dispatched! Worker must accept in their dashboard before joining the roster."
      );
      setShowInviteWorkerModal(false);
      setInviteWorkerId("");

      // Refresh invitations list
      const invRes = await fetch("/api/contractor/invitations");
      const invJson = await invRes.json();
      if (invJson.data) setInvitations(invJson.data);
    } catch (err: any) {
      toast.error(err.message || "Failed to send invitation");
    } finally {
      setIsSendingInvite(false);
    }
  };

  // Create project handler
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectTitle || !clientName) {
      toast.error("Project title and client name are required");
      return;
    }
    setIsCreatingProject(true);
    try {
      const res = await fetch("/api/contractor/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: projectTitle,
          clientName,
          location,
          budget: budget ? Number(budget) : undefined,
          startDate,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || "Failed to create project");
      }
      toast.success("Project created successfully");
      setShowNewProjectModal(false);
      setProjectTitle("");
      setClientName("");

      // Refresh dashboard data
      const refRes = await fetch("/api/contractor/organization");
      const refJson = await refRes.json();
      if (refRes.ok && refJson.data) {
        setData(refJson.data);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create project");
    } finally {
      setIsCreatingProject(false);
    }
  };

  const { organization, plan, workforce, projects } = data;
  const breakdown = calculateBillingBreakdown(selectedTier, selectedCycle);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Enterprise / Organization Header */}
      <div className="bg-card rounded-md border border-forest/15 p-6 md:p-8 shadow-sovereign-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-sm bg-forest-800 text-sand-300 flex items-center justify-center font-bold text-2xl shadow-inner">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-extrabold text-forest-950 font-serif">
                  {organization.company_name}
                </h1>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-forest-100 text-forest-800 border border-forest-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Contractor Enterprise
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-sand-100 text-sand-800 border border-sand-300 capitalize">
                  <Crown className="w-3.5 h-3.5 text-sand-600" />
                  {plan.name}
                </span>
              </div>
              <p className="text-sm text-forest-700/80 mt-1 flex items-center gap-4 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-forest-600" />
                  {organization.operating_city}, {organization.operating_state}
                </span>
                {organization.gstin && (
                  <span className="text-xs font-mono bg-ivory-100 px-2 py-0.5 rounded border border-sand-200">
                    GSTIN: {organization.gstin}
                  </span>
                )}
                <span className="text-xs uppercase font-medium text-forest-600">
                  {organization.business_type}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSelectedTier(organization.subscription_tier);
                setShowUpgradeModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-sand-400/30 hover:bg-sand-400/50 text-forest-950 border border-sand-400/50 transition-colors shadow-sm"
            >
              <CreditCard className="w-4 h-4 text-sand-700" />
              Manage Subscription
            </button>
            <button
              onClick={() => setShowNewProjectModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-forest-800 hover:bg-forest-900 text-sand-200 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              New Project
            </button>
          </div>
        </div>

        {/* Plan Quota Usage Bar */}
        <div className="mt-8 pt-6 border-t border-sand-100">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium text-forest-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-forest-600" />
              Workforce Roster Capacity:{" "}
              <strong className="text-forest-950 font-bold">
                {data.workforceCount} of {organization.max_roster_workers} active workers
              </strong>
            </span>
            <span className="text-xs font-semibold text-forest-700">
              {data.rosterUsagePercent}% Quota Utilized
            </span>
          </div>
          <div className="w-full bg-sand-100 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                data.rosterUsagePercent >= 90
                  ? "bg-terracotta-500"
                  : data.rosterUsagePercent >= 70
                  ? "bg-sand-500"
                  : "bg-forest-600"
              }`}
              style={{ width: `${Math.min(100, data.rosterUsagePercent)}%` }}
            />
          </div>
          {data.rosterUsagePercent >= 80 && (
            <p className="text-xs text-terracotta-700 mt-2 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              Approaching roster limit. Upgrade to Contractor Pro or Business for higher crew capacity.
            </p>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card p-6 rounded-md border border-forest/15 shadow-sovereign-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-sm bg-forest-50 text-forest-700 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-forest-950">{data.workforceCount}</div>
            <div className="text-xs font-medium text-forest-600 uppercase tracking-wider">
              Enrolled Workforce Roster
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-md border border-forest/15 shadow-sovereign-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-sm bg-sand-50 text-sand-800 flex items-center justify-center">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-forest-950">{data.activeProjectsCount}</div>
            <div className="text-xs font-medium text-forest-600 uppercase tracking-wider">
              Active Site Projects
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-md border border-forest/15 shadow-sovereign-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-sm bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-forest-950">0% Cut</div>
            <div className="text-xs font-medium text-forest-600 uppercase tracking-wider">
              Worker Wage Extraction (Zero Platform Cut)
            </div>
          </div>
        </div>
      </div>

      {/* Workforce Crew Roster Section */}
      <div className="bg-card rounded-md border border-forest/15 shadow-sovereign-sm overflow-hidden">
        <div className="p-6 border-b border-sand-100 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-lg font-bold text-forest-950">Workforce Crew Roster</h2>
            <p className="text-xs text-forest-600">
              Two-sided verified crew. Workers retain self-sovereign ownership of their skill cards and can leave at any time.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                toast.info("Generated PDF Compliance Dossier for active crew. Ready for DISCOM/PWD presentation.");
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-sand-100 hover:bg-sand-200 text-forest-900 border border-sand-300 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-sand-700" />
              Download Client Dossier (PDF)
            </button>
            <button
              onClick={() => setShowInviteWorkerModal(true)}
              disabled={data.workforceCount >= organization.max_roster_workers}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-forest-800 hover:bg-forest-900 disabled:opacity-50 text-sand-200 transition-colors shadow-sm"
            >
              <Mail className="w-3.5 h-3.5" />
              Invite Worker to Roster
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-ivory-50 text-forest-800 border-b border-sand-100 text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-6 font-semibold">Worker</th>
                <th className="py-3.5 px-6 font-semibold">Trade & City</th>
                <th className="py-3.5 px-6 font-semibold">KAAMSCORE</th>
                <th className="py-3.5 px-6 font-semibold">Assigned Role</th>
                <th className="py-3.5 px-6 font-semibold">Daily Wage</th>
                <th className="py-3.5 px-6 font-semibold">Status</th>
                <th className="py-3.5 px-6 font-semibold text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-100">
              {workforce.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-forest-600">
                    No workers currently on this roster. Click &ldquo;Invite Worker to Roster&rdquo; to send a secure invitation.
                  </td>
                </tr>
              ) : (
                workforce.map((member) => (
                  <tr key={member.id} className="hover:bg-ivory-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-forest-950">{member.worker.fullName}</div>
                      <div className="text-xs text-forest-600 font-mono">{member.worker.phoneMasked}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-forest-900">{member.worker.trade}</div>
                      <div className="text-xs text-forest-600">{member.worker.city}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-xs text-xs font-bold bg-forest-50 text-forest-800 border border-forest-200">
                        <ShieldCheck className="w-3 h-3 text-forest-700" />
                        {member.worker.kaamscore} pts (L{member.worker.kaamscoreLevel})
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-xs font-medium text-forest-800 bg-sand-50 border border-sand-200 px-2 py-0.5 rounded">
                        {member.project_role}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-medium text-forest-900">
                      ₹{member.daily_wage_rate || "Market"} / day
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Consent Active
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        href={`/profile/${member.worker.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-forest-700 hover:text-forest-950 underline underline-offset-2"
                      >
                        Skill Card
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending Workforce Invitations Section (Workstream B.2) */}
      {invitations.length > 0 && (
        <div className="bg-card rounded-md border border-forest/15 shadow-sovereign-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-forest-950 flex items-center gap-2">
                <Clock className="w-4 h-4 text-sand-600" />
                Pending Sent Invitations
              </h3>
              <p className="text-xs text-forest-600">
                Awaiting worker consent and acceptance before appearing on active roster.
              </p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sand-100 text-sand-800">
              {invitations.filter((i) => i.status === "pending").length} Pending
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-ivory-50 text-forest-800 border-b border-sand-100 uppercase">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Invited Worker</th>
                  <th className="py-2.5 px-4 font-semibold">Trade</th>
                  <th className="py-2.5 px-4 font-semibold">Proposed Role</th>
                  <th className="py-2.5 px-4 font-semibold">Offered Wage</th>
                  <th className="py-2.5 px-4 font-semibold">Status</th>
                  <th className="py-2.5 px-4 font-semibold">Sent Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-100">
                {invitations.map((inv) => (
                  <tr key={inv.id}>
                    <td className="py-3 px-4 font-semibold text-forest-950">{inv.workerName}</td>
                    <td className="py-3 px-4 text-forest-800">{inv.workerTrade}</td>
                    <td className="py-3 px-4 text-forest-700">{inv.proposed_role}</td>
                    <td className="py-3 px-4 font-medium text-forest-900">
                      ₹{inv.proposed_daily_wage || "Standard"} / day
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`capitalize px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          inv.status === "accepted"
                            ? "bg-emerald-100 text-emerald-800"
                            : inv.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-forest-600">
                      {new Date(inv.created_at).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Projects Section */}
      <div className="bg-card rounded-md border border-forest/15 shadow-sovereign-sm overflow-hidden">
        <div className="p-6 border-b border-sand-100 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-lg font-bold text-forest-950">Active Projects & Deployments</h2>
            <p className="text-xs text-forest-600">
              Site contracts, client billing milestones, and crew allocations.
            </p>
          </div>
          <button
            onClick={() => setShowNewProjectModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-sm text-xs font-semibold bg-forest-800 hover:bg-forest-900 text-sand-200 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            New Project
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-ivory-50 text-forest-800 border-b border-sand-100 text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-6 font-semibold">Project Title</th>
                <th className="py-3.5 px-6 font-semibold">Client</th>
                <th className="py-3.5 px-6 font-semibold">Location</th>
                <th className="py-3.5 px-6 font-semibold">Status</th>
                <th className="py-3.5 px-6 font-semibold">Budget</th>
                <th className="py-3.5 px-6 font-semibold">Timeline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-100">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-forest-600">
                    No active projects. Click &ldquo;New Project&rdquo; to schedule site work.
                  </td>
                </tr>
              ) : (
                projects.map((proj) => (
                  <tr key={proj.id} className="hover:bg-ivory-50/60 transition-colors">
                    <td className="py-4 px-6 font-semibold text-forest-950">{proj.title}</td>
                    <td className="py-4 px-6 text-forest-800">{proj.client_name}</td>
                    <td className="py-4 px-6 text-forest-700 text-xs">{proj.location}</td>
                    <td className="py-4 px-6">
                      <span className="capitalize px-2.5 py-0.5 rounded-full text-xs font-medium bg-forest-50 text-forest-800 border border-forest-200">
                        {proj.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-medium text-forest-900">
                      {proj.budget ? `₹${proj.budget.toLocaleString("en-IN")}` : "Unspecified"}
                    </td>
                    <td className="py-4 px-6 text-xs text-forest-600">
                      {proj.start_date} {proj.end_date ? `to ${proj.end_date}` : ""}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Controlled Paid Pilot Checkout Modal (Workstream A.3) */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 bg-forest-950/75 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card rounded-md max-w-4xl w-full p-4 sm:p-6 lg:p-8 shadow-sovereign-md border border-forest/20 space-y-6 max-h-[calc(100dvh-2rem)] overflow-y-auto my-auto">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold text-forest-950 font-serif">
                  Contractor Pro Commercial Subscription
                </h3>
                <p className="text-sm text-forest-700 mt-1">
                  Scale your operations with automated client compliance dossiers, multi-site crew management, and cryptographic record signing.
                </p>
              </div>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="text-forest-400 hover:text-forest-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Monthly vs Annual Toggle */}
            <div className="flex justify-center">
              <div className="bg-ivory-100 p-1 rounded-xl flex items-center gap-1 border border-sand-200">
                <button
                  type="button"
                  onClick={() => setSelectedCycle("monthly")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedCycle === "monthly"
                      ? "bg-forest-800 text-sand-200 shadow-sm"
                      : "text-forest-700 hover:text-forest-950"
                  }`}
                >
                  Monthly Billing
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCycle("annual")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    selectedCycle === "annual"
                      ? "bg-forest-800 text-sand-200 shadow-sm"
                      : "text-forest-700 hover:text-forest-950"
                  }`}
                >
                  Annual Billing
                  <span className="bg-terracotta-100 text-terracotta-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    SAVE 17% (2 MO FREE)
                  </span>
                </button>
              </div>
            </div>

            {/* Plan Tier Selector */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(["starter", "pro", "business"] as SubscriptionTier[]).map((tierKey) => {
                const p = PRICING_PLANS[tierKey];
                const isSelected = selectedTier === tierKey;
                const price = selectedCycle === "annual" ? p.priceAnnualInr : p.priceMonthlyInr;

                return (
                  <div
                    key={tierKey}
                    onClick={() => setSelectedTier(tierKey)}
                    className={`rounded-md p-5 border cursor-pointer transition-all ${
                      isSelected
                        ? "border-forest-700 bg-forest-50/60 ring-2 ring-forest-700 shadow-sm"
                        : "border-sand-200 bg-card hover:border-sand-400"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase font-bold text-forest-700">{p.name}</span>
                      {p.badge && (
                        <span className="text-[10px] bg-terracotta-100 text-terracotta-800 font-bold px-2 py-0.5 rounded-full">
                          {p.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-2xl font-extrabold text-forest-950 mt-2">
                      {price === 0 ? "Free" : `₹${price.toLocaleString("en-IN")}`}
                      {price > 0 && (
                        <span className="text-xs font-normal text-forest-600">
                          /{selectedCycle === "annual" ? "yr" : "mo"}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-forest-700 mt-1">
                      Up to <strong>{p.maxRosterWorkers} workers</strong>
                    </p>

                    <ul className="mt-4 space-y-2 text-xs text-forest-800">
                      {p.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-forest-600 shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            {/* Tax & Invoice Breakdown Table */}
            {selectedTier !== "starter" && (
              <div className="bg-card p-5 rounded-md border border-forest/15 space-y-3 text-xs">
                <div className="font-bold text-forest-950 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-forest-700" />
                  Tax Invoice Summary & Payment Breakdown
                </div>
                <div className="space-y-1.5 text-forest-800">
                  <div className="flex justify-between">
                    <span>Base Subscription ({PRICING_PLANS[selectedTier].name} - {selectedCycle}):</span>
                    <span>₹{breakdown.baseAmount.toLocaleString("en-IN")}</span>
                  </div>
                  {breakdown.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Annual Pre-Payment Discount (2 Months Free):</span>
                      <span>-₹{breakdown.discountAmount.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>GST (18% Goods & Services Tax):</span>
                    <span>₹{breakdown.gstAmount.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-sm text-forest-950 pt-2 border-t border-sand-200">
                    <span>Total Amount Payable:</span>
                    <span>₹{breakdown.totalAmount.toLocaleString("en-IN")}</span>
                  </div>
                </div>
                <p className="text-[11px] text-forest-600 italic">
                  {breakdown.renewalDescription}
                </p>
              </div>
            )}

            {/* Explicit Customer Consent Checkbox */}
            <div className="space-y-4 pt-2 border-t border-sand-100">
              <label className="flex items-start gap-3 text-xs text-forest-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={billingConsentAgreed}
                  onChange={(e) => setBillingConsentAgreed(e.target.checked)}
                  className="mt-0.5 rounded border-sand-400 text-forest-800 focus:ring-forest-600"
                />
                <span>
                  <strong>Explicit Commercial Consent:</strong> I confirm I am an authorized representative of{" "}
                  <strong>{organization.company_name}</strong>. I agree to the subscription terms and acknowledge that all worker skill cards remain strictly self-sovereign to individual workers. KAAMSETU will never tax or extract commission from worker earnings.
                </span>
              </label>

              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-forest-600 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  Server-verified cryptographic HMAC-SHA256 settlement
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowUpgradeModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-forest-700 hover:bg-ivory-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleProceedPayment}
                    disabled={isUpgrading || !billingConsentAgreed || selectedTier === "starter"}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-forest-800 hover:bg-forest-900 disabled:opacity-50 text-sand-200 transition-colors shadow-sm"
                  >
                    {isUpgrading ? "Verifying..." : `Authorize ₹${breakdown.totalAmount.toLocaleString("en-IN")}`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Two-Sided Worker Invitation Modal (Workstream B.2) */}
      {showInviteWorkerModal && (
        <div className="fixed inset-0 z-50 bg-forest-950/75 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card rounded-md max-w-md w-full p-4 sm:p-6 shadow-sovereign-md border border-forest/20 space-y-4 max-h-[calc(100dvh-2rem)] overflow-y-auto my-auto">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-forest-950">Send Workforce Crew Invitation</h3>
                <p className="text-xs text-forest-600">
                  Workers must review and consent before appearing on your organization roster.
                </p>
              </div>
              <button
                onClick={() => setShowInviteWorkerModal(false)}
                className="text-forest-400 hover:text-forest-700 text-xl font-bold"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSendInvitation} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-forest-800 mb-1">
                  Worker Profile ID / Registry UUID
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 55555555-5555-5555-5555-555555550001"
                  value={inviteWorkerId}
                  onChange={(e) => setInviteWorkerId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-forest-600 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-forest-800 mb-1">
                  Offered Enterprise Role
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lead Solar Electrician, Shuttering Lead"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-forest-600 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-forest-800 mb-1">
                  Proposed Daily Wage (₹)
                </label>
                <input
                  type="number"
                  placeholder="1500"
                  value={inviteDailyWage}
                  onChange={(e) => setInviteDailyWage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-forest-600 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-forest-800 mb-1">
                  Invitation Message to Worker
                </label>
                <textarea
                  rows={2}
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-forest-600 text-xs"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInviteWorkerModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-forest-700 hover:bg-ivory-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingInvite}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-forest-800 hover:bg-forest-900 text-sand-200"
                >
                  {isSendingInvite ? "Sending..." : "Send Invitation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 z-50 bg-forest-950/75 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card rounded-md max-w-md w-full p-4 sm:p-6 shadow-sovereign-md border border-forest/20 space-y-4 max-h-[calc(100dvh-2rem)] overflow-y-auto my-auto">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-bold text-forest-950">Create New Project</h3>
              <button
                onClick={() => setShowNewProjectModal(false)}
                className="text-forest-400 hover:text-forest-700 text-xl font-bold"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateProject} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-forest-800 mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Guwahati Smart City Solar Substation"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-forest-600 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-forest-800 mb-1">
                  Client / Government Department
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Assam PWD / APDCL"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-forest-600 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-forest-800 mb-1">
                  Site Location
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Paltan Bazaar, Guwahati"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-forest-600 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-forest-800 mb-1">
                    Budget (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="250000"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-forest-600 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-forest-800 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-forest-600 text-xs"
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewProjectModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-forest-700 hover:bg-ivory-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingProject}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-forest-800 hover:bg-forest-900 text-sand-200"
                >
                  {isCreatingProject ? "Creating..." : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
