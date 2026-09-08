"use client";

import {
  Badge,
  Button,
  Collapse,
  Group,
  Paper,
  Stack,
  Text,
} from "@mantine/core";
import { Lightbulb, Lock } from "lucide-react";
import { useLanguage } from "@/shared/hooks/useLanguage";
import type { DictationSentence } from "../../../types";

interface DictationHintDrawerProps {
  sentence: DictationSentence;
  hintsUsedCount: number;
  revealedHints: Record<string, boolean>;
  onRevealHint: (hintKey: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function DictationHintDrawer({
  sentence,
  hintsUsedCount,
  revealedHints,
  onRevealHint,
  isOpen,
  onToggle,
}: DictationHintDrawerProps) {
  const { isVi } = useLanguage();

  const hints = [
    {
      key: "wordCount",
      label: isVi ? "Xem số lượng từ trong câu" : "Word count in sentence",
      value: isVi ? `${sentence.hints.wordCount} từ` : `${sentence.hints.wordCount} words`,
    },
    {
      key: "firstLetters",
      label: isVi ? "Gợi ý các chữ cái đầu tiên" : "First letter of each word",
      value: sentence.hints.firstLetters,
    },
    {
      key: "revealWord",
      label: isVi ? "Mở khóa 1 từ khóa quan trọng" : "Reveal 1 key word",
      value: sentence.hints.revealWord,
    },
    {
      key: "translation",
      label: isVi ? "Xem bản dịch tiếng Việt" : "Vietnamese translation",
      value: sentence.hints.translation,
    },
    {
      key: "partialTranscript",
      label: isVi ? "Xem trích đoạn đầu của câu" : "Sentence opening excerpt",
      value: sentence.hints.partialTranscript,
    },
  ];

  return (
    <Paper radius="md" withBorder p="sm" bg="white">
      <Group justify="space-between" align="center">
        <Button
          variant="subtle"
          color="orange"
          size="sm"
          onClick={onToggle}
          leftSection={<Lightbulb size={16} />}
          fw={600}
        >
          {isOpen
            ? isVi
              ? "Thu gọn gợi ý"
              : "Collapse hints"
            : isVi
            ? "Bạn cần gợi ý?"
            : "Need a hint?"}
        </Button>

        <Badge variant="light" color={hintsUsedCount > 0 ? "orange" : "gray"} size="sm">
          {isVi
            ? `Đã dùng: ${hintsUsedCount} gợi ý`
            : `Used: ${hintsUsedCount} hints`}
        </Badge>
      </Group>

      <Collapse expanded={isOpen}>
        <Stack gap="xs" mt="sm">
          <Text size="xs" c="ink.5" style={{ fontStyle: "italic" }}>
            {isVi
              ? "* Mỗi gợi ý được mở sẽ tính vào số gợi ý đã dùng trong thống kê buổi học."
              : "* Each unlocked hint counts toward the hints used in session stats."}
          </Text>

          {hints.map((h) => {
            const isRevealed = Boolean(revealedHints[h.key]);

            return (
              <Paper
                key={h.key}
                p="xs"
                radius="sm"
                withBorder
                style={{
                  backgroundColor: isRevealed
                    ? "var(--mantine-color-orange-0)"
                    : "var(--mantine-color-ink-0)",
                  borderColor: isRevealed
                    ? "var(--mantine-color-orange-3)"
                    : "var(--mantine-color-ink-2)",
                }}
              >
                <Group justify="space-between" align="center">
                  <Text size="xs" fw={600} c="ink.8">
                    {h.label}
                  </Text>

                  {isRevealed ? (
                    <Text size="xs" fw={700} c="orange.9">
                      {h.value}
                    </Text>
                  ) : (
                    <Button
                      size="compact-xs"
                      variant="light"
                      color="navy"
                      radius="sm"
                      onClick={() => onRevealHint(h.key)}
                      leftSection={<Lock size={11} />}
                    >
                      {isVi ? "Mở xem" : "Unlock"}
                    </Button>
                  )}
                </Group>
              </Paper>
            );
          })}
        </Stack>
      </Collapse>
    </Paper>
  );
}
