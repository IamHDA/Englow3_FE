"use client";

import {
  ActionIcon,
  Badge,
  Box,
  Card,
  Divider,
  Group,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import {
  IconBulb,
  IconFlipHorizontal,
  IconQuote,
  IconSparkles,
  IconVolume,
  IconVolume2,
} from "@tabler/icons-react";
import React from "react";
import { FlashcardItem } from "../../../types";
import styles from "./Flashcard3DCard.module.css";
import { useLanguage } from "@/shared/hooks/useLanguage";

interface Flashcard3DCardProps {
  card: FlashcardItem;
  isFlipped: boolean;
  onFlip: () => void;
  onSpeak: (text?: string) => void;
}

export function Flashcard3DCard({
  card,
  isFlipped,
  onFlip,
  onSpeak,
}: Flashcard3DCardProps) {
  const { isVi } = useLanguage();

  return (
    <Box className={styles.cardContainer} onClick={onFlip}>
      <Box className={`${styles.flipper} ${isFlipped ? styles.flipped : ""}`}>
        {/* FRONT SIDE */}
        <Card
          withBorder
          padding="xl"
          bg="var(--mantine-color-body)"
          className={styles.frontCard}
        >
          {/* Top Info Bar */}
          <Group justify="space-between" align="center">
            <Badge variant="light" color="indigo" size="md">
              {card.pos.toUpperCase()}
            </Badge>
            <Group gap="xs">
              {card.missCount > 1 && (
                <Badge variant="dot" color="red" size="sm">
                  {isVi
                    ? `Cần ôn lại (${card.missCount} lần sai)`
                    : `Needs review (${card.missCount} misses)`}
                </Badge>
              )}
              <Tooltip label={isVi ? "Nghe phát âm chuẩn" : "Listen to native audio"}>
                <ActionIcon
                  variant="subtle"
                  color="indigo"
                  size="lg"
                  radius="xl"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSpeak(card.front);
                  }}
                  aria-label={isVi ? "Nghe phát âm" : "Listen audio"}
                >
                  <IconVolume size={20} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Group>

          {/* Word Center */}
          <Stack align="center" justify="center" gap="xs" my="auto">
            <Text
              fz={{ base: 36, sm: 46 }}
              fw={800}
              c="indigo.9"
              ta="center"
              style={{ letterSpacing: "-0.02em" }}
            >
              {card.front}
            </Text>
            <Group gap="xs" align="center">
              <Text fz="lg" c="dimmed" fs="italic" ta="center">
                {card.ipa}
              </Text>
              <ActionIcon
                variant="light"
                color="indigo"
                size="sm"
                radius="xl"
                onClick={(e) => {
                  e.stopPropagation();
                  onSpeak(card.front);
                }}
                aria-label={isVi ? "Phát âm từ" : "Pronounce word"}
              >
                <IconVolume2 size={14} />
              </ActionIcon>
            </Group>
          </Stack>

          {/* Flip Hint Footer */}
          <Group justify="center" align="center" gap={6} c="dimmed">
            <IconFlipHorizontal size={16} />
            <Text fz="xs" fw={500}>
              {isVi
                ? "Nhấn phím cách hoặc bấm vào thẻ để xem nghĩa & ví dụ"
                : "Press Space or tap card to flip and view definition"}
            </Text>
          </Group>
        </Card>

        {/* BACK SIDE */}
        <Card
          withBorder
          padding="xl"
          bg="var(--mantine-color-body)"
          className={styles.backCard}
        >
          {/* Top Bar */}
          <Group justify="space-between" align="center">
            <Group gap="xs">
              <Badge variant="filled" color="indigo" size="md">
                {card.pos}
              </Badge>
              <Text fz="sm" fw={700} c="indigo">
                {card.front}
              </Text>
              <Text fz="xs" c="dimmed" fs="italic">
                {card.ipa}
              </Text>
            </Group>
            <ActionIcon
              variant="subtle"
              color="indigo"
              size="md"
              radius="xl"
              onClick={(e) => {
                e.stopPropagation();
                onSpeak(card.front);
              }}
              aria-label={isVi ? "Nghe lại" : "Listen again"}
            >
              <IconVolume size={18} />
            </ActionIcon>
          </Group>

          <Divider my="xs" />

          {/* Meaning Content */}
          <Stack gap="sm" my="auto">
            {/* Vietnamese meaning highlighted */}
            <Box
              p="sm"
              style={{
                borderRadius: "var(--mantine-radius-md)",
                backgroundColor: "var(--mantine-color-indigo-0)",
                borderLeft: "4px solid var(--mantine-color-indigo-6)",
              }}
            >
              <Text fz="sm" c="dimmed" fw={600} mb={2}>
                {isVi ? "NGHĨA TIẾNG VIỆT:" : "VIETNAMESE MEANING:"}
              </Text>
              <Text fz="lg" fw={700} c="indigo.9">
                {card.translationVi}
              </Text>
            </Box>

            {/* English Definition */}
            <Box>
              <Text fz="xs" c="dimmed" fw={600}>
                {isVi ? "ĐỊNH NGHĨA ANH - ANH:" : "ENGLISH DEFINITION:"}
              </Text>
              <Text fz="sm" fw={500} c="dark.7">
                {card.definition}
              </Text>
            </Box>

            {/* Example sentence */}
            <Group align="flex-start" gap="xs" wrap="nowrap">
              <ThemeIcon variant="light" color="teal" size="sm" radius="xl" mt={2}>
                <IconQuote size={12} />
              </ThemeIcon>
              <Box style={{ flex: 1 }}>
                <Text fz="xs" c="dimmed" fw={600}>
                  {isVi ? "VÍ DỤ NGỮ CẢNH:" : "CONTEXT EXAMPLE:"}
                </Text>
                <Text fz="sm" c="dark.8" fs="italic">
                  &ldquo;{card.exampleSentence}&rdquo;
                </Text>
              </Box>
            </Group>

            {/* Mnemonic / Memory Note if available */}
            {card.memoryNote && (
              <Group align="flex-start" gap="xs" wrap="nowrap">
                <ThemeIcon variant="light" color="amber" size="sm" radius="xl" mt={2}>
                  <IconBulb size={12} />
                </ThemeIcon>
                <Box style={{ flex: 1 }}>
                  <Text fz="xs" c="amber.9" fw={600}>
                    {isVi ? "MẸO GHI NHỚ:" : "MEMORY MNEMONIC:"}
                  </Text>
                  <Text fz="xs" c="dimmed">
                    {card.memoryNote}
                  </Text>
                </Box>
              </Group>
            )}
          </Stack>

          {/* Footer Back */}
          <Group justify="center" align="center" gap={6} c="dimmed">
            <IconSparkles size={14} />
            <Text fz="xs" fw={500}>
              {isVi
                ? "Đánh giá mức độ ghi nhớ ở bên dưới để hệ thống lặp lại khoa học"
                : "Rate your retention below for optimal spaced repetition"}
            </Text>
          </Group>
        </Card>
      </Box>
    </Box>
  );
}
