"use client";

import { Paper, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { Lock } from "lucide-react";
import type { ReactNode } from "react";

import { useLanguage } from "@/shared/hooks/useLanguage";

type WallUnavailableProps = {
  /** "Bỏ chặn", when the viewer is the one who blocked. Nothing says who blocked whom. */
  actions?: ReactNode;
};

/** The wall of an account that cannot be seen. It never says why, so it never says who blocked whom. */
export function WallUnavailable({ actions }: WallUnavailableProps) {
  const copy = useLanguage().t.friends.wall;
  return (
    <Paper radius="lg" withBorder>
      <Stack align="center" gap="sm" px="md" py={56}>
        <ThemeIcon size={56} radius="xl" variant="light" color="ink">
          <Lock size={28} aria-hidden="true" />
        </ThemeIcon>
        <Title order={1} fz={20} fw={700} c="navy.9" ta="center">
          {copy.unavailableTitle}
        </Title>
        <Text size="sm" c="ink.6" ta="center" maw={420}>
          {copy.unavailableDescription}
        </Text>
        {actions}
      </Stack>
    </Paper>
  );
}
