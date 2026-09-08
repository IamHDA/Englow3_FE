"use client";

import { Badge, Card, Group, Stack, Table, Text } from "@mantine/core";
import { IconHistory } from "@tabler/icons-react";
import React from "react";
import { FlashcardStatsData } from "../../../types";

interface FlashcardHistoryTableProps {
  history: FlashcardStatsData["history"];
}

export function FlashcardHistoryTable({ history }: FlashcardHistoryTableProps) {
  return (
    <Card withBorder padding="md" radius="md">
      <Stack gap="sm">
        <Group justify="space-between" align="center">
          <Group gap="xs">
            <IconHistory size={20} color="var(--mantine-color-indigo-6)" />
            <Text fw={700} fz="sm" c="dark.9">
              Lịch sử các phiên học gần đây
            </Text>
          </Group>
          <Text fz="xs" c="dimmed">
            Ghi nhận tự động sau mỗi phiên ôn tập
          </Text>
        </Group>

        <Table verticalSpacing="xs" horizontalSpacing="sm" highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Thời gian</Table.Th>
              <Table.Th>Bộ từ vựng</Table.Th>
              <Table.Th>Số thẻ đã lật</Table.Th>
              <Table.Th>Tỷ lệ nhớ tốt</Table.Th>
              <Table.Th ta="right">Thời lượng</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
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
                  <Text fz="xs">{row.cardsCount} thẻ</Text>
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
