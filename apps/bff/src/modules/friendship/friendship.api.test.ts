import { describe, expect, it, vi } from "vitest";

import { BackendClient } from "../../shared/http/backendClient.js";
import { FriendshipApi } from "./friendship.api.js";

function setup() {
  const client = new BackendClient("http://backend.test", 1000);
  return {
    api: new FriendshipApi(client),
    get: vi.spyOn(client, "get").mockResolvedValue({}),
    post: vi.spyOn(client, "post").mockResolvedValue({}),
    put: vi.spyOn(client, "put").mockResolvedValue(null),
    del: vi.spyOn(client, "delete").mockResolvedValue(null),
  };
}

describe("FriendshipApi reads", () => {
  it("pages the friends list with query-string page and size", async () => {
    const { api, get } = setup();
    await api.friends({ page: 2, size: 10 });
    expect(get).toHaveBeenCalledExactlyOnceWith("/api/friends?page=2&size=10");
  });

  it("keeps page 0 in the query string rather than dropping it as empty", async () => {
    const { api, get } = setup();
    await api.blocked({ page: 0, size: 20 });
    expect(get).toHaveBeenCalledExactlyOnceWith(
      "/api/friends/blocks?page=0&size=20",
    );
  });

  it("encodes the search term", async () => {
    const { api, get } = setup();
    await api.search({ q: "an & co/x", page: 0, size: 20 });
    expect(get).toHaveBeenCalledExactlyOnceWith(
      "/api/friends/search?q=an+%26+co%2Fx&page=0&size=20",
    );
  });

  it("reads the two request lists and the pending count", async () => {
    const { api, get } = setup();
    await api.incoming({ page: 1, size: 5 });
    await api.outgoing({ page: 0, size: 5 });
    await api.incomingCount();
    expect(get.mock.calls.map(([path]) => path)).toEqual([
      "/api/friends/requests/incoming?page=1&size=5",
      "/api/friends/requests/outgoing?page=0&size=5",
      "/api/friends/requests/incoming/count",
    ]);
  });

  it("encodes the user id in the relationship and friend-count paths", async () => {
    const { api, get } = setup();
    await api.relationship("a/b?c");
    await api.friendCount("a/b?c");
    expect(get.mock.calls.map(([path]) => path)).toEqual([
      "/api/friends/relationships/a%2Fb%3Fc",
      "/api/friends/users/a%2Fb%3Fc/count",
    ]);
  });
});

describe("FriendshipApi writes", () => {
  it("sends a request with the addressee in the body", async () => {
    const { api, post } = setup();
    await api.send("user-2");
    expect(post).toHaveBeenCalledExactlyOnceWith("/api/friends/requests", {
      addresseeId: "user-2",
    });
  });

  it("accepts and withdraws by request id, encoded", async () => {
    const { api, post, del } = setup();
    await api.accept("r/1");
    await api.withdraw("r/1");
    expect(post).toHaveBeenCalledExactlyOnceWith(
      "/api/friends/requests/r%2F1/accept",
    );
    expect(del).toHaveBeenCalledExactlyOnceWith("/api/friends/requests/r%2F1");
  });

  it("unfriends, blocks and unblocks by user id, encoded", async () => {
    const { api, put, del } = setup();
    await api.unfriend("u/1");
    await api.block("u/1");
    await api.unblock("u/1");
    expect(put).toHaveBeenCalledExactlyOnceWith("/api/friends/blocks/u%2F1");
    expect(del.mock.calls.map(([path]) => path)).toEqual([
      "/api/friends/u%2F1",
      "/api/friends/blocks/u%2F1",
    ]);
  });
});
