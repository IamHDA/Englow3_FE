"use client";

import { Button, SimpleGrid, Stack, Text } from "@mantine/core";
import React from "react";

import { useLanguage } from "@/shared/hooks/useLanguage";

import { TUTOR_STARTERS } from "../../../constants/tutorChat";

interface TutorStartersProps {
  onPick: (message: string) => void;
  disabled: boolean;
}

/** Màn hình trống thì khó bắt đầu. Bốn gợi ý, mỗi cái là một việc gia sư làm được. */
export function TutorStarters({ onPick, disabled }: TutorStartersProps) {
  const { isVi } = useLanguage();
  return (
    <Stack gap="sm" py="xl">
      <Text size="sm" c="dimmed" ta="center">
        {isVi
          ? "Chưa biết hỏi gì? Thử một trong số này:"
          : "Not sure what to ask? Try one of these:"}
      </Text>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
        {TUTOR_STARTERS[isVi ? "vi" : "en"].map((starter) => (
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
