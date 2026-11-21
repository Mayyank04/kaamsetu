import type { Metadata } from "next";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export const metadata: Metadata = {
  title: "Voice & Multilingual Worker Onboarding | KAAMSETU",
  description:
    "Mint your sovereign digital craft identity through vernacular voice attestation in Hindi, Bengali, Marathi, Tamil, Telugu, Assamese, or English with Gemini AI skill extraction.",
};

export default function OnboardingPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] bg-background py-8">
      <OnboardingWizard />
    </div>
  );
}
