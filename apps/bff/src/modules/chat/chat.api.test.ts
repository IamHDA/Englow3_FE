import { afterEach, describe, expect, it, vi } from "vitest";

import { BackendClient } from "../../shared/http/backendClient.js";
import { ChatApi } from "./chat.api.js";

function setup() {
  const client = new BackendClient("http://backend.test", 1000);
  return {
    api: new ChatApi(client),
    get: vi.spyOn(client, "get").mockResolvedValue({}),
    post: vi.spyOn(client, "post").mockResolvedValue({}),
  };
}

describe("ChatApi reads", () => {
  it("pages the conversations with query-string page and size, keeping page 0", async () => {
    const { api, get } = setup();
    await api.conversations({ page: 0, size: 20 });
    expect(get).toHaveBeenCalledExactlyOnceWith(
      "/api/chat/conversations?page=0&size=20",
    );
  });

  it("reads one conversation, with its id encoded", async () => {
    const { api, get } = setup();
    await api.conversation("a/b?c");
    expect(get).toHaveBeenCalledExactlyOnceWith(
      "/api/chat/conversations/a%2Fb%3Fc",
    );
  });

  it("asks for the newest messages with the limit alone", async () => {
    const { api, get } = setup();
    await api.messages("c1", { limit: 50 });
    expect(get).toHaveBeenCalledExactlyOnceWith(
      "/api/chat/conversations/c1/messages?limit=50",
    );
  });

  it("catches up after a seq, and keeps a seq of 0 rather than dropping it as empty", async () => {
    const { api, get } = setup();
    await api.messages("c1", { afterSeq: 0, limit: 100 });
    await api.messages("c1", { afterSeq: 41, beforeSeq: null, limit: 100 });
    expect(get.mock.calls.map(([path]) => path)).toEqual([
      "/api/chat/conversations/c1/messages?afterSeq=0&limit=100",
      "/api/chat/conversations/c1/messages?afterSeq=41&limit=100",
    ]);
  });

  it("scrolls back before a seq, encoding the conversation id", async () => {
    const { api, get } = setup();
    await api.messages("c/1", { beforeSeq: 12, limit: 50 });
    expect(get).toHaveBeenCalledExactlyOnceWith(
      "/api/chat/conversations/c%2F1/messages?beforeSeq=12&limit=50",
    );
  });

  it("reads the unread count", async () => {
    const { api, get } = setup();
    await api.unreadCount();
    expect(get).toHaveBeenCalledExactlyOnceWith("/api/chat/unread-count");
  });
});

describe("ChatApi writes", () => {
  it("opens a conversation with the friend in the body", async () => {
    const { api, post } = setup();
    await api.open("friend-1");
    expect(post).toHaveBeenCalledExactlyOnceWith("/api/chat/conversations", {
      friendId: "friend-1",
    });
  });

  it("sends a message to the conversation, body and clientId as given", async () => {
    const { api, post } = setup();
    await api.send("c/1", { clientId: "k1", body: "hi", imageUploadId: "up1" });
    expect(post).toHaveBeenCalledExactlyOnceWith(
      "/api/chat/conversations/c%2F1/messages",
      { clientId: "k1", body: "hi", imageUploadId: "up1" },
    );
  });

  it("marks a conversation read up to a seq", async () => {
    const { api, post } = setup();
    await api.markRead("c1", 42);
    expect(post).toHaveBeenCalledExactlyOnceWith(
      "/api/chat/conversations/c1/read",
      { upToSeq: 42 },
    );
  });

  it("recalls a message by id, encoded, with no body", async () => {
    const { api, post } = setup();
    await api.recall("m/1");
    expect(post).toHaveBeenCalledExactlyOnceWith(
      "/api/chat/messages/m%2F1/recall",
    );
  });

  it("asks for an image upload URL with the type and size", async () => {
    const { api, post } = setup();
    await api.startImageUpload("c1", {
      contentType: "image/png",
      contentLength: 1024,
    });
    expect(post).toHaveBeenCalledExactlyOnceWith(
      "/api/chat/conversations/c1/image-uploads",
      { contentType: "image/png", contentLength: 1024 },
    );
  });

  it("asks for a socket ticket with a POST and no body", async () => {
    const { api, post } = setup();
    await api.socketTicket();
    expect(post).toHaveBeenCalledExactlyOnceWith("/api/chat/socket-tickets");
  });
});

/**
 * The ticket opens a chat socket for whoever holds it. Nothing the BFF writes
 * down may contain it: not the request line, not the response, not the body.
 */
describe("a socket ticket and the BFF's own log", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("is not in anything the real backend client logs", async () => {
    const SECRET = "sekrit-ticket-value-123";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ ticket: SECRET, expiresInSeconds: 30 }), {
          status: 201,
          headers: { "content-type": "application/json" },
        }),
      ),
    );
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const log = vi.spyOn(console, "log").mockImplementation(() => {});

    const api = new ChatApi(
      new BackendClient("http://backend.test", 1000, "token", "req-1"),
    );
    const result = await api.socketTicket();

    expect(result.ticket).toBe(SECRET);
    const written = [info, error, warn, log].flatMap((spy) => spy.mock.calls);
    expect(written.length).toBeGreaterThan(0); // the request line is logged...
    expect(JSON.stringify(written)).not.toContain(SECRET); // ...without the ticket
  });
});
