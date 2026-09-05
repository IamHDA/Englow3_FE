"use client";

import {
  Box,
  Button,
  SimpleGrid,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

import { LEARNING_PURPOSE_COPY } from "@/features/onboarding/constants/onboardingSteps";

import classes from "./LearningPurposeStep.module.css";
import { OnboardingStepShell } from "./OnboardingStepShell";

import { OnboardingStep } from "@/lib/graphql/generated";
import type { LearningPurposesQuery } from "@/lib/graphql/generated/hooks";

/** Một mục đích học như BFF trả về - lấy thẳng hình dạng codegen sinh. */
type LearningPurpose = LearningPurposesQuery["learningPurposes"][number];

/**
 * Chưa nối mutation lưu lựa chọn lên BFF nên nút Tiếp tục còn khoá - bước này
 * mới dựng để xem giao diện. Bật lại bằng cách sửa đúng dòng này khi BFF có
 * mutation, kèm khôi phục `onContinue` để gọi mutation đó.
 */
const CONTINUE_ENABLED = false;

type LearningPurposeStepProps = {
  purposes: LearningPurpose[];
};

export function LearningPurposeStep({ purposes }: LearningPurposeStepProps) {
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
        <Stack gap={8} align="flex-end">
          <Button
            type="button"
            color="orange.4"
            radius={20}
            h={60}
            px={28}
            fz={18}
            fw={700}
            disabled={!CONTINUE_ENABLED || selectedIds.length === 0}
            rightSection={<ArrowRight aria-hidden="true" size={22} />}
          >
            Tiếp tục
          </Button>
          <Text size="xs" c="ink.5">
            Bước tiếp theo đang được hoàn thiện.
          </Text>
        </Stack>
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
