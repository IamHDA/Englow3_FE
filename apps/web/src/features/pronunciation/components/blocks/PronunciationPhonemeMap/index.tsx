"use client";

import { Box, Card, Group, SimpleGrid, Stack, Text } from "@mantine/core";
import { IconVolume } from "@tabler/icons-react";
import React from "react";
import { IpaChartSound } from "../../../types";
import { useLanguage } from "@/shared/hooks/useLanguage";

interface PronunciationPhonemeMapProps {
  sounds: IpaChartSound[];
}

export function PronunciationPhonemeMap({
  sounds,
}: PronunciationPhonemeMapProps) {
  const { isVi } = useLanguage();

  const handleSpeak = (symbol: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    // Speak symbol or fallback to representative sound
    const soundChar = symbol.replace(/\//g, "");
    const utterance = new SpeechSynthesisUtterance(soundChar);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };

  const vowels = sounds.filter((s) => s.type !== "consonant");
  const consonants = sounds.filter((s) => s.type === "consonant");

  return (
    <Card withBorder padding="lg" radius="md">
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Box>
            <Text fw={700} fz="md" c="dark.9">
              {isVi
                ? "Bảng âm vị học quốc tế IPA"
                : "International Phonetic Alphabet (IPA) Chart"}
            </Text>
            <Text fz="xs" c="dimmed">
              {isVi
                ? "Nhấp vào từng âm để nghe phát âm mẫu"
                : "Click a sound to hear it"}
            </Text>
          </Box>
        </Group>

        {/* Vowels */}
        <Stack gap="xs">
          <Text fz="xs" fw={700} c="indigo">
            {isVi ? "NGUYÊN ÂM:" : "VOWELS:"}
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
                }}
                onClick={() => handleSpeak(item.symbol)}
              >
                <Group justify="space-between" align="center">
                  <Stack gap={2}>
                    <Text fw={800} fz="md" c="indigo.9">
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
            {isVi ? "PHỤ ÂM:" : "CONSONANTS:"}
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
                }}
                onClick={() => handleSpeak(item.symbol)}
              >
                <Group justify="space-between" align="center">
                  <Stack gap={2}>
                    <Text fw={800} fz="md" c="indigo.9">
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
