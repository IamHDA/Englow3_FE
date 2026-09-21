"use client";

import { Box, SimpleGrid, Text } from "@mantine/core";
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
};

/**
 * Không có ô "tôi chưa biết": backend chỉ nhận mức null để đẩy người học sang
 * bài kiểm tra xếp trình độ, mà bài đó chưa dựng nên nó trả về
 * PLACEMENT_NOT_AVAILABLE / QUIZ_NOT_AVAILABLE. Vẽ ô đó ra là mời người dùng
 * bấm vào một đường chắc chắn hỏng.
 */
export function CurrentLevelStep({
  initialLevel,
  pending,
  errorMessage,
  onContinue,
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

      <Text size="xs" c="ink.5" ta="center" mt={18}>
        Bài kiểm tra xếp trình độ tự động sẽ có sau - tạm thời bạn tự chọn mức
        gần đúng nhất.
      </Text>
    </OnboardingStepShell>
  );
}
