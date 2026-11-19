"use client";

import { useCallback } from "react";

import { useLanguage } from "@/shared/hooks/useLanguage";
import { backendCodeOf } from "@/shared/network/loadError";

import { sentenceForCode } from "../constants/blogErrors";

/** The sentence for a failure of a blog call, in the interface language: the backend's own code when it gave one we have words for, else a general one. */
export function useBlogErrorMessage() {
  const { t } = useLanguage();
  const copy = t.blog;

  return useCallback(
    (error: unknown): string => sentenceForCode(copy, backendCodeOf(error)),
    [copy],
  );
}
