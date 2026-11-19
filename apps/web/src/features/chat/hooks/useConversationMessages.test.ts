import { CombinedGraphQLErrors } from "@apollo/client";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CATCH_UP_PAGE_SIZE, MESSAGE_PAGE_SIZE } from "../constants/chat";
import { FRAME_TYPE, type ChatFrame } from "../realtime/frames";
import { DELIVERY } from "../realtime/messageList";
import type { ChatMessageData } from "../types";

import {
  useConversationMessages,
  type ChatMessagesApi,
} from "./useConversationMessages";

const ME = "me";
const PARTNER = "partner";
const CONVERSATION = "c1";

function message(
  seq: number,
  overrides: Partial<ChatMessageData> = {},
): ChatMessageData {
  return {
    id: `m${seq}`,
    conversationId: CONVERSATION,
    seq,
    senderId: PARTNER,
    body: `text ${seq}`,
    imageUrl: null,
    recalled: false,
    sentAt: "2026-11-16T03:00:00Z",
    clientId: null,
    ...overrides,
  };
}

function refusal(backendCode: string) {
  return new CombinedGraphQLErrors({
    errors: [
      { message: "refused", extensions: { code: "FORBIDDEN", backendCode } },
    ],
  });
}

/** A stand-in for the socket: the hook subscribes, the test emits. */
function frameBus() {
  const listeners = new Set<(frame: ChatFrame) => void>();
  return {
    subscribe: (listener: (frame: ChatFrame) => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    emit: (frame: ChatFrame) => {
      act(() => listeners.forEach((listener) => listener(frame)));
    },
    count: () => listeners.size,
  };
}

const messageFrame = (data: ChatMessageData): ChatFrame => ({
  type: FRAME_TYPE.message,
  message: data,
});

function setup(
  initial: { seed?: ChatMessageData[]; connectionCount?: number } = {},
) {
  const bus = frameBus();
  const api = {
    fetchMessages: vi.fn<ChatMessagesApi["fetchMessages"]>(() =>
      Promise.resolve([]),
    ),
    sendMessage: vi.fn<ChatMessagesApi["sendMessage"]>((variables) =>
      Promise.resolve(
        message(100, {
          id: "sent-1",
          senderId: ME,
          body: variables.body,
          clientId: variables.clientId,
        }),
      ),
    ),
    recallMessage: vi.fn<ChatMessagesApi["recallMessage"]>((id) =>
      Promise.resolve(message(1, { id, recalled: true, body: null })),
    ),
    uploadImage: vi.fn<ChatMessagesApi["uploadImage"]>(() =>
      Promise.resolve("upload-1"),
    ),
  };
  const onSendRefused = vi.fn();
  const revokePreviewUrl = vi.fn();
  let nextClientId = 0;
  const hook = renderHook(
    (props: { seed: ChatMessageData[] | undefined; connectionCount: number }) =>
      useConversationMessages({
        conversationId: CONVERSATION,
        partnerId: PARTNER,
        seed: props.seed,
        subscribe: bus.subscribe,
        connectionCount: props.connectionCount,
        api,
        onSendRefused,
        newClientId: () => `client-${++nextClientId}`,
        createPreviewUrl: (file) => `blob:${file.name}`,
        // A new function every render, as an inline one in a component is: the
        // hook must not take that for the conversation having been left.
        revokePreviewUrl: (url) => revokePreviewUrl(url),
      }),
    {
      initialProps: {
        seed: initial.seed,
        connectionCount: initial.connectionCount ?? 0,
      },
    },
  );
  return { ...hook, bus, api, onSendRefused, revokePreviewUrl };
}

const seqs = (entries: { seq: number | null }[]) =>
  entries.map((entry) => entry.seq);

beforeEach(() => vi.clearAllMocks());

describe("the seed and the frames", () => {
  it("shows the seed in ascending seq", () => {
    const { result } = setup({ seed: [message(3), message(1), message(2)] });

    expect(seqs(result.current.entries)).toEqual([1, 2, 3]);
  });

  it("adds a message pushed for this conversation, once, and ignores another conversation's", () => {
    const { result, bus } = setup({ seed: [message(1)] });

    bus.emit(messageFrame(message(2)));
    bus.emit(messageFrame(message(2)));
    bus.emit(messageFrame(message(9, { id: "other", conversationId: "c2" })));

    expect(seqs(result.current.entries)).toEqual([1, 2]);
  });

  it("stops listening when it is unmounted", () => {
    const { bus, unmount } = setup({ seed: [] });
    expect(bus.count()).toBe(1);

    unmount();

    expect(bus.count()).toBe(0);
  });

  /**
   * The frame comes while the history is still loading - a conversation was open
   * for a moment before its page came back. It must not be lost, and the
   * message the seed also holds must not be shown twice.
   */
  it("keeps a frame that arrives before the seed, and shows it once when the seed holds it too", () => {
    const { result, rerender, bus } = setup({ seed: undefined });

    bus.emit(messageFrame(message(5)));
    bus.emit(messageFrame(message(6)));
    expect(seqs(result.current.entries)).toEqual([5, 6]);

    rerender({
      seed: [message(4), message(5)],
      connectionCount: 0,
    });

    expect(seqs(result.current.entries)).toEqual([4, 5, 6]);
    expect(
      result.current.entries.filter((entry) => entry.id === "m5"),
    ).toHaveLength(1);
  });

  it("applies a recall that came before the seed to the message the seed brings", () => {
    const { result, rerender, bus } = setup({ seed: undefined });

    bus.emit({
      type: FRAME_TYPE.recalled,
      conversationId: CONVERSATION,
      messageId: "m2",
      seq: 2,
    });
    rerender({ seed: [message(1), message(2)], connectionCount: 0 });

    expect(result.current.entries[1]).toMatchObject({
      id: "m2",
      recalled: true,
      body: null,
    });
  });
});

describe("sending", () => {
  it("shows the message at once, last, then replaces it with the real one under the same key", async () => {
    const { result, api } = setup({ seed: [message(1)] });

    act(() => result.current.send({ body: "  hello  ", image: null }));

    const [first, optimistic] = result.current.entries;
    expect(first.seq).toBe(1);
    expect(optimistic).toMatchObject({
      key: "client-1",
      id: null,
      body: "hello",
      // Written by the viewer, and known to be: it carries its clientId.
      clientId: "client-1",
      delivery: DELIVERY.sending,
    });

    await waitFor(() =>
      expect(result.current.entries[1].delivery).toBe(DELIVERY.sent),
    );
    expect(result.current.entries).toHaveLength(2);
    expect(result.current.entries[1]).toMatchObject({
      key: "client-1",
      id: "sent-1",
      seq: 100,
    });
    expect(api.sendMessage).toHaveBeenCalledExactlyOnceWith({
      conversationId: CONVERSATION,
      clientId: "client-1",
      body: "hello",
      imageUploadId: null,
    });
  });

  it("sends nothing for a message with no text and no image", () => {
    const { result, api } = setup({ seed: [] });

    act(() => result.current.send({ body: "   ", image: null }));

    expect(result.current.entries).toEqual([]);
    expect(api.sendMessage).not.toHaveBeenCalled();
  });

  /** The frame is faster than the answer to the send. */
  it("replaces the optimistic copy by clientId when the frame comes first, and the answer then adds nothing", async () => {
    let answer: (data: ChatMessageData) => void = () => undefined;
    const { result, bus, api } = setup({ seed: [] });
    api.sendMessage.mockReturnValue(
      new Promise((resolve) => {
        answer = resolve;
      }),
    );

    act(() => result.current.send({ body: "hi", image: null }));
    const confirmed = message(7, {
      id: "real",
      senderId: ME,
      body: "hi",
      clientId: "client-1",
    });
    bus.emit(messageFrame(confirmed));

    expect(result.current.entries).toHaveLength(1);
    expect(result.current.entries[0]).toMatchObject({
      key: "client-1",
      id: "real",
      delivery: DELIVERY.sent,
    });

    await act(async () => answer(confirmed));
    expect(result.current.entries).toHaveLength(1);
  });

  it("keeps one entry when the answer comes first and the frame second", async () => {
    const { result, bus } = setup({ seed: [] });

    act(() => result.current.send({ body: "hi", image: null }));
    await waitFor(() =>
      expect(result.current.entries[0].delivery).toBe(DELIVERY.sent),
    );
    bus.emit(
      messageFrame(
        message(100, {
          id: "sent-1",
          senderId: ME,
          body: "hi",
          clientId: "client-1",
        }),
      ),
    );

    expect(result.current.entries).toHaveLength(1);
  });

  it("sends one message after another, so the backend numbers them in the order they were written", async () => {
    const order: string[] = [];
    const releases: (() => void)[] = [];
    const { result, api } = setup({ seed: [] });
    api.sendMessage.mockImplementation(
      (variables) =>
        new Promise((resolve) => {
          order.push(`start ${variables.body}`);
          releases.push(() => {
            order.push(`end ${variables.body}`);
            resolve(
              message(1, {
                id: variables.clientId,
                senderId: ME,
                clientId: variables.clientId,
                body: variables.body,
              }),
            );
          });
        }),
    );

    act(() => {
      result.current.send({ body: "one", image: null });
      result.current.send({ body: "two", image: null });
    });
    await waitFor(() => expect(order).toEqual(["start one"]));

    await act(async () => releases[0]());
    await waitFor(() => expect(order).toContain("start two"));
    await act(async () => releases[1]());

    expect(order).toEqual(["start one", "end one", "start two", "end two"]);
  });
});

describe("a send that fails", () => {
  it("keeps the message as failed, and sends it again under the same clientId", async () => {
    const { result, api } = setup({ seed: [] });
    api.sendMessage.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    act(() => result.current.send({ body: "hi", image: null }));
    await waitFor(() =>
      expect(result.current.entries[0].delivery).toBe(DELIVERY.failed),
    );
    expect(result.current.entries[0]).toMatchObject({
      body: "hi",
      failureCode: null,
    });

    act(() => result.current.retry("client-1"));
    expect(result.current.entries[0].delivery).toBe(DELIVERY.sending);
    await waitFor(() =>
      expect(result.current.entries[0].delivery).toBe(DELIVERY.sent),
    );

    expect(api.sendMessage).toHaveBeenCalledTimes(2);
    expect(api.sendMessage.mock.calls.map(([v]) => v.clientId)).toEqual([
      "client-1",
      "client-1",
    ]);
    expect(result.current.entries).toHaveLength(1);
  });

  it("offers no second try for a refusal that would only repeat, and tells the screen when the two can no longer talk", async () => {
    const { result, api, onSendRefused } = setup({ seed: [] });
    api.sendMessage.mockRejectedValue(refusal("CHAT_NOT_FRIENDS"));

    act(() => result.current.send({ body: "hi", image: null }));
    await waitFor(() =>
      expect(result.current.entries[0].delivery).toBe(DELIVERY.rejected),
    );

    expect(result.current.entries[0].failureCode).toBe("CHAT_NOT_FRIENDS");
    expect(onSendRefused).toHaveBeenCalledExactlyOnceWith("CHAT_NOT_FRIENDS");

    act(() => result.current.retry("client-1"));
    expect(api.sendMessage).toHaveBeenCalledTimes(1);
  });

  it("does not lock the screen for a refusal that is only about this message", async () => {
    const { result, api, onSendRefused } = setup({ seed: [] });
    api.sendMessage.mockRejectedValue(refusal("CHAT_MESSAGE_TOO_LONG"));

    act(() => result.current.send({ body: "hi", image: null }));
    await waitFor(() =>
      expect(result.current.entries[0].delivery).toBe(DELIVERY.rejected),
    );

    expect(onSendRefused).not.toHaveBeenCalled();
  });

  it("lets a busy server be tried again: a rate limit is not final", async () => {
    const { result, api } = setup({ seed: [] });
    api.sendMessage.mockRejectedValueOnce(refusal("RATE_LIMITED"));

    act(() => result.current.send({ body: "hi", image: null }));

    await waitFor(() =>
      expect(result.current.entries[0].delivery).toBe(DELIVERY.failed),
    );
  });

  it("drops a dismissed message, which stays sent no more", async () => {
    const { result, api } = setup({ seed: [] });
    api.sendMessage.mockRejectedValue(refusal("CHAT_NOT_FRIENDS"));
    act(() => result.current.send({ body: "hi", image: null }));
    await waitFor(() =>
      expect(result.current.entries[0].delivery).toBe(DELIVERY.rejected),
    );

    act(() => result.current.dismiss("client-1"));

    expect(result.current.entries).toEqual([]);
  });

  it("does not turn a message the backend confirmed into a failure when the answer is what failed", async () => {
    let fail: (reason: unknown) => void = () => undefined;
    const { result, bus, api } = setup({ seed: [] });
    api.sendMessage.mockReturnValue(
      new Promise((_resolve, reject) => {
        fail = reject;
      }),
    );
    act(() => result.current.send({ body: "hi", image: null }));
    bus.emit(
      messageFrame(
        message(7, {
          id: "real",
          senderId: ME,
          body: "hi",
          clientId: "client-1",
        }),
      ),
    );

    await act(async () => fail(new TypeError("Failed to fetch")));

    expect(result.current.entries[0]).toMatchObject({
      id: "real",
      delivery: DELIVERY.sent,
    });
  });
});

describe("sending an image", () => {
  const photo = new File(["x"], "photo.png", { type: "image/png" });

  it("uploads the image, then sends the message naming the upload", async () => {
    const { result, api } = setup({ seed: [] });

    act(() => result.current.send({ body: "look", image: photo }));
    expect(result.current.entries[0].imageUrl).toBe("blob:photo.png");

    await waitFor(() =>
      expect(result.current.entries[0].delivery).toBe(DELIVERY.sent),
    );
    expect(api.uploadImage).toHaveBeenCalledExactlyOnceWith(
      CONVERSATION,
      photo,
    );
    expect(api.sendMessage).toHaveBeenCalledExactlyOnceWith({
      conversationId: CONVERSATION,
      clientId: "client-1",
      body: "look",
      imageUploadId: "upload-1",
    });
  });

  it("keeps the picture's preview for as long as the message is on its way, however often the screen draws again, and gives it back once confirmed", async () => {
    let finishUpload: (id: string) => void = () => undefined;
    const { result, api, rerender, revokePreviewUrl } = setup({ seed: [] });
    api.uploadImage.mockReturnValue(
      new Promise((resolve) => {
        finishUpload = resolve;
      }),
    );

    act(() => result.current.send({ body: "", image: photo }));
    for (let draw = 0; draw < 3; draw += 1) {
      rerender({ seed: [], connectionCount: 0 });
    }
    expect(revokePreviewUrl).not.toHaveBeenCalled();
    expect(result.current.entries[0].imageUrl).toBe("blob:photo.png");

    await act(async () => finishUpload("upload-1"));
    await waitFor(() =>
      expect(result.current.entries[0].delivery).toBe(DELIVERY.sent),
    );
    expect(revokePreviewUrl).toHaveBeenCalledExactlyOnceWith("blob:photo.png");
  });

  it("gives back a preview that is still held when the conversation is left", () => {
    const { result, api, unmount, revokePreviewUrl } = setup({ seed: [] });
    api.uploadImage.mockReturnValue(new Promise(() => undefined));
    act(() => result.current.send({ body: "", image: photo }));

    unmount();

    expect(revokePreviewUrl).toHaveBeenCalledExactlyOnceWith("blob:photo.png");
  });

  it("sends no message when the upload fails, and uploads again on the next try", async () => {
    const { result, api } = setup({ seed: [] });
    api.uploadImage.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    act(() => result.current.send({ body: "", image: photo }));
    await waitFor(() =>
      expect(result.current.entries[0].delivery).toBe(DELIVERY.failed),
    );
    expect(api.sendMessage).not.toHaveBeenCalled();

    act(() => result.current.retry("client-1"));
    await waitFor(() =>
      expect(result.current.entries[0].delivery).toBe(DELIVERY.sent),
    );
    expect(api.uploadImage).toHaveBeenCalledTimes(2);
    expect(api.sendMessage).toHaveBeenCalledTimes(1);
  });

  it("reuses the finished upload when only the message was refused", async () => {
    const { result, api } = setup({ seed: [] });
    api.sendMessage.mockRejectedValueOnce(refusal("CHAT_IMAGE_NOT_UPLOADED"));

    act(() => result.current.send({ body: "", image: photo }));
    await waitFor(() =>
      expect(result.current.entries[0].delivery).toBe(DELIVERY.failed),
    );
    act(() => result.current.retry("client-1"));
    await waitFor(() =>
      expect(result.current.entries[0].delivery).toBe(DELIVERY.sent),
    );

    expect(api.uploadImage).toHaveBeenCalledTimes(1);
    expect(api.sendMessage.mock.calls.map(([v]) => v.imageUploadId)).toEqual([
      "upload-1",
      "upload-1",
    ]);
  });
});

describe("recalling", () => {
  it("clears the text and image of a message a recalled frame names", () => {
    const { result, bus } = setup({
      seed: [message(1), message(2, { imageUrl: "https://img/2" })],
    });

    bus.emit({
      type: FRAME_TYPE.recalled,
      conversationId: CONVERSATION,
      messageId: "m2",
      seq: 2,
    });

    expect(result.current.entries[1]).toMatchObject({
      recalled: true,
      body: null,
      imageUrl: null,
    });
    expect(result.current.entries[0].recalled).toBe(false);
  });

  it("is not undone by an older copy of the message that arrives afterwards", () => {
    const { result, bus } = setup({ seed: [message(1), message(2)] });
    bus.emit({
      type: FRAME_TYPE.recalled,
      conversationId: CONVERSATION,
      messageId: "m2",
      seq: 2,
    });

    bus.emit(messageFrame(message(2)));

    expect(result.current.entries[1]).toMatchObject({
      recalled: true,
      body: null,
    });
  });

  it("recalls through the backend and marks the message", async () => {
    const { result, api } = setup({ seed: [message(1, { senderId: ME })] });

    await act(async () => result.current.recall("m1"));

    expect(api.recallMessage).toHaveBeenCalledExactlyOnceWith("m1");
    expect(result.current.entries[0].recalled).toBe(true);
  });

  it("counts a message that was already recalled as recalled", async () => {
    const { result, api } = setup({ seed: [message(1, { senderId: ME })] });
    api.recallMessage.mockRejectedValue(
      refusal("CHAT_MESSAGE_ALREADY_RECALLED"),
    );

    await act(async () => result.current.recall("m1"));

    expect(result.current.entries[0].recalled).toBe(true);
  });

  it("passes any other refusal on, and leaves the message as it was", async () => {
    const { result, api } = setup({ seed: [message(1, { senderId: ME })] });
    api.recallMessage.mockRejectedValue(refusal("CHAT_MESSAGE_NOT_SENDER"));

    await expect(
      act(async () => result.current.recall("m1")),
    ).rejects.toBeDefined();

    expect(result.current.entries[0].recalled).toBe(false);
  });
});

describe("catching up after the socket opens", () => {
  it("asks for what came after the highest seq it holds", async () => {
    const { rerender, api, result } = setup({
      seed: [message(8), message(10), message(9)],
    });
    api.fetchMessages.mockResolvedValue([message(11), message(12)]);

    rerender({
      seed: [message(8), message(10), message(9)],
      connectionCount: 1,
    });

    await waitFor(() => expect(result.current.entries).toHaveLength(5));
    expect(api.fetchMessages).toHaveBeenCalledExactlyOnceWith({
      conversationId: CONVERSATION,
      afterSeq: 10,
      limit: CATCH_UP_PAGE_SIZE,
    });
    expect(seqs(result.current.entries)).toEqual([8, 9, 10, 11, 12]);
  });

  it("shows a message once when it comes by frame and again by the catch-up", async () => {
    const { rerender, api, result, bus } = setup({ seed: [message(1)] });
    bus.emit(messageFrame(message(2)));
    api.fetchMessages.mockResolvedValue([message(2), message(3)]);

    rerender({ seed: [message(1)], connectionCount: 1 });

    await waitFor(() => expect(result.current.entries).toHaveLength(3));
    expect(seqs(result.current.entries)).toEqual([1, 2, 3]);
  });

  it("asks again after every reconnect, and not twice for the same one", async () => {
    const { rerender, api } = setup({ seed: [message(1)] });

    rerender({ seed: [message(1)], connectionCount: 1 });
    await waitFor(() => expect(api.fetchMessages).toHaveBeenCalledTimes(1));
    rerender({ seed: [message(1)], connectionCount: 1 });
    rerender({ seed: [message(1)], connectionCount: 2 });
    await waitFor(() => expect(api.fetchMessages).toHaveBeenCalledTimes(2));
  });

  it("waits for the seed, then catches up once it is there", async () => {
    const { rerender, api } = setup({ seed: undefined });

    rerender({ seed: undefined, connectionCount: 1 });
    expect(api.fetchMessages).not.toHaveBeenCalled();

    rerender({ seed: [message(4)], connectionCount: 1 });
    await waitFor(() => expect(api.fetchMessages).toHaveBeenCalledTimes(1));
    expect(api.fetchMessages.mock.calls[0][0]).toMatchObject({ afterSeq: 4 });
  });

  it("does not catch up before the socket has ever opened", () => {
    const { api } = setup({ seed: [message(1)], connectionCount: 0 });

    expect(api.fetchMessages).not.toHaveBeenCalled();
  });

  it("asks for the newest page when the conversation is empty, with no seq to count from", async () => {
    const { rerender, api } = setup({ seed: [] });

    rerender({ seed: [], connectionCount: 1 });

    await waitFor(() => expect(api.fetchMessages).toHaveBeenCalledTimes(1));
    expect(api.fetchMessages.mock.calls[0][0].afterSeq).toBeNull();
  });

  it("keeps going while pages come back full, and stops at a short one", async () => {
    const full = Array.from({ length: CATCH_UP_PAGE_SIZE }, (_, i) =>
      message(11 + i),
    );
    const { rerender, api, result } = setup({ seed: [message(10)] });
    api.fetchMessages
      .mockResolvedValueOnce(full)
      .mockResolvedValueOnce([message(11 + CATCH_UP_PAGE_SIZE)]);

    rerender({ seed: [message(10)], connectionCount: 1 });

    await waitFor(() => expect(api.fetchMessages).toHaveBeenCalledTimes(2));
    expect(api.fetchMessages.mock.calls.map(([v]) => v.afterSeq)).toEqual([
      10,
      10 + CATCH_UP_PAGE_SIZE,
    ]);
    await waitFor(() =>
      expect(result.current.entries).toHaveLength(2 + CATCH_UP_PAGE_SIZE),
    );
  });

  it("counts from the first hole, not from a frame that arrived once the socket was back", async () => {
    // Messages 11-13 were sent while the socket was down; 14 was pushed after
    // it reopened. Counting from the highest seq held (14) would skip them
    // until a reload.
    const { rerender, api, result, bus } = setup({
      seed: [message(8), message(9), message(10)],
    });
    api.fetchMessages.mockResolvedValue([
      message(11),
      message(12),
      message(13),
      message(14),
    ]);

    bus.emit(messageFrame(message(14)));
    rerender({
      seed: [message(8), message(9), message(10)],
      connectionCount: 1,
    });

    await waitFor(() =>
      expect(seqs(result.current.entries)).toEqual([8, 9, 10, 11, 12, 13, 14]),
    );
    // The first thing asked for is what follows seq 10; a call that counted
    // from the highest seq held (14) would have asked for nothing that was lost.
    expect(api.fetchMessages.mock.calls[0][0].afterSeq).toBe(10);
  });

  it("fills a hole when a frame arrives more than one above the unbroken run, with no reconnect", async () => {
    const { api, result, bus } = setup({
      seed: [message(1), message(2)],
      connectionCount: 1,
    });
    await waitFor(() => expect(api.fetchMessages).toHaveBeenCalledTimes(1));
    api.fetchMessages.mockClear();
    api.fetchMessages.mockResolvedValue([message(4), message(5)]);

    bus.emit(messageFrame(message(3)));
    expect(api.fetchMessages).not.toHaveBeenCalled();
    bus.emit(messageFrame(message(5)));

    await waitFor(() =>
      expect(seqs(result.current.entries)).toEqual([1, 2, 3, 4, 5]),
    );
    expect(api.fetchMessages).toHaveBeenCalledExactlyOnceWith({
      conversationId: CONVERSATION,
      afterSeq: 3,
      limit: CATCH_UP_PAGE_SIZE,
    });
  });

  it("makes a hole over the seed's own seqs too: the unbroken run is counted from the lowest seq held", async () => {
    const { api, result, rerender } = setup({ seed: undefined });
    api.fetchMessages.mockResolvedValue([message(3), message(4), message(5)]);

    rerender({
      seed: [message(1), message(2), message(5)],
      connectionCount: 0,
    });

    await waitFor(() =>
      expect(seqs(result.current.entries)).toEqual([1, 2, 3, 4, 5]),
    );
    expect(api.fetchMessages.mock.calls[0][0].afterSeq).toBe(2);
  });

  it("runs one catch-up at a time, and goes round once more for what arrived while it ran", async () => {
    const { api, result, bus } = setup({
      seed: [message(1), message(2)],
    });
    let finishFirst: (page: ChatMessageData[]) => void = () => undefined;
    api.fetchMessages.mockImplementationOnce(
      () =>
        new Promise<ChatMessageData[]>((resolve) => {
          finishFirst = resolve;
        }),
    );
    api.fetchMessages.mockResolvedValue([message(6), message(7), message(8)]);

    bus.emit(messageFrame(message(5)));
    await waitFor(() => expect(api.fetchMessages).toHaveBeenCalledTimes(1));
    bus.emit(messageFrame(message(8)));
    // Still the first one: nothing runs beside it.
    expect(api.fetchMessages).toHaveBeenCalledTimes(1);

    await act(async () => {
      finishFirst([message(3), message(4), message(5)]);
    });

    await waitFor(() => expect(api.fetchMessages).toHaveBeenCalledTimes(2));
    expect(api.fetchMessages.mock.calls[1][0].afterSeq).toBe(5);
    await waitFor(() =>
      expect(seqs(result.current.entries)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]),
    );
  });

  it("tries a hole again when the next frame arrives after a catch-up that failed", async () => {
    const { api, result, bus } = setup({ seed: [message(1)] });
    api.fetchMessages.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    bus.emit(messageFrame(message(3)));
    await waitFor(() => expect(api.fetchMessages).toHaveBeenCalledTimes(1));
    expect(seqs(result.current.entries)).toEqual([1, 3]);

    api.fetchMessages.mockResolvedValue([message(2), message(3), message(4)]);
    bus.emit(messageFrame(message(4)));

    await waitFor(() =>
      expect(seqs(result.current.entries)).toEqual([1, 2, 3, 4]),
    );
    expect(api.fetchMessages).toHaveBeenCalledTimes(2);
  });

  it("shows nothing for a catch-up that fails", async () => {
    const { rerender, api, result } = setup({ seed: [message(1)] });
    api.fetchMessages.mockRejectedValue(new TypeError("Failed to fetch"));

    rerender({ seed: [message(1)], connectionCount: 1 });

    await waitFor(() => expect(api.fetchMessages).toHaveBeenCalled());
    expect(seqs(result.current.entries)).toEqual([1]);
  });
});

