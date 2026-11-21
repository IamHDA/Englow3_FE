"use client";

import { useSearchLearnersQuery } from "@/lib/graphql/generated/hooks";
import { useLanguage } from "@/shared/hooks/useLanguage";

import { FRIENDS_PAGE_SIZE } from "../../../../../constants/friends";
import { usePageNumber } from "../../../../../hooks/usePageNumber";
import type {
  PendingRelationshipAction,
  RelationshipActionHandler,
} from "../../../../../types";
import { LearnerSearchResults } from "../../../../blocks/LearnerSearchResults";
import { LearnerSearchResultsSkeleton } from "../../../../blocks/LearnerSearchResults/LearnerSearchResultsSkeleton";
import { PeoplePanel } from "../../../../blocks/PeoplePanel";
import { ListLoadError } from "../../../../parts/ListLoadError";

type SearchResultsProps = {
  /** Long enough to search for: the panel does not mount this for anything shorter. */
  term: string;
  pending: PendingRelationshipAction | null;
  onAction: RelationshipActionHandler;
};

/**
 * What one search term finds. The panel keys it by the term, so a new search
 * starts again on page 1.
 */
export function SearchResults({ term, pending, onAction }: SearchResultsProps) {
  const copy = useLanguage().t.friends.search;
  const { page, setPage, fitTo } = usePageNumber();
  const { data, loading, error, refetch } = useSearchLearnersQuery({
    variables: { q: term, page: page - 1, size: FRIENDS_PAGE_SIZE },
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });
  const results = data?.searchLearners;
  fitTo(results?.totalPages);

  if (!results) {
    return (
      <PeoplePanel title={copy.title}>
        {error && !loading ? (
          <ListLoadError
            title={copy.loadErrorTitle}
            onRetry={() => void refetch().catch(() => undefined)}
          />
        ) : (
          <LearnerSearchResultsSkeleton />
        )}
      </PeoplePanel>
    );
  }

  return (
    <PeoplePanel title={copy.title} count={results.totalItems} term={term}>
      <LearnerSearchResults
        items={results.items}
        page={page}
        totalPages={results.totalPages}
        onPageChange={setPage}
        pending={pending}
        onAction={onAction}
      />
    </PeoplePanel>
  );
}
