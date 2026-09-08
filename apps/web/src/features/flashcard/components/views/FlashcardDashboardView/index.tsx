"use client";

import { Container, Stack } from "@mantine/core";
import { useMemo, useState } from "react";
import {
  MOCK_FLASHCARD_SETS,
  MOCK_FLASHCARD_STATS,
} from "../../../constants/flashcardData";
import { FlashcardCharts } from "../../blocks/FlashcardCharts";
import { FlashcardDifficultCards } from "../../blocks/FlashcardDifficultCards";
import { FlashcardFilters } from "../../blocks/FlashcardFilters";
import { FlashcardHeader } from "../../blocks/FlashcardHeader";
import { FlashcardHeroCard } from "../../blocks/FlashcardHeroCard";
import { FlashcardHistoryTable } from "../../blocks/FlashcardHistoryTable";
import { FlashcardSetGrid } from "../../blocks/FlashcardSetGrid";
import { FlashcardSetList } from "../../blocks/FlashcardSetList";
import { FlashcardStatsOverview } from "../../blocks/FlashcardStatsOverview";

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

  const totalDueCount = useMemo(() => {
    return MOCK_FLASHCARD_SETS.reduce((acc, s) => acc + s.dueTodayCount, 0);
  }, []);

  const filteredSets = useMemo(() => {
    return MOCK_FLASHCARD_SETS.filter((set) => {
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
    }).sort((a, b) => {
      if (selectedSort === "due") {
        return b.dueTodayCount - a.dueTodayCount;
      }
      if (selectedSort === "progress") {
        return b.masteredPercent - a.masteredPercent;
      }
      if (selectedSort === "cards") {
        return b.totalCards - a.totalCards;
      }
      return 0;
    });
  }, [searchQuery, selectedSort, selectedTopic]);

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <FlashcardHeader activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === "decks" ? (
          <>
            <FlashcardHeroCard
              dueCount={totalDueCount}
              streakDays={MOCK_FLASHCARD_STATS.dailyStreakDays}
              retentionPercent={MOCK_FLASHCARD_STATS.retentionRatePercent}
              primarySetSlug={MOCK_FLASHCARD_SETS[0]?.slug || "ielts-core-vocab"}
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
            <FlashcardDifficultCards cards={MOCK_FLASHCARD_STATS.difficultCards} />
            <FlashcardHistoryTable history={MOCK_FLASHCARD_STATS.history} />
          </>
        )}
      </Stack>
    </Container>
  );
}
