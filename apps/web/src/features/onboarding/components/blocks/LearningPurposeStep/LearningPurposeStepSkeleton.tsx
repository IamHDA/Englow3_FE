"use client";

import { SimpleGrid, Skeleton } from "@mantine/core";

import { LEARNING_PURPOSE_COPY } from "@/features/onboarding/constants/onboardingSteps";

import { OnboardingStepShell } from "./OnboardingStepShell";

import { OnboardingStep } from "@/lib/graphql/generated";

/** Số ô giả trong lúc chờ - khớp số mục đích backend đang trả về. */
const PLACEHOLDER_COUNT = 6;

/**
 * Đứng thay cho bước chọn mục đích lúc đang tải. Dựng đúng khung thật, chỉ lưới
 * là ô xám - cùng số ô, cùng chiều cao 70px, cùng khoảng cách, nên khi dữ liệu
 * về không có gì nhảy chỗ.
 *
 * Chưa có nút "Tiếp tục": chưa có gì để chọn thì cũng chưa có gì để tiếp tục.
 */
export function LearningPurposeStepSkeleton() {
  return (
    <OnboardingStepShell
      step={OnboardingStep.LEARNING_PURPOSES}
      title={LEARNING_PURPOSE_COPY.title}
      subtitle={LEARNING_PURPOSE_COPY.subtitle}
    >
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={20}>
        {Array.from({ length: PLACEHOLDER_COUNT }, (_, index) => (
          <Skeleton key={index} height={70} radius={20} />
        ))}
      </SimpleGrid>
    </OnboardingStepShell>
  );
}
