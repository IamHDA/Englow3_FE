"use client";

import { Group, SegmentedControl, Stack, Title } from "@mantine/core";
import { IconCards, IconChartBar } from "@tabler/icons-react";
import React from "react";
import { useLanguage } from "@/shared/hooks/useLanguage";

interface FlashcardHeaderProps {
  activeTab: "decks" | "stats";
  onTabChange: (tab: "decks" | "stats") => void;
}

export function FlashcardHeader({
  activeTab,
  onTabChange,
}: FlashcardHeaderProps) {
  const { t } = useLanguage();

  return (
    <Stack gap="xs">
      <Group justify="space-between" align="flex-end" wrap="wrap">
        <Title order={2} fw={800} c="dark.9">
          {t.flashcard.title}
        </Title>

        <SegmentedControl
          value={activeTab}
          onChange={(val) => onTabChange(val as "decks" | "stats")}
          data={[
            {
              value: "decks",
              label: (
                <Group gap="xs" wrap="nowrap">
                  <IconCards size={16} />
                  <span>{t.flashcard.decksTab}</span>
                </Group>
              ),
            },
            {
              value: "stats",
              label: (
                <Group gap="xs" wrap="nowrap">
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
