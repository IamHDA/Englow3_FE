import { describe, expect, it, vi } from "vitest";

import { BackendError } from "../../shared/http/backendError.js";
import { makeContext } from "../../test/makeContext.js";
import { blogResolvers } from "./blog.resolvers.js";

const noToken = (apis: Parameters<typeof makeContext>[0] = {}) =>
  makeContext({ ...apis, token: null });

const wall = (available: boolean) => ({
  userId: "u2",
  available,
  relationship: {
    userId: "u2",
    status: available ? ("FRIENDS" as const) : ("UNAVAILABLE" as const),
    requestId: null,
  },
});

/** Each operation, called with a context that has no token. */
const withoutToken: Array<[string, () => unknown]> = [
  ["blogPosts", () => blogResolvers.Query.blogPosts({}, {}, noToken())],
  ["blogPost", () => blogResolvers.Query.blogPost({}, { id: "p1" }, noToken())],
  [
    "blogComments",
    () => blogResolvers.Query.blogComments({}, { postId: "p1" }, noToken()),
  ],
  [
    "blogTagCatalogue",
    () => blogResolvers.Query.blogTagCatalogue({}, {}, noToken()),
  ],
  [
    "blogRecommendations",
    () => blogResolvers.Query.blogRecommendations({}, {}, noToken()),
  ],
  [
    "savedBlogPosts",
    () => blogResolvers.Query.savedBlogPosts({}, {}, noToken()),
  ],
  [
    "adminBlogQueue",
    () => blogResolvers.Query.adminBlogQueue({}, {}, noToken()),
  ],
  [
    "adminBlogTarget",
    () =>
      blogResolvers.Query.adminBlogTarget(
        {},
        { type: "POST", id: "p1" },
        noToken(),
      ),
  ],
  [
    "adminBlogActions",
    () => blogResolvers.Query.adminBlogActions({}, {}, noToken()),
  ],
  [
    "createBlogPost",
    () =>
      blogResolvers.Mutation.createBlogPost(
        {},
        { input: { title: "T", body: "B", tags: [] } },
        noToken(),
      ),
  ],
  [
    "updateBlogPost",
    () =>
      blogResolvers.Mutation.updateBlogPost(
        {},
        { id: "p1", input: { title: "T", body: "B", tags: [] }, version: 1 },
        noToken(),
      ),
  ],
  [
    "deleteBlogPost",
    () => blogResolvers.Mutation.deleteBlogPost({}, { id: "p1" }, noToken()),
  ],
  [
    "likeBlogPost",
    () => blogResolvers.Mutation.likeBlogPost({}, { id: "p1" }, noToken()),
  ],
  [
    "unlikeBlogPost",
    () => blogResolvers.Mutation.unlikeBlogPost({}, { id: "p1" }, noToken()),
  ],
  [
    "saveBlogPost",
    () => blogResolvers.Mutation.saveBlogPost({}, { id: "p1" }, noToken()),
  ],
  [
    "unsaveBlogPost",
    () => blogResolvers.Mutation.unsaveBlogPost({}, { id: "p1" }, noToken()),
  ],
  [
    "createBlogComment",
    () =>
      blogResolvers.Mutation.createBlogComment(
        {},
        { postId: "p1", body: "hi" },
        noToken(),
      ),
  ],
  [
    "updateBlogComment",
    () =>
      blogResolvers.Mutation.updateBlogComment(
        {},
        { id: "c1", body: "hi" },
        noToken(),
      ),
  ],
  [
    "deleteBlogComment",
    () => blogResolvers.Mutation.deleteBlogComment({}, { id: "c1" }, noToken()),
  ],
  [
    "startBlogImageUpload",
    () =>
      blogResolvers.Mutation.startBlogImageUpload(
        {},
        { contentType: "image/png", contentLength: 5 },
        noToken(),
      ),
  ],
  [
    "reportBlogPost",
    () =>
      blogResolvers.Mutation.reportBlogPost(
        {},
        { id: "p1", reason: "SPAM" },
        noToken(),
      ),
  ],
  [
    "reportBlogComment",
    () =>
      blogResolvers.Mutation.reportBlogComment(
        {},
        { id: "c1", reason: "SPAM" },
        noToken(),
      ),
  ],
  [
    "adminModerateBlog",
    () =>
      blogResolvers.Mutation.adminModerateBlog(
        {},
        { type: "POST", id: "p1", action: "HIDE", reason: "r" },
        noToken(),
      ),
  ],
];

