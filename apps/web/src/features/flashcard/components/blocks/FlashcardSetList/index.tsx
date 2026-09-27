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
import { formatLastStudied, masteredPercent } from "../../../setProgress";

interface FlashcardSetListProps {
  sets: FlashcardSet[];
}

export function FlashcardSetList({ sets }: FlashcardSetListProps) {
  const { t } = useLanguage();

  return (
    <Card withBorder padding={0} radius="md">
      <Table verticalSpacing="sm" horizontalSpacing="md" highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{t.flashcard.setNameColumn}</Table.Th>
            <Table.Th>{t.dictation.topicColumn}</Table.Th>
            <Table.Th>{t.flashcard.cardCountColumn}</Table.Th>
            <Table.Th>{t.dictation.progressColumn}</Table.Th>
            <Table.Th>{t.flashcard.dueTodayColumn}</Table.Th>
            <Table.Th>{t.flashcard.lastStudiedColumn}</Table.Th>
            <Table.Th ta="right">{t.dictation.actionColumn}</Table.Th>
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
                <Text fz="xs">
                  {set.cardCount} {t.flashcard.wordsCountSuffix}
                </Text>
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
                    {set.dueCount} {t.flashcard.cardsUnit}
                  </Badge>
                ) : (
                  <Badge variant="light" color="teal" size="xs">
                    0 {t.flashcard.cardsUnit}
                  </Badge>
                )}
              </Table.Td>
              <Table.Td>
                <Text fz="xs" c="dimmed">
                  {formatLastStudied(set.lastStudiedAt, t)}
                </Text>
              </Table.Td>
              <Table.Td>
                <Group gap="xs" justify="flex-end">
                  <Button
                    component={Link}
                    href={`/study/flashcards/${set.id}`}
                    variant="subtle"
                    color="gray"
                    size="xs"
                    leftSection={<IconEye size={14} />}
                  >
                    {t.flashcard.viewButton}
                  </Button>
                  <Button
                    component={Link}
                    href={`/study/flashcards/${set.id}/study`}
                    variant="filled"
                    color="indigo"
                    size="xs"
                    leftSection={<IconPlayerPlay size={14} />}
                  >
                    {t.flashcard.studyButton}
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
