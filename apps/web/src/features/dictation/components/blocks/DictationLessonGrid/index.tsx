"use client";

import { Card, SimpleGrid, Text } from "@mantine/core";
import { Clock, Headphones } from "lucide-react";
import { LibraryCard } from "@/shared/components/LibraryCard";
import { useLanguage } from "@/shared/hooks/useLanguage";
import {
  estimatedTime,
  lastPractisedLabel,
  lessonStatus,
  progressPercent,
} from "../../../lessonProgress";
import type { DictationLesson } from "../../../types";

interface DictationLessonGridProps {
  lessons: DictationLesson[];
  /**
   * What to say when there is nothing to show. The view knows whether that is
   * because nothing is published yet or because the filters ruled it all out;
   * this block does not.
   */
  emptyMessage: string;
}

export function DictationLessonGrid({
  lessons,
  emptyMessage,
}: DictationLessonGridProps) {
  const { isVi } = useLanguage();

  if (lessons.length === 0) {
    return (
      <Card
        radius="md"
        p="xl"
        withBorder
        bg="white"
        style={{ textAlign: "center" }}
      >
        <Text c="ink.6" size="sm">
          {emptyMessage}
        </Text>
      </Card>
    );
  }

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
      {lessons.map((lesson) => {
        const status = lessonStatus(lesson);
        const percent = progressPercent(lesson);
        const completed = status === "Completed";
        const started = status === "In progress";
        const last = lastPractisedLabel(lesson, isVi);
        return (
          <LibraryCard
            key={lesson.id}
            eyebrow={lesson.topic}
            level={lesson.targetLevel}
            status={
              completed
                ? { label: isVi ? "Hoàn thành" : "Completed", color: "teal" }
                : undefined
            }
            title={lesson.title}
            meta={[
              {
                icon: <Headphones size={15} />,
                label: isVi
                  ? `${lesson.sentenceCount} câu`
                  : `${lesson.sentenceCount} sentences`,
              },
              { icon: <Clock size={15} />, label: estimatedTime(lesson, isVi) },
            ]}
            progress={{
              value: percent,
              label: last ?? (isVi ? "Chưa bắt đầu" : "Not started"),
              color: completed ? "teal" : "orange",
            }}
            action={{
              label: completed
                ? isVi
                  ? "Luyện lại"
                  : "Practise again"
                : started
                  ? isVi
                    ? "Tiếp tục"
                    : "Continue"
                  : isVi
                    ? "Bắt đầu"
                    : "Start",
              href: `/study/dictation/${lesson.slug || lesson.id}`,
              emphasis: started ? "continue" : "default",
            }}
          />
        );
      })}
    </SimpleGrid>
  );
}
