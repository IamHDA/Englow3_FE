"use client";

import { Anchor, Box, SimpleGrid, Text } from "@mantine/core";
import { useState } from "react";

import {
  CEFR_LEVEL_CHOICES,
  CURRENT_LEVEL_COPY,
} from "@/features/onboarding/constants/onboardingSteps";

import { OnboardingChoiceTile } from "../../parts/OnboardingChoiceTile";
import { OnboardingStepFooter } from "../../parts/OnboardingStepFooter";
import { OnboardingStepShell } from "../../parts/OnboardingStepShell";

import { OnboardingStep } from "@/lib/graphql/generated";
import type { CefrLevel } from "@/lib/graphql/generated";

type CurrentLevelStepProps = {
  initialLevel: CefrLevel | null;
  pending: boolean;
  errorMessage: string | null;
  onContinue: (level: CefrLevel) => void;
  /** Mở bài kiểm tra xếp trình độ thay vì tự khai. */
  onTakePlacementTest: () => void;
};

/**
 * "Tôi chưa biết" không gửi mức null lên backend - backend từ chối mức null.
 * Nó mở bài kiểm tra xếp trình độ, và chính điểm của bài đó ghi mức cho người
 * học rồi đẩy onboarding sang bước kế.
 */
export function CurrentLevelStep({
  initialLevel,
  pending,
  errorMessage,
  onContinue,
  onTakePlacementTest,
}: CurrentLevelStepProps) {
  const [selected, setSelected] = useState<CefrLevel | null>(initialLevel);

  return (
    <OnboardingStepShell
      step={OnboardingStep.CURRENT_LEVEL}
      title={CURRENT_LEVEL_COPY.title}
      subtitle={CURRENT_LEVEL_COPY.subtitle}
      footer={
        <OnboardingStepFooter
          pending={pending}
          errorMessage={errorMessage}
          disabled={selected === null}
          onContinue={() => selected && onContinue(selected)}
        />
      }
    >
      <Box role="group" aria-label="Trình độ tiếng Anh hiện tại">
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={20}>
          {CEFR_LEVEL_CHOICES.map((choice) => (
            <OnboardingChoiceTile
              key={choice.level}
              label={choice.label}
              description={choice.description}
              selected={selected === choice.level}
              disabled={pending}
              onSelect={() => setSelected(choice.level)}
            />
          ))}
        </SimpleGrid>
      </Box>

      <Text size="sm" c="ink.6" ta="center" mt={18}>
        Chưa chắc mình ở đâu?{" "}
        <Anchor
          component="button"
          type="button"
          onClick={onTakePlacementTest}
          disabled={pending}
          fw={700}
        >
          Làm bài kiểm tra đầu vào
        </Anchor>
      </Text>
    </OnboardingStepShell>
  );
}
