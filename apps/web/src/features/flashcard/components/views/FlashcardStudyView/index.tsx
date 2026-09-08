"use client";

import {
  Box,
  Button,
  Container,
  Group,
  Progress,
  Stack,
  Text,
} from "@mantine/core";
import { IconArrowLeft, IconClock } from "@tabler/icons-react";
import Link from "next/link";
import React from "react";
import { useFlashcardStudy } from "../../../hooks/useFlashcardStudy";
import { FlashcardSet } from "../../../types";
import { Flashcard3DCard } from "../../blocks/Flashcard3DCard";
import { FlashcardSessionSummary } from "../../blocks/FlashcardSessionSummary";
import { FlashcardStudyControls } from "../../blocks/FlashcardStudyControls";
import { useLanguage } from "@/shared/hooks/useLanguage";

interface FlashcardStudyViewProps {
  set: FlashcardSet;
}

export function FlashcardStudyView({ set }: FlashcardStudyViewProps) {
  const { isVi } = useLanguage();
  const {
    currentIndex,
    totalCards,
    currentCard,
    isFlipped,
    progressPercent,
    studyDurationFormatted,
    isCompleted,
    summaryData,
    flipCard,
    speakCard,
    rateCard,
    restartStudy,
  } = useFlashcardStudy({
    cards: set.cards,
    setName: set.name,
  });

  if (isCompleted) {
    return (
      <Container size="md" py="xl">
        <FlashcardSessionSummary
          summary={summaryData}
          onRestart={restartStudy}
        />
      </Container>
    );
  }

  if (!currentCard) {
    return null;
  }

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        {/* Top Navigation & Status Bar */}
        <Group justify="space-between" align="center">
          <Button
            component={Link}
            href={`/study/flashcards/${set.slug}`}
            variant="subtle"
            color="gray"
            size="sm"
            leftSection={<IconArrowLeft size={16} />}
          >
            {isVi ? "Thoát phiên học" : "Exit session"}
          </Button>

          <Stack gap={2} align="center">
            <Text fw={700} fz="sm" c="dark.9">
              {set.name}
            </Text>
            <Text fz="xs" c="dimmed">
              {isVi
                ? `Thẻ số ${currentIndex + 1} trên ${totalCards}`
                : `Card ${currentIndex + 1} of ${totalCards}`}
            </Text>
          </Stack>

          <Group gap="xs">
            <IconClock size={16} color="var(--mantine-color-dimmed)" />
            <Text fz="xs" fw={600} c="dimmed">
              {studyDurationFormatted}
            </Text>
          </Group>
        </Group>

        {/* Progress Bar */}
        <Box>
          <Progress
            value={progressPercent}
            color="indigo"
            size="sm"
            radius="xl"
            animated
          />
        </Box>

        {/* 3D Flashcard */}
        <Flashcard3DCard
          card={currentCard}
          isFlipped={isFlipped}
          onFlip={flipCard}
          onSpeak={speakCard}
        />

        {/* Study SRS Controls */}
        <FlashcardStudyControls
          isFlipped={isFlipped}
          onFlip={flipCard}
          onRate={rateCard}
        />
      </Stack>
    </Container>
  );
}
