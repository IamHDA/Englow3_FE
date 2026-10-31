"use client";

import {
  Badge,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/shared/hooks/useLanguage";
import type { MissedWordItem } from "../../../types";

interface DictationMissedWordsTableProps {
  words: MissedWordItem[];
}

export function DictationMissedWordsTable({
  words,
}: DictationMissedWordsTableProps) {
  const { t } = useLanguage();
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  return (
    <Paper radius="md" p="lg" withBorder bg="white">
      <Stack gap="sm">
        <Group justify="space-between" align="center">
          <Group gap="xs">
            <AlertTriangle size={18} color="var(--mantine-color-warn-7)" />
            <Title order={3} size="h5" fw={700} c="ink.9">
              {t.dictation.mistakesTitle}
            </Title>
          </Group>
        </Group>

        <ScrollArea>
          <Table verticalSpacing="sm" horizontalSpacing="md" highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t.dictation.wordColumn}</Table.Th>
                <Table.Th style={{ textAlign: "center" }}>
                  {t.dictation.missesColumn}
                </Table.Th>
                <Table.Th style={{ textAlign: "center" }}>
                  {t.dictation.correctColumn}
                </Table.Th>
                <Table.Th style={{ textAlign: "right" }}>
                  {t.dictation.accuracyScore}
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {words.length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={5}>
                    <Text size="sm" c="ink.5" ta="center" py="md">
                      {t.dictation.noMissedWords}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
              {words.map((w) => {
                const isSelected = selectedWord === w.word;

                return (
                  <Table.Tr
                    key={w.word}
                    onClick={() => setSelectedWord(isSelected ? null : w.word)}
                    style={{
                      cursor: "pointer",
                      backgroundColor: isSelected
                        ? "var(--mantine-color-navy-0)"
                        : undefined,
                    }}
                  >
                    <Table.Td>
                      <Stack gap={2}>
                        <Text fw={700} size="sm" c="ink.9">
                          {w.word}
                        </Text>
                        {isSelected && w.exampleSentence && (
                          <Text
                            size="xs"
                            c="navy.9"
                            style={{ fontStyle: "italic" }}
                          >
                            {t.dictation.exampleLabel} “{w.exampleSentence}”
                          </Text>
                        )}
                      </Stack>
                    </Table.Td>
                    <Table.Td style={{ textAlign: "center" }}>
                      <Badge color="warn" variant="light" size="sm">
                        {w.missedCount} {t.dictation.timesUnit}
                      </Badge>
                    </Table.Td>
                    <Table.Td style={{ textAlign: "center" }}>
                      <Badge color="teal" variant="light" size="sm">
                        {w.correctCount} {t.dictation.timesUnit}
                      </Badge>
                    </Table.Td>
                    <Table.Td style={{ textAlign: "right" }}>
                      <Text fw={600} size="sm" c="ink.8">
                        {w.accuracyPercent}%
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Stack>
    </Paper>
  );
}
