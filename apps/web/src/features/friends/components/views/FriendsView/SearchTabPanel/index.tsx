"use client";

import { Paper } from "@mantine/core";
import { Search } from "lucide-react";
import { useState } from "react";

import { SEARCH_COPY } from "../../../../constants/friends";
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

/** The "Tìm bạn" tab: a box to type a name in, and what that name finds. */
export function SearchTabPanel({ pending, onAction }: SearchTabPanelProps) {
  const [input, setInput] = useState("");
  const search = useLearnerSearchTerm(input);

  return (
    <LearnerSearch
      value={input}
      onChange={setInput}
      hint={search.status === "tooShort" ? SEARCH_COPY.tooShort : undefined}
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
            title={SEARCH_COPY.idleTitle}
            description={SEARCH_COPY.idleDescription}
          />
        </Paper>
      )}
    </LearnerSearch>
  );
}
