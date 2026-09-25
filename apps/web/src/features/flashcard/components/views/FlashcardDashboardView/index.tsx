"use client";

import {
  Alert,
  Container,
  Group,
  Paper,
  SegmentedControl,
  Stack,
  Text,
} from "@mantine/core";
import { useMemo, useState } from "react";
import { FlashcardDashboardSkeleton } from "../../blocks/FlashcardDashboardSkeleton";
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

/** Một trang bộ thẻ. Phân trang thật sẽ cần tới khi thư viện vượt quá con số này. */
const PAGE_SIZE = 50;

/** Tỉ lệ đã thuộc, suy ra từ hai con số backend trả về chứ không lưu sẵn. */
function masteredShare(set: { masteredCount: number; cardCount: number }) {
  return set.cardCount === 0 ? 0 : set.masteredCount / set.cardCount;
}

interface FlashcardDashboardViewProps {
  initialTab?: "decks" | "stats";
}

export function FlashcardDashboardView({
  initialTab = "decks",
}: FlashcardDashboardViewProps) {
  const [activeTab, setActiveTab] = useState<"decks" | "stats">(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("ALL");
  const [selectedSort, setSelectedSort] = useState("due");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { isVi } = useLanguage();
  const [period, setPeriod] =
    useState<keyof typeof STATS_PERIOD_DAYS>("7 Days");

  // Chỉ gọi khi người dùng mở tab thống kê - mở trang để xem bộ thẻ thì không
  // phải trả giá cho một lượt tổng hợp mình chưa nhìn tới.
  const { data: statsData } = useFlashcardStatsQuery({
    variables: { periodDays: STATS_PERIOD_DAYS[period] },
    skip: activeTab !== "stats",
    fetchPolicy: "cache-and-network",
  });

  const stats = statsData
    ? toStatsData(statsData.flashcardStats, period, isVi)
    : null;

  const { data, loading, error } = useFlashcardSetsQuery({
    variables: { size: PAGE_SIZE },
    fetchPolicy: "cache-and-network",
  });

  const sets = useMemo(() => data?.flashcardSets.items ?? [], [data]);

  const totalDueCount = useMemo(
    () => sets.reduce((acc, set) => acc + set.dueCount, 0),
    [sets],
  );

  // Lọc và sắp xếp tại chỗ: một trang hai mươi bộ thì gửi thêm tham số lên
  // server chỉ đổi một lượt round trip lấy một vòng lặp.
  const filteredSets = useMemo(() => {
    return sets
      .filter((set) => {
        if (selectedTopic !== "ALL" && set.topic !== selectedTopic) {
          return false;
        }
        if (
          searchQuery.trim() &&
          !set.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !set.description.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (selectedSort === "due") {
          return b.dueCount - a.dueCount;
        }
        if (selectedSort === "progress") {
          return masteredShare(b) - masteredShare(a);
        }
        if (selectedSort === "cards") {
          return b.cardCount - a.cardCount;
        }
        return 0;
      });
  }, [sets, searchQuery, selectedSort, selectedTopic]);

  if (loading && sets.length === 0) {
    return <FlashcardDashboardSkeleton />;
  }

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <FlashcardHeader activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === "decks" ? (
          <>
            {error && sets.length === 0 && (
              <Alert color="warn" title="Không tải được bộ thẻ">
                Kiểm tra kết nối tới backend rồi tải lại trang.
              </Alert>
            )}

            <FlashcardHeroCard
              dueCount={totalDueCount}
              streakDays={stats?.dailyStreakDays ?? null}
              retentionPercent={stats?.retentionRatePercent ?? null}
              primarySetSlug={filteredSets[0]?.slug ?? sets[0]?.slug ?? ""}
            />

            <FlashcardFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedTopic={selectedTopic}
              onTopicChange={setSelectedTopic}
              selectedSort={selectedSort}
              onSortChange={setSelectedSort}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />

            {filteredSets.length === 0 && !error ? (
              // Trống thì nói vì sao: chưa có bộ nào, hay bộ lọc loại hết.
              // Trước đây chỗ này để trắng, trông như trang tải hỏng.
              <Paper withBorder radius="md" p="xl">
                <Text ta="center" c="dimmed" fz="sm">
                  {sets.length === 0
                    ? isVi
                      ? "Chưa có bộ thẻ nào được phát hành. Quay lại sau nhé."
                      : "No flashcard sets have been published yet. Check back soon."
                    : isVi
                      ? "Không có bộ thẻ nào khớp bộ lọc. Thử đổi từ khoá hoặc chủ đề."
                      : "No sets match these filters. Try another search or topic."}
                </Text>
              </Paper>
            ) : viewMode === "grid" ? (
              <FlashcardSetGrid sets={filteredSets} />
            ) : (
              <FlashcardSetList sets={filteredSets} />
            )}
          </>
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
                    { value: "7 Days", label: isVi ? "7 ngày" : "7 days" },
                    { value: "30 Days", label: isVi ? "30 ngày" : "30 days" },
                    { value: "3 Months", label: isVi ? "3 tháng" : "3 months" },
                    { value: "All Time", label: isVi ? "Tất cả" : "All time" },
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
    </Container>
  );
}
