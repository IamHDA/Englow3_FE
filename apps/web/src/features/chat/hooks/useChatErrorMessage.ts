"use client";

import { useCallback } from "react";

import { useLanguage } from "@/shared/hooks/useLanguage";
import { backendCodeOf } from "@/shared/network/loadError";

/** The sentence for a failure of a chat call, in the interface language: the backend's own code when it gave one we have words for, else a general one. */
export function useChatErrorMessage() {
  const { t } = useLanguage();
  const { backendErrors, genericError } = t.chat;

  return useCallback(
    (error: unknown): string => {
      const code = backendCodeOf(error);
      return code && Object.hasOwn(backendErrors, code)
        ? backendErrors[code as keyof typeof backendErrors]
        : genericError;
    },
    [backendErrors, genericError],
  );
}
