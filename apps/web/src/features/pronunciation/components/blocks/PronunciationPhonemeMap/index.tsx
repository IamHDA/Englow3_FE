"use client";

import { Box, Card, Group, SimpleGrid, Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconVolume } from "@tabler/icons-react";
import React from "react";
import { IpaChartSound } from "../../../types";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { firstExampleWord, speakEnglish } from "../../../speakExample";

interface PronunciationPhonemeMapProps {
  sounds: IpaChartSound[];
}

export function PronunciationPhonemeMap({
  sounds,
}: PronunciationPhonemeMapProps) {
  const { t, isVi } = useLanguage();

  const handleSpeak = (item: IpaChartSound) => {
    // Giọng đọc của trình duyệt không đọc được ký hiệu IPA, nên đọc từ ví dụ.
    const word = firstExampleWord(item.example);
    if (!word || !speakEnglish(word)) {
      notifications.show({
        color: "warn",
        message: isVi
          ? "Trình duyệt này không có giọng đọc tiếng Anh."
          : "This browser has no English text-to-speech voice.",
      });
    }
  };

  const vowels = sounds.filter((s) => s.type !== "consonant");
  const consonants = sounds.filter((s) => s.type === "consonant");

  return (
    <Card withBorder padding="lg" radius="md">
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Box>
            <Text fw={700} fz="md" c="dark.9">
              {t.pronunciation.ipaChartTitle}
            </Text>
            <Text fz="xs" c="dimmed">
              {t.pronunciation.ipaChartSubtitle}
            </Text>
          </Box>
        </Group>

        {/* Vowels */}
        <Stack gap="xs">
          <Text fz="xs" fw={700} c="indigo">
            {t.pronunciation.vowelsHeading}
          </Text>
          <SimpleGrid cols={{ base: 3, sm: 4, md: 6 }} spacing="xs">
            {vowels.map((item, idx) => (
              <Card
                key={idx}
                withBorder
                padding="xs"
                radius="sm"
                style={{
                  cursor: "pointer",
                  textAlign: "left",
                }}
                component="button"
                type="button"
                aria-label={`${item.symbol} - ${item.example}`}
                onClick={() => handleSpeak(item)}
              >
                <Group justify="space-between" align="center">
                  <Stack gap={2}>
                    <Text fw={700} fz="md" c="indigo.9">
                      {item.symbol}
                    </Text>
                    <Text fz={10} c="dimmed">
                      {item.example}
                    </Text>
                  </Stack>
                  <IconVolume size={14} color="var(--mantine-color-gray-5)" />
                </Group>
              </Card>
            ))}
          </SimpleGrid>
        </Stack>

        {/* Consonants */}
        <Stack gap="xs" mt="sm">
          <Text fz="xs" fw={700} c="indigo">
            {t.pronunciation.consonantsHeading}
          </Text>
          <SimpleGrid cols={{ base: 3, sm: 4, md: 6 }} spacing="xs">
            {consonants.map((item, idx) => (
              <Card
                key={idx}
                withBorder
                padding="xs"
                radius="sm"
                style={{
                  cursor: "pointer",
                  textAlign: "left",
                }}
                component="button"
                type="button"
                aria-label={`${item.symbol} - ${item.example}`}
                onClick={() => handleSpeak(item)}
              >
                <Group justify="space-between" align="center">
                  <Stack gap={2}>
                    <Text fw={700} fz="md" c="indigo.9">
                      {item.symbol}
                    </Text>
                    <Text fz={10} c="dimmed">
                      {item.example}
                    </Text>
                  </Stack>
                  <IconVolume size={14} color="var(--mantine-color-gray-5)" />
                </Group>
              </Card>
            ))}
          </SimpleGrid>
        </Stack>
      </Stack>
    </Card>
  );
}
