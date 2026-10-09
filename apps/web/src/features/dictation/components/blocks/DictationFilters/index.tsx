"use client";

import { ActionIcon, Flex, Group, Paper, Select, Tooltip } from "@mantine/core";
import { LayoutGrid, List } from "lucide-react";
import { useLanguage } from "@/shared/hooks/useLanguage";
import {
  DICTATION_LEVELS,
  DICTATION_SORTS,
  DICTATION_STATUSES,
  DICTATION_TOPICS,
} from "../../../constants/dictationData";

interface DictationFiltersProps {
  selectedTopic: string;
  onTopicChange: (val: string) => void;
  selectedLevel: string;
  onLevelChange: (val: string) => void;
  selectedStatus: string;
  onStatusChange: (val: string) => void;
  selectedSort: string;
  onSortChange: (val: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
}

export function DictationFilters({
  selectedTopic,
  onTopicChange,
  selectedLevel,
  onLevelChange,
  selectedStatus,
  onStatusChange,
  selectedSort,
  onSortChange,
  viewMode,
  onViewModeChange,
}: DictationFiltersProps) {
  const { isVi, t } = useLanguage();

  const topicsData = DICTATION_TOPICS.map((item) => ({
    value: item.value,
    label: isVi ? item.labelVi : item.labelEn,
  }));

  const levelsData = DICTATION_LEVELS.map((item) => ({
    value: item.value,
    label: isVi ? item.labelVi : item.labelEn,
  }));

  const statusesData = DICTATION_STATUSES.map((item) => ({
    value: item.value,
    label: isVi ? item.labelVi : item.labelEn,
  }));

  const sortsData = DICTATION_SORTS.map((item) => ({
    value: item.value,
    label: isVi ? item.labelVi : item.labelEn,
  }));

  return (
    <Paper radius="md" p="sm" withBorder bg="white">
      <Flex
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align={{ base: "stretch", md: "center" }}
        gap="sm"
      >
        <Flex
          direction={{ base: "column", sm: "row" }}
          gap="xs"
          wrap="wrap"
          style={{ flex: 1 }}
        >
          <Select
            size="sm"
            data={topicsData}
            value={selectedTopic}
            onChange={(val) => onTopicChange(val || "ALL")}
            style={{ flex: 1, minWidth: 150 }}
            aria-label={t.dictation.filterByTopicAria}
          />

          <Select
            size="sm"
            data={levelsData}
            value={selectedLevel}
            onChange={(val) => onLevelChange(val || "ALL")}
            style={{ flex: 1, minWidth: 150 }}
            aria-label={t.dictation.filterByLevelAria}
          />

          <Select
            size="sm"
            data={statusesData}
            value={selectedStatus}
            onChange={(val) => onStatusChange(val || "ALL")}
            style={{ flex: 1, minWidth: 140 }}
            aria-label={t.dictation.filterByStatusAria}
          />

          <Select
            size="sm"
            data={sortsData}
            value={selectedSort}
            onChange={(val) => onSortChange(val || "recent")}
            style={{ flex: 1, minWidth: 150 }}
            aria-label={t.dictation.sortLessonsAria}
          />
        </Flex>

        <Group gap={6} justify="flex-end">
          <Tooltip label={t.dictation.gridView} withArrow>
            <ActionIcon
              variant={viewMode === "grid" ? "filled" : "default"}
              color="navy"
              size="lg"
              radius="md"
              onClick={() => onViewModeChange("grid")}
              aria-label={isVi ? "Xem dạng lưới" : "Grid view"}
            >
              <LayoutGrid size={18} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label={t.dictation.listView} withArrow>
            <ActionIcon
              variant={viewMode === "list" ? "filled" : "default"}
              color="navy"
              size="lg"
              radius="md"
              onClick={() => onViewModeChange("list")}
              aria-label={isVi ? "Xem dạng danh sách" : "List view"}
            >
              <List size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Flex>
    </Paper>
  );
}
