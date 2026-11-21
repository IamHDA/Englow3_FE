"use client";

import {
  useBlogSearchSuggestQuery,
  useSearchLearnersQuery,
} from "@/lib/graphql/generated/hooks";

import { SUGGESTED_PEOPLE, SUGGESTED_POSTS } from "../constants/blog";
import type {
  PersonSuggestionData,
  PostSuggestionData,
  SuggestionGroup,
} from "../types";

export type BlogSearchSuggestions = {
  posts: SuggestionGroup<PostSuggestionData>;
  /**
   * Null when there are no people to look for: a Staff or Admin account is not
   * a learner, the backend refuses the search for it, so nothing is asked.
   */
  people: SuggestionGroup<PersonSuggestionData> | null;
};

/**
 * What the search box's dropdown lists for a settled term: the first few posts
 * by title and, for a learner, the first few people by name. The two are asked
 * at the same time and each answers for itself - one failing leaves the other.
 * Nothing is asked for no term.
 */
export function useBlogSearchSuggestions(
  term: string | null,
  includePeople: boolean,
): BlogSearchSuggestions {
  const posts = useBlogSearchSuggestQuery({
    variables: { q: term ?? "", size: SUGGESTED_POSTS },
    skip: term === null,
  });
  const people = useSearchLearnersQuery({
    variables: { q: term ?? "", size: SUGGESTED_PEOPLE },
    skip: term === null || !includePeople,
    // A relationship moves as people are befriended or blocked.
    fetchPolicy: "cache-and-network",
  });

  return {
    posts: posts.data
      ? {
          status: "ready",
          items: posts.data.blogPosts.items,
          total: posts.data.blogPosts.totalItems,
        }
      : posts.error
        ? { status: "failed" }
        : { status: "loading" },
    people: !includePeople
      ? null
      : people.data
        ? {
            status: "ready",
            items: people.data.searchLearners.items,
            total: people.data.searchLearners.totalItems,
          }
        : people.error
          ? { status: "failed" }
          : { status: "loading" },
  };
}
