"use client";

import {
  Alert,
  Button,
  Pagination,
  Skeleton,
  Group,
  Paper,
  SegmentedControl,
  Stack,
  Text,
} from "@mantine/core";
import { useEffect, useState } from "react";
import {
  flashcardFiltersFromUrl,
  type FlashcardCatalogueFilters,
} from "../../../catalogueFilters";
// Import thẳng từ "hooks" chứ không qua barrel: barrel cố ý không re-export
// hooks để Server Component không kéo theo "@apollo/client/react".
import {
  useFlashcardSetsQuery,
  useFlashcardStatsQuery,
} from "@/lib/graphql/generated/hooks";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { STATS_PERIOD_DAYS, toStatsData } from "./statsMapping";
import { FlashcardCharts } from "../../blocks/FlashcardCharts";
import { FlashcardDifficultCards } from "../../blocks/FlashcardDifficultCards";
import { FlashcardFilters } from "../../blocks/FlashcardFilters";
import { FlashcardHeader } from "../../blocks/FlashcardHeader";
import { FlashcardHeroCard } from "../../blocks/FlashcardHeroCard";
import { FlashcardHistoryTable } from "../../blocks/FlashcardHistoryTable";
import { FlashcardSetGrid } from "../../blocks/FlashcardSetGrid";
import { FlashcardSetList } from "../../blocks/FlashcardSetList";
import { FlashcardStatsOverview } from "../../blocks/FlashcardStatsOverview";
import { Page } from "@/shared/components/Page";

const PAGE_SIZE = 20;

interface FlashcardDashboardViewProps {
  initialTab?: "decks" | "stats";
  initialFilters?: FlashcardCatalogueFilters;
}

