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
import Link from "next/link";
import type { DictationLesson } from "../../../types";

interface DictationLessonListProps {
  lessons: DictationLesson[];
}

export function DictationLessonList({ lessons }: DictationLessonListProps) {
  if (lessons.length === 0) {
    return (
      <Paper radius="md" p="xl" withBorder bg="white" style={{ textAlign: "center" }}>
        <Text c="ink.6" size="sm">
          Không tìm thấy bài học nào phù hợp.
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
              <Table.Th>Bài học</Table.Th>
              <Table.Th>Chủ đề</Table.Th>
              <Table.Th>Độ khó</Table.Th>
              <Table.Th>Thời lượng</Table.Th>
              <Table.Th style={{ width: 180 }}>Tiến độ</Table.Th>
              <Table.Th style={{ width: 140, textAlign: "right" }}>Hành động</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {lessons.map((lesson) => {
              const isCompleted = lesson.status === "Completed";
              const isInProgress = lesson.status === "In progress";

              let ctaText = "Bắt đầu";
              let ctaVariant: "filled" | "outline" | "light" = "outline";

              if (isCompleted) {
                ctaText = "Luyện lại";
                ctaVariant = "light";
              } else if (isInProgress) {
                ctaText = "Tiếp tục";
                ctaVariant = "filled";
              }

              return (
                <Table.Tr key={lesson.id}>
                  <Table.Td>
                    <Group gap="xs">
                      {isCompleted && (
                        <CheckCircle2 size={16} color="var(--mantine-color-teal-6)" />
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
                      {lesson.level}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs" c="ink.6">
                      {lesson.sentenceCount} câu · {lesson.estimatedTime}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs" align="center">
                      <Progress
                        value={lesson.progressPercent}
                        color={isCompleted ? "teal" : "orange"}
                        size="sm"
                        radius="xl"
                        style={{ flex: 1 }}
                      />
                      <Text size="xs" c="ink.6" fw={600} style={{ minWidth: 32 }}>
                        {lesson.progressPercent}%
                      </Text>
                    </Group>
                  </Table.Td>
                  <Table.Td style={{ textAlign: "right" }}>
                    <Button
                      component={Link}
                      href={`/study/dictation/${lesson.slug || lesson.id}`}
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
