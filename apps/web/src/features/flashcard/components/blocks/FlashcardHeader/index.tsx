"use client";

import { Badge, Box, Group, SegmentedControl, Stack, Text, Title } from "@mantine/core";
import { IconCards, IconChartBar } from "@tabler/icons-react";
import React from "react";
import { useLanguage } from "@/shared/hooks/useLanguage";

interface FlashcardHeaderProps {
  activeTab: "decks" | "stats";
  onTabChange: (tab: "decks" | "stats") => void;
}

export function FlashcardHeader({ activeTab, onTabChange }: FlashcardHeaderProps) {
  const { t } = useLanguage();

  return (
    <Stack gap="xs">
      <Group justify="space-between" align="flex-end" wrap="wrap">
        <Box>
          <Group gap="xs" align="center">
            <Title order={2} fw={800} c="dark.9">
              {t.flashcard.title}
            </Title>
            <Badge variant="filled" color="indigo" size="sm">
              {t.flashcard.srsBadge}
            </Badge>
          </Group>
          <Text c="dimmed" fz="sm" mt={4}>
            {t.flashcard.subtitle}
          </Text>
        </Box>

        <SegmentedControl
          value={activeTab}
          onChange={(val) => onTabChange(val as "decks" | "stats")}
          data={[
            {
              value: "decks",
              label: (
                <Group gap="xs">
                  <IconCards size={16} />
                  <span>{t.flashcard.decksTab}</span>
                </Group>
              ),
            },
            {
              value: "stats",
              label: (
                <Group gap="xs">
                  <IconChartBar size={16} />
                  <span>{t.flashcard.statsTab}</span>
                </Group>
              ),
            },
          ]}
        />
      </Group>
    </Stack>
  );
}
