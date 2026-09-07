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
  DIFFICULTY_OPTIONS,
  EXAM_TYPE_TABS,
  SKILL_OPTIONS,
  SORT_OPTIONS,
  STATUS_OPTIONS,
  type SortKey,
} from "../../../constants/examLibrary";
import type { ExamFiltersState } from "../../../types";
import type { TargetLevel } from "@/lib/graphql/generated/schemaTypes";

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
  const isFiltered =
    Boolean(filters.searchQuery) ||
    filters.tabId !== "all" ||
    filters.skill !== "ALL" ||
    filters.targetLevel !== "ALL" ||
    filters.attemptStatus !== "ALL";

  const currentSortLabel =
    SORT_OPTIONS.find((s) => s.value === filters.sortBy)?.label ?? "Mới nhất";

  const currentSkillLabel =
    SKILL_OPTIONS.find((s) => s.value === filters.skill)?.label ??
    "Kỹ năng: Tất cả";

  const currentDiffLabel =
    DIFFICULTY_OPTIONS.find((s) => s.value === filters.targetLevel)?.label ??
    "Độ khó: Tất cả";

  const currentStatusLabel =
    STATUS_OPTIONS.find((s) => s.value === filters.attemptStatus)?.label ??
    "Trạng thái: Tất cả";

  return (
    <Paper radius="lg" p="md" withBorder bg="white" shadow="xs">
      <Flex justify="space-between" align="center" wrap="wrap" gap="md">
        <Box style={{ flex: "1 1 260px" }}>
          <TextInput
            placeholder="Tìm theo tên đề hoặc bộ đề…"
            value={filters.searchQuery}
            onChange={(e) =>
              onFilterChange({ searchQuery: e.currentTarget.value, page: 0 })
            }
            leftSection={<Search size={16} aria-hidden="true" />}
            rightSection={
              filters.searchQuery ? (
                <UnstyledButton
                  onClick={() => onFilterChange({ searchQuery: "", page: 0 })}
                  aria-label="Xoá từ khoá tìm kiếm"
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
            {EXAM_TYPE_TABS.map((tab) => (
              <Tabs.Tab key={tab.id} value={tab.id}>
                {tab.name}
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs>

        <Group gap="xs">
          <Text size="xs" c="dimmed" fw={600}>
            Sắp xếp:
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
              {SORT_OPTIONS.map((opt) => (
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
            {SKILL_OPTIONS.map((opt) => (
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
            {DIFFICULTY_OPTIONS.map((opt) => (
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
            {STATUS_OPTIONS.map((opt) => (
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
            Xoá bộ lọc
          </Button>
        ) : null}

        <Text size="xs" c="dimmed" fw={600} ml="auto">
          {totalItems} đề thi
        </Text>
      </Flex>
    </Paper>
  );
}
