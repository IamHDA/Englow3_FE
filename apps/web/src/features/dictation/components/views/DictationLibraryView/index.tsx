"use client";

import { Alert, Stack } from "@mantine/core";
import { lessonStatus, progressPercent } from "../../../lessonProgress";
// Import thẳng từ "hooks" chứ không qua barrel: barrel cố ý không re-export
// hooks để Server Component không kéo theo "@apollo/client/react".
import {
  useDictationLessonsQuery,
  useDictationStatsQuery,
} from "@/lib/graphql/generated/hooks";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { STATS_PERIOD_DAYS, toStatsData } from "./statsMapping";
import { DictationLibrarySkeleton } from "../../blocks/DictationLibrarySkeleton";
import { useMemo, useState } from "react";
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

/** Một trang bài nghe chép. Phân trang thật sẽ cần khi thư viện vượt con số này. */
const PAGE_SIZE = 50;

export function DictationLibraryView({
  initialTab = "lessons",
}: DictationLibraryViewProps) {
  const [activeTab, setActiveTab] = useState<"lessons" | "stats">(initialTab);
  const [selectedTopic, setSelectedTopic] = useState("ALL");
  const [selectedLevel, setSelectedLevel] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedSort, setSelectedSort] = useState("recent");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [period, setPeriod] = useState<
    "7 Days" | "30 Days" | "3 Months" | "All Time"
  >("7 Days");

  const { isVi } = useLanguage();

  // Chỉ gọi khi người dùng mở tab thống kê - xem danh sách bài thì không phải
  // trả giá cho một lượt tổng hợp mình chưa nhìn tới.
  const { data: statsData } = useDictationStatsQuery({
    variables: { periodDays: STATS_PERIOD_DAYS[period] },
    skip: activeTab !== "stats",
    fetchPolicy: "cache-and-network",
  });

  const stats = statsData
    ? toStatsData(statsData.dictationStats, period, isVi)
    : null;

  const { data, loading, error } = useDictationLessonsQuery({
    variables: { size: PAGE_SIZE },
    fetchPolicy: "cache-and-network",
  });

  const lessons = useMemo(() => data?.dictationLessons.items ?? [], [data]);

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

  // Lọc và sắp xếp tại chỗ: một trang năm mươi bài thì gửi thêm tham số lên
  // server chỉ đổi một lượt round trip lấy một vòng lặp.
  const filteredLessons = useMemo(() => {
    return lessons
      .filter((lesson) => {
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
      })
      .sort((a, b) => {
        if (selectedSort === "difficulty") {
          return a.sentenceCount - b.sentenceCount;
        }
        if (selectedSort === "progress") {
          return progressPercent(b) - progressPercent(a);
        }
        return 0;
      });
  }, [lessons, selectedLevel, selectedSort, selectedStatus, selectedTopic]);

  if (loading && lessons.length === 0) {
    return <DictationLibrarySkeleton />;
  }

  // Trước đây luôn là "không có bài nào khớp bộ lọc", kể cả khi chưa lọc gì và
  // thư viện chỉ đơn giản là chưa có bài.
  const emptyMessage =
    lessons.length === 0
      ? isVi
        ? "Chưa có bài nghe nào được phát hành. Quay lại sau nhé."
        : "No listening lessons have been published yet. Check back soon."
      : isVi
        ? "Không có bài nào khớp bộ lọc. Thử đổi chủ đề, trình độ hoặc trạng thái."
        : "No lessons match these filters. Try another topic, level or status.";

  return (
    <Page>
      <Stack gap="xl">
        <DictationHeader activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === "lessons" ? (
          <Stack gap="lg">
            {continueLesson !== null && (
              <DictationHeroCard lesson={continueLesson} />
            )}

            <DictationFilters
              selectedTopic={selectedTopic}
              onTopicChange={setSelectedTopic}
              selectedLevel={selectedLevel}
              onLevelChange={setSelectedLevel}
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
              selectedSort={selectedSort}
              onSortChange={setSelectedSort}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />

            {error && lessons.length === 0 && (
              <Alert
                color="warn"
                title={
                  isVi ? "Không tải được bài học" : "Could not load lessons"
                }
              >
                {isVi
                  ? "Kiểm tra kết nối rồi tải lại trang."
                  : "Check your connection and reload the page."}
              </Alert>
            )}

            {viewMode === "grid" ? (
              <DictationLessonGrid
                lessons={filteredLessons}
                emptyMessage={emptyMessage}
              />
            ) : (
              <DictationLessonList
                lessons={filteredLessons}
                emptyMessage={emptyMessage}
              />
            )}
          </Stack>
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
