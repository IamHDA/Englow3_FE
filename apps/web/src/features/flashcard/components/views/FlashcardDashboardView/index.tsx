"use client";

import { Alert, Container, Stack } from "@mantine/core";
import { useMemo, useState } from "react";
import { MOCK_FLASHCARD_STATS } from "../../../constants/flashcardData";
import { FlashcardDashboardSkeleton } from "../../blocks/FlashcardDashboardSkeleton";
// Import thẳng từ "hooks" chứ không qua barrel: barrel cố ý không re-export
// hooks để Server Component không kéo theo "@apollo/client/react".
import { useFlashcardSetsQuery } from "@/lib/graphql/generated/hooks";
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
              streakDays={MOCK_FLASHCARD_STATS.dailyStreakDays}
              retentionPercent={MOCK_FLASHCARD_STATS.retentionRatePercent}
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

            {viewMode === "grid" ? (
              <FlashcardSetGrid sets={filteredSets} />
            ) : (
              <FlashcardSetList sets={filteredSets} />
            )}
          </>
        ) : (
          <>
            <FlashcardStatsOverview stats={MOCK_FLASHCARD_STATS} />
            <FlashcardCharts stats={MOCK_FLASHCARD_STATS} />
            <FlashcardDifficultCards
              cards={MOCK_FLASHCARD_STATS.difficultCards}
            />
            <FlashcardHistoryTable history={MOCK_FLASHCARD_STATS.history} />
          </>
        )}
      </Stack>
    </Container>
  );
}
