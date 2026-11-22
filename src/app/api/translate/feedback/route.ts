import { NextRequest, NextResponse } from "next/server";
import { translationService } from "@/lib/translation/service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.originalText || !body.translatedText || !body.rating) {
      return NextResponse.json(
        { success: false, error: "originalText, translatedText, and rating are required." },
        { status: 400 }
      );
    }

    const response = await translationService.submitFeedback(body);

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit translation feedback" },
      { status: 500 }
    );
  }
}
