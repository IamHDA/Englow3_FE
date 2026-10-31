"use client";

import { useLanguage } from "@/shared/hooks/useLanguage";

import { Box, SimpleGrid, Text } from "@mantine/core";
import { useState } from "react";

import {
  LEARNING_SKILL_LABELS,
  TARGET_SKILLS_COPY,
} from "@/features/onboarding/constants/onboardingSteps";

import { OnboardingChoiceTile } from "../../parts/OnboardingChoiceTile";
import { OnboardingStepFooter } from "../../parts/OnboardingStepFooter";
import { OnboardingStepShell } from "../../parts/OnboardingStepShell";

import { LearningSkill, OnboardingStep } from "@/lib/graphql/generated";

const SKILL_CHOICES = Object.values(LearningSkill);

type TargetSkillsStepProps = {
  initialSkills: LearningSkill[];
  pending: boolean;
  errorMessage: string | null;
  onFinish: (skills: LearningSkill[]) => void;
};

/**
 * Bước cuối. Danh sách rỗng là hợp lệ ("chưa biết chọn gì"), nên nút không bị
 * khoá theo số ô đã chọn - khác hẳn bốn bước trước.
 */
export function TargetSkillsStep({
  initialSkills,
  pending,
  errorMessage,
  onFinish,
}: TargetSkillsStepProps) {
  const { isVi } = useLanguage();
  const tr = (vi: string, en: string) => (isVi ? vi : en);
  const copy = isVi ? TARGET_SKILLS_COPY.vi : TARGET_SKILLS_COPY.en;
  const [selected, setSelected] = useState<LearningSkill[]>(initialSkills);

  function toggleSkill(skill: LearningSkill) {
    setSelected((current) =>
      current.includes(skill)
        ? current.filter((item) => item !== skill)
        : [...current, skill],
    );
  }

  return (
    <OnboardingStepShell
      step={OnboardingStep.TARGET_SKILLS}
      title={copy.title}
      subtitle={copy.subtitle}
      footer={
        <OnboardingStepFooter
          pending={pending}
          errorMessage={errorMessage}
          label={tr("Hoàn tất", "Finish")}
          onContinue={() => onFinish(selected)}
        />
      }
    >
      <Box
        role="group"
        aria-label={tr("Kỹ năng muốn tập trung", "Skills to focus on")}
      >
        <SimpleGrid cols={{ base: 2, sm: 3 }} spacing={16}>
          {SKILL_CHOICES.map((skill) => (
            <OnboardingChoiceTile
              key={skill}
              label={
                isVi
                  ? LEARNING_SKILL_LABELS[skill].vi
                  : LEARNING_SKILL_LABELS[skill].en
              }
              selected={selected.includes(skill)}
              disabled={pending}
              onSelect={() => toggleSkill(skill)}
            />
          ))}
        </SimpleGrid>
      </Box>

      <Text size="xs" c="ink.5" ta="center" mt={18}>
        {tr(
          "Chưa chắc thì cứ bỏ trống - bạn đổi được bất cứ lúc nào trong hồ sơ.",
          "Not sure? Leave it empty - you can change it any time in your profile.",
        )}
      </Text>
    </OnboardingStepShell>
  );
}
