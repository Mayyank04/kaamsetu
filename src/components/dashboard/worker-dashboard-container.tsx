"use client";

import * as React from "react";
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
  ShieldCheck,
  Award,
  Briefcase,
  Layers,
  Clock,
  Star,
  FileText,
} from "lucide-react";

interface WorkerDashboardContainerProps {
  initialData: WorkerDashboardData;
}

export function WorkerDashboardContainer({
  initialData,
}: WorkerDashboardContainerProps) {
  const [data, setData] = React.useState<WorkerDashboardData>(initialData);
  const [activeTab, setActiveTab] = React.useState<
    "overview" | "skills" | "portfolio" | "bookings" | "history" | "reviews"
  >("overview");
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isPublishing, setIsPublishing] = React.useState(false);

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
      }
    } catch (err) {
      console.error("Failed to toggle publish status:", err);
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
      }
    } catch (err) {
      console.error("Failed to update availability:", err);
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
  };

  // Remove skill
  const handleRemoveSkill = async (skillId: string) => {
    setData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s.id !== skillId),
    }));
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
  };

  const navTabs = [
    { id: "overview", label: "Overview & Identity", icon: ShieldCheck },
    { id: "skills", label: `Skills (${data.skills.length})`, icon: Award },
    { id: "portfolio", label: `Portfolio (${data.portfolio.length})`, icon: Briefcase },
    { id: "bookings", label: `Inquiries (${data.bookings.length})`, icon: Clock },
    { id: "history", label: "Work Records", icon: FileText },
    { id: "reviews", label: `Reviews (${data.reviews.length})`, icon: Star },
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

      {/* 3. Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-forest/15">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs whitespace-nowrap transition-all ${
                isActive
                  ? "bg-forest text-ivory shadow-sovereign-xs font-bold"
                  : "text-forest/70 hover:text-forest hover:bg-forest/5"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Active Tab Content */}
      <div className="space-y-8">
        {activeTab === "overview" && (
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
        )}

        {activeTab === "skills" && (
          <SkillsManager
            skills={data.skills}
            onAddSkill={handleAddSkill}
            onRemoveSkill={handleRemoveSkill}
          />
        )}

        {activeTab === "portfolio" && (
          <PortfolioManager
            portfolio={data.portfolio}
            workerProfileId={data.profile.id}
            onAddPortfolioItem={handleAddPortfolioItem}
            onDeletePortfolioItem={handleDeletePortfolioItem}
          />
        )}

        {activeTab === "bookings" && (
          <JobRequests
            bookings={data.bookings}
            onUpdateStatus={handleUpdateBookingStatus}
          />
        )}

        {activeTab === "history" && (
          <WorkHistoryView workRecords={data.workRecords} />
        )}

        {activeTab === "reviews" && (
          <ReviewsView reviews={data.reviews} />
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
