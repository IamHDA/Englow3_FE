"use client";

import { useLanguage } from "@/shared/hooks/useLanguage";

import { ActionIcon, Group, Stack, Text, Textarea } from "@mantine/core";
import { IconSend } from "@tabler/icons-react";
import React, { useRef, useState } from "react";

import { MAX_MESSAGE_LENGTH } from "../../../constants/tutorChat";

interface TutorComposerProps {
  onSend: (message: string) => Promise<boolean>;
  disabled: boolean;
}

/** Ô soạn câu hỏi. Enter gửi, Shift+Enter xuống dòng - như mọi ô chat khác. */
export function TutorComposer({ onSend, disabled }: TutorComposerProps) {
  const { isVi } = useLanguage();
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const pending = useRef(false);

  const tooLong = value.length > MAX_MESSAGE_LENGTH;
  const canSend =
    value.trim().length > 0 && !tooLong && !disabled && !submitting;

  async function submit() {
    if (!canSend || pending.current) return;
    pending.current = true;
    setSubmitting(true);
    try {
      if (await onSend(value)) setValue("");
    } catch {
      // Keep the draft when delivery fails.
    } finally {
      pending.current = false;
      setSubmitting(false);
    }
  }

  return (
    <Stack gap={4}>
      <Group align="flex-end" gap="xs" wrap="nowrap">
        <Textarea
          flex={1}
          autosize
          minRows={1}
          maxRows={6}
          radius="md"
          placeholder={
            isVi
              ? "Hỏi gia sư về từ vựng, ngữ pháp, phát âm…"
              : "Ask about vocabulary, grammar, pronunciation…"
          }
          value={value}
          disabled={submitting}
          aria-label={isVi ? "Câu hỏi cho gia sư" : "Question for the tutor"}
          error={tooLong}
          onChange={(event) => setValue(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              !event.shiftKey &&
              !event.nativeEvent.isComposing
            ) {
              event.preventDefault();
              submit();
            }
          }}
        />
        <ActionIcon
          size="lg"
          radius="md"
          disabled={!canSend}
          onClick={submit}
          aria-label={isVi ? "Gửi câu hỏi" : "Send question"}
        >
          <IconSend size={18} />
        </ActionIcon>
      </Group>
      {tooLong && (
        <Text size="xs" c="red">
          {isVi
            ? `Câu hỏi dài quá ${MAX_MESSAGE_LENGTH} ký tự. Rút ngắn giúp mình nhé.`
            : `Questions can be at most ${MAX_MESSAGE_LENGTH} characters. Please shorten it.`}
        </Text>
      )}
    </Stack>
  );
}
