"use client";

import { useLanguage } from "@/shared/hooks/useLanguage";

import { Alert, Box, Button, SimpleGrid, Text } from "@mantine/core";
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
  /**
   * Người không thi chứng chỉ đo bằng bài đo trình độ ba phần (từ vựng và ngữ
   * pháp, nghe, nói) thay cho bài xếp lớp của chứng chỉ.
   */
  certificateLearner?: boolean;
  onTakeLevelCheck?: () => void;
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
  certificateLearner = true,
  onTakeLevelCheck,
}: CurrentLevelStepProps) {
  const levelCheck = !certificateLearner && onTakeLevelCheck != null;
  const { isVi } = useLanguage();
  const tr = (vi: string, en: string) => (isVi ? vi : en);
  const copy = isVi ? CURRENT_LEVEL_COPY.vi : CURRENT_LEVEL_COPY.en;
  const [selected, setSelected] = useState<CefrLevel | null>(initialLevel);

  return (
    <OnboardingStepShell
      step={OnboardingStep.CURRENT_LEVEL}
      title={copy.title}
      subtitle={copy.subtitle}
      footer={
        <OnboardingStepFooter
          pending={pending}
          errorMessage={errorMessage}
          disabled={selected === null}
          onContinue={() => selected && onContinue(selected)}
        />
      }
    >
      <Alert
        color="teal"
        radius="md"
        mb="lg"
        title={tr("Chưa rõ trình độ của mình?", "Not sure of your level?")}
      >
        <Text size="sm" mb="sm">
          {levelCheck
            ? tr(
                "Làm bài đo trình độ gồm từ vựng và ngữ pháp, nghe, và một câu trả lời nói ngắn. Hệ thống ghép ba phần thành trình độ của bạn. Bạn cũng có thể tự chọn mức bên dưới.",
                "Take the level test: vocabulary and grammar, listening, and a short spoken answer, combined into your level. Or choose a level below yourself.",
              )
            : tr(
                "Làm bài kiểm tra đầu vào để hệ thống ghi nhận trình độ từ kết quả. Bạn cũng có thể tự chọn mức bên dưới.",
                "Take the placement test to set your level from the result, or choose a level below yourself.",
              )}
        </Text>
        <Button
          color="teal"
          onClick={levelCheck ? onTakeLevelCheck : onTakePlacementTest}
          disabled={pending}
        >
          {levelCheck
            ? tr("Làm bài đo trình độ", "Take the level test")
            : tr("Làm bài kiểm tra đầu vào", "Take the placement test")}
        </Button>
      </Alert>
      <Box
        role="group"
        aria-label={tr("Trình độ tiếng Anh hiện tại", "Current English level")}
      >
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={20}>
          {CEFR_LEVEL_CHOICES.map((choice) => (
            <OnboardingChoiceTile
              key={choice.level}
              label={isVi ? choice.label.vi : choice.label.en}
              description={isVi ? choice.description.vi : choice.description.en}
              selected={selected === choice.level}
              disabled={pending}
              onSelect={() => setSelected(choice.level)}
            />
          ))}
        </SimpleGrid>
      </Box>
    </OnboardingStepShell>
  );
}
