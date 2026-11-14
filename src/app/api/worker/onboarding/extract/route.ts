import { NextRequest } from "next/server";
import { onboardingExtractionRequestSchema } from "@/schemas/onboarding.schema";
import { extractOnboardingProfile } from "@/lib/gemini/onboarding-extractor";
import { handleApiError, createSuccessResponse } from "@/lib/error/handler";

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const validatedInput = onboardingExtractionRequestSchema.parse(json);

    const extraction = await extractOnboardingProfile(validatedInput);

    return createSuccessResponse(extraction, {
      language: validatedInput.language,
      inputMode: validatedInput.inputMode,
      charCount: validatedInput.transcript.length,
      processedAt: new Date().toISOString(),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
