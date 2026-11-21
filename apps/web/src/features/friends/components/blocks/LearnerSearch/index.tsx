"use client";

import { CloseButton, Stack, Text, TextInput } from "@mantine/core";
import { Search } from "lucide-react";
import type { Ref } from "react";

import { useLanguage } from "@/shared/hooks/useLanguage";

import { MIN_SEARCH_TERM_LENGTH } from "../../../constants/friends";

const HINT_ID = "learner-search-hint";

type LearnerSearchProps = {
  value: string;
  onChange: (value: string) => void;
  /** Empties the box. The view does it, so it can give the box focus back. */
  onClear: () => void;
  /** What was typed is too short to search for: say so under the box. */
  tooShort: boolean;
  /** The view reaches the box through this, to focus it. */
  inputRef: Ref<HTMLInputElement>;
  /** Focus the box when it first appears. */
  autoFocus?: boolean;
};

/**
 * The search box above the menu of /friends. Always there: typing in it puts
 * the search results where the list was. The box is a plain text input, not
 * type="search", so the browser's own clear button does not stand beside ours.
 */
export function LearnerSearch({
  value,
  onChange,
  onClear,
  tooShort,
  inputRef,
  autoFocus,
}: LearnerSearchProps) {
  const copy = useLanguage().t.friends.search;
  return (
    <Stack gap={4}>
      <TextInput
        ref={inputRef}
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
        // The placeholder says what the box is for; the name is for a screen reader.
        aria-label={copy.label}
        placeholder={copy.placeholder}
        leftSection={<Search size={18} aria-hidden="true" />}
        rightSection={
          value ? (
            <CloseButton aria-label={copy.clear} onClick={onClear} />
          ) : null
        }
        rightSectionPointerEvents="all"
        autoComplete="off"
        autoFocus={autoFocus}
        aria-describedby={tooShort ? HINT_ID : undefined}
      />
      {tooShort && (
        <Text id={HINT_ID} size="xs" c="ink.5">
          {copy.tooShort.replace("{min}", String(MIN_SEARCH_TERM_LENGTH))}
        </Text>
      )}
    </Stack>
  );
}
