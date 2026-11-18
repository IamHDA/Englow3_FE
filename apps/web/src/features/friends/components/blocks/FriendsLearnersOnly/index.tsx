"use client";

import { Button, Paper, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { UsersRound } from "lucide-react";
import Link from "next/link";

import { FRIENDS_ROUTES, LEARNERS_ONLY_COPY } from "../../../constants/friends";

/** What /friends says to an account that is not a learner: friends are for learners, and nothing is fetched. */
export function FriendsLearnersOnly() {
  return (
    <Paper radius="lg" withBorder>
      <Stack align="center" gap="sm" px="md" py={56}>
        <ThemeIcon size={56} radius="xl" variant="light" color="brand">
          <UsersRound size={28} aria-hidden="true" />
        </ThemeIcon>
        <Title order={2} fz={20} fw={700} c="navy.9" ta="center">
          {LEARNERS_ONLY_COPY.title}
        </Title>
        <Text size="sm" c="ink.6" ta="center" maw={440}>
          {LEARNERS_ONLY_COPY.description}
        </Text>
        <Button
          component={Link}
          href={FRIENDS_ROUTES.admin}
          variant="default"
          mt="xs"
        >
          {LEARNERS_ONLY_COPY.action}
        </Button>
      </Stack>
    </Paper>
  );
}
