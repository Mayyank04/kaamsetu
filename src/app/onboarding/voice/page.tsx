import type { Metadata } from "next";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export const metadata: Metadata = {
  title: "AI Voice Attestation Onboarding | KAAMSETU Sovereign Credential",
  description:
    "Speak naturally about your trade and experience in your mother tongue. KAAMSETU uses Gemini Flash 2.5 to map your craft skills and generate your verified credential.",
};

export default function VoiceOnboardingPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] bg-background py-8">
      <OnboardingWizard />
    </div>
  );
}
