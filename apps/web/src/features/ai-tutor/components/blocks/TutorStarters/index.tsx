"use client";

import { Button, SimpleGrid, Stack, Text } from "@mantine/core";
import React from "react";

import { TUTOR_STARTERS } from "../../../constants/tutorChat";

interface TutorStartersProps {
  onPick: (message: string) => void;
  disabled: boolean;
}

/** Màn hình trống thì khó bắt đầu. Bốn gợi ý, mỗi cái là một việc gia sư làm được. */
export function TutorStarters({ onPick, disabled }: TutorStartersProps) {
  return (
    <Stack gap="sm" py="xl">
      <Text size="sm" c="dimmed" ta="center">
        Chưa biết hỏi gì? Thử một trong số này:
      </Text>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
        {TUTOR_STARTERS.map((starter) => (
          <Button
            key={starter}
            variant="light"
            size="sm"
            radius="md"
            disabled={disabled}
            onClick={() => onPick(starter)}
            styles={{ label: { whiteSpace: "normal", textAlign: "left" } }}
            h="auto"
            py="xs"
          >
            {starter}
          </Button>
        ))}
      </SimpleGrid>
    </Stack>
  );
}
