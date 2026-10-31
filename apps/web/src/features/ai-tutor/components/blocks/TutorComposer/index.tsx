"use client";

import { useLanguage } from "@/shared/hooks/useLanguage";

import { ActionIcon, Group, Stack, Text, Textarea } from "@mantine/core";
import { IconSend } from "@tabler/icons-react";
import React, { useEffect, useRef, useState } from "react";

import { MAX_MESSAGE_LENGTH } from "../../../constants/tutorChat";

interface TutorComposerProps {
  onSend: (message: string) => Promise<boolean>;
  disabled: boolean;
  draftKey?: string;
}

/** Ô soạn câu hỏi. Enter gửi, Shift+Enter xuống dòng - như mọi ô chat khác. */
export function TutorComposer({
  onSend,
  disabled,
  draftKey,
}: TutorComposerProps) {
  const { isVi } = useLanguage();
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const pending = useRef(false);

  useEffect(() => {
    if (!draftKey) return;
    let active = true;
    void Promise.resolve().then(() => {
      if (!active) return;
      try {
        const draft = JSON.parse(sessionStorage.getItem(draftKey) ?? "null");
        if (
          draft &&
          typeof draft.text === "string" &&
          typeof draft.at === "number" &&
          Date.now() - draft.at < 86400000
        )
          setValue(draft.text);
        else sessionStorage.removeItem(draftKey);
      } catch {
        /* Drafts remain usable without storage. */
      }
    });
    return () => {
      active = false;
    };
  }, [draftKey]);
  function change(text: string) {
    setValue(text);
    if (draftKey)
      try {
        sessionStorage.setItem(
          draftKey,
          JSON.stringify({ text, at: Date.now() }),
        );
      } catch {
        /* memory draft */
      }
  }
  const tooLong = value.length > MAX_MESSAGE_LENGTH;
  const canSend =
    value.trim().length > 0 && !tooLong && !disabled && !submitting;

  async function submit() {
    if (!canSend || pending.current) return;
    pending.current = true;
    setSubmitting(true);
    try {
      if (await onSend(value)) {
        setValue("");
        if (draftKey)
          try {
            sessionStorage.removeItem(draftKey);
          } catch {
            /* storage unavailable */
          }
      }
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
          label={isVi ? "Câu hỏi của bạn" : "Your question"}
          placeholder={
            isVi
              ? "Hỏi gia sư về từ vựng, ngữ pháp, phát âm…"
              : "Ask about vocabulary, grammar, pronunciation…"
          }
          value={value}
          disabled={submitting}
          aria-label={isVi ? "Câu hỏi cho gia sư" : "Question for the tutor"}
          error={tooLong}
          onChange={(event) => change(event.currentTarget.value)}
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
          size={44}
          radius="md"
          disabled={!canSend}
          onClick={submit}
          aria-label={isVi ? "Gửi câu hỏi" : "Send question"}
        >
          <IconSend size={18} />
        </ActionIcon>
      </Group>
      <Text size="xs" c="dimmed">
        {value.length}/{MAX_MESSAGE_LENGTH} ·{" "}
        {isVi
          ? "Enter để gửi · Shift+Enter xuống dòng"
          : "Enter to send · Shift+Enter for a new line"}
      </Text>
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
