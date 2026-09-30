"use client";

import {
  Card,
  Group,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Text,
} from "@mantine/core";
import { IconClock, IconHelpCircle } from "@tabler/icons-react";
import React, { useMemo, useState } from "react";
import type { QuizSummary } from "../../../types";
import { LibraryCard } from "@/shared/components/LibraryCard";
import { useLanguage } from "@/shared/hooks/useLanguage";

interface QuizCatalogueProps {
  quizzes: QuizSummary[];
}

export function QuizCatalogue({ quizzes }: QuizCatalogueProps) {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const categories = useMemo(() => {
    const cats = Array.from(new Set(quizzes.map((q) => q.category)));
    return ["ALL", ...cats];
  }, [quizzes]);

  const filteredQuizzes = useMemo(() => {
    if (selectedCategory === "ALL") return quizzes;
    return quizzes.filter((q) => q.category === selectedCategory);
  }, [quizzes, selectedCategory]);

  return (
    <Stack gap="md">
      <Group justify="space-between" align="center" wrap="wrap">
        <Text fw={800} fz="lg" c="dark.9">
          {t.quiz.catalogueTitle}
        </Text>

        {/* One option is no choice: only offer the filter when there are
            categories to pick between. */}
        {categories.length > 2 && (
          <SegmentedControl
            size="xs"
            value={selectedCategory}
            onChange={setSelectedCategory}
            data={categories.map((c) => ({
              value: c,
              label: c === "ALL" ? t.quiz.allCategoriesSegment : c,
            }))}
          />
        )}
      </Group>

      {filteredQuizzes.length === 0 && (
        <Card withBorder radius="md" p="xl">
          <Text ta="center" c="dimmed" fz="sm">
            {t.quiz.noQuizzesPublished}
          </Text>
        </Card>
      )}

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
        {filteredQuizzes.map((quiz) => (
          <LibraryCard
            key={quiz.id}
            eyebrow={quiz.category}
            level={quiz.targetLevel}
            title={quiz.title}
            meta={[
              {
                icon: <IconHelpCircle size={15} />,
                label: `${quiz.questionCount} ${t.quiz.questionsCountSuffix}`,
              },
              {
                icon: <IconClock size={15} />,
                label: `${Math.round(quiz.timeLimitSeconds / 60)} ${t.quiz.minutesUnitShort}`,
              },
            ]}
            progress={
              quiz.bestScorePercent != null
                ? {
                    value: quiz.bestScorePercent,
                    label: t.pronunciation.bestScoreLabel,
                  }
                : undefined
            }
            action={{
              label: t.common.start,
              href: `/study/quiz/${quiz.id}`,
            }}
          />
        ))}
      </SimpleGrid>
    </Stack>
  );
}
