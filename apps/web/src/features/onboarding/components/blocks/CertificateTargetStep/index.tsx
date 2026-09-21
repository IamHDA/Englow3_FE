"use client";

import { Box, SimpleGrid } from "@mantine/core";
import { useState } from "react";

import {
  CERTIFICATE_TARGET_COPY,
  TARGET_CERTIFICATE_CHOICES,
} from "@/features/onboarding/constants/onboardingSteps";

import { OnboardingChoiceTile } from "../../parts/OnboardingChoiceTile";
import { OnboardingStepFooter } from "../../parts/OnboardingStepFooter";
import { OnboardingStepShell } from "../../parts/OnboardingStepShell";

import { OnboardingStep } from "@/lib/graphql/generated";
import type { TargetCertificate } from "@/lib/graphql/generated";

type CertificateTargetStepProps = {
  /** Đã chọn ở lần vào trước - backend giữ lại nên bước này không bắt chọn lại từ đầu. */
  initialCertificate: TargetCertificate | null;
  pending: boolean;
  errorMessage: string | null;
  onContinue: (certificateType: TargetCertificate) => void;
};

/**
 * Bước chỉ hiện với người học có mục đích "luyện chứng chỉ" - backend tự bỏ
 * qua bước này cho người khác, nên ở đây không cần kiểm tra lại.
 */
export function CertificateTargetStep({
  initialCertificate,
  pending,
  errorMessage,
  onContinue,
}: CertificateTargetStepProps) {
  const [selected, setSelected] = useState<TargetCertificate | null>(
    initialCertificate,
  );

  return (
    <OnboardingStepShell
      step={OnboardingStep.CERTIFICATE_TARGET}
      title={CERTIFICATE_TARGET_COPY.title}
      subtitle={CERTIFICATE_TARGET_COPY.subtitle}
      footer={
        <OnboardingStepFooter
          pending={pending}
          errorMessage={errorMessage}
          disabled={selected === null}
          onContinue={() => selected && onContinue(selected)}
        />
      }
    >
      <Box role="group" aria-label="Chứng chỉ muốn thi">
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={20}>
          {TARGET_CERTIFICATE_CHOICES.map((choice) => (
            <OnboardingChoiceTile
              key={choice.certificate}
              label={choice.label}
              description={choice.description}
              selected={selected === choice.certificate}
              disabled={pending}
              onSelect={() => setSelected(choice.certificate)}
            />
          ))}
        </SimpleGrid>
      </Box>
    </OnboardingStepShell>
  );
}
