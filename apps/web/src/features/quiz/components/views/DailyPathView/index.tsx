"use client";

import {
  Alert,
  Container,
  Grid,
  Group,
  SegmentedControl,
  Skeleton,
  Stack,
} from "@mantine/core";
import { IconCompass, IconSparkles } from "@tabler/icons-react";
import React, { useState } from "react";

import { DailyPathRoadmap } from "../../blocks/DailyPathRoadmap";
import { DailyQuestsCard } from "../../blocks/DailyQuestsCard";
import { DailyStreakBanner } from "../../blocks/DailyStreakBanner";
import { QuizCatalogue } from "../../blocks/QuizCatalogue";
// Import thẳng từ "hooks" chứ không qua barrel: barrel cố ý không re-export
// hooks để Server Component không kéo theo "@apollo/client/react".
import {
  useDailyPathQuery,
  useQuizzesQuery,
} from "@/lib/graphql/generated/hooks";

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

  // Lộ trình là một view trên các bảng hoạt động, không phải bản kế hoạch được
  // lưu, nên lần nào mở cũng phải lấy lại: vừa ôn xong một buổi mà vẫn thấy
  // "còn 12 thẻ đến hạn" thì còn tệ hơn là chờ thêm một nhịp.
  const {
    data: pathData,
    loading: pathLoading,
    error: pathError,
  } = useDailyPathQuery({ fetchPolicy: "cache-and-network" });

  const path = pathData?.dailyPath;

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        {path ? (
          <DailyStreakBanner
            streakDays={path.streakDays}
            totalXp={path.totalXp}
            level={path.level}
            xpIntoLevel={path.xpIntoLevel}
            levelCostXp={path.levelCostXp}
          />
        ) : (
          <Skeleton height={180} radius="lg" />
        )}

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
                  <Group gap="xs" wrap="nowrap">
                    <IconCompass size={18} />
                    <span>{isVi ? "Lộ trình hôm nay" : "Today's Roadmap"}</span>
                  </Group>
                ),
              },
              {
                value: "quizzes",
                label: (
                  <Group gap="xs" wrap="nowrap">
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
              {pathError && !path ? (
                <Alert
                  color="warn"
                  title={
                    isVi
                      ? "Không tải được lộ trình"
                      : "Could not load your path"
                  }
                >
                  {isVi
                    ? "Kiểm tra kết nối tới backend rồi tải lại trang."
                    : "Check the connection to the backend and reload."}
                </Alert>
              ) : path ? (
                <DailyPathRoadmap tasks={path.tasks} />
              ) : (
                <Skeleton height={420} radius="md" visible={pathLoading} />
              )}
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              {path ? (
                <DailyQuestsCard quests={path.quests} />
              ) : (
                <Skeleton height={280} radius="md" visible={pathLoading} />
              )}
            </Grid.Col>
          </Grid>
        ) : (
          <QuizCatalogue quizzes={data?.quizzes.items ?? []} />
        )}
      </Stack>
    </Container>
  );
}
