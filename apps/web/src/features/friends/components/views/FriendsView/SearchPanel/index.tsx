"use client";

import { Search } from "lucide-react";

import { useLanguage } from "@/shared/hooks/useLanguage";

import type { LearnerSearchTerm } from "../../../../hooks/useLearnerSearchTerm";
import type {
  PendingRelationshipAction,
  RelationshipActionHandler,
} from "../../../../types";
import { LearnerSearchResultsSkeleton } from "../../../blocks/LearnerSearchResults/LearnerSearchResultsSkeleton";
import { PeoplePanel } from "../../../blocks/PeoplePanel";
import { ListEmptyState } from "../../../parts/ListEmptyState";

import { SearchResults } from "./SearchResults";

type SearchPanelProps = {
  /** What the search box holds - never "idle": with nothing typed there is no search to show. */
  search: Exclude<LearnerSearchTerm, { status: "idle" }>;
  pending: PendingRelationshipAction | null;
  onAction: RelationshipActionHandler;
};

/**
 * "Tìm learner": what the search box finds, shown where the list was while
 * something is typed in it. The box itself is in the side column.
 */
export function SearchPanel({ search, pending, onAction }: SearchPanelProps) {
  const copy = useLanguage().t.friends.search;

  switch (search.status) {
    case "ready":
      return (
        <SearchResults
          key={search.term}
          term={search.term}
          pending={pending}
          onAction={onAction}
        />
      );
    case "typing":
      return (
        <PeoplePanel title={copy.title}>
          <LearnerSearchResultsSkeleton />
        </PeoplePanel>
      );
    case "tooShort":
      return (
        <PeoplePanel title={copy.title}>
          <ListEmptyState
            icon={<Search size={24} aria-hidden="true" />}
            title={copy.promptTitle}
            description={copy.promptDescription}
          />
        </PeoplePanel>
      );
    default: {
      const unreachable: never = search;
      return unreachable;
    }
  }
}
