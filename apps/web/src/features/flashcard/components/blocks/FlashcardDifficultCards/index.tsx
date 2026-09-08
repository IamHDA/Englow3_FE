"use client";

import {
  ActionIcon,
  Badge,
  Card,
  Group,
  Stack,
  Table,
  Text,
} from "@mantine/core";
import { IconAlertTriangle, IconVolume } from "@tabler/icons-react";
import React from "react";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { FlashcardStatsData } from "../../../types";

interface FlashcardDifficultCardsProps {
  cards: FlashcardStatsData["difficultCards"];
  onSpeak?: (word: string) => void;
}

export function FlashcardDifficultCards({
  cards,
  onSpeak,
}: FlashcardDifficultCardsProps) {
  const { isVi, t } = useLanguage();

  const handleSpeak = (word: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(word);
    utt.lang = "en-US";
    window.speechSynthesis.speak(utt);
  };

  return (
    <Card withBorder padding="md" radius="md">
      <Stack gap="sm">
        <Group justify="space-between" align="center">
          <Group gap="xs">
            <IconAlertTriangle size={20} color="var(--mantine-color-red-6)" />
            <Text fw={700} fz="sm" c="dark.9">
              {t.flashcard.needsAttention}
            </Text>
          </Group>
          <Badge variant="light" color="red" size="sm">
            {isVi ? `${cards.length} từ cần ưu tiên` : `${cards.length} priority words`}
          </Badge>
        </Group>

        <Table verticalSpacing="xs" horizontalSpacing="sm" highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{isVi ? "Từ vựng" : "Word"}</Table.Th>
              <Table.Th>{isVi ? "Bộ từ" : "Deck"}</Table.Th>
              <Table.Th>{isVi ? "Số lần chưa nhớ" : "Misses"}</Table.Th>
              <Table.Th>{isVi ? "Lần xem cuối" : "Last Review"}</Table.Th>
              <Table.Th ta="right">{isVi ? "Phát âm" : "Audio"}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {cards.map((item) => (
              <Table.Tr key={item.id}>
                <Table.Td>
                  <Text fw={700} c="red.8">
                    {item.card}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text fz="xs" c="dimmed">
                    {item.set}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Badge color="red" variant="filled" size="xs">
                    {isVi ? `${item.missCount} lần` : `${item.missCount} times`}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Text fz="xs" c="dimmed">
                    {item.lastReview}
                  </Text>
                </Table.Td>
                <Table.Td ta="right">
                  <ActionIcon
                    variant="subtle"
                    color="indigo"
                    size="sm"
                    onClick={() => (onSpeak ? onSpeak(item.card) : handleSpeak(item.card))}
                  >
                    <IconVolume size={16} />
                  </ActionIcon>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Stack>
    </Card>
  );
}
