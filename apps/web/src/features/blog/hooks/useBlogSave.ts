"use client";

import type { ApolloCache } from "@apollo/client";
import { useCallback, useRef, useState } from "react";

import {
  useSaveBlogPostMutation,
  useUnsaveBlogPostMutation,
  type SaveBlogPostMutation,
} from "@/lib/graphql/generated/hooks";

/** What a bookmark needs to know of a post to turn it the other way. */
export type SavablePost = {
  id: string;
  savedByMe: boolean;
};

type SaveState = SaveBlogPostMutation["saveBlogPost"];

/**
 * Codegen leaves `__typename` out of an operation's type, but the optimistic
 * answer needs it to be written to the cache the way a real one is.
 */
const asAnswer = (state: SaveState): SaveState =>
  ({ __typename: "BlogSaveState", ...state }) as SaveState;

/**
 * The post's record in the cache that every list reads - the feed, the saved
 * list, the recommendations are all this one summary. The mutation answers
 * with a state, not a post, so Apollo cannot update it by itself.
 */
function writeSavedState(
  cache: ApolloCache,
  postId: string,
  saved: boolean,
): void {
  cache.modify({
    id: cache.identify({ __typename: "BlogPostSummary", id: postId }),
    fields: { savedByMe: () => saved },
  });
}

type Options = {
  /** The save or unsave was refused or never got there: the bookmark is back as it was. */
  onError: (error: unknown) => void;
  /**
   * Names of the queries on the screen that a save changes the answer of - the
   * count on the "Đã lưu" button, the saved list, the recommendations, which
   * leave out what is saved. They are asked again once the call went through.
   */
  refetch: string[];
};

/**
 * Saving and unsaving a post, optimistically: the bookmark turns at once, takes
 * the state the backend answers with, and goes back to what it was if the call
 * fails. The optimistic write is an Apollo optimistic layer, so the rollback is
 * Apollo's own and cannot be missed on any path of failure.
 *
 * One call at a time: a second tap while one is in flight is ignored.
 */
export function useBlogSave({ onError, refetch }: Options) {
  const [save] = useSaveBlogPostMutation();
  const [unsave] = useUnsaveBlogPostMutation();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const inFlight = useRef(false);

  const toggle = useCallback(
    async (post: SavablePost) => {
      if (inFlight.current) return;
      inFlight.current = true;
      setPendingId(post.id);
      const saving = !post.savedByMe;
      const guess: SaveState = { postId: post.id, saved: saving };
      try {
        if (saving) {
          await save({
            variables: { id: post.id },
            optimisticResponse: { saveBlogPost: asAnswer(guess) },
            update: (cache, { data }) => {
              if (data) {
                writeSavedState(cache, post.id, data.saveBlogPost.saved);
              }
            },
            refetchQueries: refetch,
          });
        } else {
          await unsave({
            variables: { id: post.id },
            optimisticResponse: { unsaveBlogPost: asAnswer(guess) },
            update: (cache, { data }) => {
              if (data) {
                writeSavedState(cache, post.id, data.unsaveBlogPost.saved);
              }
            },
            refetchQueries: refetch,
          });
        }
      } catch (error) {
        onError(error);
      } finally {
        inFlight.current = false;
        setPendingId(null);
      }
    },
    [save, unsave, onError, refetch],
  );

  return { toggle, pendingId };
}
