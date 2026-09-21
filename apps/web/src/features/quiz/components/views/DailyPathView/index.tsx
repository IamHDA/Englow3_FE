"use client";

import { Container, Grid, Group, SegmentedControl, Stack } from "@mantine/core";
import { IconCompass, IconSparkles } from "@tabler/icons-react";
import React, { useState } from "react";
import {
  MOCK_DAILY_PATH_NODES,
  MOCK_DAILY_QUESTS,
} from "../../../constants/quizData";
import { DailyPathRoadmap } from "../../blocks/DailyPathRoadmap";
import { DailyQuestsCard } from "../../blocks/DailyQuestsCard";
import { DailyStreakBanner } from "../../blocks/DailyStreakBanner";
import { QuizCatalogue } from "../../blocks/QuizCatalogue";
// Import thẳng từ "hooks" chứ không qua barrel: barrel cố ý không re-export
// hooks để Server Component không kéo theo "@apollo/client/react".
import { useQuizzesQuery } from "@/lib/graphql/generated/hooks";

import { useLanguage } from "@/shared/hooks/useLanguage";

/** Một trang bài kiểm tra. Phân trang thật sẽ cần khi thư viện vượt con số này. */
const QUIZ_PAGE_SIZE = 50;

interface DailyPathViewProps {
  initialTab?: "roadmap" | "quizzes";
}

export function DailyPathView({ initialTab = "roadmap" }: DailyPathViewProps) {
  const [activeTab, setActiveTab] = useState<"roadmap" | "quizzes">(initialTab);
  const { isVi } = useLanguage();

  const { data } = useQuizzesQuery({
    variables: { size: QUIZ_PAGE_SIZE },
    fetchPolicy: "cache-and-network",
  });

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        {/* Streak & Level Banner */}
        <DailyStreakBanner
          streakDays={6}
          totalXp={1420}
          currentLevel={4}
          levelXp={220}
          nextLevelXp={500}
        />

        {/* Tab switch */}
        <Group justify="center">
          <SegmentedControl
            size="md"
            value={activeTab}
            onChange={(val) => setActiveTab(val as "roadmap" | "quizzes")}
            data={[
              {
                value: "roadmap",
                label: (
                  <Group gap="xs">
                    <IconCompass size={18} />
                    <span>{isVi ? "Lộ trình hôm nay" : "Today's Roadmap"}</span>
                  </Group>
                ),
              },
              {
                value: "quizzes",
                label: (
                  <Group gap="xs">
                    <IconSparkles size={18} />
                    <span>
                      {isVi ? "Kho thử thách trắc nghiệm" : "Quiz Challenges"}
                    </span>
                  </Group>
                ),
              },
            ]}
          />
        </Group>

        {activeTab === "roadmap" ? (
          <Grid gap="md">
            <Grid.Col span={{ base: 12, md: 8 }}>
              <DailyPathRoadmap nodes={MOCK_DAILY_PATH_NODES} />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <DailyQuestsCard quests={MOCK_DAILY_QUESTS} />
            </Grid.Col>
          </Grid>
        ) : (
          <QuizCatalogue quizzes={data?.quizzes.items ?? []} />
        )}
      </Stack>
    </Container>
  );
}
