"use client";

import { useMemo, useState } from "react";
import {
  Button,
  Center,
  Container,
  Flex,
  Group,
  Pagination,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";

import { useExamLibraryQuery } from "@/lib/graphql/generated/hooks";
import { ExamCard } from "../../blocks/ExamCard";
import { ExamEmptyState } from "../../blocks/ExamEmptyState";
import { ExamFilters } from "../../blocks/ExamFilters";
import { ExamLibrarySkeleton } from "../../blocks/ExamLibrarySkeleton";
import { EXAM_TYPE_TABS } from "../../../constants/examLibrary";
import type { ExamFiltersState } from "../../../types";
import type {
  CertificateType,
  CertificateVariant,
  ExamType,
  TargetLevel,
} from "@/lib/graphql/generated/schemaTypes";

const PAGE_SIZE = 8;

export function ExamLibraryView() {
  const [filters, setFilters] = useState<ExamFiltersState>({
    searchQuery: "",
    tabId: "all",
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
      page: filters.page,
      size: PAGE_SIZE,
    };
  }, [activeTab, filters.targetLevel, filters.searchQuery, filters.page]);

  const { data, loading, error, refetch } = useExamLibraryQuery({
    variables: queryVariables,
    notifyOnNetworkStatusChange: true,
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

  // Sorting items client-side if needed (e.g. by targetLevel or title)
  const sortedItems = useMemo(() => {
    const rawItems = examPage?.items;
    if (!rawItems || !rawItems.length) return [];
    const list = [...rawItems];

    if (filters.sortBy === "LEVEL_ASC") {
      list.sort((a, b) =>
        (a.targetLevel ?? "").localeCompare(b.targetLevel ?? ""),
      );
    } else if (filters.sortBy === "LEVEL_DESC") {
      list.sort((a, b) =>
        (b.targetLevel ?? "").localeCompare(a.targetLevel ?? ""),
      );
    } else if (filters.sortBy === "SCORE_DESC") {
      list.sort((a, b) => (b.maxRawScore ?? 0) - (a.maxRawScore ?? 0));
    }
    return list;
  }, [examPage?.items, filters.sortBy]);

  // Pagination calculation
  const startItem = totalItems > 0 ? currentPage * PAGE_SIZE + 1 : 0;
  const endItem = Math.min((currentPage + 1) * PAGE_SIZE, totalItems);

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header Banner */}
        <Flex
          justify="space-between"
          align={{ base: "flex-start", sm: "flex-end" }}
          direction={{ base: "column", sm: "row" }}
          gap="lg"
        >
          <Stack gap={6} maw={640}>
            <Text
              size="xs"
              fw={700}
              tt="uppercase"
              lts="0.12em"
              c="orange.6"
            >
              Mock Test · Thư viện đề
            </Text>
            <Title order={1} size="h1" c="navy.9" lh={1.15} style={{ letterSpacing: "-0.02em" }}>
              Thư viện đề thi
            </Title>
            <Text size="sm" c="dimmed" lh={1.6}>
              Chọn đề thi đầy đủ bấm giờ chuẩn kỳ thi quốc tế ETS &amp; IELTS,
              hoặc đề theo từng kỹ năng để ôn luyện tập trung.
            </Text>
          </Stack>

          <Group gap="xl" wrap="nowrap">
            <Stack gap={2} align="flex-end">
              <Text fw={800} size="xl" c="navy.9" style={{ fontVariantNumeric: "tabular-nums" }}>
                {totalItems}
              </Text>
              <Text size="xs" c="dimmed">
                Bộ đề thi thật
              </Text>
            </Stack>
            <Stack gap={2} align="flex-end">
              <Text fw={800} size="xl" c="navy.9">
                100%
              </Text>
              <Text size="xs" c="dimmed">
                Chấm tự động
              </Text>
            </Stack>
            <Stack gap={2} align="flex-end">
              <Text fw={800} size="xl" c="navy.9">
                AI
              </Text>
              <Text size="xs" c="dimmed">
                Phân tích điểm
              </Text>
            </Stack>
          </Group>
        </Flex>

        {/* Filter Toolbar */}
        <ExamFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          totalItems={totalItems}
        />

        {/* Content Area */}
        {loading && !data ? (
          <ExamLibrarySkeleton />
        ) : error ? (
          <Center py={64}>
            <Stack align="center" gap="sm">
              <Text c="red.6" fw={600}>
                Không thể tải danh sách đề thi: {error.message}
              </Text>
              <Button
                variant="filled"
                color="navy.9"
                radius="xl"
                size="sm"
                onClick={() => refetch()}
              >
                Thử lại
              </Button>
            </Stack>
          </Center>
        ) : sortedItems.length === 0 ? (
          <ExamEmptyState
            searchQuery={filters.searchQuery}
            onResetFilters={handleResetFilters}
          />
        ) : (
          <Stack gap="xl">
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="lg">
              {sortedItems.map((exam) => (
                <ExamCard key={exam.id} exam={exam} />
              ))}
            </SimpleGrid>

            {/* Pagination */}
            {totalPages > 1 ? (
              <Group justify="space-between" align="center" pt="md" wrap="wrap" gap="md">
                <Text size="sm" c="dimmed">
                  Hiển thị {startItem} - {endItem} của {totalItems} đề thi
                </Text>

                <Pagination
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
    </Container>
  );
}
