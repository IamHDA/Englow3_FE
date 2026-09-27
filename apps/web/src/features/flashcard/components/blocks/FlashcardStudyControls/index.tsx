"use client";

import { Button, Group, Kbd, Stack, Text } from "@mantine/core";
import { ReviewRating } from "@/lib/graphql/generated";
import {
  IconCheck,
  IconClock,
  IconMoodSmile,
  IconRotateClockwise,
  IconX,
} from "@tabler/icons-react";
import React from "react";
import { SRSRating } from "../../../types";
import { useLanguage } from "@/shared/hooks/useLanguage";

interface FlashcardStudyControlsProps {
  isFlipped: boolean;
  onFlip: () => void;
  onRate: (rating: SRSRating) => void;
}

export function FlashcardStudyControls({
  isFlipped,
  onFlip,
  onRate,
}: FlashcardStudyControlsProps) {
  const { t } = useLanguage();

  if (!isFlipped) {
    return (
      <Group justify="center" mt="md">
        <Button
          size="lg"
          variant="filled"
          color="indigo"
          radius="xl"
          onClick={onFlip}
          leftSection={<IconRotateClockwise size={20} />}
          rightSection={<Kbd size="xs">Space</Kbd>}
          style={{ minWidth: 260 }}
        >
          {t.flashcard.flipPrompt}
        </Button>
      </Group>
    );
  }

  return (
    <Stack gap="xs" align="center" mt="md">
      <Text fz="xs" c="dimmed" fw={600}>
        {t.flashcard.assessRetentionLabel}
      </Text>
      <Group justify="center" gap="sm" wrap="wrap">
        {/* Rating 1: Again */}
        <Button
          size="md"
          variant="light"
          color="red"
          radius="md"
          onClick={() => onRate(ReviewRating.AGAIN)}
          leftSection={<IconX size={18} />}
          rightSection={<Kbd size="xs">1</Kbd>}
        >
          {t.flashcard.ratingAgainHint}
        </Button>

        {/* Rating 2: Hard */}
        <Button
          size="md"
          variant="light"
          color="orange"
          radius="md"
          onClick={() => onRate(ReviewRating.HARD)}
          leftSection={<IconClock size={18} />}
          rightSection={<Kbd size="xs">2</Kbd>}
        >
          {t.flashcard.ratingHardHint}
        </Button>

        {/* Rating 3: Good */}
        <Button
          size="md"
          variant="light"
          color="blue"
          radius="md"
          onClick={() => onRate(ReviewRating.GOOD)}
          leftSection={<IconCheck size={18} />}
          rightSection={<Kbd size="xs">3</Kbd>}
        >
          {t.flashcard.ratingGoodHint}
        </Button>

        {/* Rating 4: Easy */}
        <Button
          size="md"
          variant="light"
          color="teal"
          radius="md"
          onClick={() => onRate(ReviewRating.EASY)}
          leftSection={<IconMoodSmile size={18} />}
          rightSection={<Kbd size="xs">4</Kbd>}
        >
          {t.flashcard.ratingEasyHint}
        </Button>
      </Group>
    </Stack>
  );
}
