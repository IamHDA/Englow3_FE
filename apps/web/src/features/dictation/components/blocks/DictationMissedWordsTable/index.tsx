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

export function DictationMissedWordsTable({ words }: DictationMissedWordsTableProps) {
  const { isVi, t } = useLanguage();
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
          <Text size="xs" c="ink.5">
            {isVi
              ? "Bấm một từ để xem ngữ cảnh câu mẫu chứa từ đó"
              : "Click a word to view its example sentence context"}
          </Text>
        </Group>

        <ScrollArea>
          <Table verticalSpacing="sm" horizontalSpacing="md" highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{isVi ? "Từ vựng" : "Word"}</Table.Th>
                <Table.Th style={{ textAlign: "center" }}>
                  {isVi ? "Số lần gõ sai" : "Misses"}
                </Table.Th>
                <Table.Th style={{ textAlign: "center" }}>
                  {isVi ? "Số lần gõ đúng" : "Correct"}
                </Table.Th>
                <Table.Th style={{ textAlign: "right" }}>
                  {isVi ? "Độ chính xác" : "Accuracy"}
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {words.map((w) => {
                const isSelected = selectedWord === w.word;

                return (
                  <Table.Tr
                    key={w.word}
                    onClick={() =>
                      setSelectedWord(isSelected ? null : w.word)
                    }
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
                          <Text size="xs" c="navy.9" style={{ fontStyle: "italic" }}>
                            {isVi ? "Ví dụ:" : "Example:"} “{w.exampleSentence}”
                          </Text>
                        )}
                      </Stack>
                    </Table.Td>
                    <Table.Td style={{ textAlign: "center" }}>
                      <Badge color="warn" variant="light" size="sm">
                        {w.missedCount} {isVi ? "lần" : "times"}
                      </Badge>
                    </Table.Td>
                    <Table.Td style={{ textAlign: "center" }}>
                      <Badge color="teal" variant="light" size="sm">
                        {w.correctCount} {isVi ? "lần" : "times"}
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
