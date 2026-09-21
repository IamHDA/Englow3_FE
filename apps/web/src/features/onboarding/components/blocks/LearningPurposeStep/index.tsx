"use client";

import { Box, SimpleGrid } from "@mantine/core";
import { useState } from "react";

import { LEARNING_PURPOSE_COPY } from "@/features/onboarding/constants/onboardingSteps";

import { OnboardingChoiceTile } from "../../parts/OnboardingChoiceTile";
import { OnboardingStepShell } from "../../parts/OnboardingStepShell";
import { OnboardingStepFooter } from "../../parts/OnboardingStepFooter";

import { OnboardingStep } from "@/lib/graphql/generated";
import type { LearningPurposesQuery } from "@/lib/graphql/generated/hooks";

/** Một mục đích học như BFF trả về - lấy thẳng hình dạng codegen sinh. */
type LearningPurpose = LearningPurposesQuery["learningPurposes"][number];

type LearningPurposeStepProps = {
  purposes: LearningPurpose[];
  pending: boolean;
  errorMessage: string | null;
  onContinue: (purposeIds: number[]) => void;
};

export function LearningPurposeStep({
  purposes,
  pending,
  errorMessage,
  onContinue,
}: LearningPurposeStepProps) {
  // Backend lưu `learningPurposeIds` là mảng nên chọn được nhiều. State cục bộ
  // của bước này, không đưa lên global.
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  function togglePurpose(id: number) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((selected) => selected !== id)
        : [...current, id],
    );
  }

  return (
    <OnboardingStepShell
      step={OnboardingStep.LEARNING_PURPOSES}
      title={LEARNING_PURPOSE_COPY.title}
      subtitle={LEARNING_PURPOSE_COPY.subtitle}
      footer={
        <OnboardingStepFooter
          pending={pending}
          errorMessage={errorMessage}
          disabled={selectedIds.length === 0}
          onContinue={() => onContinue(selectedIds)}
        />
      }
    >
      <Box role="group" aria-label="Mục đích học tiếng Anh">
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={20}>
          {purposes.map((purpose) => (
            <OnboardingChoiceTile
              key={purpose.id}
              label={purpose.displayName}
              selected={selectedIds.includes(purpose.id)}
              disabled={pending}
              onSelect={() => togglePurpose(purpose.id)}
            />
          ))}
        </SimpleGrid>
      </Box>
    </OnboardingStepShell>
  );
}
