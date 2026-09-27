"use client";

import {
  Badge,
  Button,
  Group,
  Paper,
  Progress,
  ScrollArea,
  Table,
  Text,
} from "@mantine/core";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { DICTATION_LEVELS } from "../../../constants/dictationData";
import {
  estimatedTime,
  lessonStatus,
  progressPercent,
} from "../../../lessonProgress";
import Link from "next/link";
import type { DictationLesson } from "../../../types";

const ALL_LEVELS_LABEL = DICTATION_LEVELS.find((l) => l.value === "ALL") ?? {
  labelVi: "Mọi trình độ",
  labelEn: "All Levels",
};

interface DictationLessonListProps {
  lessons: DictationLesson[];
  /**
   * What to say when there is nothing to show. The view knows whether that is
   * because nothing is published yet or because the filters ruled it all out;
   * this block does not.
   */
  emptyMessage: string;
}

export function DictationLessonList({
  lessons,
  emptyMessage,
}: DictationLessonListProps) {
  const { isVi, t } = useLanguage();

  if (lessons.length === 0) {
    return (
      <Paper
        radius="md"
        p="xl"
        withBorder
        bg="white"
        style={{ textAlign: "center" }}
      >
        <Text c="ink.6" size="sm">
          {emptyMessage}
        </Text>
      </Paper>
    );
  }

  return (
    <Paper radius="md" withBorder bg="white">
      <ScrollArea>
        <Table verticalSpacing="md" horizontalSpacing="md" highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t.dictation.lessonColumn}</Table.Th>
              <Table.Th>{t.dictation.topicColumn}</Table.Th>
              <Table.Th>{t.dictation.difficultyColumn}</Table.Th>
              <Table.Th>{t.dictation.durationColumn}</Table.Th>
              <Table.Th style={{ width: 180 }}>
                {t.dictation.progressColumn}
              </Table.Th>
              <Table.Th style={{ width: 140, textAlign: "right" }}>
                {t.dictation.actionColumn}
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {lessons.map((lesson) => {
              const isCompleted = lessonStatus(lesson) === "Completed";
              const isInProgress = lessonStatus(lesson) === "In progress";

              let ctaText = t.common.start;
              let ctaVariant: "filled" | "outline" | "light" = "outline";

              if (isCompleted) {
                ctaText = t.dictation.practiceAgainShort;
                ctaVariant = "light";
              } else if (isInProgress) {
                ctaText = t.dictation.continueButton;
                ctaVariant = "filled";
              }

              return (
                <Table.Tr key={lesson.id}>
                  <Table.Td>
                    <Group gap="xs">
                      {isCompleted && (
                        <CheckCircle2
                          size={16}
                          color="var(--mantine-color-teal-6)"
                        />
                      )}
                      <Text fw={600} size="sm" c="ink.9">
                        {lesson.title}
                      </Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Badge size="xs" variant="light" color="navy">
                      {lesson.topic}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Badge size="xs" variant="outline" color="ink.6">
                      {lesson.targetLevel ??
                        (isVi ? ALL_LEVELS_LABEL.labelVi : ALL_LEVELS_LABEL.labelEn)}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs" c="ink.6">
                      {lesson.sentenceCount} {t.dictation.sentenceCountSuffix} ·{" "}
                      {estimatedTime(lesson, t)}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs" align="center">
                      <Progress
                        value={progressPercent(lesson)}
                        color={isCompleted ? "teal" : "orange"}
                        size="sm"
                        radius="xl"
                        style={{ flex: 1 }}
                      />
                      <Text
                        size="xs"
                        c="ink.6"
                        fw={600}
                        style={{ minWidth: 32 }}
                      >
                        {progressPercent(lesson)}%
                      </Text>
                    </Group>
                  </Table.Td>
                  <Table.Td style={{ textAlign: "right" }}>
                    <Button
                      component={Link}
                      href={`/study/dictation/${lesson.id}`}
                      variant={ctaVariant}
                      color="navy"
                      size="xs"
                      radius="md"
                      fw={600}
                      rightSection={<ArrowRight size={12} />}
                    >
                      {ctaText}
                    </Button>
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Paper>
  );
}
