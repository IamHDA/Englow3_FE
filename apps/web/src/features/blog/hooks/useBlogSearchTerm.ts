"use client";

import { useDebouncedValue } from "@mantine/hooks";

import { MIN_SEARCH_TERM_LENGTH, SEARCH_DEBOUNCE_MS } from "../constants/blog";

export type BlogSearchTerm = {
  /**
   * What the box has to say about what was typed: nothing yet (`idle`), too
   * short for the backend to answer (`tooShort`), long enough but still being
   * typed (`typing`), or settled (`ready`).
   */
  status: "idle" | "tooShort" | "typing" | "ready";
  /**
   * The term to search titles for, or null for no search: the last thing the
   * person typed and paused on, when it is long enough. It lags the box by one
   * pause, so a list does not search on every key - and it keeps the list that
   * was showing until the next term is settled.
   */
  term: string | null;
};

/**
 * What a search box hands to the list. The list only searches once the person
 * pauses, with the last thing they typed, and never below the length the
 * backend refuses (it would answer SEARCH_TERM_TOO_SHORT).
 */
export function useBlogSearchTerm(input: string): BlogSearchTerm {
  const typed = input.trim();
  const [settled] = useDebouncedValue(typed, SEARCH_DEBOUNCE_MS);
  const term = settled.length >= MIN_SEARCH_TERM_LENGTH ? settled : null;

  if (typed.length === 0) return { status: "idle", term };
  if (typed.length < MIN_SEARCH_TERM_LENGTH)
    return { status: "tooShort", term };
  if (settled !== typed) return { status: "typing", term };
  return { status: "ready", term };
}
