/**
 * KAAMSETU — Voice Engine TTS API Route
 * Endpoint: /api/voice/tts
 * Phase 50.4 Specification
 * 
 * GET: Returns status of all TTS providers (Google Cloud, Azure, Bhashini, Browser),
 * distinguishing server audio generators from client browser synthesizers.
 * 
 * POST: Performs server-side speech synthesis if configured, validating decodable audio
 * bytes. If unconfigured, truthfully returns audioGenerated: false with client browser fallback signal.
 */

import { NextRequest, NextResponse } from "next/server";
import { TTSProviderService } from "@/lib/voice/tts-provider";
import { TTSRequest } from "@/lib/voice/types";

export async function GET() {
  try {
    const providers = TTSProviderService.getProvidersStatus();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      providers,
      data: {
        providers,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to query TTS providers status",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: TTSRequest = await req.json();

    if (!body || !body.text || !body.text.trim()) {
      return NextResponse.json(
        {
          success: false,
          audioGenerated: false,
          error: "Text is required. Text parameter is required for speech synthesis.",
        },
        { status: 400 }
      );
    }

    const result = await TTSProviderService.synthesize(body);

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      ...result,
      success: true,
      fallbackReason: result.error,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        audioGenerated: false,
        error: error?.message || "Speech synthesis failed",
        fallbackToBrowser: true,
      },
      { status: 500 }
    );
  }
}
