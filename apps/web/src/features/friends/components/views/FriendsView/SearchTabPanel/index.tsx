"use client";

import { Paper } from "@mantine/core";
import { Search } from "lucide-react";
import { useState } from "react";

import { useLanguage } from "@/shared/hooks/useLanguage";

import { MIN_SEARCH_TERM_LENGTH } from "../../../../constants/friends";
import { useLearnerSearchTerm } from "../../../../hooks/useLearnerSearchTerm";
import type {
  PendingRelationshipAction,
  RelationshipActionHandler,
} from "../../../../types";
import { LearnerSearch } from "../../../blocks/LearnerSearch";
import { LearnerSearchResultsSkeleton } from "../../../blocks/LearnerSearchResults/LearnerSearchResultsSkeleton";
import { ListEmptyState } from "../../../parts/ListEmptyState";

import { SearchResults } from "./SearchResults";

type SearchTabPanelProps = {
  pending: PendingRelationshipAction | null;
  onAction: RelationshipActionHandler;
};

/** The "search" tab: a box to type a name in, and what that name finds. */
export function SearchTabPanel({ pending, onAction }: SearchTabPanelProps) {
  const { t } = useLanguage();
  const [input, setInput] = useState("");
  const search = useLearnerSearchTerm(input);

  return (
    <LearnerSearch
      value={input}
      onChange={setInput}
      hint={
        search.status === "tooShort"
          ? t.friends.search.tooShort.replace(
              "{min}",
              String(MIN_SEARCH_TERM_LENGTH),
            )
          : undefined
      }
    >
      {search.status === "ready" ? (
        <SearchResults
          key={search.term}
          term={search.term}
          pending={pending}
          onAction={onAction}
        />
      ) : search.status === "typing" ? (
        <LearnerSearchResultsSkeleton />
      ) : (
        <Paper withBorder radius="lg">
          <ListEmptyState
            icon={<Search size={24} aria-hidden="true" />}
            title={t.friends.search.idleTitle}
            description={t.friends.search.idleDescription}
          />
        </Paper>
      )}
    </LearnerSearch>
  );
}