describe("scrolling back", () => {
  const fullPage = (from: number) =>
    Array.from({ length: MESSAGE_PAGE_SIZE }, (_, i) => message(from + i));

  it("has nothing older when the first page was short", () => {
    const { result } = setup({ seed: [message(1), message(2)] });

    expect(result.current.hasOlder).toBe(false);
  });

  it("asks for the page before the lowest seq and puts it at the top", async () => {
    const seed = fullPage(100);
    const { result, api } = setup({ seed });
    expect(result.current.hasOlder).toBe(true);
    api.fetchMessages.mockResolvedValue(fullPage(50));

    await act(async () => result.current.loadOlder());

    expect(api.fetchMessages).toHaveBeenCalledExactlyOnceWith({
      conversationId: CONVERSATION,
      beforeSeq: 100,
      limit: MESSAGE_PAGE_SIZE,
    });
    expect(result.current.entries).toHaveLength(2 * MESSAGE_PAGE_SIZE);
    expect(result.current.entries[0].seq).toBe(50);
    expect(result.current.hasOlder).toBe(true);
  });

  it("says there is nothing older once a page comes back short", async () => {
    const { result, api } = setup({ seed: fullPage(100) });
    api.fetchMessages.mockResolvedValue([message(98), message(99)]);

    await act(async () => result.current.loadOlder());

    expect(result.current.hasOlder).toBe(false);
  });

  it("does not ask twice while a page is on its way", async () => {
    let answer: (page: ChatMessageData[]) => void = () => undefined;
    const { result, api } = setup({ seed: fullPage(100) });
    api.fetchMessages.mockReturnValue(
      new Promise((resolve) => {
        answer = resolve;
      }),
    );

    act(() => {
      void result.current.loadOlder();
      void result.current.loadOlder();
    });
    expect(api.fetchMessages).toHaveBeenCalledTimes(1);
    expect(result.current.loadingOlder).toBe(true);

    await act(async () => answer([]));
    expect(result.current.loadingOlder).toBe(false);
  });

  it("can try again after a page failed", async () => {
    const { result, api } = setup({ seed: fullPage(100) });
    api.fetchMessages.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    await act(async () => result.current.loadOlder());
    expect(result.current.hasOlder).toBe(true);

    api.fetchMessages.mockResolvedValueOnce([message(99)]);
    await act(async () => result.current.loadOlder());

    expect(api.fetchMessages).toHaveBeenCalledTimes(2);
  });
});

