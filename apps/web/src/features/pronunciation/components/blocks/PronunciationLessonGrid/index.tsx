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
import { IconMicrophone } from "@tabler/icons-react";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import { PronunciationLesson } from "../../../types";
import { useLanguage } from "@/shared/hooks/useLanguage";

interface PronunciationLessonGridProps {
  lessons: PronunciationLesson[];
}

export function PronunciationLessonGrid({ lessons }: PronunciationLessonGridProps) {
  const { isVi } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const categories = useMemo(() => {
    const set = new Set(lessons.map((l) => l.category));
    return ["ALL", ...Array.from(set)];
  }, [lessons]);

  const filteredLessons = useMemo(() => {
    if (selectedCategory === "ALL") return lessons;
    return lessons.filter((l) => l.category === selectedCategory);
  }, [lessons, selectedCategory]);

  return (
    <Stack gap="md">
      <Group justify="space-between" align="center" wrap="wrap">
        <Box>
          <Text fw={700} fz="lg" c="dark.9">
            {isVi ? "Danh sách bài luyện phát âm" : "Pronunciation Lessons"}
          </Text>
          <Text fz="xs" c="dimmed">
            {isVi
              ? "Chọn một bài học để bắt đầu ghi âm và nhận đánh giá từ AI"
              : "Select a lesson to begin recording and receive instant AI feedback"}
          </Text>
        </Box>

        <SegmentedControl
          size="xs"
          value={selectedCategory}
          onChange={setSelectedCategory}
          data={categories.map((c) => ({
            value: c,
            label: c === "ALL" ? (isVi ? "Tất cả bài học" : "All Lessons") : c,
          }))}
        />
      </Group>

      <Grid gap="md">
        {filteredLessons.map((lesson) => (
          <Grid.Col key={lesson.id} span={{ base: 12, sm: 6, lg: 4 }}>
            <Card
              withBorder
              padding="lg"
              radius="md"
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transition: "all 0.15s ease",
              }}
            >
              <Stack gap="xs">
                <Group justify="space-between" align="center">
                  <Badge variant="light" color="indigo" size="xs">
                    {lesson.category}
                  </Badge>
                  <Badge
                    variant="dot"
                    color={
                      lesson.level === "Advanced"
                        ? "red"
                        : lesson.level === "Intermediate"
                        ? "orange"
                        : "teal"
                    }
                    size="xs"
                  >
                    {lesson.level}
                  </Badge>
                </Group>

                <Text fw={700} fz="md" c="dark.9" lineClamp={2}>
                  {lesson.title}
                </Text>

                <Box
                  p="xs"
                  style={{
                    backgroundColor: "var(--mantine-color-indigo-0)",
                    borderRadius: "var(--mantine-radius-sm)",
                  }}
                >
                  <Text fz="xs" c="indigo.8" fw={700}>
                    {isVi ? "Trọng tâm:" : "Focus:"} {lesson.phonemeTarget}
                  </Text>
                </Box>

                <Text fz="xs" c="dark.8" fs="italic" lineClamp={2}>
                  &ldquo;{lesson.targetSentence}&rdquo;
                </Text>

                <Text fz="xs" c="dimmed" lineClamp={2}>
                  {lesson.translationVi}
                </Text>

                {lesson.bestScore !== undefined && (
                  <Group gap="xs" mt="xs">
                    <Badge variant="light" color="teal" size="xs">
                      {isVi ? "Điểm cao nhất:" : "Best Score:"} {lesson.bestScore}/100
                    </Badge>
                  </Group>
                )}
              </Stack>

              <Group mt="md">
                <Button
                  component={Link}
                  href={`/study/pronunciation/${lesson.slug}`}
                  variant="filled"
                  color="indigo"
                  fullWidth
                  size="xs"
                  leftSection={<IconMicrophone size={16} />}
                >
                  {isVi ? "Bắt đầu luyện phát âm" : "Start Practice"}
                </Button>
              </Group>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </Stack>
  );
}
