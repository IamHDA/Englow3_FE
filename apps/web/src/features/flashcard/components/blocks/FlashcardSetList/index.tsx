"use client";

import {
  Badge,
  Button,
  Card,
  Group,
  Progress,
  Table,
  Text,
} from "@mantine/core";
import { IconEye, IconPlayerPlay } from "@tabler/icons-react";
import Link from "next/link";
import React from "react";
import { FlashcardSet } from "../../../types";

interface FlashcardSetListProps {
  sets: FlashcardSet[];
}

export function FlashcardSetList({ sets }: FlashcardSetListProps) {
  return (
    <Card withBorder padding={0} radius="md">
      <Table verticalSpacing="sm" horizontalSpacing="md" highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Bộ từ vựng</Table.Th>
            <Table.Th>Chủ đề</Table.Th>
            <Table.Th>Số từ</Table.Th>
            <Table.Th>Tiến độ</Table.Th>
            <Table.Th>Cần ôn hôm nay</Table.Th>
            <Table.Th>Lần học cuối</Table.Th>
            <Table.Th ta="right">Hành động</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {sets.map((set) => (
            <Table.Tr key={set.id}>
              <Table.Td>
                <Text fw={600} fz="sm" c="dark.9">
                  {set.name}
                </Text>
                <Text fz="xs" c="dimmed" lineClamp={1}>
                  {set.description}
                </Text>
              </Table.Td>
              <Table.Td>
                <Badge variant="light" color="indigo" size="xs">
                  {set.topic}
                </Badge>
              </Table.Td>
              <Table.Td>
                <Text fz="xs">{set.totalCards} từ</Text>
              </Table.Td>
              <Table.Td style={{ minWidth: 120 }}>
                <Group gap="xs">
                  <Progress
                    value={set.masteredPercent}
                    size="xs"
                    color="indigo"
                    style={{ flex: 1 }}
                  />
                  <Text fz="xs" fw={600}>
                    {set.masteredPercent}%
                  </Text>
                </Group>
              </Table.Td>
              <Table.Td>
                {set.dueTodayCount > 0 ? (
                  <Badge variant="filled" color="orange" size="xs">
                    {set.dueTodayCount} thẻ
                  </Badge>
                ) : (
                  <Badge variant="light" color="teal" size="xs">
                    0 thẻ
                  </Badge>
                )}
              </Table.Td>
              <Table.Td>
                <Text fz="xs" c="dimmed">
                  {set.lastStudied}
                </Text>
              </Table.Td>
              <Table.Td>
                <Group gap="xs" justify="flex-end">
                  <Button
                    component={Link}
                    href={`/study/flashcards/${set.slug}`}
                    variant="subtle"
                    color="gray"
                    size="xs"
                    leftSection={<IconEye size={14} />}
                  >
                    Xem
                  </Button>
                  <Button
                    component={Link}
                    href={`/study/flashcards/${set.slug}/study`}
                    variant="filled"
                    color="indigo"
                    size="xs"
                    leftSection={<IconPlayerPlay size={14} />}
                  >
                    Học
                  </Button>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Card>
  );
}
