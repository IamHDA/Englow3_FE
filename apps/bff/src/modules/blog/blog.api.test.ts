import { describe, expect, it, vi } from "vitest";

import { BackendClient } from "../../shared/http/backendClient.js";
import { BlogApi } from "./blog.api.js";

function setup() {
  const client = new BackendClient("http://backend.test", 1000);
  return {
    api: new BlogApi(client),
    get: vi.spyOn(client, "get").mockResolvedValue({}),
    post: vi.spyOn(client, "post").mockResolvedValue({}),
    put: vi.spyOn(client, "put").mockResolvedValue({}),
    del: vi.spyOn(client, "delete").mockResolvedValue(null),
  };
}

describe("BlogApi posts", () => {
  it("lists with every filter in the query string, keeping page 0", async () => {
    const { api, get } = setup();
    await api.list({
      q: "ielts tips",
      skill: "WRITING",
      level: "B2",
      certificate: "IELTS",
      authorId: "u-1",
      sort: "MOST_LIKED",
      page: 0,
      size: 20,
    });
    const [path] = get.mock.calls[0];
    const [base, query] = path.split("?");
    expect(base).toBe("/api/blog/posts");
    expect(Object.fromEntries(new URLSearchParams(query))).toEqual({
      q: "ielts tips",
      skill: "WRITING",
      level: "B2",
      certificate: "IELTS",
      authorId: "u-1",
      sort: "MOST_LIKED",
      page: "0",
      size: "20",
    });
  });

  it("leaves out a filter that is not given", async () => {
    const { api, get } = setup();
    await api.list({
      q: "",
      skill: null,
      level: undefined,
      page: 2,
      size: 10,
    });
    expect(get).toHaveBeenCalledExactlyOnceWith(
      "/api/blog/posts?page=2&size=10",
    );
  });

  it("reads one post, with its id encoded", async () => {
    const { api, get } = setup();
    await api.post("a/b?c");
    expect(get).toHaveBeenCalledExactlyOnceWith("/api/blog/posts/a%2Fb%3Fc");
  });

  it("creates with the post in the body", async () => {
    const { api, post } = setup();
    const body = {
      title: "T",
      body: "B",
      tags: [{ kind: "SKILL" as const, value: "WRITING" }],
    };
    await api.create(body);
    expect(post).toHaveBeenCalledExactlyOnceWith("/api/blog/posts", body);
  });

  it("updates with the version the editor opened in the body", async () => {
    const { api, put } = setup();
    const body = { title: "T", body: "B", tags: [], version: 3 };
    await api.update("p1", body);
    expect(put).toHaveBeenCalledExactlyOnceWith("/api/blog/posts/p1", body);
  });

  it("deletes a post, and a comment, by their ids", async () => {
    const { api, del } = setup();
    await api.remove("p1");
    await api.removeComment("c/1");
    expect(del.mock.calls.map(([path]) => path)).toEqual([
      "/api/blog/posts/p1",
      "/api/blog/comments/c%2F1",
    ]);
  });

  it("likes with a PUT and unlikes with a DELETE, neither with a body", async () => {
    const { api, put, del } = setup();
    await api.like("p1");
    await api.unlike("p1");
    expect(put).toHaveBeenCalledExactlyOnceWith("/api/blog/posts/p1/like");
    expect(del).toHaveBeenCalledExactlyOnceWith("/api/blog/posts/p1/like");
  });

  it("saves with a PUT and unsaves with a DELETE, neither with a body, the id encoded", async () => {
    const { api, put, del } = setup();
    await api.save("p/1");
    await api.unsave("p/1");
    expect(put).toHaveBeenCalledExactlyOnceWith("/api/blog/posts/p%2F1/save");
    expect(del).toHaveBeenCalledExactlyOnceWith("/api/blog/posts/p%2F1/save");
  });

  it("pages the saved posts", async () => {
    const { api, get } = setup();
    await api.savedPosts({ page: 0, size: 12 });
    expect(get).toHaveBeenCalledExactlyOnceWith(
      "/api/blog/saved-posts?page=0&size=12",
    );
  });

  it("asks for as many recommendations as it is told", async () => {
    const { api, get } = setup();
    await api.recommendations({ limit: 3 });
    expect(get).toHaveBeenCalledExactlyOnceWith(
      "/api/blog/recommendations?limit=3",
    );
  });

  it("reads the tag catalogue", async () => {
    const { api, get } = setup();
    await api.tagCatalogue();
    expect(get).toHaveBeenCalledExactlyOnceWith("/api/blog/tags");
  });
});

