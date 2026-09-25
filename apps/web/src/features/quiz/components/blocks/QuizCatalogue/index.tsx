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
  const { isVi } = useLanguage();
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
          {isVi ? "Kho bài tập trắc nghiệm" : "Quiz Challenge Library"}
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
              label:
                c === "ALL" ? (isVi ? "Tất cả chủ đề" : "All Categories") : c,
            }))}
          />
        )}
      </Group>

      {filteredQuizzes.length === 0 && (
        <Card withBorder radius="md" p="xl">
          <Text ta="center" c="dimmed" fz="sm">
            {isVi
              ? "Chưa có bài trắc nghiệm nào được phát hành. Quay lại sau nhé."
              : "No quizzes have been published yet. Check back soon."}
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
                label: isVi
                  ? `${quiz.questionCount} câu hỏi`
                  : `${quiz.questionCount} questions`,
              },
              {
                icon: <IconClock size={15} />,
                label: isVi
                  ? `${Math.round(quiz.timeLimitSeconds / 60)} phút`
                  : `${Math.round(quiz.timeLimitSeconds / 60)} min`,
              },
            ]}
            progress={
              quiz.bestScorePercent != null
                ? {
                    value: quiz.bestScorePercent,
                    label: isVi ? "Điểm cao nhất" : "Best score",
                  }
                : undefined
            }
            action={{
              label: isVi ? "Làm bài" : "Start",
              href: `/study/quiz/${quiz.id}`,
            }}
          />
        ))}
      </SimpleGrid>
    </Stack>
  );
}
