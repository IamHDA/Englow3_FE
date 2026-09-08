"use client";

import {
  Badge,
  Box,
  Button,
  Card,
  Grid,
  Group,
  SegmentedControl,
  Stack,
  Text,
} from "@mantine/core";
import {
  IconClock,
  IconHelpCircle,
  IconPlayerPlay,
  IconTrophy,
} from "@tabler/icons-react";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import { QuizItem } from "../../../types";
import { useLanguage } from "@/shared/hooks/useLanguage";

interface QuizCatalogueProps {
  quizzes: QuizItem[];
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
        <Box>
          <Text fw={800} fz="lg" c="dark.9">
            {isVi ? "Kho bài tập trắc nghiệm" : "Quiz Challenge Library"}
          </Text>
          <Text fz="xs" c="dimmed">
            {isVi
              ? "Lựa chọn chủ đề để kiểm tra nhanh và đánh giá lỗ hổng kiến thức"
              : "Select a topic to test comprehension and identify knowledge gaps"}
          </Text>
        </Box>

        <SegmentedControl
          size="xs"
          value={selectedCategory}
          onChange={setSelectedCategory}
          data={categories.map((c) => ({
            value: c,
            label: c === "ALL" ? (isVi ? "Tất cả chủ đề" : "All Categories") : c,
          }))}
        />
      </Group>

      <Grid gap="md">
        {filteredQuizzes.map((quiz) => (
          <Grid.Col key={quiz.id} span={{ base: 12, sm: 6, lg: 4 }}>
            <Card
              withBorder
              padding="lg"
              radius="md"
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Stack gap="xs">
                <Group justify="space-between">
                  <Badge variant="light" color="indigo" size="xs">
                    {quiz.category}
                  </Badge>
                  <Badge
                    variant="dot"
                    color={
                      quiz.level === "Advanced"
                        ? "red"
                        : quiz.level === "Intermediate"
                        ? "orange"
                        : "teal"
                    }
                    size="xs"
                  >
                    {quiz.level}
                  </Badge>
                </Group>

                <Text fw={700} fz="md" c="dark.9" lineClamp={2}>
                  {quiz.title}
                </Text>

                <Text fz="xs" c="dimmed" lineClamp={2}>
                  {quiz.description}
                </Text>

                <Group gap="md" c="dimmed" fz="xs" mt="xs">
                  <Group gap={4}>
                    <IconHelpCircle size={14} />
                    <span>
                      {quiz.questions.length} {isVi ? "câu hỏi" : "questions"}
                    </span>
                  </Group>
                  <Group gap={4}>
                    <IconClock size={14} />
                    <span>
                      {quiz.timeLimitMinutes} {isVi ? "phút" : "mins"}
                    </span>
                  </Group>
                </Group>

                {quiz.bestScorePercent !== undefined && (
                  <Group gap="xs" mt={4}>
                    <IconTrophy size={14} color="var(--mantine-color-yellow-6)" />
                    <Text fz="xs" fw={600} c="yellow.8">
                      {isVi ? "Điểm cao nhất:" : "Best Score:"} {quiz.bestScorePercent}%
                    </Text>
                  </Group>
                )}
              </Stack>

              <Group mt="md">
                <Button
                  component={Link}
                  href={`/study/quiz/${quiz.id}`}
                  variant="filled"
                  color="indigo"
                  fullWidth
                  size="xs"
                  leftSection={<IconPlayerPlay size={14} />}
                >
                  {isVi ? "Bắt đầu làm bài" : "Start Quiz"}
                </Button>
              </Group>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </Stack>
  );
}