describe("every blog operation needs a token", () => {
  it.each(withoutToken)(
    "%s fails before reaching the backend",
    async (_name, run) => {
      await expect(Promise.resolve().then(run)).rejects.toThrow(
        "Missing or invalid access token",
      );
    },
  );
});

describe("Query.blogPosts", () => {
  it("defaults to the first page of 20 and sends no filter the caller did not give", async () => {
    const list = vi.fn().mockResolvedValue({ items: [] });
    const ctx = makeContext({ apis: { blogApi: { list } } });

    await blogResolvers.Query.blogPosts({}, {}, ctx);

    expect(list).toHaveBeenCalledWith({
      q: undefined,
      skill: undefined,
      level: undefined,
      certificate: undefined,
      authorId: undefined,
      sort: undefined,
      page: 0,
      size: 20,
    });
  });

  it("passes the filters and the sort on as given, and caps the page at the backend's 50", async () => {
    const list = vi.fn().mockResolvedValue({ items: [] });
    const ctx = makeContext({ apis: { blogApi: { list } } });

    await blogResolvers.Query.blogPosts(
      {},
      {
        q: "ielts",
        skill: "WRITING",
        level: "B2",
        certificate: "IELTS",
        authorId: "u1",
        sort: "MOST_LIKED",
        page: 3,
        size: 500,
      },
      ctx,
    );

    expect(list).toHaveBeenCalledWith({
      q: "ielts",
      skill: "WRITING",
      level: "B2",
      certificate: "IELTS",
      authorId: "u1",
      sort: "MOST_LIKED",
      page: 3,
      size: 50,
    });
  });

  it("returns the page as the backend gave it, an erased author's null included", async () => {
    const page = {
      items: [{ id: "p1", author: null, status: "PUBLISHED" }],
      page: 0,
      size: 20,
      totalItems: 1,
      totalPages: 1,
    };
    const ctx = makeContext({
      apis: { blogApi: { list: vi.fn().mockResolvedValue(page) } },
    });

    expect(await blogResolvers.Query.blogPosts({}, {}, ctx)).toBe(page);
  });

  it("lets a backend refusal through for the central formatter to map to its backendCode", async () => {
    const list = vi
      .fn()
      .mockRejectedValue(
        new BackendError("Too short", 400, "SEARCH_TERM_TOO_SHORT"),
      );
    const ctx = makeContext({ apis: { blogApi: { list } } });

    await expect(
      blogResolvers.Query.blogPosts({}, { q: "a" }, ctx),
    ).rejects.toMatchObject({ status: 400, code: "SEARCH_TERM_TOO_SHORT" });
  });
});

describe("Query.savedBlogPosts", () => {
  it("pages the saved posts, 20 by default and 50 at most, and returns the page as given", async () => {
    const page = { items: [], page: 0, size: 20, totalItems: 0, totalPages: 0 };
    const savedPosts = vi.fn().mockResolvedValue(page);
    const ctx = makeContext({ apis: { blogApi: { savedPosts } } });

    const first = await blogResolvers.Query.savedBlogPosts({}, {}, ctx);
    await blogResolvers.Query.savedBlogPosts({}, { page: 2, size: 999 }, ctx);

    expect(first).toBe(page);
    expect(savedPosts.mock.calls).toEqual([
      [{ page: 0, size: 20 }],
      [{ page: 2, size: 50 }],
    ]);
  });
});

describe("Query.blogRecommendations", () => {
  const recommendation = (kind: string) => ({
    post: { id: `p-${kind}` },
    reason: {
      kind,
      matchedTags:
        kind === "PROFILE" ? [{ kind: "SKILL", value: "WRITING" }] : [],
    },
  });

  it("reads the reason flat: the post, its kind and the tags that matched", async () => {
    const recommendations = vi
      .fn()
      .mockResolvedValue([
        recommendation("PROFILE"),
        recommendation("POPULAR_THIS_WEEK"),
      ]);
    const ctx = makeContext({ apis: { blogApi: { recommendations } } });

    expect(await blogResolvers.Query.blogRecommendations({}, {}, ctx)).toEqual([
      {
        post: { id: "p-PROFILE" },
        kind: "PROFILE",
        matchedTags: [{ kind: "SKILL", value: "WRITING" }],
      },
      {
        post: { id: "p-POPULAR_THIS_WEEK" },
        kind: "POPULAR_THIS_WEEK",
        matchedTags: [],
      },
    ]);
  });

  it("asks for 3 unless told otherwise, and never for more than the backend's 10", async () => {
    const recommendations = vi.fn().mockResolvedValue([]);
    const ctx = makeContext({ apis: { blogApi: { recommendations } } });

    await blogResolvers.Query.blogRecommendations({}, {}, ctx);
    await blogResolvers.Query.blogRecommendations({}, { limit: 5 }, ctx);
    await blogResolvers.Query.blogRecommendations({}, { limit: 500 }, ctx);

    expect(recommendations.mock.calls).toEqual([
      [{ limit: 3 }],
      [{ limit: 5 }],
      [{ limit: 10 }],
    ]);
  });

  it("answers an empty list when there is nothing to recommend", async () => {
    const ctx = makeContext({
      apis: {
        blogApi: { recommendations: vi.fn().mockResolvedValue([]) },
      },
    });

    expect(await blogResolvers.Query.blogRecommendations({}, {}, ctx)).toEqual(
      [],
    );
  });
});

