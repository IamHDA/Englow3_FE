"use client";

import { Button, Group, Kbd, Stack, Text } from "@mantine/core";
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
  const { isVi } = useLanguage();

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
          {isVi ? "Lật thẻ xem đáp án" : "Flip card to reveal answer"}
        </Button>
      </Group>
    );
  }

  return (
    <Stack gap="xs" align="center" mt="md">
      <Text fz="xs" c="dimmed" fw={600}>
        {isVi
          ? "ĐÁNH GIÁ MỨC ĐỘ GHI NHỚ (Phím tắt 1 - 4):"
          : "ASSESS RETENTION LEVEL (Keys 1 - 4):"}
      </Text>
      <Group justify="center" gap="sm" wrap="wrap">
        {/* Rating 1: Again */}
        <Button
          size="md"
          variant="light"
          color="red"
          radius="md"
          onClick={() => onRate("Again")}
          leftSection={<IconX size={18} />}
          rightSection={<Kbd size="xs">1</Kbd>}
        >
          {isVi ? "Chưa nhớ (< 1 ngày)" : "Again (< 1 day)"}
        </Button>

        {/* Rating 2: Hard */}
        <Button
          size="md"
          variant="light"
          color="orange"
          radius="md"
          onClick={() => onRate("Hard")}
          leftSection={<IconClock size={18} />}
          rightSection={<Kbd size="xs">2</Kbd>}
        >
          {isVi ? "Khó (2 ngày)" : "Hard (2 days)"}
        </Button>

        {/* Rating 3: Good */}
        <Button
          size="md"
          variant="light"
          color="blue"
          radius="md"
          onClick={() => onRate("Good")}
          leftSection={<IconCheck size={18} />}
          rightSection={<Kbd size="xs">3</Kbd>}
        >
          {isVi ? "Nhớ tốt (4 ngày)" : "Good (4 days)"}
        </Button>

        {/* Rating 4: Easy */}
        <Button
          size="md"
          variant="light"
          color="teal"
          radius="md"
          onClick={() => onRate("Easy")}
          leftSection={<IconMoodSmile size={18} />}
          rightSection={<Kbd size="xs">4</Kbd>}
        >
          {isVi ? "Rất dễ (7 ngày)" : "Easy (7 days)"}
        </Button>
      </Group>
    </Stack>
  );
}
