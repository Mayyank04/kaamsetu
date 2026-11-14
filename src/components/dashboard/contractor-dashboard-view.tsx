"use client";

import React, { useState } from "react";
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
  ExternalLink,
  ChevronRight,
  TrendingUp,
  MapPin,
  Clock,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import {
  ContractorDashboardData,
  CONTRACTOR_PLANS,
  SubscriptionTier,
} from "@/types/contractor";

interface ContractorDashboardViewProps {
  initialData: ContractorDashboardData;
}

export function ContractorDashboardView({ initialData }: ContractorDashboardViewProps) {
  const [data, setData] = useState<ContractorDashboardData>(initialData);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionTier>(data.organization.subscription_tier);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showAddWorkerModal, setShowAddWorkerModal] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);

  // New Worker Form
  const [workerProfileId, setWorkerProfileId] = useState("");
  const [projectRole, setProjectRole] = useState("Crew Specialist");
  const [dailyWage, setDailyWage] = useState("1500");
  const [isAddingWorker, setIsAddingWorker] = useState(false);

  // New Project Form
  const [projectTitle, setProjectTitle] = useState("");
  const [clientName, setClientName] = useState("");
  const [location, setLocation] = useState("Guwahati, Assam");
  const [budget, setBudget] = useState("250000");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  // Subscription upgrade handler
  const handleUpgrade = async (tier: SubscriptionTier) => {
    setIsUpgrading(true);
    try {
      const res = await fetch("/api/contractor/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || "Failed to upgrade subscription");
      }
      toast.success(json.meta?.message || `Upgraded to ${CONTRACTOR_PLANS[tier].name}`);
      setData((prev) => ({
        ...prev,
        organization: json.data.organization,
        plan: json.data.plan,
        rosterUsagePercent: Math.min(
          100,
          Math.round((prev.workforceCount / json.data.organization.max_roster_workers) * 100)
        ),
      }));
      setShowUpgradeModal(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update subscription");
    } finally {
      setIsUpgrading(false);
    }
  };

  // Add worker handler
  const handleAddWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workerProfileId) {
      toast.error("Please provide a Worker Profile ID");
      return;
    }
    setIsAddingWorker(true);
    try {
      const res = await fetch("/api/contractor/workforce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workerProfileId,
          projectRole,
          dailyWageRate: dailyWage ? Number(dailyWage) : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || "Failed to add worker");
      }
      toast.success("Worker successfully added to workforce roster");
      setShowAddWorkerModal(false);
      setWorkerProfileId("");
      // Refresh dashboard
      const refRes = await fetch("/api/contractor/organization");
      const refJson = await refRes.json();
      if (refRes.ok && refJson.data) {
        setData(refJson.data);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to add worker");
    } finally {
      setIsAddingWorker(false);
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
      // Refresh dashboard
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Enterprise / Organization Header */}
      <div className="bg-white rounded-2xl border border-sand-200/60 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-forest-800 text-sand-300 flex items-center justify-center font-bold text-2xl shadow-inner">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-extrabold text-forest-950 font-serif">
                  {organization.company_name}
                </h1>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-forest-100 text-forest-800 border border-forest-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Contractor
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
              onClick={() => setShowUpgradeModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-sand-400/30 hover:bg-sand-400/50 text-forest-950 border border-sand-400/50 transition-colors shadow-sm"
            >
              <Crown className="w-4 h-4 text-sand-700" />
              Manage Plan
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
              Approaching roster limit. Upgrade to Contractor Pro or Business for higher capacity.
            </p>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-sand-200/60 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-forest-50 text-forest-700 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-forest-950">{data.workforceCount}</div>
            <div className="text-xs font-medium text-forest-600 uppercase tracking-wider">
              Enrolled Workforce Roster
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-sand-200/60 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sand-50 text-sand-800 flex items-center justify-center">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-forest-950">{data.activeProjectsCount}</div>
            <div className="text-xs font-medium text-forest-600 uppercase tracking-wider">
              Active Enterprise Projects
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-sand-200/60 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
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

      {/* Workforce Roster Section */}
      <div className="bg-white rounded-2xl border border-sand-200/60 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-sand-100 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-lg font-bold text-forest-950">Workforce Crew Roster</h2>
            <p className="text-xs text-forest-600">
              Verified skilled workers under your organization. Identity & credentials remain self-sovereign to the worker.
            </p>
          </div>
          <button
            onClick={() => setShowAddWorkerModal(true)}
            disabled={data.workforceCount >= organization.max_roster_workers}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-forest-800 hover:bg-forest-900 disabled:opacity-50 text-sand-200 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Worker to Roster
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-ivory-50 text-forest-800 border-b border-sand-100 text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-6 font-semibold">Worker</th>
                <th className="py-3.5 px-6 font-semibold">Trade & City</th>
                <th className="py-3.5 px-6 font-semibold">KAAMSCORE</th>
                <th className="py-3.5 px-6 font-semibold">Organization Role</th>
                <th className="py-3.5 px-6 font-semibold">Daily Wage</th>
                <th className="py-3.5 px-6 font-semibold">Verification</th>
                <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-100">
              {workforce.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-forest-600">
                    No workers currently on this roster. Click &ldquo;Add Worker to Roster&rdquo; to build your crew.
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
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-forest-50 text-forest-800 border border-forest-200">
                        <Sparkles className="w-3 h-3 text-sand-600" />
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
                      <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        Verified
                      </div>
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

      {/* Projects Section */}
      <div className="bg-white rounded-2xl border border-sand-200/60 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-sand-100 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-lg font-bold text-forest-950">Active Projects & Deployments</h2>
            <p className="text-xs text-forest-600">
              Track project milestones and allocation of verified crew members across sites.
            </p>
          </div>
          <button
            onClick={() => setShowNewProjectModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-forest-800 hover:bg-forest-900 text-sand-200 transition-colors shadow-sm"
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

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-8 shadow-2xl border border-sand-300 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold text-forest-950 font-serif">
                  Select Contractor SaaS Tier
                </h3>
                <p className="text-sm text-forest-700 mt-1">
                  Scale your operations with dedicated workforce rosters, compliance dossiers, and multi-supervisor access.
                </p>
              </div>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="text-forest-400 hover:text-forest-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(["starter", "pro", "business"] as SubscriptionTier[]).map((tierKey) => {
                const p = CONTRACTOR_PLANS[tierKey];
                const isCurrent = organization.subscription_tier === tierKey;
                return (
                  <div
                    key={tierKey}
                    className={`rounded-2xl p-5 border flex flex-col justify-between transition-all ${
                      isCurrent
                        ? "border-forest-700 bg-forest-50/50 ring-2 ring-forest-700"
                        : "border-sand-200 bg-white hover:border-sand-400"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs uppercase font-bold text-forest-700">
                          {p.tier}
                        </span>
                        {p.recommended && (
                          <span className="text-[10px] bg-terracotta-100 text-terracotta-800 font-bold px-2 py-0.5 rounded-full">
                            POPULAR
                          </span>
                        )}
                      </div>
                      <div className="text-xl font-extrabold text-forest-950 mt-2">
                        {p.priceMonthlyInr === 0 ? "Free" : `₹${p.priceMonthlyInr}`}
                        {p.priceMonthlyInr > 0 && <span className="text-xs font-normal">/mo</span>}
                      </div>
                      <p className="text-xs text-forest-600 mt-1">
                        Up to <strong>{p.maxRosterWorkers} workers</strong>
                      </p>

                      <ul className="mt-4 space-y-2 text-xs text-forest-800">
                        {p.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-forest-600 shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => handleUpgrade(tierKey)}
                      disabled={isCurrent || isUpgrading}
                      className={`w-full mt-6 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                        isCurrent
                          ? "bg-forest-100 text-forest-700 cursor-default"
                          : "bg-forest-800 hover:bg-forest-900 text-sand-200 shadow-sm"
                      }`}
                    >
                      {isCurrent ? "Current Plan" : `Select ${p.name}`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Add Worker Modal */}
      {showAddWorkerModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-sand-300 space-y-4">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-bold text-forest-950">Add Worker to Roster</h3>
              <button
                onClick={() => setShowAddWorkerModal(false)}
                className="text-forest-400 hover:text-forest-700 text-xl font-bold"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddWorker} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-forest-800 mb-1">
                  Worker Profile ID / Registry UUID
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 55555555-5555-5555-5555-555555550001"
                  value={workerProfileId}
                  onChange={(e) => setWorkerProfileId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-forest-600 text-xs font-mono"
                />
                <p className="text-[11px] text-forest-600 mt-1">
                  Workers retain sovereign ownership of their profiles. Contractors cannot alter personal credentials.
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-forest-800 mb-1">
                  Enterprise Project Role
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lead Solar Electrician, Shuttering Lead"
                  value={projectRole}
                  onChange={(e) => setProjectRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-forest-600 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-forest-800 mb-1">
                  Daily Wage Rate (₹)
                </label>
                <input
                  type="number"
                  placeholder="1500"
                  value={dailyWage}
                  onChange={(e) => setDailyWage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-forest-600 text-xs"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddWorkerModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-forest-700 hover:bg-ivory-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingWorker}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-forest-800 hover:bg-forest-900 text-sand-200"
                >
                  {isAddingWorker ? "Adding..." : "Add to Roster"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-sand-300 space-y-4">
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
