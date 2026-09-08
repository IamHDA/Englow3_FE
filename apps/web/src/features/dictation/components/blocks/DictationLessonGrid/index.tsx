"use client";

import {
  Badge,
  Button,
  Card,
  Group,
  Progress,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { ArrowRight, CheckCircle2, Clock, Headphones } from "lucide-react";
import Link from "next/link";
import type { DictationLesson } from "../../../types";

interface DictationLessonGridProps {
  lessons: DictationLesson[];
}

export function DictationLessonGrid({ lessons }: DictationLessonGridProps) {
  if (lessons.length === 0) {
    return (
      <Card radius="md" p="xl" withBorder bg="white" style={{ textAlign: "center" }}>
        <Text c="ink.6" size="sm">
          Không tìm thấy bài học nào phù hợp với bộ lọc. Hãy thử thay đổi chủ đề hoặc cấp độ.
        </Text>
      </Card>
    );
  }

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
      {lessons.map((lesson) => {
        const isCompleted = lesson.status === "Completed";
        const isInProgress = lesson.status === "In progress";

        let ctaText = "Bắt đầu học";
        let ctaVariant: "filled" | "outline" | "light" = "outline";
        let ctaColor = "navy";

        if (isCompleted) {
          ctaText = "Luyện lại";
          ctaVariant = "light";
          ctaColor = "navy";
        } else if (isInProgress) {
          ctaText = "Tiếp tục";
          ctaVariant = "filled";
          ctaColor = "navy";
        }

        return (
          <Card
            key={lesson.id}
            radius="md"
            p="lg"
            withBorder
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              transition: "transform 0.15s ease, box-shadow 0.15s ease",
            }}
          >
            <Stack gap="sm">
              <Group justify="space-between" align="center">
                <Badge size="xs" variant="light" color="navy">
                  {lesson.topic}
                </Badge>
                <Group gap={6}>
                  <Badge size="xs" variant="outline" color="ink.6">
                    {lesson.level}
                  </Badge>
                  {isCompleted && (
                    <CheckCircle2 size={16} color="var(--mantine-color-teal-6)" />
                  )}
                </Group>
              </Group>

              <Title order={3} size="h4" fw={700} c="ink.9" lineClamp={2}>
                {lesson.title}
              </Title>

              <Group gap="md" c="ink.6">
                <Group gap={4}>
                  <Headphones size={13} />
                  <Text size="xs">{lesson.sentenceCount} câu</Text>
                </Group>
                <Group gap={4}>
                  <Clock size={13} />
                  <Text size="xs">{lesson.estimatedTime}</Text>
                </Group>
              </Group>
            </Stack>

            <Stack gap="xs" mt="md">
              <Group justify="space-between" align="center">
                <Text size="xs" c="ink.6" fw={500}>
                  {lesson.progressPercent > 0
                    ? `${lesson.progressPercent}% hoàn thành`
                    : "Chưa bắt đầu"}
                </Text>
                {lesson.lastPracticed && (
                  <Text size="xs" c="ink.5">
                    {lesson.lastPracticed}
                  </Text>
                )}
              </Group>

              <Progress
                value={lesson.progressPercent}
                color={isCompleted ? "teal" : "orange"}
                size="sm"
                radius="xl"
              />

              <Button
                component={Link}
                href={`/study/dictation/${lesson.slug || lesson.id}`}
                variant={ctaVariant}
                color={ctaColor}
                fullWidth
                radius="md"
                size="sm"
                mt="xs"
                fw={600}
                rightSection={<ArrowRight size={14} />}
              >
                {ctaText}
              </Button>
            </Stack>
          </Card>
        );
      })}
    </SimpleGrid>
  );
}