describe("BlogApi comments, images and reports", () => {
  it("pages the comments of a post", async () => {
    const { api, get } = setup();
    await api.comments("p/1", { page: 0, size: 20 });
    expect(get).toHaveBeenCalledExactlyOnceWith(
      "/api/blog/posts/p%2F1/comments?page=0&size=20",
    );
  });

  it("writes a comment under a post and edits one by its own id", async () => {
    const { api, post, put } = setup();
    await api.createComment("p1", { body: "hi" });
    await api.updateComment("c1", { body: "hello" });
    expect(post).toHaveBeenCalledExactlyOnceWith(
      "/api/blog/posts/p1/comments",
      { body: "hi" },
    );
    expect(put).toHaveBeenCalledExactlyOnceWith("/api/blog/comments/c1", {
      body: "hello",
    });
  });

  it("asks for an image upload with the type and size in the body", async () => {
    const { api, post } = setup();
    await api.startImageUpload({ contentType: "image/png", contentLength: 5 });
    expect(post).toHaveBeenCalledExactlyOnceWith("/api/blog/images", {
      contentType: "image/png",
      contentLength: 5,
    });
  });

  it("reports a post and a comment on their own routes", async () => {
    const { api, post } = setup();
    await api.reportPost("p1", { reason: "SPAM", detail: "ads" });
    await api.reportComment("c1", { reason: "OTHER" });
    expect(post.mock.calls).toEqual([
      ["/api/blog/posts/p1/reports", { reason: "SPAM", detail: "ads" }],
      ["/api/blog/comments/c1/reports", { reason: "OTHER" }],
    ]);
  });
});

describe("BlogApi moderation", () => {
  it("asks for the queue with the type under its enum name", async () => {
    const { api, get } = setup();
    await api.adminQueue({
      type: "COMMENT",
      sort: "MOST_REPORTED",
      page: 1,
      size: 20,
    });
    const [path] = get.mock.calls[0];
    expect(path.startsWith("/api/admin/blog/queue?")).toBe(true);
    expect(Object.fromEntries(new URLSearchParams(path.split("?")[1]))).toEqual(
      { type: "COMMENT", sort: "MOST_REPORTED", page: "1", size: "20" },
    );
  });

  it("leaves the type and the sort out of the queue when they are not given", async () => {
    const { api, get } = setup();
    await api.adminQueue({ page: 0, size: 20 });
    expect(get).toHaveBeenCalledExactlyOnceWith(
      "/api/admin/blog/queue?page=0&size=20",
    );
  });

  it("puts the type in lower case in the path of a target, which is what the backend routes on", async () => {
    const { api, get } = setup();
    await api.adminTarget("POST", "p1");
    await api.adminTarget("COMMENT", "c/1");
    expect(get.mock.calls.map(([path]) => path)).toEqual([
      "/api/admin/blog/targets/post/p1",
      "/api/admin/blog/targets/comment/c%2F1",
    ]);
  });

  it("acts on a target with the action and the reason in the body", async () => {
    const { api, post } = setup();
    await api.adminModerate("COMMENT", "c1", {
      action: "HIDE",
      reason: "abusive",
    });
    expect(post).toHaveBeenCalledExactlyOnceWith(
      "/api/admin/blog/targets/comment/c1/actions",
      { action: "HIDE", reason: "abusive" },
    );
  });

  it("pages the history of actions", async () => {
    const { api, get } = setup();
    await api.adminActions({ page: 0, size: 50 });
    expect(get).toHaveBeenCalledExactlyOnceWith(
      "/api/admin/blog/actions?page=0&size=50",
    );
  });
});