describe("the other reads", () => {
  it("reads one post by id", async () => {
    const post = vi.fn().mockResolvedValue({ id: "p1" });
    const ctx = makeContext({ apis: { blogApi: { post } } });

    await blogResolvers.Query.blogPost({}, { id: "p1" }, ctx);

    expect(post).toHaveBeenCalledWith("p1");
  });

  it("pages the comments of a post, 20 by default and 50 at most", async () => {
    const comments = vi.fn().mockResolvedValue({ items: [] });
    const ctx = makeContext({ apis: { blogApi: { comments } } });

    await blogResolvers.Query.blogComments({}, { postId: "p1" }, ctx);
    await blogResolvers.Query.blogComments(
      {},
      { postId: "p1", page: 2, size: 999 },
      ctx,
    );

    expect(comments.mock.calls).toEqual([
      ["p1", { page: 0, size: 20 }],
      ["p1", { page: 2, size: 50 }],
    ]);
  });

  it("reads the tag catalogue", async () => {
    const catalogue = { skills: ["WRITING"], levels: ["B2"], certificates: [] };
    const tagCatalogue = vi.fn().mockResolvedValue(catalogue);
    const ctx = makeContext({ apis: { blogApi: { tagCatalogue } } });

    expect(await blogResolvers.Query.blogTagCatalogue({}, {}, ctx)).toBe(
      catalogue,
    );
  });
});

describe("saving a post", () => {
  const input = {
    title: "T",
    body: "B ![](blog-image:i1)",
    tags: [{ kind: "SKILL" as const, value: "WRITING" }],
  };

  it("creates with the input as given", async () => {
    const create = vi.fn().mockResolvedValue({ id: "p1" });
    const ctx = makeContext({ apis: { blogApi: { create } } });

    await blogResolvers.Mutation.createBlogPost({}, { input }, ctx);

    expect(create).toHaveBeenCalledWith(input);
  });

  it("updates with the version the editor opened joined to the input", async () => {
    const update = vi.fn().mockResolvedValue({ id: "p1" });
    const ctx = makeContext({ apis: { blogApi: { update } } });

    await blogResolvers.Mutation.updateBlogPost(
      {},
      { id: "p1", input, version: 7 },
      ctx,
    );

    expect(update).toHaveBeenCalledWith("p1", { ...input, version: 7 });
  });

  it("lets BLOG_POST_STALE through with its code", async () => {
    const update = vi
      .fn()
      .mockRejectedValue(new BackendError("stale", 409, "BLOG_POST_STALE"));
    const ctx = makeContext({ apis: { blogApi: { update } } });

    await expect(
      blogResolvers.Mutation.updateBlogPost(
        {},
        { id: "p1", input, version: 1 },
        ctx,
      ),
    ).rejects.toMatchObject({ status: 409, code: "BLOG_POST_STALE" });
  });

  it("answers true for a delete, which has no body to return", async () => {
    const remove = vi.fn().mockResolvedValue(undefined);
    const removeComment = vi.fn().mockResolvedValue(undefined);
    const ctx = makeContext({ apis: { blogApi: { remove, removeComment } } });

    expect(
      await blogResolvers.Mutation.deleteBlogPost({}, { id: "p1" }, ctx),
    ).toBe(true);
    expect(
      await blogResolvers.Mutation.deleteBlogComment({}, { id: "c1" }, ctx),
    ).toBe(true);
    expect(remove).toHaveBeenCalledWith("p1");
    expect(removeComment).toHaveBeenCalledWith("c1");
  });
});

