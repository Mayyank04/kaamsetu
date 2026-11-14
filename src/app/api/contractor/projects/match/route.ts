import { NextRequest, NextResponse } from "next/server";
import { evaluateExplainableMatch } from "@/lib/opportunity/matching-engine-v2";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.opportunity || !body.workers || !Array.isArray(body.workers)) {
      return NextResponse.json(
        { error: "Missing required fields: opportunity, workers array" },
        { status: 400 }
      );
    }

    const matches = body.workers.map((worker: any) => ({
      workerId: worker.id,
      workerName: worker.fullName || "Verified Craftsperson",
      evaluation: evaluateExplainableMatch({
        opportunity: body.opportunity,
        worker,
      }),
    }));

    // Sort by total score descending
    matches.sort((a: any, b: any) => b.evaluation.totalScore - a.evaluation.totalScore);

    return NextResponse.json({
      success: true,
      opportunityId: body.opportunity.id,
      matchCount: matches.length,
      eligibleMatches: matches.filter((m: any) => m.evaluation.isEligible),
      allMatches: matches,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
