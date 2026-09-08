"use client";

import { Container, Stack } from "@mantine/core";
import { useMemo, useState } from "react";
import {
  MOCK_LESSONS,
  MOCK_STATS_DATA,
} from "../../../constants/dictationData";
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

interface DictationLibraryViewProps {
  initialTab?: "lessons" | "stats";
}

export function DictationLibraryView({ initialTab = "lessons" }: DictationLibraryViewProps) {
  const [activeTab, setActiveTab] = useState<"lessons" | "stats">(initialTab);
  const [selectedTopic, setSelectedTopic] = useState("ALL");
  const [selectedLevel, setSelectedLevel] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedSort, setSelectedSort] = useState("recent");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [period, setPeriod] = useState<"7 Days" | "30 Days" | "3 Months" | "All Time">("7 Days");

  const filteredLessons = useMemo(() => {
    return MOCK_LESSONS.filter((lesson) => {
      if (selectedTopic !== "ALL" && lesson.topic !== selectedTopic) {
        return false;
      }
      if (selectedLevel !== "ALL" && lesson.level !== selectedLevel) {
        return false;
      }
      if (selectedStatus !== "ALL" && lesson.status !== selectedStatus) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (selectedSort === "difficulty") {
        return a.sentenceCount - b.sentenceCount;
      }
      if (selectedSort === "progress") {
        return b.progressPercent - a.progressPercent;
      }
      return 0;
    });
  }, [selectedLevel, selectedSort, selectedStatus, selectedTopic]);

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <DictationHeader activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === "lessons" ? (
          <Stack gap="lg">
            <DictationHeroCard />

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

            {viewMode === "grid" ? (
              <DictationLessonGrid lessons={filteredLessons} />
            ) : (
              <DictationLessonList lessons={filteredLessons} />
            )}
          </Stack>
        ) : (
          <Stack gap="xl">
            <DictationStatsOverview
              stats={MOCK_STATS_DATA}
              period={period}
              onPeriodChange={setPeriod}
            />

            <DictationCharts stats={MOCK_STATS_DATA} />

            <DictationMissedWordsTable words={MOCK_STATS_DATA.missedWords} />

            <DictationHardSentences sentences={MOCK_STATS_DATA.difficultSentences} />

            <DictationHistoryTable history={MOCK_STATS_DATA.history} />
          </Stack>
        )}
      </Stack>
    </Container>
  );
}
