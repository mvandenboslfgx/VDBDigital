"use client";

import { useRouter } from "next/navigation";
import OnboardingWizard from "./OnboardingWizard";

export default function DashboardOnboarding() {
  const router = useRouter();
  return (
    <OnboardingWizard
      onComplete={() => {
        router.refresh();
      }}
    />
  );
}
