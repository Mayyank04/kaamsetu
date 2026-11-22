import { NextRequest, NextResponse } from "next/server";
import { translationService } from "@/lib/translation/service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.text || typeof body.text !== "string") {
      return NextResponse.json(
        { success: false, error: "Text string is required for language detection." },
        { status: 400 }
      );
    }

    const detection = await translationService.detectLanguage(body.text);

    return NextResponse.json({
      success: true,
      data: detection,
    });
  } catch (error: any) {
    console.error("[API /api/translate/detect] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Language detection failed" },
      { status: 500 }
    );
  }
}
