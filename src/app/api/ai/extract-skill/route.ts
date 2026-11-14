import { NextRequest } from "next/server";
import { voiceClaimSubmissionSchema } from "@/schemas/voice.schema";
import { extractSkillsFromTranscript } from "@/lib/gemini/client";
import { handleApiError, createSuccessResponse } from "@/lib/error/handler";

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const validated = voiceClaimSubmissionSchema.parse(json);

    const extraction = await extractSkillsFromTranscript(validated.transcript);

    return createSuccessResponse(extraction, {
      language: validated.language,
      charactersProcessed: validated.transcript.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
