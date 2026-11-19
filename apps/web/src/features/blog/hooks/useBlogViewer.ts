"use client";

import { useAccountProfile } from "@/features/account";

/**
 * Who is looking, as far as the blog needs to know it: the id the backend knows
 * the viewer by (`me.id`), which is what an author's `userId` is compared with.
 * The profile it comes from loads on its own schedule, so there are three
 * states, and a screen must treat the two that are not `known` differently
 * from "somebody else":
 *
 * - `loading`: the profile is on its way;
 * - `failed`: it did not come (the server did not answer) and `retry` asks again;
 * - `known`: the id.
 */
export type BlogViewer =
  | { status: "loading" }
  | { status: "failed"; retry: () => void }
  | { status: "known"; id: string };

/**
 * Whether a piece of content is the viewer's own, as a control has to ask it.
 * `loading` and `unavailable` mean "not known": showing the controls for
 * somebody else's content on a moderator's own post or comment, even for the
 * moment a profile takes to load, is the mistake this exists to prevent.
 */
export type Ownership = "own" | "other" | "loading" | "unavailable";

/** The id of the author of a thing, or null for an erased account (nobody's own). */
export function ownershipOf(
  viewer: BlogViewer,
  authorId: string | null | undefined,
): Ownership {
  switch (viewer.status) {
    case "known":
      return authorId !== null &&
        authorId !== undefined &&
        authorId === viewer.id
        ? "own"
        : "other";
    case "loading":
      return "loading";
    case "failed":
      return "unavailable";
    default: {
      const unreachable: never = viewer;
      return unreachable;
    }
  }
}

/** The viewer, from the account's profile. */
export function useBlogViewer(): BlogViewer {
  const { profile, hasError, loading, refresh } = useAccountProfile();
  if (profile) return { status: "known", id: profile.id };
  // No profile, not loading, no error: nobody is signed in, and there is
  // nothing to wait for - these pages are member-only, so this is a failure too.
  if (hasError || !loading) {
    return { status: "failed", retry: () => void refresh() };
  }
  return { status: "loading" };
}
