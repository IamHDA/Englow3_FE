"use client";

import {
  Badge,
  Button,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { Eye, History } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/shared/hooks/useLanguage";
import type { DictationHistoryItem } from "../../../types";

interface DictationHistoryTableProps {
  history: DictationHistoryItem[];
}

export function DictationHistoryTable({ history }: DictationHistoryTableProps) {
  const { isVi, t } = useLanguage();

  return (
    <Paper radius="md" p="lg" withBorder bg="white">
      <Stack gap="sm">
        <Group justify="space-between" align="center">
          <Group gap="xs">
            <History size={18} color="var(--mantine-color-navy-9)" />
            <Title order={3} size="h5" fw={700} c="ink.9">
              {t.dictation.historyTitle}
            </Title>
          </Group>
          <Text size="xs" c="ink.5">
            {isVi ? "Xem lại các phiên làm bài gần đây" : "Review your recent practice sessions"}
          </Text>
        </Group>

        <ScrollArea>
          <Table verticalSpacing="md" horizontalSpacing="md" highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{isVi ? "Thời gian" : "Date"}</Table.Th>
                <Table.Th>{isVi ? "Bài học" : "Lesson"}</Table.Th>
                <Table.Th>{isVi ? "Số câu" : "Sentences"}</Table.Th>
                <Table.Th>{isVi ? "Độ chính xác" : "Accuracy"}</Table.Th>
                <Table.Th>{isVi ? "Thời lượng" : "Duration"}</Table.Th>
                <Table.Th>{isVi ? "Gợi ý dùng" : "Hints"}</Table.Th>
                <Table.Th style={{ textAlign: "right" }}>{isVi ? "Xem lại" : "Action"}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {history.map((h) => (
                <Table.Tr key={h.id}>
                  <Table.Td>
                    <Text size="xs" fw={600} c="ink.8">
                      {h.date}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" fw={600} c="ink.9">
                      {h.lessonTitle}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs" c="ink.6">
                      {h.sentenceCountLabel}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge size="xs" color="teal" variant="light">
                      {h.accuracyLabel}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs" c="ink.6">
                      {h.studyTimeLabel}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs" c="ink.6">
                      {h.hintsUsedLabel}
                    </Text>
                  </Table.Td>
                  <Table.Td style={{ textAlign: "right" }}>
                    <Button
                      component={Link}
                      href="/study/dictation/ordering-food-at-a-restaurant"
                      size="xs"
                      variant="subtle"
                      color="navy"
                      radius="md"
                      leftSection={<Eye size={13} />}
                    >
                      {isVi ? "Chi tiết" : "Details"}
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Stack>
    </Paper>
  );
}
