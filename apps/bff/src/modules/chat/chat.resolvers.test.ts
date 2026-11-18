import { describe, expect, it, vi } from "vitest";

import { BackendError } from "../../shared/http/backendError.js";
import { makeContext } from "../../test/makeContext.js";
import { chatResolvers } from "./chat.resolvers.js";

const noToken = (apis: Parameters<typeof makeContext>[0] = {}) =>
  makeContext({ ...apis, token: null });

/** Each operation, called with a context that has no token. */
const withoutToken: Array<[string, () => unknown]> = [
  [
    "chatConversations",
    () => chatResolvers.Query.chatConversations({}, {}, noToken()),
  ],
  [
    "chatConversation",
    () => chatResolvers.Query.chatConversation({}, { id: "c1" }, noToken()),
  ],
  [
    "chatMessages",
    () =>
      chatResolvers.Query.chatMessages({}, { conversationId: "c1" }, noToken()),
  ],
  [
    "chatUnreadCount",
    () => chatResolvers.Query.chatUnreadCount({}, {}, noToken()),
  ],
  [
    "openChat",
    () => chatResolvers.Mutation.openChat({}, { friendId: "u2" }, noToken()),
  ],
  [
    "sendChatMessage",
    () =>
      chatResolvers.Mutation.sendChatMessage(
        {},
        { conversationId: "c1", clientId: "k1" },
        noToken(),
      ),
  ],
  [
    "markChatRead",
    () =>
      chatResolvers.Mutation.markChatRead(
        {},
        { conversationId: "c1", upToSeq: 3 },
        noToken(),
      ),
  ],
  [
    "recallChatMessage",
    () =>
      chatResolvers.Mutation.recallChatMessage(
        {},
        { messageId: "m1" },
        noToken(),
      ),
  ],
  [
    "startChatImageUpload",
    () =>
      chatResolvers.Mutation.startChatImageUpload(
        {},
        { conversationId: "c1", contentType: "image/png", contentLength: 5 },
        noToken(),
      ),
  ],
  [
    "chatSocketTicket",
    () => chatResolvers.Mutation.chatSocketTicket({}, {}, noToken()),
  ],
];

describe("every chat operation needs a token", () => {
  it.each(withoutToken)(
    "%s fails before reaching the backend",
    async (_name, run) => {
      await expect(Promise.resolve().then(run)).rejects.toThrow(
        "Missing or invalid access token",
      );
    },
  );
});

describe("Query.chatConversations", () => {
  it("defaults to the first page of 20", async () => {
    const conversations = vi.fn().mockResolvedValue({ items: [] });
    const ctx = makeContext({ apis: { chatApi: { conversations } } });

    await chatResolvers.Query.chatConversations({}, {}, ctx);

    expect(conversations).toHaveBeenCalledWith({ page: 0, size: 20 });
  });

  it("caps the page at the backend's 50", async () => {
    const conversations = vi.fn().mockResolvedValue({ items: [] });
    const ctx = makeContext({ apis: { chatApi: { conversations } } });

    await chatResolvers.Query.chatConversations(
      {},
      { page: 2, size: 500 },
      ctx,
    );

    expect(conversations).toHaveBeenCalledWith({ page: 2, size: 50 });
  });

  it("returns the page as the backend gave it, a null otherUser and lastMessage included", async () => {
    const page = {
      items: [
        {
          id: "c1",
          otherUser: null,
          lastSeq: 4,
          lastReadSeq: 4,
          unreadCount: 0,
          lastMessage: null,
          canSend: null,
        },
      ],
      page: 0,
      size: 20,
      totalItems: 1,
      totalPages: 1,
    };
    const ctx = makeContext({
      apis: { chatApi: { conversations: vi.fn().mockResolvedValue(page) } },
    });

    expect(await chatResolvers.Query.chatConversations({}, {}, ctx)).toEqual(
      page,
    );
  });
});

describe("Query.chatMessages", () => {
  it("asks for the newest 50 when only the conversation is named", async () => {
    const messages = vi.fn().mockResolvedValue([]);
    const ctx = makeContext({ apis: { chatApi: { messages } } });

    await chatResolvers.Query.chatMessages({}, { conversationId: "c1" }, ctx);

    expect(messages).toHaveBeenCalledWith("c1", {
      afterSeq: undefined,
      beforeSeq: undefined,
      limit: 50,
    });
  });

  it("passes the cursor through and caps the limit at the backend's 100", async () => {
    const messages = vi.fn().mockResolvedValue([]);
    const ctx = makeContext({ apis: { chatApi: { messages } } });

    await chatResolvers.Query.chatMessages(
      {},
      { conversationId: "c1", afterSeq: 41, limit: 1000 },
      ctx,
    );

    expect(messages).toHaveBeenCalledWith("c1", {
      afterSeq: 41,
      beforeSeq: undefined,
      limit: 100,
    });
  });

  it("does not choose between two cursors: that refusal is the backend's", async () => {
    const messages = vi
      .fn()
      .mockRejectedValue(
        new BackendError("both", 400, "CHAT_HISTORY_CURSOR_CONFLICT"),
      );
    const ctx = makeContext({ apis: { chatApi: { messages } } });

    await expect(
      chatResolvers.Query.chatMessages(
        {},
        { conversationId: "c1", afterSeq: 1, beforeSeq: 9 },
        ctx,
      ),
    ).rejects.toMatchObject({ code: "CHAT_HISTORY_CURSOR_CONFLICT" });
    expect(messages).toHaveBeenCalledWith("c1", {
      afterSeq: 1,
      beforeSeq: 9,
      limit: 50,
    });
  });
});

