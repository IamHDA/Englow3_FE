"use client";

import { paginationControlProps } from "@/shared/a11y/paginationControls";

import {
  Alert,
  Button,
  Grid,
  Pagination,
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
import { Page, PageHeader, PageTabs } from "@/shared/components/Page";

/** Một trang bài kiểm tra. Phân trang thật sẽ cần khi thư viện vượt con số này. */
const QUIZ_PAGE_SIZE = 12;

interface DailyPathViewProps {
  initialTab?: "roadmap" | "quizzes";
}

export function DailyPathView({ initialTab = "roadmap" }: DailyPathViewProps) {
  const [activeTab, setActiveTab] = useState<"roadmap" | "quizzes">(initialTab);
  const [quizPage, setQuizPage] = useState(1);
  const { t, isVi } = useLanguage();

  const {
    data,
    loading: quizzesLoading,
    error: quizzesError,
    refetch: refetchQuizzes,
  } = useQuizzesQuery({
    variables: { size: QUIZ_PAGE_SIZE, page: quizPage - 1 },
    skip: activeTab !== "quizzes",
    fetchPolicy: "cache-and-network",
  });

  // Lộ trình là một view trên các bảng hoạt động, không phải bản kế hoạch được
  // lưu, nên lần nào mở cũng phải lấy lại: vừa ôn xong một buổi mà vẫn thấy
  // "còn 12 thẻ đến hạn" thì còn tệ hơn là chờ thêm một nhịp.
  const {
    data: pathData,
    loading: pathLoading,
    error: pathError,
    refetch: refetchPath,
  } = useDailyPathQuery({ fetchPolicy: "cache-and-network" });

  const path = pathData?.dailyPath;

  return (
    <Page>
      <Stack gap="xl">
        <PageHeader
          title={t.dailyPath.pageTitle}
          actions={
            <PageTabs
              value={activeTab}
              onChange={setActiveTab}
              tabs={[
                {
                  value: "roadmap",
                  label: t.dailyPath.roadmapTab,
                  icon: <IconCompass size={16} />,
                },
                {
                  value: "quizzes",
                  label: t.dailyPath.quizCatalogueTab,
                  icon: <IconSparkles size={16} />,
                },
              ]}
            />
          }
        />

        {pathError && !path && (
          <Alert color="warn" title={t.dailyPath.couldNotLoadPath}>
            <Stack gap="sm" align="flex-start">
              <span>{t.dictation.checkConnectionReload}</span>
              <Button
                variant="light"
                onClick={() => void refetchPath()}
                loading={pathLoading}
              >
                {t.common.retry}
              </Button>
            </Stack>
          </Alert>
        )}

        {path ? (
          <DailyStreakBanner
            streakDays={path.streakDays}
            totalXp={path.totalXp}
            level={path.level}
            xpIntoLevel={path.xpIntoLevel}
            levelCostXp={path.levelCostXp}
          />
        ) : !pathError ? (
          <Skeleton height={180} radius="lg" />
        ) : null}

        {activeTab === "roadmap" ? (
          <Grid gap="md">
            <Grid.Col span={{ base: 12, md: 8 }}>
              {path ? (
                <DailyPathRoadmap tasks={path.tasks} />
              ) : (
                !pathError && (
                  <Skeleton height={420} radius="md" visible={pathLoading} />
                )
              )}
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              {path ? (
                <DailyQuestsCard quests={path.quests} />
              ) : !pathError ? (
                <Skeleton height={280} radius="md" visible={pathLoading} />
              ) : null}
            </Grid.Col>
          </Grid>
        ) : (
          <Stack>
            {quizzesLoading && !data ? (
              <Skeleton height={280} />
            ) : quizzesError && !data ? (
              <Alert color="orange" title={t.dailyPath.couldNotLoadPath}>
                <Button
                  variant="light"
                  onClick={() => void refetchQuizzes().catch(() => {})}
                >
                  {t.common.retry}
                </Button>
              </Alert>
            ) : (
              <QuizCatalogue quizzes={data?.quizzes.items ?? []} />
            )}
            {data && data.quizzes.totalPages > 1 && (
              <Pagination
                getControlProps={paginationControlProps(isVi)}
                value={quizPage}
                onChange={setQuizPage}
                total={data.quizzes.totalPages}
              />
            )}
          </Stack>
        )}
      </Stack>
    </Page>
  );
}