describe("how far the other person has read", () => {
  it("follows the other person's read frames, never backwards", () => {
    const { result, bus } = setup({ seed: [] });
    expect(result.current.partnerReadSeq).toBeNull();

    bus.emit({
      type: FRAME_TYPE.read,
      conversationId: CONVERSATION,
      userId: PARTNER,
      upToSeq: 8,
    });
    bus.emit({
      type: FRAME_TYPE.read,
      conversationId: CONVERSATION,
      userId: PARTNER,
      upToSeq: 5,
    });

    expect(result.current.partnerReadSeq).toBe(8);
  });

  it("ignores the viewer's own read marks, and another conversation's", () => {
    const { result, bus } = setup({ seed: [] });

    bus.emit({
      type: FRAME_TYPE.read,
      conversationId: CONVERSATION,
      userId: ME,
      upToSeq: 8,
    });
    bus.emit({
      type: FRAME_TYPE.read,
      conversationId: "c2",
      userId: PARTNER,
      upToSeq: 8,
    });

    expect(result.current.partnerReadSeq).toBeNull();
  });
});

describe("an image link that no longer works", () => {
  const withImage = message(5, { imageUrl: "https://old" });

  it("fetches that one message again and swaps in its new link", async () => {
    const { result, api } = setup({ seed: [withImage] });
    api.fetchMessages.mockResolvedValue([
      { ...withImage, imageUrl: "https://new" },
    ]);

    await act(async () =>
      result.current.refreshImage(result.current.entries[0]),
    );

    expect(api.fetchMessages).toHaveBeenCalledExactlyOnceWith({
      conversationId: CONVERSATION,
      beforeSeq: 6,
      limit: 1,
    });
    expect(result.current.entries[0].imageUrl).toBe("https://new");
  });

  it("does not fetch again for a link that has already been tried", async () => {
    const { result, api } = setup({ seed: [withImage] });
    api.fetchMessages.mockResolvedValue([withImage]);

    await act(async () =>
      result.current.refreshImage(result.current.entries[0]),
    );
    await act(async () =>
      result.current.refreshImage(result.current.entries[0]),
    );

    expect(api.fetchMessages).toHaveBeenCalledTimes(1);
  });
});
