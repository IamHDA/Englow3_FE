"use client";

import { Button, Paper, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { MessageCircleOff } from "lucide-react";
import Link from "next/link";

import { useLanguage } from "@/shared/hooks/useLanguage";

import { CHAT_ROUTES } from "../../../constants/chat";

/** What /chat says to an account that is not a learner: messages are for learners, and no ticket is asked for. */
export function ChatLearnersOnly() {
  const copy = useLanguage().t.chat.learnersOnly;
  return (
    <Paper radius="lg" withBorder>
      <Stack align="center" gap="sm" px="md" py={56}>
        <ThemeIcon size={56} radius="xl" variant="light" color="brand">
          <MessageCircleOff size={28} aria-hidden="true" />
        </ThemeIcon>
        <Title order={1} fz={20} fw={700} c="navy.9" ta="center">
          {copy.title}
        </Title>
        <Text size="sm" c="ink.6" ta="center" maw={440}>
          {copy.description}
        </Text>
        <Button
          component={Link}
          href={CHAT_ROUTES.admin}
          variant="default"
          mt="xs"
        >
          {copy.action}
        </Button>
      </Stack>
    </Paper>
  );
}
