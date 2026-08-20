"use client";

import { Badge, Group, Stack, Text, UnstyledButton } from "@mantine/core";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";

import {
  ONBOARDING_TOTAL_STEPS,
  getOnboardingStepNumber,
} from "@/features/onboarding/constants/onboardingSteps";

import classes from "../LearningPurposeStep.module.css";

import type { OnboardingStep } from "@/lib/graphql/generated";

type OnboardingStepShellProps = {
  step: OnboardingStep;
  title: string;
  subtitle: string;
  /** Vùng nội dung thay đổi theo trạng thái: lưới thật, skeleton, lỗi hay rỗng. */
  children: ReactNode;
  /** Hàng nút dưới cùng - để trống khi đang tải vì chưa có gì để tiếp tục. */
  footer?: ReactNode;
  /**
   * Không truyền thì không vẽ nút - bước 1 không có bước trước để lùi về.
   * Popup onboarding cũng đang bắt buộc nên không có cách nào khác để đóng.
   */
  onBack?: () => void;
};

/**
 * Phần khung không đổi của một bước onboarding: nút quay lại (khi có), logo,
 * badge số bước, tiêu đề và phụ đề.
 *
 * Tách ra vì cả bước thật lẫn skeleton đều dựng đúng khung này - nếu skeleton
 * chỉ có mỗi lưới thì tiêu đề sẽ nhảy vào khi dữ liệu về, đúng thứ skeleton
 * sinh ra để tránh.
 */
export function OnboardingStepShell({
  step,
  title,
  subtitle,
  children,
  footer,
  onBack,
}: OnboardingStepShellProps) {
  return (
    <Stack gap={0}>
      {onBack ? (
        <Group justify="flex-start">
          <UnstyledButton
            type="button"
            onClick={onBack}
            className={classes.backButton}
          >
            <Group gap={8} wrap="nowrap">
              <ArrowLeft aria-hidden="true" size={20} />
              Quay lại
            </Group>
          </UnstyledButton>
        </Group>
      ) : null}

      <Group justify="center" gap={16} mt={18} wrap="nowrap">
        <Image src="/englow3-mark.png" alt="Englow3" width={52} height={56} />
        <Badge size="lg" radius={10} color="navy.0" c="navy.9" py={16} px={14}>
          Bước {getOnboardingStepNumber(step)} / {ONBOARDING_TOTAL_STEPS}
        </Badge>
      </Group>

      <Stack gap={6} mt={22}>
        <Text component="h2" className={classes.title}>
          {title}
        </Text>
        <Text className={classes.subtitle}>{subtitle}</Text>
      </Stack>

      <Stack mt={26} gap={0}>
        {children}
      </Stack>

      {footer ? (
        <Group justify="flex-end" mt={30}>
          {footer}
        </Group>
      ) : null}
    </Stack>
  );
}
