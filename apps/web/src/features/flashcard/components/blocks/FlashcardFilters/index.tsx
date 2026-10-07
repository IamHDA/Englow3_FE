"use client";

import {
  ActionIcon,
  Chip,
  Group,
  Select,
  Stack,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { IconLayoutGrid, IconList, IconSearch } from "@tabler/icons-react";
import React from "react";
import { useLanguage } from "@/shared/hooks/useLanguage";

interface FlashcardFiltersProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedTopic: string;
  onTopicChange: (val: string) => void;
  selectedSort: string;
  onSortChange: (val: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (val: "grid" | "list") => void;
}

export function FlashcardFilters({
  searchQuery,
  onSearchChange,
  selectedTopic,
  onTopicChange,
  selectedSort,
  onSortChange,
  viewMode,
  onViewModeChange,
}: FlashcardFiltersProps) {
  const { t, isVi } = useLanguage();

  const topics = [
    { key: "ALL", label: t.flashcard.allTopicsChip },
    { key: "IELTS", label: "IELTS" },
    { key: "TOEIC", label: "TOEIC" },
    { key: "Daily Conversation", label: t.flashcard.dailyConversationChip },
    { key: "Travel", label: t.flashcard.travelChip },
  ];

  return (
    <Stack gap="sm">
      <Group justify="space-between" align="center" wrap="wrap">
        <TextInput
          placeholder={t.flashcard.searchPlaceholder}
          aria-label={t.flashcard.searchPlaceholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.currentTarget.value)}
          leftSection={<IconSearch size={16} />}
          style={{ flex: 1, minWidth: 260 }}
          size="sm"
        />

        <Group gap="xs">
          <Select
            size="sm"
            value={selectedSort}
            onChange={(val) => onSortChange(val || "due")}
            aria-label={isVi ? "Sắp xếp" : "Sort"}
            data={[
              { value: "due", label: t.flashcard.sortDue },
              { value: "progress", label: t.flashcard.sortProgress },
              { value: "cards", label: t.flashcard.sortCards },
            ]}
            style={{ width: 190 }}
          />

          <Group gap={4}>
            <Tooltip label={t.flashcard.gridViewTooltip}>
              <ActionIcon
                variant={viewMode === "grid" ? "filled" : "subtle"}
                color="indigo"
                onClick={() => onViewModeChange("grid")}
                aria-label={t.flashcard.gridViewAria}
              >
                <IconLayoutGrid size={18} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label={t.flashcard.listViewTooltip}>
              <ActionIcon
                variant={viewMode === "list" ? "filled" : "subtle"}
                color="indigo"
                onClick={() => onViewModeChange("list")}
                aria-label={t.flashcard.listViewAria}
              >
                <IconList size={18} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
      </Group>

      {/* Topic Chips */}
      <Group gap="xs">
        {topics.map((item) => {
          const isSelected = selectedTopic === item.key;
          return (
            <Chip
              key={item.key}
              checked={isSelected}
              onChange={() => onTopicChange(item.key)}
              size="xs"
              variant="outline"
              color="indigo"
            >
              {item.label}
            </Chip>
          );
        })}
      </Group>
    </Stack>
  );
}
