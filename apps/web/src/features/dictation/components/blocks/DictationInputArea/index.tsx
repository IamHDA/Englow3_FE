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
import React, { useEffect, useRef } from "react";
import { useLanguage } from "@/shared/hooks/useLanguage";

interface DictationInputAreaProps {
  value: string;
  onChange: (val: string) => void;
  /** Enter và nút chính: chưa chấm thì chấm, đã chấm mà chưa sửa thì sang câu kế. */
  onSubmit: () => void;
  onSkip: () => void;
  /** Đã chấm và chưa sửa chữ nào kể từ đó. */
  checked?: boolean;
  disabled?: boolean;
  /** Đổi giá trị này (sang câu mới) thì đưa con trỏ về ô nhập. */
  focusKey?: string | number;
}

export function DictationInputArea({
  value,
  onChange,
  onSubmit,
  onSkip,
  checked = false,
  disabled = false,
  focusKey,
}: DictationInputAreaProps) {
  const { t, isVi } = useLanguage();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const wordCount = value.trim().split(/\s+/).filter(Boolean).length;

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, [focusKey]);

  // Một câu chép là một dòng: Enter là chấm, không xuống dòng (Shift+Enter vẫn xuống dòng).
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Enter" || e.shiftKey || e.nativeEvent.isComposing) return;
    e.preventDefault();
    if (!disabled && (checked || value.trim())) onSubmit();
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
          ref={inputRef}
          readOnly={disabled}
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
              <Kbd size="xs">Enter</Kbd>
              <Text size="xs" c="ink.5">
                {checked
                  ? isVi
                    ? "để sang câu tiếp theo"
                    : "for the next sentence"
                  : t.dictation.toCheckHint}
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
              onClick={onSubmit}
              disabled={disabled || (!checked && value.trim().length === 0)}
              leftSection={<Check size={15} />}
              fw={600}
            >
              {checked ? t.dictation.nextSentence : t.dictation.checkAnswer}
            </Button>
          </Group>
        </Flex>
      </Stack>
    </Paper>
  );
}
