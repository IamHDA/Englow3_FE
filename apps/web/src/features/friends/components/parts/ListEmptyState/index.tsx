"use client";

import { Stack, Text, ThemeIcon } from "@mantine/core";
import type { ReactNode } from "react";

type ListEmptyStateProps = {
  icon: ReactNode;
  title: string;
  description: string;
  /** What to do about it, if there is something. */
  action?: ReactNode;
};

/** What a list says when it has nobody to show - and, where there is one, where to go next. */
export function ListEmptyState({
  icon,
  title,
  description,
  action,
}: ListEmptyStateProps) {
  return (
    <Stack align="center" gap="xs" px="md" py={56}>
      <ThemeIcon size={48} radius="xl" variant="light" color="brand">
        {icon}
      </ThemeIcon>
      <Text fw={700} c="navy.9" ta="center">
        {title}
      </Text>
      <Text size="sm" c="ink.6" ta="center" maw={360}>
        {description}
      </Text>
      {action}
    </Stack>
  );
}
