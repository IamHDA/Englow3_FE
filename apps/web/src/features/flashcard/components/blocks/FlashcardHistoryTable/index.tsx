"use client";

import { useLanguage } from "@/shared/hooks/useLanguage";

import { Badge, Card, Group, Stack, Table, Text } from "@mantine/core";
import { IconHistory } from "@tabler/icons-react";
import React from "react";
import { FlashcardStatsData } from "../../../types";

interface FlashcardHistoryTableProps {
  history: FlashcardStatsData["history"];
}

export function FlashcardHistoryTable({ history }: FlashcardHistoryTableProps) {
  const { isVi } = useLanguage();
  const tr = (vi: string, en: string) => (isVi ? vi : en);
  return (
    <Card withBorder padding="md" radius="md">
      <Stack gap="sm">
        <Group justify="space-between" align="center">
          <Group gap="xs">
            <IconHistory size={20} color="var(--mantine-color-indigo-6)" />
            <Text fw={700} fz="sm" c="dark.9">
              {tr("Lịch sử các phiên học gần đây", "Recent study sessions")}
            </Text>
          </Group>
        </Group>

        <Table verticalSpacing="xs" horizontalSpacing="sm" highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{tr("Thời gian", "When")}</Table.Th>
              <Table.Th>{tr("Bộ từ vựng", "Set")}</Table.Th>
              <Table.Th>{tr("Số thẻ đã lật", "Cards reviewed")}</Table.Th>
              <Table.Th>{tr("Tỷ lệ nhớ tốt", "Recall")}</Table.Th>
              <Table.Th ta="right">{tr("Thời lượng", "Duration")}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {history.length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={5}>
                  <Text fz="sm" c="dimmed" ta="center" py="md">
                    {tr("Chưa có phiên học nào.", "No study sessions yet.")}
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
            {history.map((row) => (
              <Table.Tr key={row.id}>
                <Table.Td>
                  <Text fz="xs" fw={500}>
                    {row.date}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text fz="sm" fw={600} c="indigo">
                    {row.set}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text fz="xs">
                    {row.cardsCount} {tr("thẻ", "cards")}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Badge
                    color={
                      row.recallPercent >= 85
                        ? "teal"
                        : row.recallPercent >= 70
                          ? "blue"
                          : "orange"
                    }
                    variant="light"
                    size="sm"
                  >
                    {row.recallPercent}%
                  </Badge>
                </Table.Td>
                <Table.Td ta="right">
                  <Text fz="xs" c="dimmed">
                    {row.studyTime}
                  </Text>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Stack>
    </Card>
  );
}
