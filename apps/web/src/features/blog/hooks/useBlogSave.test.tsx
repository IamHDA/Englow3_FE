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

import { useBlogSave } from "./useBlogSave";

const SAVED = gql`
  fragment Saved on BlogPostSummary {
    savedByMe
  }
`;
const SAVED_COUNT = gql`
  query BlogSavedCount {
    savedBlogPosts(size: 1) {
      totalItems
    }
  }
`;

type Answer = { saved: boolean } | { error: Error };

/** A backend that answers each save when the test says so, answers the count at once, and remembers what it was asked. */
function backend() {
  const asked: string[] = [];
  const waiting: Array<(answer: Answer) => void> = [];
  const link = new ApolloLink(
    (operation) =>
      new Observable((subscriber) => {
        const name = operation.operationName ?? "";
        asked.push(name);
        if (name === "BlogSavedCount") {
          subscriber.next({
            data: {
              savedBlogPosts: { __typename: "BlogPostPage", totalItems: 3 },
            },
          });
          subscriber.complete();
          return;
        }
        waiting.push((answer) => {
          if ("error" in answer) {
            subscriber.error(answer.error);
            return;
          }
          const field =
            name === "SaveBlogPost" ? "saveBlogPost" : "unsaveBlogPost";
          subscriber.next({
            data: {
              [field]: {
                __typename: "BlogSaveState",
                postId: "p1",
                saved: answer.saved,
              },
            },
          });
          subscriber.complete();
        });
      }),
  );
  return { link, asked, answer: (a: Answer) => waiting.shift()?.(a) };
}

function setup(savedByMe = false) {
  const server = backend();
  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: server.link,
  });
  client.cache.writeFragment({
    id: client.cache.identify({ __typename: "BlogPostSummary", id: "p1" }),
    fragment: SAVED,
    data: { __typename: "BlogPostSummary", savedByMe },
  });
  // The count on the screen is an active query, which the save asks again.
  const subscription = client
    .watchQuery({ query: SAVED_COUNT, fetchPolicy: "network-only" })
    .subscribe({ next: () => undefined, error: () => undefined });
  const onError = vi.fn();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <ApolloProvider client={client}>{children}</ApolloProvider>
  );
  const hook = renderHook(
    () => useBlogSave({ onError, refetch: ["BlogSavedCount"] }),
    { wrapper },
  );
  const read = () =>
    client.cache.readFragment({
      id: client.cache.identify({ __typename: "BlogPostSummary", id: "p1" }),
      fragment: SAVED,
      // What the screen sees: the optimistic layer on top of what is stored.
      optimistic: true,
    });
  return {
    ...hook,
    server,
    onError,
    read,
    subscription,
    cache: client.cache as ApolloCache,
  };
}

const countAsked = (asked: string[]) =>
  asked.filter((name) => name === "BlogSavedCount").length;

describe("useBlogSave", () => {
  it("turns the bookmark at once, keeps what the backend answers with, and asks the count again", async () => {
    const { result, server, read } = setup();
    await waitFor(() => expect(countAsked(server.asked)).toBe(1));

    let done: Promise<void> = Promise.resolve();
    act(() => {
      done = result.current.toggle({ id: "p1", savedByMe: false });
    });

    await waitFor(() => expect(read()).toMatchObject({ savedByMe: true }));
    expect(server.asked).toContain("SaveBlogPost");

    await act(async () => {
      server.answer({ saved: true });
      await done;
    });

    expect(read()).toMatchObject({ savedByMe: true });
    await waitFor(() => expect(countAsked(server.asked)).toBe(2));
  });

  it("puts the bookmark back as it was, says so, and leaves the count alone when the call fails", async () => {
    const { result, server, read, onError } = setup();
    await waitFor(() => expect(countAsked(server.asked)).toBe(1));

    let done: Promise<void> = Promise.resolve();
    act(() => {
      done = result.current.toggle({ id: "p1", savedByMe: false });
    });
    await waitFor(() => expect(read()).toMatchObject({ savedByMe: true }));

    await act(async () => {
      server.answer({ error: new Error("Failed to fetch") });
      await done;
    });

    expect(read()).toMatchObject({ savedByMe: false });
    expect(onError).toHaveBeenCalledTimes(1);
    expect(countAsked(server.asked)).toBe(1);
  });

  it("unsaves with the other call", async () => {
    const { result, server, read } = setup(true);

    let done: Promise<void> = Promise.resolve();
    act(() => {
      done = result.current.toggle({ id: "p1", savedByMe: true });
    });
    await waitFor(() => expect(read()).toMatchObject({ savedByMe: false }));
    expect(server.asked).toContain("UnsaveBlogPost");
    expect(server.asked).not.toContain("SaveBlogPost");

    await act(async () => {
      server.answer({ saved: false });
      await done;
    });
    expect(read()).toMatchObject({ savedByMe: false });
  });

  it("ignores a second tap while one is on its way, and says which post is pending", async () => {
    const { result, server } = setup();

    let done: Promise<void> = Promise.resolve();
    act(() => {
      done = result.current.toggle({ id: "p1", savedByMe: false });
    });
    await waitFor(() => expect(result.current.pendingId).toBe("p1"));

    await act(async () => {
      await result.current.toggle({ id: "p1", savedByMe: true });
    });
    expect(
      server.asked.filter((name) => name.endsWith("SaveBlogPost")),
    ).toEqual(["SaveBlogPost"]);

    await act(async () => {
      server.answer({ saved: true });
      await done;
    });
    expect(result.current.pendingId).toBeNull();
  });
});
