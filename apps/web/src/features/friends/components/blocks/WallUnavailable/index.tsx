"use client";

import { Paper, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { Lock } from "lucide-react";
import type { ReactNode } from "react";

import { WALL_COPY } from "../../../constants/friends";

type WallUnavailableProps = {
  /** "Bỏ chặn", when the viewer is the one who blocked. Nothing says who blocked whom. */
  actions?: ReactNode;
};

/** The wall of an account that cannot be seen. It never says why, so it never says who blocked whom. */
export function WallUnavailable({ actions }: WallUnavailableProps) {
  return (
    <Paper radius="lg" withBorder>
      <Stack align="center" gap="sm" px="md" py={56}>
        <ThemeIcon size={56} radius="xl" variant="light" color="ink">
          <Lock size={28} aria-hidden="true" />
        </ThemeIcon>
        <Title order={1} fz={20} fw={700} c="navy.9" ta="center">
          {WALL_COPY.unavailableTitle}
        </Title>
        <Text size="sm" c="ink.6" ta="center" maw={420}>
          {WALL_COPY.unavailableDescription}
        </Text>
        {actions}
      </Stack>
    </Paper>
  );
}