describe("Query.chatUnreadCount", () => {
  it("answers the number, not the REST body", async () => {
    const unreadCount = vi.fn().mockResolvedValue({ count: 3 });
    const ctx = makeContext({ apis: { chatApi: { unreadCount } } });

    expect(await chatResolvers.Query.chatUnreadCount({}, {}, ctx)).toBe(3);
  });
});

describe("Mutation.sendChatMessage", () => {
  it("leaves out the text and the image the caller did not give", async () => {
    const send = vi.fn().mockResolvedValue({ id: "m1" });
    const ctx = makeContext({ apis: { chatApi: { send } } });

    await chatResolvers.Mutation.sendChatMessage(
      {},
      { conversationId: "c1", clientId: "k1", body: null, imageUploadId: null },
      ctx,
    );

    expect(send).toHaveBeenCalledWith("c1", {
      clientId: "k1",
      body: undefined,
      imageUploadId: undefined,
    });
  });

  it("sends text and image together, with the clientId untouched", async () => {
    const send = vi.fn().mockResolvedValue({ id: "m1" });
    const ctx = makeContext({ apis: { chatApi: { send } } });

    await chatResolvers.Mutation.sendChatMessage(
      {},
      {
        conversationId: "c1",
        clientId: "k1",
        body: "hi",
        imageUploadId: "up1",
      },
      ctx,
    );

    expect(send).toHaveBeenCalledWith("c1", {
      clientId: "k1",
      body: "hi",
      imageUploadId: "up1",
    });
  });

  it("lets a backend refusal through for the central error mapping", async () => {
    const send = vi
      .fn()
      .mockRejectedValue(new BackendError("no", 403, "CHAT_NOT_FRIENDS"));
    const ctx = makeContext({ apis: { chatApi: { send } } });

    await expect(
      chatResolvers.Mutation.sendChatMessage(
        {},
        { conversationId: "c1", clientId: "k1", body: "hi" },
        ctx,
      ),
    ).rejects.toMatchObject({ status: 403, code: "CHAT_NOT_FRIENDS" });
  });
});

describe("the mutations that answer 204", () => {
  it("markChatRead answers true once the backend has marked it", async () => {
    const markRead = vi.fn().mockResolvedValue(undefined);
    const ctx = makeContext({ apis: { chatApi: { markRead } } });

    expect(
      await chatResolvers.Mutation.markChatRead(
        {},
        { conversationId: "c1", upToSeq: 7 },
        ctx,
      ),
    ).toBe(true);
    expect(markRead).toHaveBeenCalledWith("c1", 7);
  });
});

describe("the other mutations", () => {
  it("openChat returns the conversation", async () => {
    const conversation = { id: "c1", canSend: true };
    const open = vi.fn().mockResolvedValue(conversation);
    const ctx = makeContext({ apis: { chatApi: { open } } });

    expect(
      await chatResolvers.Mutation.openChat({}, { friendId: "u2" }, ctx),
    ).toBe(conversation);
    expect(open).toHaveBeenCalledWith("u2");
  });

  it("recallChatMessage returns the recalled message", async () => {
    const recall = vi.fn().mockResolvedValue({ id: "m1", recalled: true });
    const ctx = makeContext({ apis: { chatApi: { recall } } });

    expect(
      await chatResolvers.Mutation.recallChatMessage(
        {},
        { messageId: "m1" },
        ctx,
      ),
    ).toEqual({ id: "m1", recalled: true });
  });

  it("startChatImageUpload sends the type and size", async () => {
    const startImageUpload = vi.fn().mockResolvedValue({ uploadId: "up1" });
    const ctx = makeContext({ apis: { chatApi: { startImageUpload } } });

    await chatResolvers.Mutation.startChatImageUpload(
      {},
      { conversationId: "c1", contentType: "image/webp", contentLength: 2048 },
      ctx,
    );

    expect(startImageUpload).toHaveBeenCalledWith("c1", {
      contentType: "image/webp",
      contentLength: 2048,
    });
  });

  it("chatSocketTicket makes a new ticket on every call", async () => {
    const socketTicket = vi
      .fn()
      .mockResolvedValueOnce({ ticket: "t1", expiresInSeconds: 30 })
      .mockResolvedValueOnce({ ticket: "t2", expiresInSeconds: 30 });
    const ctx = makeContext({ apis: { chatApi: { socketTicket } } });

    const first = await chatResolvers.Mutation.chatSocketTicket({}, {}, ctx);
    const second = await chatResolvers.Mutation.chatSocketTicket({}, {}, ctx);

    expect([first.ticket, second.ticket]).toEqual(["t1", "t2"]);
    expect(socketTicket).toHaveBeenCalledTimes(2);
  });
});
