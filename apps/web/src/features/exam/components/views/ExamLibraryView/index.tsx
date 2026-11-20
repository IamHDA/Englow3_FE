"use client";

import { paginationControlProps } from "@/shared/a11y/paginationControls";

import { useMemo, useState } from "react";
import {
  Button,
  Center,
  Group,
  Pagination,
  SimpleGrid,
  Stack,
  Text,
} from "@mantine/core";

import { useExamLibraryQuery } from "@/lib/graphql/generated/hooks";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { ExamCard } from "../../blocks/ExamCard";
import { ExamEmptyState } from "../../blocks/ExamEmptyState";
import { ProductiveSkillsNotice } from "../../blocks/ProductiveSkillsNotice";
import { ExamFilters } from "../../blocks/ExamFilters";
import { ExamLibrarySkeleton } from "../../blocks/ExamLibrarySkeleton";
import { IeltsFullTestGrid } from "../../blocks/IeltsFullTestGrid";
import { EXAM_TYPE_TABS, knownTabId } from "../../../constants/examLibrary";
import type { ExamFiltersState } from "../../../types";
import type {
  CertificateType,
  CertificateVariant,
  ExamSortBy,
  ExamType,
  TargetLevel,
} from "@/lib/graphql/generated/schemaTypes";
import { Page, PageHeader } from "@/shared/components/Page";

const PAGE_SIZE = 8;

type ExamLibraryViewProps = {
  /** The tab to open on, from `?tab=` - how a full test page links back. */
  initialTabId?: string | null;
};

export function ExamLibraryView({ initialTabId }: ExamLibraryViewProps = {}) {
  const { t, isVi } = useLanguage();
  const tr = (vi: string, en: string) => (isVi ? vi : en);
  const [filters, setFilters] = useState<ExamFiltersState>({
    searchQuery: "",
    tabId: knownTabId(initialTabId),
    skill: "ALL",
    targetLevel: "ALL",
    attemptStatus: "ALL",
    sortBy: "NEWEST",
    page: 0,
  });

  const activeTab = useMemo(
    () => EXAM_TYPE_TABS.find((t) => t.id === filters.tabId),
    [filters.tabId],
  );
  // IELTS has no stand-alone papers: its tabs list full tests (D-IELTS-11).
  const fullTestTab = Boolean(activeTab?.fullTests);
  // Full tests carry no level, so a level filter on "all" leaves them out.
  const fullTestsOnAll =
    filters.tabId === "all" && filters.targetLevel === "ALL";

  // Writing and Speaking are practised in their own module; the notice points
  // there, and an empty mock-exam list under it would only repeat the point.
  // An IELTS full test holds both, so its tabs need no such pointer.
  const productiveFocus =
    !fullTestTab &&
    (filters.tabId === "toeic_sw" ||
      filters.skill === "WRITING" ||
      filters.skill === "SPEAKING");

  const queryVariables = useMemo(() => {
    return {
      examType: "MOCK" as ExamType,
      certificateType: activeTab?.certificateType as
        CertificateType | undefined,
      certificateVariant: activeTab?.certificateVariant as
        CertificateVariant | undefined,
      targetLevel:
        filters.targetLevel !== "ALL"
          ? (filters.targetLevel as TargetLevel)
          : undefined,
      title: filters.searchQuery ? filters.searchQuery.trim() : undefined,
      // Ordered by the server over the whole catalogue, so the order holds across pages.
      sortBy: filters.sortBy as ExamSortBy,
      page: filters.page,
      size: PAGE_SIZE,
    };
  }, [
    activeTab,
    filters.targetLevel,
    filters.searchQuery,
    filters.sortBy,
    filters.page,
  ]);

  const { data, loading, error, refetch } = useExamLibraryQuery({
    variables: queryVariables,
    notifyOnNetworkStatusChange: true,
    skip: fullTestTab,
  });

  const handleFilterChange = (newFilters: Partial<ExamFiltersState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: "",
      tabId: "all",
      skill: "ALL",
      targetLevel: "ALL",
      attemptStatus: "ALL",
      sortBy: "NEWEST",
      page: 0,
    });
  };

  const examPage = data?.exams;
  const totalItems = examPage?.totalItems ?? 0;
  const totalPages = Math.max(examPage?.totalPages ?? 1, 1);
  const currentPage = filters.page;

  const sortedItems = examPage?.items ?? [];

  // Pagination calculation
  const startItem = totalItems > 0 ? currentPage * PAGE_SIZE + 1 : 0;
  const endItem = Math.min((currentPage + 1) * PAGE_SIZE, totalItems);

  return (
    <Page>
      <Stack gap="xl">
        <PageHeader title={t.exam.title} />

        {/* Filter Toolbar */}
        <ExamFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          totalItems={totalItems}
          paperFilters={!fullTestTab}
        />

        {productiveFocus && <ProductiveSkillsNotice />}

        {fullTestsOnAll && (
          <IeltsFullTestGrid
            searchQuery={filters.searchQuery}
            heading={tr(
              "IELTS — Full test 4 kỹ năng",
              "IELTS — four-skill full tests",
            )}
          />
        )}

        {/* Content Area */}
        {fullTestTab ? (
          <IeltsFullTestGrid
            variant={activeTab?.certificateVariant}
            searchQuery={filters.searchQuery}
          />
        ) : loading && !data ? (
          <ExamLibrarySkeleton />
        ) : error ? (
          <Center py={64}>
            <Stack align="center" gap="sm">
              <Text c="red.6" fw={600}>
                {/* The server's own message is English and for developers;
                    the learner gets ours, and the retry below. */}
                {t.exam.loadListError}
              </Text>
              <Button
                variant="filled"
                color="navy.9"
                radius="xl"
                size="sm"
                onClick={() => refetch()}
              >
                {t.common.retry}
              </Button>
            </Stack>
          </Center>
        ) : sortedItems.length === 0 &&
          productiveFocus ? null : sortedItems.length === 0 ? (
          <ExamEmptyState
            searchQuery={filters.searchQuery}
            onResetFilters={handleResetFilters}
          />
        ) : (
          <Stack gap="xl">
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
              {sortedItems.map((exam) => (
                <ExamCard key={exam.id} exam={exam} />
              ))}
            </SimpleGrid>

            {/* Pagination */}
            {totalPages > 1 ? (
              <Group
                justify="space-between"
                align="center"
                pt="md"
                wrap="wrap"
                gap="md"
              >
                <Text size="sm" c="dimmed">
                  {t.exam.showingRange
                    .replace("{start}", String(startItem))
                    .replace("{end}", String(endItem))
                    .replace("{total}", String(totalItems))}
                </Text>

                <Pagination
                  getControlProps={paginationControlProps(isVi)}
                  total={totalPages}
                  value={currentPage + 1}
                  onChange={(page) => handleFilterChange({ page: page - 1 })}
                  radius="xl"
                  size="sm"
                  color="navy.9"
                />
              </Group>
            ) : null}
          </Stack>
        )}
      </Stack>
    </Page>
  );
}
