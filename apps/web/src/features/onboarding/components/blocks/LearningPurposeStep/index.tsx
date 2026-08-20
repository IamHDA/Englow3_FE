"use client";

import { Box, Button, SimpleGrid, UnstyledButton } from "@mantine/core";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

import { LEARNING_PURPOSE_COPY } from "@/features/onboarding/constants/onboardingSteps";

import classes from "./LearningPurposeStep.module.css";
import { OnboardingStepShell } from "./OnboardingStepShell";

import type { LearningPurposesQuery } from "@/lib/graphql/generated/hooks";

/** Một mục đích học như BFF trả về - lấy thẳng hình dạng codegen sinh. */
type LearningPurpose = LearningPurposesQuery["learningPurposes"][number];

type LearningPurposeStepProps = {
  purposes: LearningPurpose[];
  /** Đóng modal - bước 1 chưa có bước trước để lùi về. */
  onBack: () => void;
  /**
   * Bấm tiếp tục kèm các id đã chọn. Việc gửi lên BFF làm ở lần sau, khi BFF đã
   * có mutation - ở đây chỉ báo ra ngoài để nơi gọi quyết định.
   */
  onContinue: (selectedIds: number[]) => void;
};

export function LearningPurposeStep({
  purposes,
  onBack,
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
      title={LEARNING_PURPOSE_COPY.title}
      subtitle={LEARNING_PURPOSE_COPY.subtitle}
      onBack={onBack}
      footer={
        <Button
          type="button"
          color="orange.4"
          radius={20}
          h={60}
          px={28}
          fz={18}
          fw={700}
          disabled={selectedIds.length === 0}
          rightSection={<ArrowRight aria-hidden="true" size={22} />}
          onClick={() => onContinue(selectedIds)}
        >
          Tiếp tục
        </Button>
      }
    >
      {/* Nút thật nên Tab/Enter/Space chạy sẵn; `aria-pressed` cho trình đọc
          màn hình biết đây là lựa chọn bật/tắt và chọn được nhiều ô. */}
      <Box role="group" aria-label="Mục đích học tiếng Anh">
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={20}>
          {purposes.map((purpose) => (
            <UnstyledButton
              key={purpose.id}
              type="button"
              aria-pressed={selectedIds.includes(purpose.id)}
              onClick={() => togglePurpose(purpose.id)}
              className={classes.purpose}
            >
              {purpose.displayName}
            </UnstyledButton>
          ))}
        </SimpleGrid>
      </Box>
    </OnboardingStepShell>
  );
}
