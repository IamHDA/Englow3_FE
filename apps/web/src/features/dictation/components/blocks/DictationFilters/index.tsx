"use client";

import {
  ActionIcon,
  Flex,
  Group,
  Paper,
  Select,
  Tooltip,
} from "@mantine/core";
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

const EN_TOPICS: Record<string, string> = {
  ALL: "All Topics",
  "Daily Conversation": "Daily Conversation",
  "Business English": "Business English",
  "IELTS Speaking & Listening": "IELTS Speaking & Listening",
  "Academic English": "Academic English",
};

const EN_LEVELS: Record<string, string> = {
  ALL: "All Levels",
  Beginner: "Beginner",
  Elementary: "Elementary",
  Intermediate: "Intermediate",
  "Upper Intermediate": "Upper Intermediate",
  Advanced: "Advanced",
};

const EN_STATUSES: Record<string, string> = {
  ALL: "All Statuses",
  "Not started": "Not started",
  "In progress": "In progress",
  Completed: "Completed",
};

const EN_SORTS: Record<string, string> = {
  recent: "Recently Studied",
  popular: "Most Popular",
  easiest: "Easiest to Hardest",
  hardest: "Hardest to Easiest",
};

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
    label: isVi ? item.label : (EN_TOPICS[item.value] || item.value),
  }));

  const levelsData = DICTATION_LEVELS.map((item) => ({
    value: item.value,
    label: isVi ? item.label : (EN_LEVELS[item.value] || item.value),
  }));

  const statusesData = DICTATION_STATUSES.map((item) => ({
    value: item.value,
    label: isVi ? item.label : (EN_STATUSES[item.value] || item.value),
  }));

  const sortsData = DICTATION_SORTS.map((item) => ({
    value: item.value,
    label: isVi ? item.label : (EN_SORTS[item.value] || item.label),
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
            aria-label={isVi ? "Lọc theo chủ đề" : "Filter by topic"}
          />

          <Select
            size="sm"
            data={levelsData}
            value={selectedLevel}
            onChange={(val) => onLevelChange(val || "ALL")}
            style={{ flex: 1, minWidth: 150 }}
            aria-label={isVi ? "Lọc theo cấp độ" : "Filter by level"}
          />

          <Select
            size="sm"
            data={statusesData}
            value={selectedStatus}
            onChange={(val) => onStatusChange(val || "ALL")}
            style={{ flex: 1, minWidth: 140 }}
            aria-label={isVi ? "Lọc theo trạng thái" : "Filter by status"}
          />

          <Select
            size="sm"
            data={sortsData}
            value={selectedSort}
            onChange={(val) => onSortChange(val || "recent")}
            style={{ flex: 1, minWidth: 150 }}
            aria-label={isVi ? "Sắp xếp bài học" : "Sort lessons"}
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
              aria-label="Grid view"
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
              aria-label="List view"
            >
              <List size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Flex>
    </Paper>
  );
}
