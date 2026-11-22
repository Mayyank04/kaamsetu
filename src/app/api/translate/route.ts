import { NextRequest, NextResponse } from "next/server";
import { translationService } from "@/lib/translation/service";
import { TranslationRequest } from "@/lib/translation/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.text || typeof body.text !== "string") {
      return NextResponse.json(
        { success: false, error: "Text string is required for translation." },
        { status: 400 }
      );
    }

    if (!body.targetLanguage || typeof body.targetLanguage !== "string") {
      return NextResponse.json(
        { success: false, error: "Target language code is required." },
        { status: 400 }
      );
    }

    const translationRequest: TranslationRequest = {
      text: body.text,
      sourceLanguage: body.sourceLanguage || "auto",
      targetLanguage: body.targetLanguage,
      provider: body.provider,
      contentType: body.contentType || "general",
      isPrivate: Boolean(body.isPrivate),
    };

    const result = await translationService.translate(translationRequest);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("[API /api/translate] Translation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Translation failed",
      },
      { status: 500 }
    );
  }
}
