import { WorkerDashboardData } from "@/types/dashboard";
import { isConfigured } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

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

  if (!isConfigured.supabase) {
    return defaultDashboardData;
  }

  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // If user is authenticated, query their profile from database
    if (user) {
      const { data: worker, error } = await supabase
        .from("worker_profiles")
        .select(`
          *,
          occupation:occupations(*),
          portfolio(*),
          bookings(*),
          work_records(*),
          reviews(*)
        `)
        .eq("user_id", user.id)
        .single();

      if (worker && !error) {
        // Map database records to dashboard format
        return {
          ...defaultDashboardData,
          profile: {
            ...defaultDashboardData.profile,
            id: worker.id,
            userId: worker.user_id,
            registryId: worker.registry_id,
            slug: worker.slug,
            headline: worker.headline,
            bio: worker.bio || defaultDashboardData.profile.bio,
            yearsExperience: worker.years_experience,
            dailyRateMin: worker.daily_rate_min || 1200,
            dailyRateMax: worker.daily_rate_max || 1800,
            city: worker.city,
            state: worker.state,
            pincode: worker.pincode,
            serviceRadiusKm: worker.service_radius_km,
            languages: worker.languages || ["Hindi", "English"],
            kaamScore: {
              totalScore: worker.kaamscore,
              level: worker.kaamscore_level,
              tier: worker.kaamscore >= 820 ? "Sovereign Master" : "Institutional Tier",
              percentile: 96,
            },
            isPublished: worker.is_published,
            availabilityStatus: worker.availability_status,
          },
          portfolio:
            worker.portfolio && worker.portfolio.length > 0
              ? worker.portfolio.map((p: any) => ({
                  id: p.id,
                  workerProfileId: p.worker_profile_id,
                  title: p.title,
                  description: p.description,
                  imageUrl: p.image_url,
                  category: p.category,
                  projectDate: p.project_date,
                  clientTestimony: p.client_testimony,
                  createdAt: p.created_at,
                }))
              : defaultDashboardData.portfolio,
        };
      }
    }

    return defaultDashboardData;
  } catch (err) {
    console.error("Error loading dashboard data:", err);
    return defaultDashboardData;
  }
}
