import { requireAdmin } from "@/lib/auth/server";
import { handleApiError } from "@/lib/error/handler";
import { NextRequest, NextResponse } from "next/server";
import {
  buildEnterprisePilotDescriptor,
  generateGemFormBComplianceReport,
  syncWorkersToEnterpriseErp,
  EnterprisePilotConfig,
} from "@/lib/enterprise/enterprise-pilot-service";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try { await requireAdmin(); } catch (authError) { return handleApiError(authError); }
  try {
    const admin = createAdminClient();
    const { data: pilots } = await admin
      .from("enterprise_pilot_engagements")
      .select("*")
      .order("created_at", { ascending: false });

    if (pilots && pilots.length > 0) {
      return NextResponse.json({
        pilots,
        source: "database",
      });
    }

    // Default reference pilots for Assam and Meghalaya
    const assamPilot = buildEnterprisePilotDescriptor({
      enterpriseName: "Brahmaputra Infrastructure & Construction EPC Ltd",
      enterpriseTaxId: "18AABCB1234F1Z5",
      regionCode: "IN-AS",
      erpSystem: "sap_successfactors",
      pilotAgreementRef: "MOU-AS-EPC-2026-001",
      projectScope: "Guwahati-North Guwahati River Bridge Sub-Project Phase II",
      targetWorkerCount: 65,
      startDate: "2026-11-01",
      endDate: "2027-04-30",
    });

    const meghalayaPilot = buildEnterprisePilotDescriptor({
      enterpriseName: "Meghalaya Highway & Tunnel Consortium Ltd",
      enterpriseTaxId: "17AABCM5678G1Z2",
      regionCode: "IN-ML",
      erpSystem: "sap_successfactors",
      pilotAgreementRef: "MOU-ML-HTC-2026-004",
      projectScope: "Shillong Western Bypass Elevated Corridor Skilling Roster",
      targetWorkerCount: 40,
      startDate: "2026-11-15",
      endDate: "2027-05-31",
    });

    return NextResponse.json({
      pilots: [assamPilot, meghalayaPilot],
      source: "reference_descriptor",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to retrieve enterprise pilot data" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try { await requireAdmin(); } catch (authError) { return handleApiError(authError); }
  try {
    const body = await req.json();

    // Check if this is a GeM Form B report generation request
    if (body.type === "gem_form_b") {
      const { contractRef, enterpriseName, regionCode, totalDeployedWorkers, underpaidWorkersCount, localDistrictWorkers } = body;
      const report = generateGemFormBComplianceReport({
        contractRef: contractRef || "GEM/2026/B/88990",
        enterpriseName: enterpriseName || "Brahmaputra Infrastructure EPC Ltd",
        regionCode: regionCode || "IN-AS",
        totalDeployedWorkers: totalDeployedWorkers || 50,
        underpaidWorkersCount: underpaidWorkersCount || 0,
        localDistrictWorkers: localDistrictWorkers || 35,
      });

      return NextResponse.json({
        success: true,
        report,
      });
    }

    // Default: ERP Sync request
    const { enterpriseName, workers } = body;
    const syncResult = syncWorkersToEnterpriseErp({
      enterpriseName: enterpriseName || "Brahmaputra Infrastructure EPC Ltd",
      workers: workers || [],
    });

    return NextResponse.json({
      success: true,
      syncResult,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to process enterprise pilot request" },
      { status: 500 }
    );
  }
}
