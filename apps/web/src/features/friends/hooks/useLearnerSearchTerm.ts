"use client";

import { useDebouncedValue } from "@mantine/hooks";

import {
  MIN_SEARCH_TERM_LENGTH,
  SEARCH_DEBOUNCE_MS,
} from "../constants/friends";

export type LearnerSearchTerm =
  /** Nothing typed yet. */
  | { status: "idle" }
  /** Typed, but shorter than the backend answers. */
  | { status: "tooShort" }
  /** Long enough, but the person is still typing: the query waits for them to pause. */
  | { status: "typing" }
  /** The term to search for. */
  | { status: "ready"; term: string };

/**
 * What a search box has to say about what was typed. The query only runs once
 * the person pauses, with the last thing they typed, and never below the
 * length the backend refuses (it would answer SEARCH_TERM_TOO_SHORT).
 */
export function useLearnerSearchTerm(input: string): LearnerSearchTerm {
  const typed = input.trim();
  const [settled] = useDebouncedValue(typed, SEARCH_DEBOUNCE_MS);

  if (typed.length === 0) return { status: "idle" };
  if (typed.length < MIN_SEARCH_TERM_LENGTH) return { status: "tooShort" };
  if (settled !== typed) return { status: "typing" };
  return { status: "ready", term: settled };
}
