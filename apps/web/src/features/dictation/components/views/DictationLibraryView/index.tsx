"use client";

import { Alert, Box, Button, Pagination, Stack, Text } from "@mantine/core";
import { DictationStatsSkeleton } from "../../blocks/DictationStatsSkeleton";
import { paginationControlProps } from "@/shared/a11y/paginationControls";
import { useAllDictationLessons } from "../../../hooks/useAllDictationLessons";
import { sortLessons } from "../../../lessonOrder";
import { lessonStatus } from "../../../lessonProgress";
// Import thẳng từ "hooks" chứ không qua barrel: barrel cố ý không re-export
// hooks để Server Component không kéo theo "@apollo/client/react".
import { useDictationStatsQuery } from "@/lib/graphql/generated/hooks";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { STATS_PERIOD_DAYS, toStatsData } from "./statsMapping";
import { DictationLibrarySkeleton } from "../../blocks/DictationLibrarySkeleton";
import { useMemo, useRef, useState } from "react";
import { DictationCharts } from "../../blocks/DictationCharts";
import { DictationFilters } from "../../blocks/DictationFilters";
import { DictationHardSentences } from "../../blocks/DictationHardSentences";
import { DictationHeader } from "../../blocks/DictationHeader";
import { DictationHeroCard } from "../../blocks/DictationHeroCard";
import { DictationHistoryTable } from "../../blocks/DictationHistoryTable";
import { DictationLessonGrid } from "../../blocks/DictationLessonGrid";
import { DictationLessonList } from "../../blocks/DictationLessonList";
import { DictationMissedWordsTable } from "../../blocks/DictationMissedWordsTable";
import { DictationStatsOverview } from "../../blocks/DictationStatsOverview";
import { Page } from "@/shared/components/Page";

interface DictationLibraryViewProps {
  initialTab?: "lessons" | "stats";
}

const PAGE_SIZE = 12;

