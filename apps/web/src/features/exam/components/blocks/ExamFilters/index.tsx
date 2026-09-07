"use client";

import { Menu, TextInput, UnstyledButton } from "@mantine/core";
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
import classes from "./ExamFilters.module.css";
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
    <div className={classes.filterContainer}>
      <div className={classes.topBar}>
        <div className={classes.searchWrapper}>
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
            className={classes.searchInput}
          />
        </div>

        <nav className={classes.tabsNav} aria-label="Phân loại đề thi">
          {EXAM_TYPE_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={classes.tabButton}
              data-active={filters.tabId === tab.id}
              onClick={() => onFilterChange({ tabId: tab.id, page: 0 })}
            >
              {tab.name}
            </button>
          ))}
        </nav>

        <div className={classes.sortWrapper}>
          <span className={classes.sortLabel}>Sắp xếp:</span>
          <Menu shadow="md" width={200} position="bottom-end">
            <Menu.Target>
              <button type="button" className={classes.filterMenuButton}>
                <span>{currentSortLabel}</span>
                <ChevronDown size={14} aria-hidden="true" />
              </button>
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
                      <span style={{ width: 14 }} />
                    )
                  }
                >
                  {opt.label}
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>
        </div>
      </div>

      <div className={classes.bottomBar}>
        {/* Kỹ năng */}
        <Menu shadow="md" width={180}>
          <Menu.Target>
            <button
              type="button"
              className={classes.filterMenuButton}
              data-active={filters.skill !== "ALL"}
            >
              <span>{currentSkillLabel}</span>
              <ChevronDown size={14} aria-hidden="true" />
            </button>
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
                    <span style={{ width: 14 }} />
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
            <button
              type="button"
              className={classes.filterMenuButton}
              data-active={filters.targetLevel !== "ALL"}
            >
              <span>{currentDiffLabel}</span>
              <ChevronDown size={14} aria-hidden="true" />
            </button>
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
                    <span style={{ width: 14 }} />
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
            <button
              type="button"
              className={classes.filterMenuButton}
              data-active={filters.attemptStatus !== "ALL"}
            >
              <span>{currentStatusLabel}</span>
              <ChevronDown size={14} aria-hidden="true" />
            </button>
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
                    <span style={{ width: 14 }} />
                  )
                }
              >
                {opt.label}
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>

        {isFiltered ? (
          <button
            type="button"
            className={classes.clearButton}
            onClick={onResetFilters}
          >
            <X size={14} aria-hidden="true" />
            <span>Xoá bộ lọc</span>
          </button>
        ) : null}

        <span className={classes.resultCount}>{totalItems} đề thi</span>
      </div>
    </div>
  );
}
