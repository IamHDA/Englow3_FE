"use client";

import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Container,
  Group,
  Progress,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconBook,
  IconClock,
  IconPlayerPlay,
  IconVolume,
} from "@tabler/icons-react";
import Link from "next/link";
import React from "react";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { FlashcardSet } from "../../../types";

interface FlashcardSetDetailViewProps {
  set: FlashcardSet;
}

export function FlashcardSetDetailView({ set }: FlashcardSetDetailViewProps) {
  const { isVi } = useLanguage();

  const handleSpeak = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = "en-US";
    window.speechSynthesis.speak(utt);
  };

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        {/* Navigation & Header */}
        <Group justify="space-between" align="center">
          <Button
            component={Link}
            href="/study/flashcards"
            variant="subtle"
            color="gray"
            leftSection={<IconArrowLeft size={18} />}
          >
            {isVi ? "Quay lại danh sách bộ thẻ" : "Back to Decks"}
          </Button>

          <Button
            component={Link}
            href={`/study/flashcards/${set.slug}/study`}
            size="md"
            variant="filled"
            color="indigo"
            radius="md"
            leftSection={<IconPlayerPlay size={18} />}
          >
            {isVi ? "Học ngay bộ từ này" : "Study Deck Now"}
          </Button>
        </Group>

        {/* Set Info Header Card */}
        <Card withBorder padding="xl" radius="lg">
          <Stack gap="sm">
            <Group justify="space-between" align="flex-start">
              <Stack gap={4}>
                <Group gap="xs">
                  <Badge variant="filled" color="indigo" size="md">
                    {set.topic}
                  </Badge>
                  {set.dueTodayCount > 0 ? (
                    <Badge variant="filled" color="orange" size="sm">
                      {isVi
                        ? `${set.dueTodayCount} từ cần ôn tập hôm nay`
                        : `${set.dueTodayCount} cards due today`}
                    </Badge>
                  ) : (
                    <Badge variant="light" color="teal" size="sm">
                      {isVi ? "Đã hoàn thành mục tiêu hôm nay" : "Completed for today"}
                    </Badge>
                  )}
                </Group>
                <Title order={2} fw={800} c="dark.9">
                  {set.name}
                </Title>
              </Stack>
            </Group>

            <Text fz="sm" c="dimmed">
              {set.description}
            </Text>

            <Group gap="xl" mt="xs">
              <Group gap="xs">
                <IconBook size={16} color="var(--mantine-color-indigo-6)" />
                <Text fz="sm">
                  {isVi ? "Tổng số từ:" : "Total cards:"} <b>{set.totalCards} {isVi ? "từ" : "cards"}</b>
                </Text>
              </Group>
              <Group gap="xs">
                <IconClock size={16} color="var(--mantine-color-blue-6)" />
                <Text fz="sm">
                  {isVi ? "Lần học gần nhất:" : "Last studied:"} <b>{set.lastStudied}</b>
                </Text>
              </Group>
              <Box style={{ flex: 1, maxWidth: 240 }}>
                <Group justify="space-between" mb={2}>
                  <Text fz="xs" c="dimmed">
                    {isVi ? "Đã thuộc:" : "Mastered:"}
                  </Text>
                  <Text fz="xs" fw={700} c="indigo">
                    {set.masteredPercent}%
                  </Text>
                </Group>
                <Progress
                  value={set.masteredPercent}
                  color="indigo"
                  size="sm"
                  radius="xl"
                />
              </Box>
            </Group>
          </Stack>
        </Card>

        {/* Card List Table */}
        <Card withBorder padding="md" radius="md">
          <Stack gap="sm">
            <Group justify="space-between" align="center">
              <Text fw={700} fz="md" c="dark.9">
                {isVi
                  ? `Danh sách từ vựng trong bộ (${set.cards.length} thẻ)`
                  : `Card list in deck (${set.cards.length} cards)`}
              </Text>
              <Text fz="xs" c="dimmed">
                {isVi
                  ? "Bấm vào biểu tượng loa để nghe phát âm chuẩn bản xứ"
                  : "Click speaker icon to listen to native pronunciation"}
              </Text>
            </Group>

            <Table verticalSpacing="sm" horizontalSpacing="md" highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{isVi ? "Từ vựng" : "Word"}</Table.Th>
                  <Table.Th>{isVi ? "Phiên âm IPA" : "IPA"}</Table.Th>
                  <Table.Th>{isVi ? "Từ loại" : "Part of Speech"}</Table.Th>
                  <Table.Th>{isVi ? "Nghĩa" : "Definition"}</Table.Th>
                  <Table.Th>{isVi ? "Định nghĩa tiếng Anh" : "English Meaning"}</Table.Th>
                  <Table.Th>{isVi ? "Trạng thái" : "Status"}</Table.Th>
                  <Table.Th ta="right">{isVi ? "Nghe" : "Audio"}</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {set.cards.map((card) => (
                  <Table.Tr key={card.id}>
                    <Table.Td>
                      <Text fw={700} c="indigo">
                        {card.front}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text fz="xs" c="dimmed" fs="italic">
                        {card.ipa}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="outline" color="gray" size="xs">
                        {card.pos}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text fz="sm">{card.translationVi}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text fz="xs" c="dimmed">
                        {card.definition}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      {card.status === "Mastered" && (
                        <Badge color="teal" variant="light" size="xs">
                          {isVi ? "Đã thuộc" : "Mastered"}
                        </Badge>
                      )}
                      {card.status === "Review" && (
                        <Badge color="indigo" variant="light" size="xs">
                          {isVi ? "Ôn tập" : "Review"}
                        </Badge>
                      )}
                      {card.status === "Learning" && (
                        <Badge color="blue" variant="light" size="xs">
                          {isVi ? "Đang học" : "Learning"}
                        </Badge>
                      )}
                      {card.status === "New" && (
                        <Badge color="gray" variant="light" size="xs">
                          {isVi ? "Từ mới" : "New"}
                        </Badge>
                      )}
                    </Table.Td>
                    <Table.Td ta="right">
                      <ActionIcon
                        variant="subtle"
                        color="indigo"
                        size="sm"
                        onClick={() => handleSpeak(card.front)}
                        aria-label={`Nghe từ ${card.front}`}
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
      </Stack>
    </Container>
  );
}