export function DictationLibraryView({
  initialTab = "lessons",
}: DictationLibraryViewProps) {
  const [activeTab, setActiveTab] = useState<"lessons" | "stats">(initialTab);
  const changeTab = (tab: "lessons" | "stats") => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    window.history.replaceState(null, "", url);
  };
  const [selectedTopic, setSelectedTopic] = useState("ALL");
  const [selectedLevel, setSelectedLevel] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedSort, setSelectedSort] = useState("recent");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const rangeRef = useRef<HTMLParagraphElement>(null);

  const [period, setPeriod] = useState<
    "7 Days" | "30 Days" | "3 Months" | "All Time"
  >("7 Days");

  const { isVi, t } = useLanguage();

  // Chỉ gọi khi người dùng mở tab thống kê - xem danh sách bài thì không phải
  // trả giá cho một lượt tổng hợp mình chưa nhìn tới.
  const {
    data: statsData,
    loading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useDictationStatsQuery({
    variables: { periodDays: STATS_PERIOD_DAYS[period] },
    skip: activeTab !== "stats",
    fetchPolicy: "cache-and-network",
  });

  const stats = statsData
    ? toStatsData(statsData.dictationStats, period, isVi)
    : null;

  const { lessons, loading, error } = useAllDictationLessons();

  // Thẻ "tiếp tục học" là bài được luyện gần nhất, lấy từ chính danh sách này.
  // Người học chưa luyện bài nào thì không có gì để tiếp tục, nên thẻ biến mất
  // thay vì hiện một bài bịa.
  const continueLesson = useMemo(() => {
    const practised = lessons.filter(
      (lesson) => lesson.lastPractisedAt !== null,
    );
    if (practised.length === 0) return null;

    return practised.reduce((latest, lesson) =>
      Date.parse(lesson.lastPractisedAt!) > Date.parse(latest.lastPractisedAt!)
        ? lesson
        : latest,
    );
  }, [lessons]);

  // Lọc và sắp xếp tại chỗ trên cả thư viện (đã tải đủ mọi trang): gửi thêm
  // tham số lên server chỉ đổi một lượt round trip lấy một vòng lặp.
  const filteredLessons = useMemo(() => {
    return sortLessons(
      lessons.filter((lesson) => {
        if (selectedTopic !== "ALL" && lesson.topic !== selectedTopic) {
          return false;
        }
        if (selectedLevel !== "ALL" && lesson.targetLevel !== selectedLevel) {
          return false;
        }
        if (
          selectedStatus !== "ALL" &&
          lessonStatus(lesson) !== selectedStatus
        ) {
          return false;
        }
        return true;
      }),
      selectedSort,
    );
  }, [lessons, selectedLevel, selectedSort, selectedStatus, selectedTopic]);

  const totalPages = Math.max(1, Math.ceil(filteredLessons.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const visibleLessons = filteredLessons.slice(start, start + PAGE_SIZE);

  const changeFilter = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setPage(1);
  };

  const changePage = (nextPage: number) => {
    setPage(nextPage);
    rangeRef.current?.focus({ preventScroll: true });
    rangeRef.current?.scrollIntoView({ block: "start", behavior: "instant" });
  };

  if (activeTab === "lessons" && loading && lessons.length === 0) {
    return <DictationLibrarySkeleton />;
  }

  // Trước đây luôn là "không có bài nào khớp bộ lọc", kể cả khi chưa lọc gì và
  // thư viện chỉ đơn giản là chưa có bài.
  const emptyMessage =
    lessons.length === 0
      ? t.dictation.noLessonsPublished
      : t.dictation.noLessonsMatchFilters;

  return (
    <Page>
      <Stack gap="xl">
        <DictationHeader activeTab={activeTab} onTabChange={changeTab} />

        {activeTab === "lessons" ? (
          <Stack gap="lg">
            {continueLesson !== null && (
              <DictationHeroCard lesson={continueLesson} />
            )}

            <DictationFilters
              selectedTopic={selectedTopic}
              onTopicChange={changeFilter(setSelectedTopic)}
              selectedLevel={selectedLevel}
              onLevelChange={changeFilter(setSelectedLevel)}
              selectedStatus={selectedStatus}
              onStatusChange={changeFilter(setSelectedStatus)}
              selectedSort={selectedSort}
              onSortChange={changeFilter(setSelectedSort)}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />

            {error && lessons.length === 0 && (
              <Alert color="warn" title={t.dictation.couldNotLoadLessons}>
                {t.dictation.checkConnectionReload}
              </Alert>
            )}

            <Text
              ref={rangeRef}
              component="p"
              size="sm"
              c="dimmed"
              role="status"
              aria-atomic="true"
              tabIndex={-1}
              style={{ scrollMarginTop: 100 }}
            >
              {t.dictation.showingLessonsRange
                .replace(
                  "{start}",
                  String(filteredLessons.length ? start + 1 : 0),
                )
                .replace("{end}", String(start + visibleLessons.length))
                .replace("{total}", String(filteredLessons.length))}
            </Text>

            {viewMode === "grid" ? (
              <DictationLessonGrid
                lessons={visibleLessons}
                emptyMessage={emptyMessage}
              />
            ) : (
              <DictationLessonList
                lessons={visibleLessons}
                emptyMessage={emptyMessage}
              />
            )}

            {totalPages > 1 && (
              <Box
                component="nav"
                aria-label={
                  isVi ? "Phân trang bài nghe" : "Listening lesson pages"
                }
              >
                <Pagination
                  total={totalPages}
                  value={currentPage}
                  onChange={changePage}
                  getControlProps={paginationControlProps(isVi)}
                  getItemProps={(number) => ({
                    "aria-label": isVi ? `Trang ${number}` : `Page ${number}`,
                  })}
                  layout="responsive"
                  formatLabel={({ page, totalPages }) =>
                    isVi
                      ? `Trang ${page} / ${totalPages}`
                      : `Page ${page} / ${totalPages}`
                  }
                  siblings={0}
                  size="md"
                  styles={{ control: { minWidth: 44, height: 44 } }}
                  radius="md"
                  color="teal"
                  w="100%"
                />
              </Box>
            )}
          </Stack>
        ) : statsError ? (
          <Alert color="warn" title={t.dictation.couldNotLoadLessons}>
            <Button onClick={() => void refetchStats().catch(() => undefined)}>
              {isVi ? "Thử lại" : "Retry"}
            </Button>
          </Alert>
        ) : statsLoading && !stats ? (
          <DictationStatsSkeleton />
        ) : (
          stats && (
            <Stack gap="xl">
              <DictationStatsOverview
                stats={stats}
                period={period}
                onPeriodChange={setPeriod}
              />

              <DictationCharts stats={stats} />

              <DictationMissedWordsTable words={stats.missedWords} />

              <DictationHardSentences sentences={stats.difficultSentences} />

              <DictationHistoryTable history={stats.history} />
            </Stack>
          )
        )}
      </Stack>
    </Page>
  );
}
