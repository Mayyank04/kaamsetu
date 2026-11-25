import { WorkerDashboardData } from "@/types/dashboard";
import { isConfigured } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { FEATURED_PROFESSIONALS } from "@/lib/data/professionals";

export async function getWorkerDashboardData(
  targetSlug?: string
): Promise<WorkerDashboardData> {
  // Demo data for Rameshwar Sharma (or fallback)
  const defaultDashboardData: WorkerDashboardData = {
    profile: {
      id: "w-pro-01",
      userId: "33333333-3333-3333-3333-333333330001",
      registryId: "IN-RJ-2026-4029-KS",
      slug: "rameshwar-sharma-jaipur",
      fullName: "Rameshwar Sharma",
      avatarUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDbofQt3JNo-0nKP_7wT3yVLDSjnipeuwapv0I6oJbI0rtw7Ck45Xk3VFmhklL6b9FyeRMe2cBNy9RNV0O34xMjoCtlzLIFKAd-z3kAN4KupPq7ypm8miD2uz1hH_lWc6DgszG2L6Xt8CUljV9eTbpO3MmEotYLG5kUlGPcu1GVmNfL4TRODQKl6Yln99dznHtpaIxO9Zvg2NheIvm5U0EnQDTs4My6N9C0BFlXrA",
      occupation: "Industrial Electrician & Solar Installer",
      occupationSlug: "electrical-solar",
      category: "Electrical & Solar Tech",
      headline: "Master Industrial Electrician & Rooftop Solar Grid Specialist",
      bio: "14+ years in Jaipur & Sitapura industrial zone specializing in 10kW to 100kW rooftop industrial solar arrays, zero-fault 3-phase commercial wiring, and safety earthing.",
      yearsExperience: 14,
      hourlyRate: 175,
      dailyRateMin: 1200,
      dailyRateMax: 1800,
      city: "Jaipur",
      state: "Rajasthan",
      pincode: "302001",
      serviceRadiusKm: 35,
      languages: ["Hindi", "Marwari", "English"],
      kaamScore: {
        totalScore: 842,
        level: 4,
        tier: "Sovereign Master",
        percentile: 98,
      },
      aadhaarVerified: true,
      digiLockerLinked: true,
      isPublished: true,
      availabilityStatus: "available",
      createdAt: "2025-03-12T00:00:00Z",
      updatedAt: new Date().toISOString(),
    },
    skills: [
      {
        id: "sk-1",
        name: "Rooftop Solar Grid Synchronization",
        category: "Solar Tech",
        isPrimary: true,
        verificationType: "digilocker_verified",
        verifiedCount: 5,
        yearsPracticed: 8,
      },
      {
        id: "sk-2",
        name: "3-Phase Commercial Busbar Wiring",
        category: "Electrical",
        isPrimary: true,
        verificationType: "voice_attested",
        yearsPracticed: 14,
      },
      {
        id: "sk-3",
        name: "Industrial Earthing Grid Testing",
        category: "Safety Compliance",
        isPrimary: true,
        verificationType: "peer_confirmed",
        verifiedCount: 4,
        yearsPracticed: 10,
      },
      {
        id: "sk-4",
        name: "Variable Frequency Drives (VFD) Calibration",
        category: "Industrial Automation",
        isPrimary: false,
        verificationType: "self_declared",
        yearsPracticed: 3,
        declaredAt: "2026-09-10",
      },
      {
        id: "sk-5",
        name: "Smart Energy Metering & CT Wiring",
        category: "Metering",
        isPrimary: false,
        verificationType: "self_declared",
        yearsPracticed: 2,
        declaredAt: "2026-10-18",
      },
    ],
    portfolio: [
      {
        id: "port-1",
        workerProfileId: "w-pro-01",
        title: "85kW Commercial Solar Installation",
        description:
          "Complete synchronization of 85kW rooftop solar array with 440V distribution grid. Zero harmonic distortion recorded by DISCOM engineers.",
        imageUrl:
          "https://images.unsplash.com/photo-1508873696983-2df570464756?auto=format&fit=crop&w=800&q=80",
        category: "Commercial Solar",
        projectDate: "2025-09-15",
        clientTestimony:
          "Flawless execution by Rameshwar and team. Substation inspection cleared on first pass.",
        createdAt: "2025-09-20T00:00:00Z",
      },
      {
        id: "port-2",
        workerProfileId: "w-pro-01",
        title: "Industrial Plant 3-Phase Busbar Replacement",
        description:
          "Installed 630A copper busbar chamber and Siemens MCCBs with concealed conduit routing in Sitapura manufacturing unit.",
        imageUrl:
          "https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=800&q=80",
        category: "Heavy Electrical",
        projectDate: "2025-11-04",
        clientTestimony:
          "Clean routing, proper ferrule labeling, and complete earth resistance documentation provided.",
        createdAt: "2025-11-10T00:00:00Z",
      },
      {
        id: "port-3",
        workerProfileId: "w-pro-01",
        title: "Cold Storage Automated Backup Switchgear",
        description:
          "Automated AMF panel for 125kVA generator with dual-source interlock and surge protection devices.",
        imageUrl:
          "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80",
        category: "Switchgear",
        projectDate: "2026-02-18",
        clientTestimony:
          "Prompt emergency cutover test passed without dropping critical chillers.",
        createdAt: "2026-02-22T00:00:00Z",
      },
    ],
    bookings: [
      {
        id: "bk-101",
        bookingReference: "BK-2026-4821",
        clientName: "Vikram Singhania (Singhania Textiles)",
        clientPhone: "+91 98290 11234",
        serviceTitle: "Solar Array Annual Inverter Inspection & Earthing",
        description:
          "Need full diagnostic scan of two 25kW SMA inverters showing intermittent ground fault errors after heavy monsoon rain.",
        locationAddress: "Plot C-14, Sitapura Industrial Area, Phase II",
        locationCity: "Jaipur",
        scheduledStart: "2026-11-18T10:00:00Z",
        estimatedCost: 3500,
        status: "requested",
        createdAt: "2026-11-13T14:30:00Z",
      },
      {
        id: "bk-102",
        bookingReference: "BK-2026-4490",
        clientName: "Meenakshi Rathore",
        clientPhone: "+91 94140 88291",
        serviceTitle: "Commercial Showroom 3-Phase Panel Upgrade",
        description:
          "Replace aging distribution board with new 100A 4-pole isolator and individual RCBOs for retail lighting tracks.",
        locationAddress: "12, MI Road, Near Raj Mandir",
        locationCity: "Jaipur",
        scheduledStart: "2026-11-20T09:30:00Z",
        estimatedCost: 6500,
        status: "confirmed",
        createdAt: "2026-11-11T16:00:00Z",
      },
      {
        id: "bk-103",
        bookingReference: "BK-2026-3910",
        clientName: "Rajesh Khandelwal",
        serviceTitle: "Factory Substation Grounding Maintenance",
        description: "Chemical earthing pit recharge and earth test report submission.",
        locationAddress: "VKI Area, Road No. 9",
        locationCity: "Jaipur",
        scheduledStart: "2026-10-28T09:00:00Z",
        estimatedCost: 4800,
        status: "completed",
        createdAt: "2026-10-24T11:00:00Z",
      },
    ],
    workRecords: [
      {
        id: "wr-1",
        projectTitle: "85kW Commercial Rooftop Solar Sync",
        contractorOrClient: "Rajasthan State Warehousing Corporation",
        location: "Jaipur Substation Zone",
        startDate: "2025-02-01",
        endDate: "2025-09-15",
        hoursLogged: 620,
        tradeCategory: "Solar & Heavy Electrical",
        verifiedByContractor: true,
        verificationHash: "0x8f2c91a7834e019b8827fa6d7c8e90a1b2c3d4e5",
      },
      {
        id: "wr-2",
        projectTitle: "Sitapura Industrial Area Phase-1 Panel Commissioning",
        contractorOrClient: "Bhanwar Singh & Sons Electricals",
        location: "Sitapura, Jaipur",
        startDate: "2024-05-10",
        endDate: "2024-12-20",
        hoursLogged: 840,
        tradeCategory: "Industrial Distribution",
        verifiedByContractor: true,
        verificationHash: "0x3e1d7a8b9c0e2f4a5b6c7d8e9f0a1b2c3d4e5f6a",
      },
    ],
    reviews: [
      {
        id: "rev-1",
        customerName: "Rajasthan State Warehousing Corp (Officer Sharma)",
        rating: 5,
        qualityRating: 5,
        punctualityRating: 5,
        comment:
          "Rameshwar is one of the most disciplined solar technicians we have contracted. The entire conduit run was labeled with high-voltage warnings according to CEA guidelines.",
        contractorSigned: true,
        createdAt: "2025-09-20T00:00:00Z",
      },
      {
        id: "rev-2",
        customerName: "Bhanwar Singh (Licensed Contractor)",
        rating: 5,
        qualityRating: 5,
        punctualityRating: 4.8,
        comment:
          "14 years of working together on high-stakes industrial panels. Never had a single short-circuit or inspection fail on Rameshwar's lines.",
        contractorSigned: true,
        createdAt: "2026-08-11T00:00:00Z",
      },
    ],
    analytics: {
      profileViewsThisWeek: 48,
      totalProfileViews: 348,
      cardScans: 46,
      inquiriesCount: 12,
      completionPercentage: 88,
      completionTasks: [
        {
          id: "task-1",
          title: "Voice Attestation Registered",
          description: "Spoken trade testimony analyzed by Gemini AI",
          completed: true,
          impactScore: 25,
        },
        {
          id: "task-2",
          title: "Sovereign ID Minted",
          description: "Anchored to national workforce registry",
          completed: true,
          impactScore: 25,
        },
        {
          id: "task-3",
          title: "DigiLocker Credential Linked",
          description: "NSDC Level 4 trade certification verified",
          completed: true,
          impactScore: 20,
        },
        {
          id: "task-4",
          title: "Portfolio Projects Showcase",
          description: "Upload at least 3 completed job photos (3 added)",
          completed: true,
          impactScore: 18,
        },
        {
          id: "task-5",
          title: "Peer Verification Endorsements",
          description: "Request 2 more peer craftsman endorsements to reach 100%",
          completed: false,
          impactScore: 12,
        },
      ],
    },
  };

  if (targetSlug) {
    const matched = FEATURED_PROFESSIONALS.find((p) => {
      const pSlug =
        p.fullName.toLowerCase().replace(/\s+/g, "-") +
        "-" +
        p.location.city.toLowerCase();
      return pSlug === targetSlug || p.id === targetSlug || p.registryId === targetSlug;
    });

    if (matched) {
      defaultDashboardData.profile = {
        ...defaultDashboardData.profile,
        id: matched.id,
        registryId: matched.registryId,
        slug: targetSlug,
        fullName: matched.fullName,
        avatarUrl: matched.photoUrl,
        occupation: matched.primaryTrade,
        category: matched.primaryTrade.split("&")[0].trim(),
        headline: matched.primaryTrade,
        bio: matched.bio,
        yearsExperience: matched.yearsExperience,
        city: matched.location.city,
        state: matched.location.state,
        pincode: matched.location.pincode,
        languages: matched.languages,
        kaamScore: {
          totalScore: matched.kaamScore.totalScore,
          level: matched.kaamScore.level,
          tier: matched.kaamScore.tier,
          percentile: matched.kaamScore.percentileRank,
        },
        aadhaarVerified: matched.aadhaarVerified,
        digiLockerLinked: matched.digiLockerLinked,
        availabilityStatus: (matched.availabilityStatus as any) || "available",
      };

      defaultDashboardData.skills = matched.subTrades.map((st, idx) => ({
        id: `sk-${matched.id}-${idx}`,
        name: st,
        category: matched.primaryTrade,
        isPrimary: idx < 2,
        verificationType: idx === 0 ? "digilocker_verified" : "voice_attested",
        yearsPracticed: Math.max(2, matched.yearsExperience - idx * 2),
      }));
    }
  }

  if (!isConfigured.supabase) {
    return defaultDashboardData;
  }

  try {
    const supabase = await createServerSupabaseClient();
    const mapWorkerRowToDashboard = (worker: any, fallbackName?: string): WorkerDashboardData => {
      const resolvedSkills = Array.isArray(worker.worker_skills)
        ? worker.worker_skills.map((ws: any) => ({
            id: ws.id,
            name: ws.skill?.name || "Trade Skill",
            category: ws.skill?.category || worker.occupation?.name || "Trade",
            isPrimary: Boolean(ws.is_primary),
            verificationType: ws.verification_type || "self_declared",
            yearsPracticed: ws.years_practiced || 1,
            declaredAt: ws.created_at ? String(ws.created_at).split("T")[0] : undefined,
          }))
        : [];

      const resolvedPortfolio = Array.isArray(worker.portfolio)
        ? worker.portfolio.map((p: any) => ({
            id: p.id,
            workerProfileId: p.worker_profile_id,
            title: p.title,
            description: p.description || "",
            imageUrl: p.image_url,
            category: p.category || "Work Sample",
            projectDate: p.project_date || "",
            clientTestimony: p.client_testimony || "",
            createdAt: p.created_at || "",
          }))
        : [];

      const resolvedBookings = Array.isArray(worker.bookings)
        ? worker.bookings.map((b: any) => ({
            id: b.id,
            bookingReference: b.booking_reference || b.id,
            clientName: b.client_name || "Customer",
            clientPhone: b.client_phone,
            serviceTitle: b.service_title,
            description: b.description || "",
            locationAddress: b.location_address || "",
            locationCity: b.location_city || worker.city,
            scheduledStart: b.scheduled_start,
            estimatedCost: Number(b.estimated_cost || 0),
            status: b.status || "requested",
            createdAt: b.created_at,
          }))
        : [];

      const resolvedWorkRecords = Array.isArray(worker.work_records) ? worker.work_records : [];
      const resolvedReviews = Array.isArray(worker.reviews) ? worker.reviews : [];

      const tasks = [
        {
          id: "task-profile",
          title: "Profile Identity & Bio",
          description: worker.bio ? "Craft summary completed" : "Add a brief description of your work",
          completed: Boolean(worker.headline && worker.bio),
          impactScore: 25,
        },
        {
          id: "task-skills",
          title: "Craft Skills Listed",
          description: `${resolvedSkills.length} skill(s) listed on profile`,
          completed: resolvedSkills.length >= 1,
          impactScore: 25,
        },
        {
          id: "task-portfolio",
          title: "Work Sample Photos",
          description: `${resolvedPortfolio.length} project photo(s) uploaded`,
          completed: resolvedPortfolio.length >= 1,
          impactScore: 25,
        },
        {
          id: "task-publish",
          title: "Public Directory Visibility",
          description: worker.is_published ? "Discoverable in directory" : "Turn on visibility so customers can find you",
          completed: Boolean(worker.is_published),
          impactScore: 25,
        },
      ];
      const completionPercentage = tasks.reduce((sum, t) => sum + (t.completed ? t.impactScore : 0), 0);

      return {
        profile: {
          id: worker.id,
          userId: worker.user_id,
          registryId: worker.registry_id,
          slug: worker.slug,
          fullName: worker.profile?.full_name || fallbackName || "Skilled Professional",
          avatarUrl: worker.profile?.avatar_url || undefined,
          occupation: worker.occupation?.name || worker.headline || "Skilled Trade",
          occupationSlug: worker.occupation?.slug || "general-trade",
          category: worker.occupation?.name || "Craft & Service",
          headline: worker.headline,
          bio: worker.bio || "",
          yearsExperience: worker.years_experience || 0,
          hourlyRate: Number(worker.hourly_rate || 0),
          dailyRateMin: Number(worker.daily_rate_min || 0),
          dailyRateMax: Number(worker.daily_rate_max || 0),
          city: worker.city,
          state: worker.state,
          pincode: worker.pincode,
          serviceRadiusKm: worker.service_radius_km || 25,
          languages: Array.isArray(worker.languages) ? worker.languages : ["Hindi"],
          kaamScore: {
            totalScore: worker.kaamscore || 300,
            level: worker.kaamscore_level || 1,
            tier: worker.kaamscore >= 820 ? "Sovereign Master" : worker.kaamscore >= 550 ? "Verified Professional" : "Starter Profile",
            percentile: worker.kaamscore >= 800 ? 95 : 50,
          },
          aadhaarVerified: Boolean(worker.aadhaar_verified),
          digiLockerLinked: Boolean(worker.digilocker_linked),
          isPublished: Boolean(worker.is_published),
          availabilityStatus: worker.availability_status || "available",
          businessName: worker.business_name || undefined,
          stallType: worker.stall_type || undefined,
          operatingHours: worker.operating_hours || undefined,
          productCatalog: Array.isArray(worker.product_catalog) ? worker.product_catalog : [],
          createdAt: worker.created_at,
          updatedAt: worker.updated_at,
        },
        skills: resolvedSkills,
        portfolio: resolvedPortfolio,
        bookings: resolvedBookings,
        workRecords: resolvedWorkRecords,
        reviews: resolvedReviews,
        analytics: {
          profileViewsThisWeek: 0,
          totalProfileViews: 0,
          cardScans: 0,
          inquiriesCount: resolvedBookings.length,
          completionPercentage,
          completionTasks: tasks,
        },
      };
    };

    // Public profile lookup by slug
    if (targetSlug) {
      const { data: slugWorker, error: slugErr } = await supabase
        .from("worker_profiles")
        .select(`
          *,
          profile:profiles(full_name, avatar_url),
          occupation:occupations(*),
          worker_skills(*, skill:skills(*)),
          portfolio(*),
          work_records(*),
          reviews(*)
        `)
        .eq("slug", targetSlug)
        .maybeSingle();

      if (slugWorker && !slugErr) {
        return mapWorkerRowToDashboard(slugWorker);
      }

      // Return matched illustrative profile if viewing featured example slug
      return defaultDashboardData;
    }

    // Authenticated user's own dashboard
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: worker, error } = await supabase
        .from("worker_profiles")
        .select(`
          *,
          profile:profiles(full_name, avatar_url),
          occupation:occupations(*),
          worker_skills(*, skill:skills(*)),
          portfolio(*),
          bookings(*),
          work_records(*),
          reviews(*)
        `)
        .eq("user_id", user.id)
        .maybeSingle();

      if (worker && !error) {
        return mapWorkerRowToDashboard(worker, user.user_metadata?.full_name);
      }

      // Authenticated user has not completed worker profile onboarding yet: never leak Rameshwar's demo data
      return {
        profile: {
          ...defaultDashboardData.profile,
          id: "",
          userId: user.id,
          registryId: "PENDING-ONBOARDING",
          slug: "",
          fullName: (user.user_metadata?.full_name as string) || "New Worker",
          avatarUrl: undefined,
          occupation: "Complete Onboarding to Set Trade",
          headline: "Complete your 3-minute craft profile to appear in search",
          bio: "",
          yearsExperience: 0,
          dailyRateMin: 0,
          dailyRateMax: 0,
          city: "Guwahati",
          state: "Assam",
          pincode: "781001",
          languages: ["Hindi"],
          kaamScore: { totalScore: 300, level: 1, tier: "Starter Profile", percentile: 0 },
          aadhaarVerified: false,
          digiLockerLinked: false,
          isPublished: false,
          availabilityStatus: "available",
        },
        skills: [],
        portfolio: [],
        bookings: [],
        workRecords: [],
        reviews: [],
        analytics: {
          profileViewsThisWeek: 0,
          totalProfileViews: 0,
          cardScans: 0,
          inquiriesCount: 0,
          completionPercentage: 10,
          completionTasks: [
            {
              id: "task-onboard",
              title: "Complete Guided Profile Intake",
              description: "Add your craft, location, and languages in /onboarding",
              completed: false,
              impactScore: 90,
            },
          ],
        },
      };
    }

    return defaultDashboardData;
  } catch (err) {
    console.error("Error loading dashboard data:", err);
    return defaultDashboardData;
  }
}
