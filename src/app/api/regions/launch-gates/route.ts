import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  evaluateStateLaunchGates,
  LaunchGateEvaluationInput,
  STATE_LAUNCH_STEPS_14,
} from "@/lib/regions/state-launch-gate-service";

export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(req.url);
    const regionCode = searchParams.get("regionCode");

    let query = supabase.from("state_launch_gate_evaluations").select("*");
    if (regionCode) {
      query = query.eq("region_code", regionCode);
    }

    const { data, error } = await query.order("gate_number", { ascending: true });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      steps14: STATE_LAUNCH_STEPS_14,
      evaluations: data || [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: LaunchGateEvaluationInput = await req.json();
    const decision = evaluateStateLaunchGates(body);

    const supabase = createAdminClient();
    for (const gate of decision.gates) {
      await supabase
        .from("state_launch_gate_evaluations")
        .upsert(
          {
            region_code: decision.regionCode,
            gate_number: gate.gateNumber,
            gate_name: gate.gateName,
            evaluation_status: gate.passed ? "passed" : "failed",
            notes: gate.details,
            evaluated_at: new Date().toISOString(),
          },
          { onConflict: "region_code,gate_number" }
        );
    }

    return NextResponse.json({
      success: true,
      decision,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
