"use client";

import {
  Button,
  Flex,
  Group,
  Kbd,
  Paper,
  Stack,
  Text,
  Textarea,
} from "@mantine/core";
import { Check, SkipForward } from "lucide-react";
import React from "react";
import { useLanguage } from "@/shared/hooks/useLanguage";

interface DictationInputAreaProps {
  value: string;
  onChange: (val: string) => void;
  onCheckAnswer: () => void;
  onSkip: () => void;
  disabled?: boolean;
  checking?: boolean;
}

export function DictationInputArea({
  value,
  onChange,
  onCheckAnswer,
  onSkip,
  disabled = false,
  checking = false,
}: DictationInputAreaProps) {
  const { t } = useLanguage();
  const wordCount = value.trim().split(/\s+/).filter(Boolean).length;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      !disabled &&
      value.trim() &&
      !e.nativeEvent.isComposing &&
      (e.ctrlKey || e.metaKey) &&
      e.key === "Enter"
    ) {
      e.preventDefault();
      onCheckAnswer();
    }
  };

  return (
    <Paper radius="md" p="lg" withBorder bg="white">
      <Stack gap="sm">
        <Textarea
          placeholder={t.dictation.inputPlaceholder}
          minRows={3}
          maxRows={6}
          autosize
          size="md"
          value={value}
          onChange={(e) => onChange(e.currentTarget.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          styles={{
            input: {
              fontSize: 16,
              lineHeight: 1.6,
              fontFamily: "var(--font-body), sans-serif",
            },
          }}
        />

        <Flex
          direction={{ base: "column", sm: "row" }}
          justify="space-between"
          align={{ base: "flex-start", sm: "center" }}
          gap="sm"
        >
          {/* Shortcuts & Word count */}
          <Group gap="xs">
            <Text size="xs" fw={600} c="ink.6">
              {t.dictation.wordsTypedCount.replace(
                "{count}",
                String(wordCount),
              )}
            </Text>
            <Text size="xs" c="ink.4">
              •
            </Text>
            <Group gap={4} visibleFrom="sm">
              <Kbd size="xs">Ctrl</Kbd> + <Kbd size="xs">Enter</Kbd>
              <Text size="xs" c="ink.5">
                {t.dictation.toCheckHint}
              </Text>
            </Group>
          </Group>

          {/* Actions */}
          <Group gap="xs" style={{ width: "100%", justifyContent: "flex-end" }}>
            <Button
              variant="default"
              size="sm"
              radius="md"
              onClick={onSkip}
              disabled={disabled}
              leftSection={<SkipForward size={14} />}
            >
              {t.dictation.skipButton}
            </Button>

            <Button
              variant="filled"
              color="navy"
              size="sm"
              radius="md"
              onClick={onCheckAnswer}
              disabled={disabled || value.trim().length === 0}
              loading={checking}
              leftSection={<Check size={15} />}
              fw={600}
            >
              {t.dictation.checkAnswer}
            </Button>
          </Group>
        </Flex>
      </Stack>
    </Paper>
  );
}
