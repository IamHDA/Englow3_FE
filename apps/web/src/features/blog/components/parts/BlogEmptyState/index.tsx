"use client";

import { Stack, Text, ThemeIcon } from "@mantine/core";
import type { ReactNode } from "react";

type BlogEmptyStateProps = {
  icon: ReactNode;
  title: string;
  description: string;
  /** What to do about it, if there is something. */
  action?: ReactNode;
};

/** What a list says when it has nothing to show - and, where there is something to do, the way to do it. */
export function BlogEmptyState({
  icon,
  title,
  description,
  action,
}: BlogEmptyStateProps) {
  return (
    <Stack align="center" gap="xs" px="md" py="xl">
      <ThemeIcon size={48} radius="xl" variant="light" color="brand">
        {icon}
      </ThemeIcon>
      <Text fw={700} c="navy.9" ta="center">
        {title}
      </Text>
      <Text size="sm" c="ink.6" ta="center" maw={380}>
        {description}
      </Text>
      {action}
    </Stack>
  );
}