describe("likes, comments and images", () => {
  it("likes and unlikes, answering with the backend's state", async () => {
    const state = { liked: true, likeCount: 4 };
    const like = vi.fn().mockResolvedValue(state);
    const unlike = vi.fn().mockResolvedValue({ liked: false, likeCount: 3 });
    const ctx = makeContext({ apis: { blogApi: { like, unlike } } });

    expect(
      await blogResolvers.Mutation.likeBlogPost({}, { id: "p1" }, ctx),
    ).toBe(state);
    expect(
      await blogResolvers.Mutation.unlikeBlogPost({}, { id: "p1" }, ctx),
    ).toEqual({ liked: false, likeCount: 3 });
  });

  it("saves and unsaves a post, naming the post in the answer", async () => {
    const save = vi.fn().mockResolvedValue({ saved: true });
    const unsave = vi.fn().mockResolvedValue({ saved: false });
    const ctx = makeContext({ apis: { blogApi: { save, unsave } } });

    expect(
      await blogResolvers.Mutation.saveBlogPost({}, { id: "p1" }, ctx),
    ).toEqual({ postId: "p1", saved: true });
    expect(
      await blogResolvers.Mutation.unsaveBlogPost({}, { id: "p1" }, ctx),
    ).toEqual({ postId: "p1", saved: false });
    expect(save).toHaveBeenCalledWith("p1");
    expect(unsave).toHaveBeenCalledWith("p1");
  });

  it("lets a refused save through for the central formatter to map", async () => {
    const save = vi
      .fn()
      .mockRejectedValue(new BackendError("closed", 409, "BLOG_POST_NOT_OPEN"));
    const ctx = makeContext({ apis: { blogApi: { save } } });

    await expect(
      blogResolvers.Mutation.saveBlogPost({}, { id: "p1" }, ctx),
    ).rejects.toMatchObject({ status: 409, code: "BLOG_POST_NOT_OPEN" });
  });

  it("writes and edits a comment with its text as the body", async () => {
    const createComment = vi.fn().mockResolvedValue({ id: "c1" });
    const updateComment = vi.fn().mockResolvedValue({ id: "c1" });
    const ctx = makeContext({
      apis: { blogApi: { createComment, updateComment } },
    });

    await blogResolvers.Mutation.createBlogComment(
      {},
      { postId: "p1", body: "hi" },
      ctx,
    );
    await blogResolvers.Mutation.updateBlogComment(
      {},
      { id: "c1", body: "hello" },
      ctx,
    );

    expect(createComment).toHaveBeenCalledWith("p1", { body: "hi" });
    expect(updateComment).toHaveBeenCalledWith("c1", { body: "hello" });
  });

  it("asks for an upload URL with the type and the size", async () => {
    const startImageUpload = vi.fn().mockResolvedValue({ imageId: "i1" });
    const ctx = makeContext({ apis: { blogApi: { startImageUpload } } });

    await blogResolvers.Mutation.startBlogImageUpload(
      {},
      { contentType: "image/webp", contentLength: 1234 },
      ctx,
    );

    expect(startImageUpload).toHaveBeenCalledWith({
      contentType: "image/webp",
      contentLength: 1234,
    });
  });
});

describe("reports", () => {
  it("reports a post and a comment, leaving the note out of the body when there is none", async () => {
    const reportPost = vi.fn().mockResolvedValue({ id: "r1" });
    const reportComment = vi.fn().mockResolvedValue({ id: "r2" });
    const ctx = makeContext({
      apis: { blogApi: { reportPost, reportComment } },
    });

    await blogResolvers.Mutation.reportBlogPost(
      {},
      { id: "p1", reason: "SPAM", detail: null },
      ctx,
    );
    await blogResolvers.Mutation.reportBlogComment(
      {},
      { id: "c1", reason: "OTHER", detail: "why" },
      ctx,
    );

    expect(reportPost).toHaveBeenCalledWith("p1", {
      reason: "SPAM",
      detail: undefined,
    });
    expect(reportComment).toHaveBeenCalledWith("c1", {
      reason: "OTHER",
      detail: "why",
    });
  });

  it("lets BLOG_REPORT_OWN_CONTENT through with its code", async () => {
    const reportPost = vi
      .fn()
      .mockRejectedValue(
        new BackendError("own", 400, "BLOG_REPORT_OWN_CONTENT"),
      );
    const ctx = makeContext({ apis: { blogApi: { reportPost } } });

    await expect(
      blogResolvers.Mutation.reportBlogPost(
        {},
        { id: "p1", reason: "SPAM" },
        ctx,
      ),
    ).rejects.toMatchObject({ code: "BLOG_REPORT_OWN_CONTENT" });
  });
});

