"use client";

import { useContext } from "react";

import { OnboardingContext } from "@/features/onboarding/provider";

/** Trạng thái onboarding (cần hay không, popup đang mở hay không) dùng chung
 * giữa nút nhắc ở header, guard chặn điều hướng, và chính popup. */
export function useOnboarding() {
  const value = useContext(OnboardingContext);

  if (!value) {
    throw new Error(
      "useOnboarding phải được gọi bên trong <OnboardingProvider>",
    );
  }

  return value;
}