export function FlashcardDashboardView({
  initialTab = "decks",
  initialFilters = flashcardFiltersFromUrl({}),
}: FlashcardDashboardViewProps) {
  const [activeTab, setActiveTab] = useState<"decks" | "stats">(initialTab);
  const [filters, setFilters] = useState(initialFilters);
  const { q: searchQuery, topic: selectedTopic, sort: selectedSort } = filters;
  useEffect(() => {
    const restore = () => {
      const params = new URL(window.location.href).searchParams;
      const values = Object.fromEntries(
        [...params.keys()].map((key) => [key, params.get(key) ?? undefined]),
      );
      setFilters(flashcardFiltersFromUrl(values));
      setActiveTab(values.tab === "stats" ? "stats" : "decks");
    };
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, []);
  const changeFilters = (patch: Partial<FlashcardCatalogueFilters>) => {
    const next = { ...filters, ...patch, page: patch.page ?? 1 };
    setFilters(next);
    const url = new URL(window.location.href);
    for (const [key, value] of Object.entries(next)) {
      if ((key === "topic" && value === "ALL") || value === "")
        url.searchParams.delete(key);
      else url.searchParams.set(key, String(value));
    }
    window.history.pushState(null, "", url);
  };
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const changeTab = (tab: "decks" | "stats") => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    window.history.replaceState(null, "", url);
  };

  const { isVi, t } = useLanguage();
  const [period, setPeriod] =
    useState<keyof typeof STATS_PERIOD_DAYS>("7 Days");

  // Chỉ gọi khi người dùng mở tab thống kê - mở trang để xem bộ thẻ thì không
  // phải trả giá cho một lượt tổng hợp mình chưa nhìn tới.
  const {
    data: statsData,
    loading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useFlashcardStatsQuery({
    variables: { periodDays: STATS_PERIOD_DAYS[period] },
    skip: activeTab !== "stats",
    fetchPolicy: "cache-and-network",
  });

  const stats = statsData
    ? toStatsData(statsData.flashcardStats, period, isVi)
    : null;

  const { data, previousData, loading, error, refetch } = useFlashcardSetsQuery(
    {
      variables: {
        size: PAGE_SIZE,
        page: filters.page - 1,
        topic: selectedTopic === "ALL" ? null : selectedTopic,
        title: searchQuery || null,
        sortBy: selectedSort,
      },
      skip: activeTab !== "decks",
      fetchPolicy: "network-only",
    },
  );

  const sets = data?.flashcardSets.items ?? [];
  const catalogueInfo =
    data?.flashcardCatalogueInfo ?? previousData?.flashcardCatalogueInfo;
  const totalDueCount = catalogueInfo?.totalDueCount ?? 0;
  const filteredSets = sets;

  return (
    <Page>
      <Stack gap="xl">
        <FlashcardHeader activeTab={activeTab} onTabChange={changeTab} />

        {activeTab === "decks" ? (
          <>
            {error && (
              <Alert color="warn" title={t.flashcard.couldNotLoadSets}>
                {t.dictation.checkConnectionReload}
                <Button
                  variant="subtle"
                  onClick={() => void refetch().catch(() => undefined)}
                >
                  {isVi ? "Thử lại" : "Retry"}
                </Button>
              </Alert>
            )}

            <FlashcardHeroCard
              dueCount={totalDueCount}
              streakDays={stats?.dailyStreakDays ?? null}
              retentionPercent={stats?.retentionRatePercent ?? null}
              primarySetId={filteredSets[0]?.id ?? sets[0]?.id ?? ""}
            />

            <FlashcardFilters
              topics={catalogueInfo?.topics ?? []}
              searchQuery={searchQuery}
              onSearchChange={(q) => changeFilters({ q })}
              selectedTopic={selectedTopic}
              onTopicChange={(topic) => changeFilters({ topic })}
              selectedSort={selectedSort}
              onSortChange={(sort) => changeFilters({ sort })}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />

            {loading ? (
              <Stack aria-busy="true">
                <Skeleton h={160} />
                <Skeleton h={160} />
              </Stack>
            ) : filteredSets.length === 0 && !error ? (
              // Trống thì nói vì sao: chưa có bộ nào, hay bộ lọc loại hết.
              // Trước đây chỗ này để trắng, trông như trang tải hỏng.
              <Paper withBorder radius="md" p="xl">
                <Text ta="center" c="dimmed" fz="sm">
                  {selectedTopic === "ALL" && !searchQuery
                    ? t.flashcard.noSetsPublished
                    : t.flashcard.noSetsMatchFilters}
                </Text>
              </Paper>
            ) : viewMode === "grid" ? (
              <FlashcardSetGrid sets={filteredSets} />
            ) : (
              <FlashcardSetList sets={filteredSets} />
            )}
            {(data?.flashcardSets.totalPages ?? 0) > 1 && (
              <Pagination
                total={data!.flashcardSets.totalPages}
                value={filters.page}
                onChange={(page) => changeFilters({ page })}
                disabled={loading}
              />
            )}
          </>
        ) : statsError ? (
          <Alert color="warn" title={t.flashcard.couldNotLoadSets}>
            <Button onClick={() => void refetchStats().catch(() => undefined)}>
              {isVi ? "Thử lại" : "Retry"}
            </Button>
          </Alert>
        ) : statsLoading && !stats ? (
          <Stack aria-busy="true">
            <Skeleton h={100} />
            <Skeleton h={260} />
            <Skeleton h={180} />
          </Stack>
        ) : (
          stats && (
            <>
              <Group justify="flex-end">
                <SegmentedControl
                  value={period}
                  onChange={(next) =>
                    setPeriod(next as keyof typeof STATS_PERIOD_DAYS)
                  }
                  // The keys are internal ids; the labels are what a learner
                  // reads, in their language.
                  data={[
                    { value: "7 Days", label: t.flashcard.period7DaysShort },
                    { value: "30 Days", label: t.flashcard.period30DaysShort },
                    {
                      value: "3 Months",
                      label: t.flashcard.period3MonthsShort,
                    },
                    {
                      value: "All Time",
                      label: t.flashcard.periodAllTimeShort,
                    },
                  ]}
                  radius="md"
                  size="sm"
                />
              </Group>
              <FlashcardStatsOverview stats={stats} />
              <FlashcardCharts stats={stats} />
              <FlashcardDifficultCards cards={stats.difficultCards} />
              <FlashcardHistoryTable history={stats.history} />
            </>
          )
        )}
      </Stack>
    </Page>
  );
}
