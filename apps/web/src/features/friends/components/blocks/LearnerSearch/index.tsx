"use client";

import { Stack, Text, TextInput } from "@mantine/core";
import { Search } from "lucide-react";
import type { ReactNode } from "react";

import { SEARCH_COPY } from "../../../constants/friends";

type LearnerSearchProps = {
  value: string;
  onChange: (value: string) => void;
  /** A short line under the box when what was typed cannot be searched yet. */
  hint?: string;
  /** Whatever the search came back with: results, a skeleton, an empty or error state. */
  children: ReactNode;
};

/** The search box of the "Tìm bạn" tab, and room for what the search finds. */
export function LearnerSearch({
  value,
  onChange,
  hint,
  children,
}: LearnerSearchProps) {
  return (
    <Stack gap="md">
      <Stack gap={4}>
        <TextInput
          type="search"
          value={value}
          onChange={(event) => onChange(event.currentTarget.value)}
          label={SEARCH_COPY.label}
          placeholder={SEARCH_COPY.placeholder}
          leftSection={<Search size={16} aria-hidden="true" />}
          autoComplete="off"
          aria-describedby={hint ? "learner-search-hint" : undefined}
        />
        {hint && (
          <Text id="learner-search-hint" size="xs" c="ink.5">
            {hint}
          </Text>
        )}
      </Stack>
      {children}
    </Stack>
  );
}
