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
import { useLanguage } from "@/shared/hooks/useLanguage";
import Link from "next/link";
import React from "react";
import { FlashcardSet } from "../../../types";

interface FlashcardSetListProps {
  sets: FlashcardSet[];
}

/**
 * Derived, not stored: the backend reports how many cards are mastered, and the
 * bar wants a proportion. Computing it here keeps one number in the API instead
 * of two that can disagree.
 */
/**
 * The backend reports an instant; the card wants "3 days ago". Null means the
 * learner has never opened this set, which is not the same as "0 days ago".
 */
function formatLastStudied(value: string | null, isVi: boolean): string {
  if (!value) return isVi ? "Chưa học" : "Not started";

  const days = Math.floor((Date.now() - Date.parse(value)) / 86_400_000);
  if (days <= 0) return isVi ? "Hôm nay" : "Today";
  if (days === 1) return isVi ? "Hôm qua" : "Yesterday";
  return isVi ? `${days} ngày trước` : `${days} days ago`;
}

function masteredPercent(set: FlashcardSet): number {
  if (set.cardCount === 0) return 0;
  return Math.round((set.masteredCount / set.cardCount) * 100);
}

export function FlashcardSetList({ sets }: FlashcardSetListProps) {
  const { isVi } = useLanguage();

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
                <Text fz="xs">{set.cardCount} từ</Text>
              </Table.Td>
              <Table.Td style={{ minWidth: 120 }}>
                <Group gap="xs">
                  <Progress
                    value={masteredPercent(set)}
                    size="xs"
                    color="indigo"
                    style={{ flex: 1 }}
                  />
                  <Text fz="xs" fw={600}>
                    {masteredPercent(set)}%
                  </Text>
                </Group>
              </Table.Td>
              <Table.Td>
                {set.dueCount > 0 ? (
                  <Badge variant="filled" color="orange" size="xs">
                    {set.dueCount} thẻ
                  </Badge>
                ) : (
                  <Badge variant="light" color="teal" size="xs">
                    0 thẻ
                  </Badge>
                )}
              </Table.Td>
              <Table.Td>
                <Text fz="xs" c="dimmed">
                  {formatLastStudied(set.lastStudiedAt, isVi)}
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
