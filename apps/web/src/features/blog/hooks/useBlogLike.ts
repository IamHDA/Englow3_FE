"use client";

import type { ApolloCache } from "@apollo/client";
import { useCallback, useRef, useState } from "react";

import {
  useLikeBlogPostMutation,
  useUnlikeBlogPostMutation,
  type LikeBlogPostMutation,
} from "@/lib/graphql/generated/hooks";

/** What a like button needs to know of a post to turn it the other way. */
export type LikeablePost = {
  id: string;
  likedByMe: boolean;
  likeCount: number;
};

type LikeState = LikeBlogPostMutation["likeBlogPost"];

/**
 * Codegen leaves `__typename` out of an operation's type, but the optimistic
 * answer needs it to be written to the cache the way a real one is.
 */
const asAnswer = (state: LikeState): LikeState =>
  ({ __typename: "BlogLikeState", ...state }) as LikeState;

/**
 * A post's two records in the cache that show its likes: the one a card reads
 * and the one the page reads. The mutation answers with a count, not a post, so
 * Apollo cannot update either by itself.
 */
const POST_TYPENAMES = ["BlogPost", "BlogPostSummary"] as const;

function writeLikeState(
  cache: ApolloCache,
  postId: string,
  state: LikeState,
): void {
  for (const typename of POST_TYPENAMES) {
    cache.modify({
      id: cache.identify({ __typename: typename, id: postId }),
      fields: {
        likedByMe: () => state.liked,
        likeCount: () => state.likeCount,
      },
    });
  }
}

type Options = {
  /** The like or unlike was refused or never got there: the state is back as it was. */
  onError: (error: unknown) => void;
};

/**
 * Liking and unliking a post, optimistically: the heart and the count turn at
 * once, then take the state the backend answers with (a count somebody else
 * moved in the meantime), and go back to what they were if the call fails. The
 * optimistic write is an Apollo optimistic layer, so the rollback is Apollo's
 * own and cannot be missed on any path of failure.
 *
 * One call at a time: a second tap while one is in flight is ignored.
 */
export function useBlogLike({ onError }: Options) {
  const [like] = useLikeBlogPostMutation();
  const [unlike] = useUnlikeBlogPostMutation();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const inFlight = useRef(false);

  const toggle = useCallback(
    async (post: LikeablePost) => {
      if (inFlight.current) return;
      inFlight.current = true;
      setPendingId(post.id);
      const liking = !post.likedByMe;
      const guess: LikeState = {
        liked: liking,
        likeCount: Math.max(0, post.likeCount + (liking ? 1 : -1)),
      };
      try {
        if (liking) {
          await like({
            variables: { id: post.id },
            optimisticResponse: {
              likeBlogPost: asAnswer(guess),
            },
            update: (cache, { data }) => {
              if (data) writeLikeState(cache, post.id, data.likeBlogPost);
            },
          });
        } else {
          await unlike({
            variables: { id: post.id },
            optimisticResponse: {
              unlikeBlogPost: asAnswer(guess),
            },
            update: (cache, { data }) => {
              if (data) writeLikeState(cache, post.id, data.unlikeBlogPost);
            },
          });
        }
      } catch (error) {
        onError(error);
      } finally {
        inFlight.current = false;
        setPendingId(null);
      }
    },
    [like, unlike, onError],
  );

  return { toggle, pendingId };
}
