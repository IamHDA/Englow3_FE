"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import { useOnboarding } from "@/features/onboarding/hooks/useOnboarding";

/*
 * The onboarding dialog - its five steps, their forms and schemas, the
 * mutations - is needed by a new learner once, and by nobody else. The gate is
 * in the root layout, on every page, so the dialog's code is fetched only when
 * it first opens instead of with every page.
 */
const OnboardingDialog = dynamic(
  () => import("./OnboardingDialog").then((module) => module.OnboardingDialog),
  { ssr: false },
);

/**
 * Popup onboarding, on every page: mounts the dialog the first time
 * `OnboardingProvider` opens it, and keeps it mounted so it closes with its
 * transition.
 */
export function OnboardingGate() {
  const { opened } = useOnboarding();
  const [wanted, setWanted] = useState(opened);
  // Remembered while rendering, not in an effect: the dialog has to start
  // loading on the very render that opens it.
  if (opened && !wanted) setWanted(true);
  if (!wanted) return null;
  return <OnboardingDialog />;
}
