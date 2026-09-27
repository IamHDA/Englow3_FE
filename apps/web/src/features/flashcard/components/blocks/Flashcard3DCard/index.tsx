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
  const { t } = useLanguage();

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
              {card.partOfSpeech.toUpperCase()}
            </Badge>
            <Group gap="xs">
              {card.lapseCount > 1 && (
                <Badge variant="dot" color="red" size="sm">
                  {t.flashcard.needsReviewBadge.replace(
                    "{count}",
                    String(card.lapseCount),
                  )}
                </Badge>
              )}
              <Tooltip label={t.flashcard.listenNativeAudioTooltip}>
                <ActionIcon
                  variant="subtle"
                  color="indigo"
                  size="lg"
                  radius="xl"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSpeak(card.lemma);
                  }}
                  aria-label={t.flashcard.listenAudioAria}
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
              {card.lemma}
            </Text>
            <Group gap="xs" align="center">
              <Text fz="lg" c="dimmed" fs="italic" ta="center">
                {card.ipaUs}
              </Text>
              <ActionIcon
                variant="light"
                color="indigo"
                size="sm"
                radius="xl"
                onClick={(e) => {
                  e.stopPropagation();
                  onSpeak(card.lemma);
                }}
                aria-label={t.flashcard.pronounceWordAria}
              >
                <IconVolume2 size={14} />
              </ActionIcon>
            </Group>
          </Stack>

          {/* Flip Hint Footer */}
          <Group justify="center" align="center" gap={6} c="dimmed">
            <IconFlipHorizontal size={16} />
            <Text fz="xs" fw={500}>
              {t.flashcard.flipHintFooter}
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
                {card.partOfSpeech}
              </Badge>
              <Text fz="sm" fw={700} c="indigo">
                {card.lemma}
              </Text>
              <Text fz="xs" c="dimmed" fs="italic">
                {card.ipaUs}
              </Text>
            </Group>
            <ActionIcon
              variant="subtle"
              color="indigo"
              size="md"
              radius="xl"
              onClick={(e) => {
                e.stopPropagation();
                onSpeak(card.lemma);
              }}
              aria-label={t.flashcard.listenAgainAria}
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
                {t.flashcard.vietnameseMeaningLabel}
              </Text>
              <Text fz="lg" fw={700} c="indigo.9">
                {card.definitionVi}
              </Text>
            </Box>

            {/* English Definition */}
            <Box>
              <Text fz="xs" c="dimmed" fw={600}>
                {t.flashcard.englishDefinitionLabel}
              </Text>
              <Text fz="sm" fw={500} c="dark.7">
                {card.definitionEn}
              </Text>
            </Box>

            {/* Example sentence */}
            <Group align="flex-start" gap="xs" wrap="nowrap">
              <ThemeIcon
                variant="light"
                color="teal"
                size="sm"
                radius="xl"
                mt={2}
              >
                <IconQuote size={12} />
              </ThemeIcon>
              <Box style={{ flex: 1 }}>
                <Text fz="xs" c="dimmed" fw={600}>
                  {t.flashcard.contextExampleLabel}
                </Text>
                <Text fz="sm" c="dark.8" fs="italic">
                  &ldquo;{card.exampleSentence}&rdquo;
                </Text>
              </Box>
            </Group>

            {/* Mnemonic / Memory Note if available */}
            {card.mnemonicTipVi && (
              <Group align="flex-start" gap="xs" wrap="nowrap">
                <ThemeIcon
                  variant="light"
                  color="amber"
                  size="sm"
                  radius="xl"
                  mt={2}
                >
                  <IconBulb size={12} />
                </ThemeIcon>
                <Box style={{ flex: 1 }}>
                  <Text fz="xs" c="amber.9" fw={600}>
                    {t.flashcard.memoryMnemonicLabel}
                  </Text>
                  <Text fz="xs" c="dimmed">
                    {card.mnemonicTipVi}
                  </Text>
                </Box>
              </Group>
            )}
          </Stack>

          {/* Footer Back */}
          <Group justify="center" align="center" gap={6} c="dimmed">
            <IconSparkles size={14} />
            <Text fz="xs" fw={500}>
              {t.flashcard.rateRetentionFooter}
            </Text>
          </Group>
        </Card>
      </Box>
    </Box>
  );
}