describe("moderation", () => {
  it("asks for the queue with the type and the sort as given, 20 by default and 50 at most", async () => {
    const adminQueue = vi.fn().mockResolvedValue({ items: [] });
    const ctx = makeContext({ apis: { blogApi: { adminQueue } } });

    await blogResolvers.Query.adminBlogQueue({}, {}, ctx);
    await blogResolvers.Query.adminBlogQueue(
      {},
      { type: "COMMENT", sort: "MOST_REPORTED", page: 1, size: 200 },
      ctx,
    );

    expect(adminQueue.mock.calls).toEqual([
      [{ type: undefined, sort: undefined, page: 0, size: 20 }],
      [{ type: "COMMENT", sort: "MOST_REPORTED", page: 1, size: 50 }],
    ]);
  });

  it("hands the target's type to the api as the enum - the api is what writes it in lower case", async () => {
    const adminTarget = vi.fn().mockResolvedValue({ targetId: "p1" });
    const ctx = makeContext({ apis: { blogApi: { adminTarget } } });

    await blogResolvers.Query.adminBlogTarget(
      {},
      { type: "COMMENT", id: "c1" },
      ctx,
    );

    expect(adminTarget).toHaveBeenCalledWith("COMMENT", "c1");
  });

  it("acts with the action and the reason, and answers with the content as it is after", async () => {
    const after = { targetStatus: "HIDDEN" };
    const adminModerate = vi.fn().mockResolvedValue(after);
    const ctx = makeContext({ apis: { blogApi: { adminModerate } } });

    expect(
      await blogResolvers.Mutation.adminModerateBlog(
        {},
        { type: "POST", id: "p1", action: "HIDE", reason: "spam" },
        ctx,
      ),
    ).toBe(after);
    expect(adminModerate).toHaveBeenCalledWith("POST", "p1", {
      action: "HIDE",
      reason: "spam",
    });
  });

  it("lets a refusal of moderation through with its code", async () => {
    const adminModerate = vi
      .fn()
      .mockRejectedValue(
        new BackendError("own", 403, "BLOG_MODERATION_OWN_CONTENT"),
      );
    const ctx = makeContext({ apis: { blogApi: { adminModerate } } });

    await expect(
      blogResolvers.Mutation.adminModerateBlog(
        {},
        { type: "POST", id: "p1", action: "HIDE", reason: "x" },
        ctx,
      ),
    ).rejects.toMatchObject({
      status: 403,
      code: "BLOG_MODERATION_OWN_CONTENT",
    });
  });

  it("pages the history of actions", async () => {
    const adminActions = vi.fn().mockResolvedValue({ items: [] });
    const ctx = makeContext({ apis: { blogApi: { adminActions } } });

    await blogResolvers.Query.adminBlogActions({}, { page: 2 }, ctx);

    expect(adminActions).toHaveBeenCalledWith({ page: 2, size: 20 });
  });
});

describe("UserWall.posts", () => {
  it("lists the owner's posts newest first, as the page asked", async () => {
    const page = { items: [], page: 1, size: 5, totalItems: 0, totalPages: 0 };
    const list = vi.fn().mockResolvedValue(page);
    const ctx = makeContext({ apis: { blogApi: { list } } });

    expect(
      await blogResolvers.UserWall.posts(wall(true), { page: 1, size: 5 }, ctx),
    ).toBe(page);
    expect(list).toHaveBeenCalledWith({
      authorId: "u2",
      sort: "NEWEST",
      page: 1,
      size: 5,
    });
  });

  it("asks the backend for nothing when the wall is unavailable", async () => {
    const list = vi.fn();
    const ctx = makeContext({ apis: { blogApi: { list } } });

    expect(await blogResolvers.UserWall.posts(wall(false), {}, ctx)).toBeNull();
    expect(list).not.toHaveBeenCalled();
  });

  it("defaults to 20 and caps at 50 like every other list", async () => {
    const list = vi.fn().mockResolvedValue({ items: [] });
    const ctx = makeContext({ apis: { blogApi: { list } } });

    await blogResolvers.UserWall.posts(wall(true), {}, ctx);
    await blogResolvers.UserWall.posts(wall(true), { size: 900 }, ctx);

    expect(list.mock.calls.map(([params]) => params.size)).toEqual([20, 50]);
  });
});
