"use client";

import { Stack, Text, UnstyledButton } from "@mantine/core";

import classes from "./OnboardingChoiceTile.module.css";

type OnboardingChoiceTileProps = {
  label: string;
  /** Dòng phụ dưới nhãn - bước chọn trình độ và kỹ năng cần giải thích thêm. */
  description?: string;
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
};

/**
 * Ô chọn của onboarding. Là `button` thật nên Tab/Enter/Space chạy sẵn;
 * `aria-pressed` cho trình đọc màn hình biết đây là lựa chọn bật/tắt, đúng cả
 * khi bước đó chỉ cho chọn một ô.
 */
export function OnboardingChoiceTile({
  label,
  description,
  selected,
  disabled,
  onSelect,
}: OnboardingChoiceTileProps) {
  return (
    <UnstyledButton
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onSelect}
      className={classes.tile}
    >
      <Stack gap={4} justify="center" h="100%">
        <Text inherit>{label}</Text>
        {description && (
          <Text inherit className={classes.description}>
            {description}
          </Text>
        )}
      </Stack>
    </UnstyledButton>
  );
}
