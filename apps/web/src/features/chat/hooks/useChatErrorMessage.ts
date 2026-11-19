"use client";

import { useCallback } from "react";

import { useLanguage } from "@/shared/hooks/useLanguage";
import { backendCodeOf } from "@/shared/network/loadError";

import { sentenceForCode } from "../constants/chatErrors";

/** The sentence for a failure of a chat call, in the interface language: the backend's own code when it gave one we have words for, else a general one. */
export function useChatErrorMessage() {
  const { t } = useLanguage();
  const copy = t.chat;

  return useCallback(
    (error: unknown): string => sentenceForCode(copy, backendCodeOf(error)),
    [copy],
  );
}
