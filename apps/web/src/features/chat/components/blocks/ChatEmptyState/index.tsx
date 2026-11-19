"use client";

import { Stack, Text, ThemeIcon } from "@mantine/core";
import type { ReactNode } from "react";

type ChatEmptyStateProps = {
  icon: ReactNode;
  title: string;
  description: string;
  /** What to do about it, if there is something. */
  action?: ReactNode;
};

/** What the list, the pane and a conversation without messages say when there is nothing to show - and where to go next. */
export function ChatEmptyState({
  icon,
  title,
  description,
  action,
}: ChatEmptyStateProps) {
  return (
    <Stack align="center" justify="center" gap="xs" px="md" py="xl" h="100%">
      <ThemeIcon size={48} radius="xl" variant="light" color="brand">
        {icon}
      </ThemeIcon>
      <Text fw={700} c="navy.9" ta="center">
        {title}
      </Text>
      <Text size="sm" c="ink.6" ta="center" maw={340}>
        {description}
      </Text>
      {action}
    </Stack>
  );
}
