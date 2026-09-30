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
  const { t } = useLanguage();

  const hints = [
    {
      key: "wordCount",
      label: t.dictation.hintWordCountLabel,
      value: `${sentence.hintWordCount} ${t.dictation.wordsUnit}`,
    },
    {
      key: "firstLetters",
      label: t.dictation.hintFirstLettersLabel,
      value: sentence.hintFirstLetters,
    },
    {
      key: "revealWord",
      label: t.dictation.hintRevealWordLabel,
      value: sentence.hintRevealWord,
    },
    {
      key: "translation",
      label: t.dictation.hintTranslationLabel,
      value: null,
    },
    {
      key: "partialTranscript",
      label: t.dictation.hintPartialTranscriptLabel,
      value: sentence.hintPartialTranscript,
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
          {isOpen ? t.dictation.collapseHints : t.dictation.needHint}
        </Button>

        <Badge
          variant="light"
          color={hintsUsedCount > 0 ? "orange" : "gray"}
          size="sm"
        >
          {t.dictation.hintsUsedBadge.replace(
            "{count}",
            String(hintsUsedCount),
          )}
        </Badge>
      </Group>

      <Collapse expanded={isOpen}>
        <Stack gap="xs" mt="sm">
          <Text size="xs" c="ink.5" style={{ fontStyle: "italic" }}>
            {t.dictation.hintsCounterNote}
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
                      {t.dictation.unlockHint}
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
