"use client";

import {
  Box,
  Button,
  Flex,
  Group,
  Menu,
  Paper,
  Tabs,
  Text,
  TextInput,
  UnstyledButton,
} from "@mantine/core";
import { Check, ChevronDown, Search, X } from "lucide-react";

import {
  getDifficultyOptions,
  getExamTypeTabs,
  getSkillOptions,
  getSortOptions,
  getStatusOptions,
  type SortKey,
} from "../../../constants/examLibrary";
import type { ExamFiltersState } from "../../../types";
import type { TargetLevel } from "@/lib/graphql/generated/schemaTypes";
import { useLanguage } from "@/shared/hooks/useLanguage";

type ExamFiltersProps = {
  filters: ExamFiltersState;
  onFilterChange: (newFilters: Partial<ExamFiltersState>) => void;
  onResetFilters: () => void;
  totalItems: number;
};

export function ExamFilters({
  filters,
  onFilterChange,
  onResetFilters,
  totalItems,
}: ExamFiltersProps) {
  const { t, isVi } = useLanguage();

  const examTypeTabs = getExamTypeTabs(t.exam.tabAll);
  const skillOptions = getSkillOptions(t.exam.skillAll);
  const difficultyOptions = getDifficultyOptions(t.exam.diffAll, isVi);
  const statusOptions = getStatusOptions(
    t.exam.statusAll,
    t.exam.notStarted,
    t.exam.inProgress,
    t.exam.completed,
  );
  const sortOptions = getSortOptions(
    t.exam.sortNewest,
    t.exam.sortLevelAsc,
    t.exam.sortLevelDesc,
    t.exam.sortScoreDesc,
  );

  const isFiltered =
    Boolean(filters.searchQuery) ||
    filters.tabId !== "all" ||
    filters.skill !== "ALL" ||
    filters.targetLevel !== "ALL" ||
    filters.attemptStatus !== "ALL";

  const currentSortLabel =
    sortOptions.find((s) => s.value === filters.sortBy)?.label ?? t.exam.sortNewest;

  const currentSkillLabel =
    skillOptions.find((s) => s.value === filters.skill)?.label ?? t.exam.skillAll;

  const currentDiffLabel =
    difficultyOptions.find((s) => s.value === filters.targetLevel)?.label ??
    t.exam.diffAll;

  const currentStatusLabel =
    statusOptions.find((s) => s.value === filters.attemptStatus)?.label ??
    t.exam.statusAll;

  return (
    <Paper radius="lg" p="md" withBorder bg="white" shadow="xs">
      <Flex justify="space-between" align="center" wrap="wrap" gap="md">
        <Box style={{ flex: "1 1 260px" }}>
          <TextInput
            placeholder={t.exam.searchPlaceholder}
            value={filters.searchQuery}
            onChange={(e) =>
              onFilterChange({ searchQuery: e.currentTarget.value, page: 0 })
            }
            leftSection={<Search size={16} aria-hidden="true" />}
            rightSection={
              filters.searchQuery ? (
                <UnstyledButton
                  onClick={() => onFilterChange({ searchQuery: "", page: 0 })}
                  aria-label={t.exam.clearSearchAria}
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <X size={14} />
                </UnstyledButton>
              ) : null
            }
            radius="xl"
            size="sm"
          />
        </Box>

        <Tabs
          value={filters.tabId}
          onChange={(val) => onFilterChange({ tabId: val || "all", page: 0 })}
        >
          <Tabs.List>
            {examTypeTabs.map((tab) => (
              <Tabs.Tab key={tab.id} value={tab.id}>
                {tab.name}
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs>

        <Group gap="xs">
          <Text size="xs" c="dimmed" fw={600}>
            {t.exam.sortByLabel}
          </Text>
          <Menu shadow="md" width={200} position="bottom-end">
            <Menu.Target>
              <Button
                variant="default"
                size="xs"
                radius="xl"
                rightSection={<ChevronDown size={14} aria-hidden="true" />}
              >
                {currentSortLabel}
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              {sortOptions.map((opt) => (
                <Menu.Item
                  key={opt.value}
                  onClick={() =>
                    onFilterChange({ sortBy: opt.value as SortKey, page: 0 })
                  }
                  leftSection={
                    filters.sortBy === opt.value ? (
                      <Check size={14} color="var(--mantine-color-blue-6)" />
                    ) : (
                      <Box w={14} />
                    )
                  }
                >
                  {opt.label}
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Flex>

      <Flex align="center" wrap="wrap" gap="xs" mt="md" pt="xs" style={{ borderTop: "1px solid var(--mantine-color-gray-2)" }}>
        {/* Kỹ năng */}
        <Menu shadow="md" width={180}>
          <Menu.Target>
            <Button
              variant={filters.skill !== "ALL" ? "light" : "default"}
              color={filters.skill !== "ALL" ? "blue" : undefined}
              size="xs"
              radius="xl"
              rightSection={<ChevronDown size={14} aria-hidden="true" />}
            >
              {currentSkillLabel}
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            {skillOptions.map((opt) => (
              <Menu.Item
                key={opt.value}
                onClick={() => onFilterChange({ skill: opt.value, page: 0 })}
                leftSection={
                  filters.skill === opt.value ? (
                    <Check size={14} color="var(--mantine-color-blue-6)" />
                  ) : (
                    <Box w={14} />
                  )
                }
              >
                {opt.label}
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>

        {/* Độ khó */}
        <Menu shadow="md" width={190}>
          <Menu.Target>
            <Button
              variant={filters.targetLevel !== "ALL" ? "light" : "default"}
              color={filters.targetLevel !== "ALL" ? "blue" : undefined}
              size="xs"
              radius="xl"
              rightSection={<ChevronDown size={14} aria-hidden="true" />}
            >
              {currentDiffLabel}
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            {difficultyOptions.map((opt) => (
              <Menu.Item
                key={opt.value}
                onClick={() =>
                  onFilterChange({
                    targetLevel: opt.value as TargetLevel | "ALL",
                    page: 0,
                  })
                }
                leftSection={
                  filters.targetLevel === opt.value ? (
                    <Check size={14} color="var(--mantine-color-blue-6)" />
                  ) : (
                    <Box w={14} />
                  )
                }
              >
                {opt.label}
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>

        {/* Trạng thái */}
        <Menu shadow="md" width={180}>
          <Menu.Target>
            <Button
              variant={filters.attemptStatus !== "ALL" ? "light" : "default"}
              color={filters.attemptStatus !== "ALL" ? "blue" : undefined}
              size="xs"
              radius="xl"
              rightSection={<ChevronDown size={14} aria-hidden="true" />}
            >
              {currentStatusLabel}
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            {statusOptions.map((opt) => (
              <Menu.Item
                key={opt.value}
                onClick={() =>
                  onFilterChange({ attemptStatus: opt.value, page: 0 })
                }
                leftSection={
                  filters.attemptStatus === opt.value ? (
                    <Check size={14} color="var(--mantine-color-blue-6)" />
                  ) : (
                    <Box w={14} />
                  )
                }
              >
                {opt.label}
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>

        {isFiltered ? (
          <Button
            variant="subtle"
            color="gray"
            size="xs"
            radius="xl"
            leftSection={<X size={14} aria-hidden="true" />}
            onClick={onResetFilters}
          >
            {t.exam.clearFilters}
          </Button>
        ) : null}

        <Text size="xs" c="dimmed" fw={600} ml="auto">
          {totalItems} {t.exam.examsCountUnit}
        </Text>
      </Flex>
    </Paper>
  );
}
