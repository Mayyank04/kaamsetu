"use client";

import * as React from "react";
import Link from "next/link";
import {
  WorkerDashboardData,
  DashboardSkill,
  DashboardPortfolioItem,
  DashboardBooking,
  DashboardWorkerProfile,
} from "@/types/dashboard";
import { AvailabilityState } from "@/types/database.types";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { AnalyticsOverview } from "@/components/dashboard/analytics-overview";
import { IdentityWidget } from "@/components/dashboard/identity-widget";
import { SkillsManager } from "@/components/dashboard/skills-manager";
import { PortfolioManager } from "@/components/dashboard/portfolio-manager";
import { JobRequests } from "@/components/dashboard/job-requests";
import { AvailabilitySettings } from "@/components/dashboard/availability-settings";
import { WorkHistoryView } from "@/components/dashboard/work-history-view";
import { ReviewsView } from "@/components/dashboard/reviews-view";
import { ProfileEditorModal } from "@/components/dashboard/profile-editor-modal";
import {
  LayoutDashboard,
  User,
  Award,
  Briefcase,
  CalendarCheck,
  Layers,
  ShieldCheck,
  TrendingUp,
  Bell,
  Settings,
  Mail,
  Building2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Star,
  FileText,
  HelpCircle,
  ChevronRight,
  ExternalLink,
  Edit3,
  MapPin,
  Phone,
  ArrowRight,
  Check,
  X as XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth/use-auth";

export type WorkerDashboardTab =
  | "dashboard"
  | "profile"
  | "skills"
  | "opportunities"
  | "bookings"
  | "portfolio"
  | "credentials"
  | "earnings"
  | "notifications"
  | "settings";

interface WorkerDashboardContainerProps {
  initialData: WorkerDashboardData;
}

export function WorkerDashboardContainer({
  initialData,
}: WorkerDashboardContainerProps) {
  const { logout } = useAuth();
  const [data, setData] = React.useState<WorkerDashboardData>(initialData);
  const [activeTab, setActiveTab] = React.useState<WorkerDashboardTab>("dashboard");
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isPublishing, setIsPublishing] = React.useState(false);
  const [pendingInvitations, setPendingInvitations] = React.useState<any[]>([]);

  React.useEffect(() => {
    fetch("/api/worker/invitations")
      .then((res) => res.json())
      .then((res) => {
        if (res.data) setPendingInvitations(res.data);
      })
      .catch(() => {});
  }, []);

  const handleRespondInvitation = async (invitationId: string, action: "accept" | "reject") => {
    try {
      const res = await fetch(`/api/worker/invitations/${invitationId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed to respond");

      toast.success(json.meta?.message || "Response recorded");
      setPendingInvitations((prev) => prev.filter((i) => i.id !== invitationId));
    } catch (err: any) {
      toast.error(err.message || "Failed to process invitation");
    }
  };

  // Toggle publish / unpublish
  const handleTogglePublish = async (newStatus: boolean) => {
    setIsPublishing(true);
    try {
      const res = await fetch("/api/worker/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: data.profile.id,
          is_published: newStatus,
        }),
      });

      if (res.ok) {
        setData((prev) => ({
          ...prev,
          profile: {
            ...prev.profile,
            isPublished: newStatus,
          },
        }));
        toast.success(newStatus ? "Profile is now visible publicly" : "Profile set to private draft mode");
      }
    } catch (err) {
      console.error("Failed to toggle publish status:", err);
      toast.error("Failed to update visibility status");
    } finally {
      setIsPublishing(false);
    }
  };

  // Update availability and radius
  const handleUpdateAvailability = async (
    status: AvailabilityState,
    radiusKm: number
  ) => {
    try {
      const res = await fetch("/api/worker/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: data.profile.id,
          availability_status: status,
          service_radius_km: radiusKm,
        }),
      });

      if (res.ok) {
        setData((prev) => ({
          ...prev,
          profile: {
            ...prev.profile,
            availabilityStatus: status,
            serviceRadiusKm: radiusKm,
          },
        }));
        toast.success("Availability preferences updated");
      }
    } catch (err) {
      console.error("Failed to update availability:", err);
      toast.error("Failed to save availability");
    }
  };

  // Save profile updates from modal
  const handleSaveProfile = async (
    updates: Partial<DashboardWorkerProfile>
  ) => {
    const res = await fetch("/api/worker/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: data.profile.id,
        headline: updates.headline,
        bio: updates.bio,
        years_experience: updates.yearsExperience,
        daily_rate_min: updates.dailyRateMin,
        daily_rate_max: updates.dailyRateMax,
        city: updates.city,
        state: updates.state,
        service_radius_km: updates.serviceRadiusKm,
      }),
    });

    if (res.ok) {
      setData((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          ...updates,
        },
      }));
      toast.success("Profile updated successfully");
    } else {
      toast.error("Failed to save profile changes");
    }
  };

  // Add self-declared skill
  const handleAddSkill = async (
    name: string,
    category: string,
    years: number
  ) => {
    const newSkill: DashboardSkill = {
      id: `sk-decl-${Date.now()}`,
      name,
      category,
      isPrimary: false,
      verificationType: "self_declared",
      yearsPracticed: years,
      declaredAt: new Date().toISOString().split("T")[0],
    };

    setData((prev) => ({
      ...prev,
      skills: [...prev.skills, newSkill],
    }));
    toast.success(`Skill "${name}" added to profile`);
  };

  // Remove skill
  const handleRemoveSkill = async (skillId: string) => {
    setData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s.id !== skillId),
    }));
    toast.success("Skill removed from profile");
  };

  // Add portfolio project
  const handleAddPortfolioItem = async (item: {
    title: string;
    description: string;
    imageUrl: string;
    category: string;
    projectDate: string;
    clientTestimony: string;
  }) => {
    const res = await fetch("/api/worker/portfolio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        worker_profile_id: data.profile.id,
        title: item.title,
        description: item.description,
        image_url: item.imageUrl,
        category: item.category,
        project_date: item.projectDate,
        client_testimony: item.clientTestimony,
      }),
    });

    const json = await res.json();
    const newPortItem: DashboardPortfolioItem = {
      id: json.data?.id || `port-${Date.now()}`,
      workerProfileId: data.profile.id,
      title: item.title,
      description: item.description,
      imageUrl: item.imageUrl,
      category: item.category,
      projectDate: item.projectDate,
      clientTestimony: item.clientTestimony,
      createdAt: new Date().toISOString(),
    };

    setData((prev) => ({
      ...prev,
      portfolio: [newPortItem, ...prev.portfolio],
    }));
    toast.success("Portfolio project added");
  };

  // Delete portfolio project
  const handleDeletePortfolioItem = async (id: string) => {
    await fetch(`/api/worker/portfolio?id=${id}`, {
      method: "DELETE",
    });

    setData((prev) => ({
      ...prev,
      portfolio: prev.portfolio.filter((p) => p.id !== id),
    }));
    toast.success("Portfolio project deleted");
  };

  // Update booking status
  const handleUpdateBookingStatus = async (
    bookingId: string,
    status: "confirmed" | "completed" | "cancelled"
  ) => {
    await fetch(`/api/worker/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    setData((prev) => ({
      ...prev,
      bookings: prev.bookings.map((b) =>
        b.id === bookingId ? { ...b, status } : b
      ),
    }));
    toast.success(`Booking marked as ${status}`);
  };

  // Full 10-section navigation menu per Phase 43 UX specifications
  const navTabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "profile", label: "My Profile", icon: User },
    { id: "skills", label: `My Skills (${data.skills.length})`, icon: Award },
    { id: "opportunities", label: `Work Opportunities (${pendingInvitations.length})`, icon: Briefcase },
    { id: "bookings", label: `Bookings (${data.bookings.length})`, icon: CalendarCheck },
    { id: "portfolio", label: `Portfolio (${data.portfolio.length})`, icon: Layers },
    { id: "credentials", label: "Credentials & Trust", icon: ShieldCheck },
    { id: "earnings", label: "Earnings & Payouts", icon: TrendingUp },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "settings", label: "Help & Settings", icon: Settings },
  ] as const;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Header with Welcome, Publish Switch & Completion Meter */}
      <DashboardHeader
        profile={data.profile}
        completionPercentage={data.analytics.completionPercentage}
        completionTasks={data.analytics.completionTasks}
        onTogglePublish={handleTogglePublish}
        onOpenEditModal={() => setIsEditModalOpen(true)}
        isPublishing={isPublishing}
      />

      {/* 2. Key Analytics Metrics Bar */}
      <AnalyticsOverview
        analytics={data.analytics}
        profile={data.profile}
      />

      {/* 3. 10-Section Navigation Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-forest/15">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as WorkerDashboardTab)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xs font-semibold text-xs whitespace-nowrap transition-all border ${
                isActive
                  ? "bg-forest text-ivory border-forest shadow-xs font-bold"
                  : "bg-card text-charcoal-muted border-forest/10 hover:text-forest hover:bg-forest/5 hover:border-forest/20"
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Active Tab Content Panels */}
      <div className="space-y-8">
        {/* =========================================================================
            PANEL 1: DASHBOARD OVERVIEW
           ========================================================================= */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* Quick Next Steps Card */}
            <div className="rounded-md border border-forest/15 bg-card p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-forest/10 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-forest" />
                  <h2 className="font-bold text-forest text-base">Recommended Next Steps</h2>
                </div>
                <span className="text-xs text-charcoal-muted">
                  Profile {data.analytics.completionPercentage}% Complete
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xs border border-forest/10 bg-ivory space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-forest uppercase tracking-wider">Step 1</span>
                    {data.skills.length >= 3 ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <span className="text-[10px] text-amber-700 font-semibold">Recommended</span>
                    )}
                  </div>
                  <h3 className="font-bold text-forest text-sm">Add Specialized Skills</h3>
                  <p className="text-xs text-charcoal-muted">
                    List tools and sub-trades you practice to improve customer search visibility.
                  </p>
                  <button
                    onClick={() => setActiveTab("skills")}
                    className="text-xs font-bold text-forest hover:underline inline-flex items-center pt-1"
                  >
                    Manage Skills <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                  </button>
                </div>

                <div className="p-4 rounded-xs border border-forest/10 bg-ivory space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-forest uppercase tracking-wider">Step 2</span>
                    {data.portfolio.length > 0 ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <span className="text-[10px] text-amber-700 font-semibold">Pending</span>
                    )}
                  </div>
                  <h3 className="font-bold text-forest text-sm">Showcase Work Photos</h3>
                  <p className="text-xs text-charcoal-muted">
                    Upload photos of completed projects to give clients tangible proof of craftsmanship.
                  </p>
                  <button
                    onClick={() => setActiveTab("portfolio")}
                    className="text-xs font-bold text-forest hover:underline inline-flex items-center pt-1"
                  >
                    Add Portfolio <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                  </button>
                </div>

                <div className="p-4 rounded-xs border border-forest/10 bg-ivory space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-forest uppercase tracking-wider">Step 3</span>
                    <span className="text-[10px] text-forest font-semibold">Active</span>
                  </div>
                  <h3 className="font-bold text-forest text-sm">Review Opportunities</h3>
                  <p className="text-xs text-charcoal-muted">
                    Browse open contractor requests and incoming project inquiries in your area.
                  </p>
                  <button
                    onClick={() => setActiveTab("opportunities")}
                    className="text-xs font-bold text-forest hover:underline inline-flex items-center pt-1"
                  >
                    View Open Jobs <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Split Row: Identity Widget & Availability */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <IdentityWidget profile={data.profile} />
              <AvailabilitySettings
                currentStatus={data.profile.availabilityStatus}
                serviceRadiusKm={data.profile.serviceRadiusKm}
                city={data.profile.city}
                state={data.profile.state}
                onUpdateAvailability={handleUpdateAvailability}
              />
            </div>
          </div>
        )}

        {/* =========================================================================
            PANEL 2: MY PROFILE
           ========================================================================= */}
        {activeTab === "profile" && (
          <div className="rounded-md border border-forest/15 bg-card p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-forest/10 pb-4">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-forest">
                  Worker Profile Details
                </h2>
                <p className="text-xs text-charcoal-muted mt-0.5">
                  Information visible to customers and contractors on the public directory.
                </p>
              </div>
              <Button
                variant="default"
                size="sm"
                onClick={() => setIsEditModalOpen(true)}
                className="bg-forest text-ivory hover:bg-forest-600 text-xs shrink-0"
              >
                <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                Edit Profile Information
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-charcoal-muted uppercase tracking-wider block">Full Name</span>
                  <span className="text-base font-bold text-forest">{data.profile.fullName}</span>
                </div>
                <div>
                  <span className="text-xs text-charcoal-muted uppercase tracking-wider block">Primary Trade</span>
                  <span className="text-base font-bold text-forest">{data.profile.occupation}</span>
                </div>
                <div>
                  <span className="text-xs text-charcoal-muted uppercase tracking-wider block">Professional Headline</span>
                  <p className="text-sm text-charcoal mt-0.5">{data.profile.headline || "Not provided yet"}</p>
                </div>
                <div>
                  <span className="text-xs text-charcoal-muted uppercase tracking-wider block">Work Bio</span>
                  <p className="text-sm text-charcoal leading-relaxed mt-0.5 whitespace-pre-wrap">
                    {data.profile.bio || "No professional bio written yet. Add a brief summary of your craft."}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-xs text-charcoal-muted uppercase tracking-wider block">Operating Location</span>
                  <span className="text-base font-bold text-forest flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-4 h-4 text-forest" />
                    {data.profile.city}, {data.profile.state} (PIN {data.profile.pincode})
                  </span>
                </div>
                <div>
                  <span className="text-xs text-charcoal-muted uppercase tracking-wider block">Years of Practical Experience</span>
                  <span className="text-base font-bold text-forest">{data.profile.yearsExperience} Years</span>
                </div>
                <div>
                  <span className="text-xs text-charcoal-muted uppercase tracking-wider block">Daily Wage Bracket</span>
                  <span className="text-base font-bold text-forest">
                    ₹{data.profile.dailyRateMin} – ₹{data.profile.dailyRateMax} / day
                  </span>
                </div>
                <div>
                  <span className="text-xs text-charcoal-muted uppercase tracking-wider block">Service Radius</span>
                  <span className="text-sm text-charcoal font-medium">Up to {data.profile.serviceRadiusKm} km</span>
                </div>
                <div>
                  <span className="text-xs text-charcoal-muted uppercase tracking-wider block">Public Profile Link</span>
                  <Link
                    href={`/profile/${data.profile.slug}`}
                    target="_blank"
                    className="text-xs text-forest hover:underline font-bold inline-flex items-center gap-1 mt-0.5"
                  >
                    View Public Profile <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            PANEL 3: MY SKILLS
           ========================================================================= */}
        {activeTab === "skills" && (
          <SkillsManager
            skills={data.skills}
            onAddSkill={handleAddSkill}
            onRemoveSkill={handleRemoveSkill}
          />
        )}

        {/* =========================================================================
            PANEL 4: WORK OPPORTUNITIES
           ========================================================================= */}
        {activeTab === "opportunities" && (
          <div className="space-y-6">
            {pendingInvitations.length > 0 ? (
              <div className="bg-card border border-forest/15 rounded-md p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-forest/10 pb-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-forest" />
                    <h2 className="font-bold text-forest text-base">
                      Incoming Enterprise Crew Invitations ({pendingInvitations.length})
                    </h2>
                  </div>
                  <span className="text-[11px] bg-forest text-sand px-2.5 py-0.5 rounded-full font-bold">
                    Explicit Worker Consent Required
                  </span>
                </div>

                <div className="space-y-3">
                  {pendingInvitations.map((inv) => (
                    <div
                      key={inv.id}
                      className="bg-ivory border border-forest/10 p-4 rounded-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="font-bold text-forest text-sm flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-forest/70" />
                          {inv.organizationName} ({inv.organizationCity})
                        </div>
                        <div className="text-xs text-charcoal mt-1">
                          Role: <strong className="font-semibold text-forest">{inv.proposed_role}</strong> • Offered Daily Wage:{" "}
                          <strong className="text-forest font-semibold">₹{inv.proposed_daily_wage || "Standard"} / day</strong>
                        </div>
                        {inv.message && (
                          <p className="text-xs text-charcoal-muted mt-1 italic">&ldquo;{inv.message}&rdquo;</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleRespondInvitation(inv.id, "reject")}
                          className="px-3.5 py-2 rounded-xs border border-forest/20 text-xs font-semibold text-charcoal hover:bg-forest/5"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleRespondInvitation(inv.id, "accept")}
                          className="px-4 py-2 rounded-xs bg-forest text-sand text-xs font-bold hover:bg-forest-600 shadow-xs"
                        >
                          Accept & Join Crew
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-md border border-forest/15 bg-card p-8 text-center space-y-3">
                <Briefcase className="w-8 h-8 text-forest/40 mx-auto" />
                <h3 className="font-bold text-forest text-base">No Open Crew Invitations Right Now</h3>
                <p className="text-xs text-charcoal-muted max-w-md mx-auto leading-relaxed">
                  When local contractors, architects, or construction project supervisors match your trade in {data.profile.city}, invitations will appear here for your review and consent.
                </p>
                <div className="pt-2">
                  <Button variant="outline" asChild size="sm" className="border-forest/20 text-forest text-xs">
                    <Link href="/explore">Browse Directory Listings</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            PANEL 5: BOOKINGS & INQUIRIES
           ========================================================================= */}
        {activeTab === "bookings" && (
          <JobRequests
            bookings={data.bookings}
            onUpdateStatus={handleUpdateBookingStatus}
          />
        )}

        {/* =========================================================================
            PANEL 6: PORTFOLIO
           ========================================================================= */}
        {activeTab === "portfolio" && (
          <PortfolioManager
            portfolio={data.portfolio}
            workerProfileId={data.profile.id}
            onAddPortfolioItem={handleAddPortfolioItem}
            onDeletePortfolioItem={handleDeletePortfolioItem}
          />
        )}

        {/* =========================================================================
            PANEL 7: CREDENTIALS & TRUST
           ========================================================================= */}
        {activeTab === "credentials" && (
          <div className="space-y-8">
            <IdentityWidget profile={data.profile} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <WorkHistoryView workRecords={data.workRecords} />
              <ReviewsView reviews={data.reviews} />
            </div>
          </div>
        )}

        {/* =========================================================================
            PANEL 8: EARNINGS & PAYMENT HISTORY
           ========================================================================= */}
        {activeTab === "earnings" && (
          <div className="rounded-md border border-forest/15 bg-card p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-forest/10 pb-4">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-forest">
                  Earnings & Settlement Ledger
                </h2>
                <p className="text-xs text-charcoal-muted mt-0.5">
                  100% of customer payments belong to the working artisan. Permanent zero platform commission.
                </p>
              </div>
              <Badge variant="outline" className="bg-sand/30 text-sand-800 border-sand/40 text-xs font-mono font-bold self-start sm:self-center">
                COMMISSION = ₹0.00
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xs border border-forest/10 bg-ivory space-y-1">
                <span className="text-[11px] text-charcoal-muted uppercase tracking-wider block">Estimated Gross Earnings</span>
                <span className="text-2xl font-black text-forest font-serif">₹0.00</span>
                <span className="text-[10px] text-charcoal-muted block">Direct customer settlements</span>
              </div>
              <div className="p-4 rounded-xs border border-forest/10 bg-ivory space-y-1">
                <span className="text-[11px] text-charcoal-muted uppercase tracking-wider block">Platform Commission Fee</span>
                <span className="text-2xl font-black text-forest font-serif">₹0.00</span>
                <span className="text-[10px] text-emerald-700 font-bold block">Permanent Invariant: 0.00%</span>
              </div>
              <div className="p-4 rounded-xs border border-forest/10 bg-ivory space-y-1">
                <span className="text-[11px] text-charcoal-muted uppercase tracking-wider block">Payout Settlement Channel</span>
                <span className="text-lg font-bold text-forest block">Direct UPI / Bank</span>
                <span className="text-[10px] text-charcoal-muted block">Direct bank account transfer</span>
              </div>
            </div>

            <div className="rounded-xs border border-forest/10 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-forest/5 text-forest font-bold border-b border-forest/10">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Service / Project</th>
                    <th className="p-3">Client / Contractor</th>
                    <th className="p-3">Gross Payment</th>
                    <th className="p-3">Platform Fee</th>
                    <th className="p-3">Net Disbursed</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-forest/5">
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-charcoal-muted">
                      No customer payment transactions recorded yet. Completed bookings will appear here with full audit receipts.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================================
            PANEL 9: NOTIFICATIONS & MESSAGES
           ========================================================================= */}
        {activeTab === "notifications" && (
          <div className="rounded-md border border-forest/15 bg-card p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="border-b border-forest/10 pb-4">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-forest">
                Notifications & Account Activity
              </h2>
              <p className="text-xs text-charcoal-muted mt-0.5">
                Updates regarding your skill profile, booking inquiries, and verification status.
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-xs border border-forest/10 bg-ivory flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-forest shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-forest text-xs">Digital Work Profile Active</h3>
                  <p className="text-xs text-charcoal-muted mt-0.5">
                    Your profile is saved under registry ID <code className="font-mono bg-forest/5 px-1 py-0.5 rounded">{data.profile.registryId}</code>.
                  </p>
                  <span className="text-[10px] text-charcoal-muted mt-1 block">Account Milestone</span>
                </div>
              </div>

              <div className="p-4 rounded-xs border border-forest/10 bg-ivory flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-forest shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-forest text-xs">Nationwide Discovery Enabled</h3>
                  <p className="text-xs text-charcoal-muted mt-0.5">
                    Your trade listing is discoverable by customers across all 36 Indian States and Union Territories.
                  </p>
                  <span className="text-[10px] text-charcoal-muted mt-1 block">System Notification</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            PANEL 10: HELP & SETTINGS
           ========================================================================= */}
        {activeTab === "settings" && (
          <div className="space-y-8">
            <div className="rounded-md border border-forest/15 bg-card p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="border-b border-forest/10 pb-4">
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-forest">
                  Account Settings & Availability
                </h2>
                <p className="text-xs text-charcoal-muted mt-0.5">
                  Manage your working status, notification preferences, and account credentials.
                </p>
              </div>

              <AvailabilitySettings
                currentStatus={data.profile.availabilityStatus}
                serviceRadiusKm={data.profile.serviceRadiusKm}
                city={data.profile.city}
                state={data.profile.state}
                onUpdateAvailability={handleUpdateAvailability}
              />

              <div className="pt-6 border-t border-forest/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-forest text-sm">Need Help or Wish to Report a Grievance?</h3>
                  <p className="text-xs text-charcoal-muted mt-0.5">
                    Our support desk assists workers with profile updates, disputes, and payment inquiries.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" asChild className="border-forest/20 text-forest text-xs">
                    <Link href="/about">Support Channels</Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={logout}
                    className="border-red-200 text-red-700 hover:bg-red-50 text-xs"
                  >
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      <ProfileEditorModal
        profile={data.profile}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveProfile}
      />
    </div>
  );
}
