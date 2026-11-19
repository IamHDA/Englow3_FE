import { describe, expect, it } from "vitest";

import type { ChatMessageData } from "../types";

import {
  DELIVERY,
  applyRecall,
  contiguousHighSeq,
  entryFromMessage,
  highestSeq,
  isOwnMessage,
  lowestSeq,
  markFailed,
  mergeEntries,
  optimisticEntry,
  sortEntries,
} from "./messageList";

const data = (
  seq: number,
  overrides: Partial<ChatMessageData> = {},
): ChatMessageData => ({
  id: `m${seq}`,
  conversationId: "c1",
  seq,
  senderId: "u2",
  body: `text ${seq}`,
  imageUrl: null,
  recalled: false,
  sentAt: "2026-11-16T03:00:00Z",
  clientId: null,
  ...overrides,
});

const waiting = (clientId: string) =>
  optimisticEntry({
    clientId,
    body: "hi",
    imageUrl: null,
    sentAt: "2026-11-16T03:01:00Z",
  });

describe("isOwnMessage", () => {
  /**
   * The signed-in account's id (Supabase's) is not the user id the backend
   * writes into senderId, so it cannot say whose a message is. The backend's
   * own signal can: a message carries its clientId only to the one who sent it.
   */
  it("is the clientId and nothing else: the viewer's messages have one, the other person's and a deleted user's do not", () => {
    expect(isOwnMessage(entryFromMessage(data(1, { clientId: "k1" })))).toBe(
      true,
    );
    expect(isOwnMessage(entryFromMessage(data(2, { clientId: null })))).toBe(
      false,
    );
    expect(
      isOwnMessage(
        entryFromMessage(data(3, { senderId: null, clientId: null })),
      ),
    ).toBe(false);
  });

  it("holds for a message the viewer has just written and the backend has not answered", () => {
    expect(isOwnMessage(waiting("k1"))).toBe(true);
  });

  it("does not look at senderId, so an id from another namespace cannot make a message the other person's", () => {
    const own = entryFromMessage(
      data(4, { senderId: "an-id-the-session-does-not-know", clientId: "k4" }),
    );

    expect(isOwnMessage(own)).toBe(true);
  });
});

describe("mergeEntries", () => {
  it("puts messages in ascending seq and the unconfirmed ones last, in the order written", () => {
    const merged = mergeEntries(
      [waiting("a"), entryFromMessage(data(3))],
      [waiting("b"), entryFromMessage(data(1)), entryFromMessage(data(2))],
    );

    expect(merged.map((entry) => entry.key)).toEqual([
      "m1",
      "m2",
      "m3",
      "a",
      "b",
    ]);
  });

  it("replaces a message with the same id, and keeps the key the row already has", () => {
    const first = entryFromMessage(data(1, { imageUrl: "https://old" }));
    const merged = mergeEntries(
      [first],
      [entryFromMessage(data(1, { imageUrl: "https://new" }))],
    );

    expect(merged).toHaveLength(1);
    expect(merged[0]).toMatchObject({ key: "m1", imageUrl: "https://new" });
  });

  it("replaces an unconfirmed message with its confirmation by clientId", () => {
    const merged = mergeEntries(
      [waiting("k1")],
      [entryFromMessage(data(7, { clientId: "k1" }))],
    );

    expect(merged).toHaveLength(1);
    expect(merged[0]).toMatchObject({
      key: "k1",
      id: "m7",
      seq: 7,
      delivery: DELIVERY.sent,
    });
  });

  it("never lets an unconfirmed message replace a confirmed one with the same clientId", () => {
    const confirmed = entryFromMessage(data(7, { clientId: "k1" }));

    const merged = mergeEntries([confirmed], [waiting("k1")]);

    expect(merged).toEqual([confirmed]);
  });

  it("does not take a recall back when an older copy of the message arrives", () => {
    const recalled = entryFromMessage(data(2, { recalled: true, body: null }));

    const merged = mergeEntries([recalled], [entryFromMessage(data(2))]);

    expect(merged[0]).toMatchObject({
      recalled: true,
      body: null,
      imageUrl: null,
    });
  });
});

describe("applyRecall", () => {
  it("recalls the message with that id and leaves the others, and unknown ids, alone", () => {
    const entries = [
      entryFromMessage(data(1)),
      entryFromMessage(data(2, { imageUrl: "https://img" })),
    ];

    const recalled = applyRecall(entries, "m2");

    expect(recalled[1]).toMatchObject({
      recalled: true,
      body: null,
      imageUrl: null,
    });
    expect(recalled[0]).toBe(entries[0]);
    expect(applyRecall(entries, "nobody")).toEqual(entries);
  });
});

describe("markFailed", () => {
  it("fails only an unconfirmed message with that clientId, as failed or rejected", () => {
    const entries = [
      waiting("a"),
      waiting("b"),
      entryFromMessage(data(3, { clientId: "a" })),
    ];

    const failed = markFailed(entries, "a", { code: null, retryable: true });
    const rejected = markFailed(entries, "b", {
      code: "CHAT_NOT_FRIENDS",
      retryable: false,
    });

    expect(failed[0].delivery).toBe(DELIVERY.failed);
    expect(failed[1].delivery).toBe(DELIVERY.sending);
    expect(failed[2].delivery).toBe(DELIVERY.sent);
    expect(rejected[1]).toMatchObject({
      delivery: DELIVERY.rejected,
      failureCode: "CHAT_NOT_FRIENDS",
    });
  });
});

describe("highestSeq and lowestSeq", () => {
  it("ignore the unconfirmed messages, and say null when there is nothing numbered", () => {
    expect(highestSeq([waiting("a")])).toBeNull();
    expect(lowestSeq([])).toBeNull();
    const entries = sortEntries([
      waiting("a"),
      entryFromMessage(data(9)),
      entryFromMessage(data(4)),
    ]);
    expect(highestSeq(entries)).toBe(9);
    expect(lowestSeq(entries)).toBe(4);
  });
});

describe("contiguousHighSeq", () => {
  const held = (...seqs: number[]) =>
    seqs.map((seq) => entryFromMessage(data(seq)));

  it("is the end of the unbroken run that starts at the lowest seq", () => {
    expect(contiguousHighSeq(held(8, 9, 10))).toBe(10);
    expect(contiguousHighSeq(held(8, 9, 10, 14))).toBe(10);
    expect(contiguousHighSeq(held(1, 3, 4, 5))).toBe(1);
  });

  it("does not depend on the order the entries are in, and counts a seq held twice once", () => {
    expect(contiguousHighSeq(held(10, 8, 9, 9, 13))).toBe(10);
  });

  it("is the one seq held when only one is, and null when none is numbered", () => {
    expect(contiguousHighSeq(held(7))).toBe(7);
    expect(contiguousHighSeq([])).toBeNull();
    expect(contiguousHighSeq([waiting("a")])).toBeNull();
  });

  it("ignores messages still waiting to be numbered", () => {
    expect(contiguousHighSeq([...held(1, 2), waiting("a")])).toBe(2);
  });
});
