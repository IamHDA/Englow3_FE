"use client";

import { Button, Stack, Text } from "@mantine/core";
import { ArrowRight } from "lucide-react";

type OnboardingStepFooterProps = {
  /** Đang gọi BFF - khoá nút và đổi nhãn, không phải trường hợp dùng skeleton. */
  pending: boolean;
  errorMessage: string | null;
  /** Chưa chọn đủ để đi tiếp. Tách khỏi `pending` để hai lý do không lẫn nhau. */
  disabled?: boolean;
  label?: string;
  onContinue: () => void;
};

const DEFAULT_LABEL = "Tiếp tục";

/** Hàng nút cuối mỗi bước onboarding: lỗi lần gửi trước, rồi nút đi tiếp. */
export function OnboardingStepFooter({
  pending,
  errorMessage,
  disabled,
  label = DEFAULT_LABEL,
  onContinue,
}: OnboardingStepFooterProps) {
  return (
    <Stack gap={8} align="flex-end">
      {errorMessage && (
        <Text size="sm" c="warn.6" ta="right" role="alert">
          {errorMessage}
        </Text>
      )}
      <Button
        type="button"
        color="orange.4"
        radius={20}
        h={60}
        px={28}
        fz={18}
        fw={700}
        loading={pending}
        disabled={disabled}
        onClick={onContinue}
        rightSection={<ArrowRight aria-hidden="true" size={22} />}
      >
        {label}
      </Button>
    </Stack>
  );
}
