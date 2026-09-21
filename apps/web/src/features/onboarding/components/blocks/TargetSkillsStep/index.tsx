"use client";

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
      title={TARGET_SKILLS_COPY.title}
      subtitle={TARGET_SKILLS_COPY.subtitle}
      footer={
        <OnboardingStepFooter
          pending={pending}
          errorMessage={errorMessage}
          label="Hoàn tất"
          onContinue={() => onFinish(selected)}
        />
      }
    >
      <Box role="group" aria-label="Kỹ năng muốn tập trung">
        <SimpleGrid cols={{ base: 2, sm: 3 }} spacing={16}>
          {SKILL_CHOICES.map((skill) => (
            <OnboardingChoiceTile
              key={skill}
              label={LEARNING_SKILL_LABELS[skill]}
              selected={selected.includes(skill)}
              disabled={pending}
              onSelect={() => toggleSkill(skill)}
            />
          ))}
        </SimpleGrid>
      </Box>

      <Text size="xs" c="ink.5" ta="center" mt={18}>
        Chưa chắc thì cứ bỏ trống - bạn đổi được bất cứ lúc nào trong hồ sơ.
      </Text>
    </OnboardingStepShell>
  );
}
