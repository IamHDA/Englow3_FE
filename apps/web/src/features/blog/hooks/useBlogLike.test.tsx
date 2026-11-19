import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  gql,
  type ApolloCache,
} from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { Observable } from "rxjs";
import { describe, expect, it, vi } from "vitest";

import { useBlogLike } from "./useBlogLike";

const LIKES = gql`
  fragment Likes on BlogPost {
    likedByMe
    likeCount
  }
`;
const CARD_LIKES = gql`
  fragment CardLikes on BlogPostSummary {
    likedByMe
    likeCount
  }
`;

type Answer =
  { state: { liked: boolean; likeCount: number } } | { error: Error };

/** A backend that answers each call when the test says so, and remembers what it was asked. */
function backend() {
  const asked: string[] = [];
  const waiting: Array<(answer: Answer) => void> = [];
  const link = new ApolloLink(
    (operation) =>
      new Observable((subscriber) => {
        asked.push(operation.operationName ?? "");
        waiting.push((answer) => {
          if ("error" in answer) {
            subscriber.error(answer.error);
            return;
          }
          const field =
            operation.operationName === "LikeBlogPost"
              ? "likeBlogPost"
              : "unlikeBlogPost";
          subscriber.next({
            data: {
              [field]: { __typename: "BlogLikeState", ...answer.state },
            },
          });
          subscriber.complete();
        });
      }),
  );
  return { link, asked, answer: (a: Answer) => waiting.shift()?.(a) };
}

function setup(start = { likedByMe: false, likeCount: 5 }) {
  const server = backend();
  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: server.link,
  });
  for (const [typename, fragment] of [
    ["BlogPost", LIKES],
    ["BlogPostSummary", CARD_LIKES],
  ] as const) {
    client.cache.writeFragment({
      id: client.cache.identify({ __typename: typename, id: "p1" }),
      fragment,
      data: { __typename: typename, ...start },
    });
  }
  const onError = vi.fn();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <ApolloProvider client={client}>{children}</ApolloProvider>
  );
  const hook = renderHook(() => useBlogLike({ onError }), { wrapper });
  const read = (typename: "BlogPost" | "BlogPostSummary") =>
    client.cache.readFragment({
      id: client.cache.identify({ __typename: typename, id: "p1" }),
      fragment: typename === "BlogPost" ? LIKES : CARD_LIKES,
      // What the screen sees: the optimistic layer on top of what is stored.
      optimistic: true,
    });
  return { ...hook, server, onError, read, cache: client.cache as ApolloCache };
}

describe("useBlogLike", () => {
  it("turns the heart and the count at once on both records of the post, then takes the state the backend answers with", async () => {
    const { result, server, read } = setup();

    let done: Promise<void> = Promise.resolve();
    act(() => {
      done = result.current.toggle({
        id: "p1",
        likedByMe: false,
        likeCount: 5,
      });
    });

    await waitFor(() =>
      expect(read("BlogPost")).toMatchObject({ likedByMe: true, likeCount: 6 }),
    );
    expect(read("BlogPostSummary")).toMatchObject({
      likedByMe: true,
      likeCount: 6,
    });
    expect(server.asked).toEqual(["LikeBlogPost"]);

    // Somebody else liked it meanwhile: the answer is the count that stands.
    await act(async () => {
      server.answer({ state: { liked: true, likeCount: 7 } });
      await done;
    });

    expect(read("BlogPost")).toMatchObject({ likedByMe: true, likeCount: 7 });
    expect(read("BlogPostSummary")).toMatchObject({
      likedByMe: true,
      likeCount: 7,
    });
  });

  it("puts everything back as it was, and says so, when the call fails", async () => {
    const { result, server, read, onError } = setup();

    let done: Promise<void> = Promise.resolve();
    act(() => {
      done = result.current.toggle({
        id: "p1",
        likedByMe: false,
        likeCount: 5,
      });
    });
    await waitFor(() =>
      expect(read("BlogPost")).toMatchObject({ likeCount: 6 }),
    );

    const failure = new Error("Failed to fetch");
    await act(async () => {
      server.answer({ error: failure });
      await done;
    });

    expect(read("BlogPost")).toMatchObject({ likedByMe: false, likeCount: 5 });
    expect(read("BlogPostSummary")).toMatchObject({
      likedByMe: false,
      likeCount: 5,
    });
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it("unlikes with the other call, and never takes the count below zero", async () => {
    const { result, server, read } = setup({ likedByMe: true, likeCount: 0 });

    let done: Promise<void> = Promise.resolve();
    act(() => {
      done = result.current.toggle({ id: "p1", likedByMe: true, likeCount: 0 });
    });
    await waitFor(() =>
      expect(read("BlogPost")).toMatchObject({
        likedByMe: false,
        likeCount: 0,
      }),
    );
    expect(server.asked).toEqual(["UnlikeBlogPost"]);

    await act(async () => {
      server.answer({ state: { liked: false, likeCount: 0 } });
      await done;
    });
    expect(read("BlogPost")).toMatchObject({ likedByMe: false, likeCount: 0 });
  });

  it("ignores a second tap while one is on its way, and says which post is pending", async () => {
    const { result, server } = setup();

    let done: Promise<void> = Promise.resolve();
    act(() => {
      done = result.current.toggle({
        id: "p1",
        likedByMe: false,
        likeCount: 5,
      });
    });
    await waitFor(() => expect(result.current.pendingId).toBe("p1"));

    await act(async () => {
      await result.current.toggle({ id: "p1", likedByMe: true, likeCount: 6 });
    });
    expect(server.asked).toEqual(["LikeBlogPost"]);

    await act(async () => {
      server.answer({ state: { liked: true, likeCount: 6 } });
      await done;
    });
    expect(result.current.pendingId).toBeNull();
  });
});
