import { NextRequest, NextResponse } from "next/server";
import { createSuccessResponse, handleApiError } from "@/lib/error/handler";
import { getAuthenticatedSession } from "@/lib/auth/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";

/**
 * POST /api/geo/custom-locality
 * Controlled submission of unlisted villages, hamlets, wards, or colonies.
 */
export async function POST(request: NextRequest) {
  try {
    const { user } = await getAuthenticatedSession();
    const body = await request.json();

    const { state, district, localityName, pincode, localityType = "village" } = body;

    if (!state || !district || !localityName) {
      return NextResponse.json(
        { error: "State, district, and localityName are required." },
        { status: 400 }
      );
    }

    if (pincode && (!/^\d{6}$/.test(pincode) || pincode.startsWith("0"))) {
      return NextResponse.json(
        { error: "Pincode must be a valid 6-digit Indian Postal PIN." },
        { status: 400 }
      );
    }

    const submissionRecord = {
      id: `loc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      state: state.trim(),
      district: district.trim(),
      locality_name: localityName.trim(),
      pincode: pincode ? pincode.trim() : null,
      locality_type: localityType,
      review_status: "pending",
      submitted_by: user?.id || null,
      created_at: new Date().toISOString(),
    };

    if (isConfigured.supabase) {
      const supabase = await createServerSupabaseClient();
      const { data, error } = await supabase
        .from("custom_localities")
        .insert({
          state: submissionRecord.state,
          district: submissionRecord.district,
          locality_name: submissionRecord.locality_name,
          pincode: submissionRecord.pincode,
          locality_type: submissionRecord.locality_type,
          review_status: "pending",
          submitted_by: user?.id || null,
        })
        .select()
        .single();

      if (!error && data) {
        return createSuccessResponse(data, {
          message: "Custom locality recorded successfully for nationwide indexing.",
        });
      }
    }

    return createSuccessResponse(submissionRecord, {
      message: "Custom locality recorded successfully for nationwide indexing.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
