import { NextRequest, NextResponse } from "next/server";
import {
  evaluateRegionalOperatingStandard,
  RegionalOperatingReviewRecord,
} from "@/lib/regional/regional-operating-standard-service";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(req.url);
    const regionCode = searchParams.get("region");

    const reviews: RegionalOperatingReviewRecord[] = [
      evaluateRegionalOperatingStandard({
        regionCode: "IN-AS",
        regionName: "Assam",
        districtName: "Kamrup Metropolitan (Guwahati)",
        reviewCycle: "2026-Q4-CYCLE-01",
        operatingStatus: "active",
        supply: {
          registeredWorkers: 1450,
          contactableWorkers: 1380,
          availableWorkers: 850,
          verifiedWorkers: 1200,
          recentCompletedWork: 395,
          independentlyVerifiedPayments: 388,
          inactiveWorkers: 400,
        },
        sropChecksPassed: 12, // 100% SROP compliance
        leadReviewer: "KAAMSETU-SROP-AUDITOR-ASSAM-01",
      }),
      evaluateRegionalOperatingStandard({
        regionCode: "IN-ML",
        regionName: "Meghalaya",
        districtName: "East Khasi Hills (Shillong)",
        reviewCycle: "2026-Q4-CYCLE-01",
        operatingStatus: "active",
        supply: {
          registeredWorkers: 420,
          contactableWorkers: 390,
          availableWorkers: 280,
          verifiedWorkers: 350,
          recentCompletedWork: 138,
          independentlyVerifiedPayments: 135,
          inactiveWorkers: 100,
        },
        sropChecksPassed: 11, // 91.7% SROP compliance
        leadReviewer: "KAAMSETU-SROP-AUDITOR-MEGHALAYA-01",
      }),
      evaluateRegionalOperatingStandard({
        regionCode: "IN-WB-SIL",
        regionName: "Siliguri Transit Corridor",
        districtName: "Darjeeling / Jalpaiguri border",
        reviewCycle: "2026-Q4-CYCLE-01",
        operatingStatus: "conditionally_ready",
        supply: {
          registeredWorkers: 180,
          contactableWorkers: 160,
          availableWorkers: 95,
          verifiedWorkers: 140,
          recentCompletedWork: 38,
          independentlyVerifiedPayments: 35,
          inactiveWorkers: 60,
        },
        sropChecksPassed: 8,
        leadReviewer: "KAAMSETU-SROP-AUDITOR-SILIGURI-01",
        limitationsNotes: "Field office lease pending. Anti-override invariant strictly blocks activation.",
      }),
    ];

    let filtered = reviews;
    if (regionCode) {
      filtered = reviews.filter((r) => r.regionCode.toLowerCase() === regionCode.toLowerCase());
    }

    return NextResponse.json({
      success: true,
      count: filtered.length,
      reviews: filtered,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
