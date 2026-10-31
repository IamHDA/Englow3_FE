"use client";

import { Button } from "@mantine/core";
import { Sparkles } from "lucide-react";

import { useOnboarding } from "@/features/onboarding";
import { useLanguage } from "@/shared/hooks/useLanguage";

type SiteHeaderOnboardingButtonProps = {
  /** Called after the popup opens, so the mobile drawer can close itself. */
  onNavigate?: () => void;
  fullWidth?: boolean;
};

/** Nhắc người dùng còn onboarding dở dang - chỉ hiện khi cần, bấm là mở popup. */
export function SiteHeaderOnboardingButton({
  onNavigate,
  fullWidth,
}: SiteHeaderOnboardingButtonProps) {
  const { open } = useOnboarding();
  const { t } = useLanguage();

  return (
    <Button
      onClick={() => {
        open();
        onNavigate?.();
      }}
      fullWidth={fullWidth}
      color="orange.4"
      size="md"
      radius="md"
      fw={700}
      leftSection={<Sparkles aria-hidden="true" size={16} />}
    >
      {t.nav.completeOnboarding}
    </Button>
  );
}
