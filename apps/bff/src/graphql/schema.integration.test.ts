import { ApolloServer } from "@apollo/server";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { formatError } from "./errors.js";
import { resolvers, typeDefs } from "./schema.js";
import type { UserInformationResponse } from "../modules/user/user.types.js";
import { BackendError } from "../shared/http/backendError.js";
import { makeContext } from "../test/makeContext.js";

const ME: UserInformationResponse = {
  id: "u1",
  email: "learner@example.com",
  role: "LEARNER",
  fullName: "Nguyen Van A",
  displayName: "vana",
  gender: null,
  birthDate: null,
  avatarUrl: null,
  bannerUrl: null,
  onboardingStep: "TARGET_SKILLS",
};

describe("me query - schema wiring and partial failure", () => {
  const server = new ApolloServer({ typeDefs, resolvers, formatError });

  beforeAll(() => server.start());
  afterAll(() => server.stop());

  it("does not call onboarding when onboardingState is not selected", async () => {
    const getMe = vi.fn().mockResolvedValue(ME);
    const getCurrentState = vi.fn();
    const ctx = makeContext({
      apis: {
        userApi: { getMe },
        onboardingApi: { getCurrentState },
      },
    });

    const response = await server.executeOperation(
      { query: "query { me { id onboardingStep } }" },
      { contextValue: ctx },
    );
    if (response.body.kind !== "single")
      throw new Error("expected single result");

    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data).toEqual({
      me: { id: "u1", onboardingStep: "TARGET_SKILLS" },
    });
    expect(getCurrentState).not.toHaveBeenCalled();
  });

  it("degrades onboardingState to null with an errors entry, without failing the rest of me", async () => {
    const getMe = vi.fn().mockResolvedValue(ME);
    const getCurrentState = vi
      .fn()
      .mockRejectedValue(new BackendError("boom", 500));
    const ctx = makeContext({
      apis: {
        userApi: { getMe },
        onboardingApi: { getCurrentState },
      },
    });

    const response = await server.executeOperation(
      {
        query:
          "query { me { id onboardingStep onboardingState { currentLevel } } }",
      },
      { contextValue: ctx },
    );
    if (response.body.kind !== "single")
      throw new Error("expected single result");

    expect(response.body.singleResult.data).toEqual({
      me: {
        id: "u1",
        onboardingStep: "TARGET_SKILLS",
        onboardingState: null,
      },
    });
    expect(response.body.singleResult.errors).toHaveLength(1);
    expect(response.body.singleResult.errors?.[0]?.extensions?.code).toBe(
      "INTERNAL_SERVER_ERROR",
    );
    expect(response.body.singleResult.errors?.[0]?.message).not.toContain(
      "boom",
    );
  });

  it("fails the whole query without calling the backend when unauthenticated", async () => {
    const getMe = vi.fn();
    const ctx = makeContext({
      token: null,
      apis: {
        userApi: { getMe },
        onboardingApi: { getCurrentState: vi.fn() },
      },
    });

    const response = await server.executeOperation(
      { query: "query { me { id } }" },
      { contextValue: ctx },
    );
    if (response.body.kind !== "single")
      throw new Error("expected single result");

    expect(response.body.singleResult.data).toBeNull();
    expect(response.body.singleResult.errors?.[0]?.extensions?.code).toBe(
      "UNAUTHENTICATED",
    );
    expect(getMe).not.toHaveBeenCalled();
  });
});

describe("publishExam mutation - schema wiring and error mapping", () => {
  const server = new ApolloServer({ typeDefs, resolvers, formatError });

  beforeAll(() => server.start());
  afterAll(() => server.stop());

  it("returns the published exam on success", async () => {
    const publishAsAdmin = vi.fn().mockResolvedValue({
      id: "exam-1",
      title: "TOEIC Mock 1",
      description: "desc",
      examType: "MOCK",
      certificateType: "TOEIC",
      certificateVariant: "LR",
      targetLevel: "B1",
      durationSeconds: 7200,
      maxRawScore: 200,
      passScore: null,
      status: "PUBLISHED",
      versionNumber: 1,
      createdByUserId: "admin-1",
      publishedAt: "2026-09-06T00:00:00Z",
    });
    const ctx = makeContext({
      apis: {
        examApi: { publishAsAdmin, archiveAsAdmin: vi.fn() },
      },
    });

    const response = await server.executeOperation(
      {
        query:
          'mutation { publishExam(id: "exam-1") { id status publishedAt } }',
      },
      { contextValue: ctx },
    );
    if (response.body.kind !== "single")
      throw new Error("expected single result");

    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data).toEqual({
      publishExam: {
        id: "exam-1",
        status: "PUBLISHED",
        publishedAt: "2026-09-06T00:00:00Z",
      },
    });
    expect(publishAsAdmin).toHaveBeenCalledWith("exam-1");
  });

  it("surfaces the backend's domain code when publish is refused", async () => {
    const publishAsAdmin = vi
      .fn()
      .mockRejectedValue(
        new BackendError(
          "Section scores total 195 but the paper declares 200",
          409,
          "EXAM_SCORE_MISMATCH",
          "trace-9",
        ),
      );
    const ctx = makeContext({
      apis: {
        examApi: { publishAsAdmin, archiveAsAdmin: vi.fn() },
      },
    });

    const response = await server.executeOperation(
      { query: 'mutation { publishExam(id: "exam-1") { id } }' },
      { contextValue: ctx },
    );
    if (response.body.kind !== "single")
      throw new Error("expected single result");

    const error = response.body.singleResult.errors?.[0];
    expect(error?.extensions?.code).toBe("CONFLICT");
    expect(error?.extensions?.backendCode).toBe("EXAM_SCORE_MISMATCH");
    expect(error?.message).not.toContain("195");
  });
});

describe("updateProfile mutation - schema wiring", () => {
  const server = new ApolloServer({ typeDefs, resolvers, formatError });

  beforeAll(() => server.start());
  afterAll(() => server.stop());

  it("calls UserApi.updateProfile and returns updated Me", async () => {
    const updateProfile = vi.fn().mockResolvedValue(ME);
    const ctx = makeContext({
      apis: {
        userApi: { updateProfile },
      },
    });

    const response = await server.executeOperation(
      {
        query: `
          mutation {
            updateProfile(input: { fullName: "Nguyen Van A", displayName: "vana" }) {
              id
              fullName
              displayName
            }
          }
        `,
      },
      { contextValue: ctx },
    );

    if (response.body.kind !== "single")
      throw new Error("expected single result");

    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data).toEqual({
      updateProfile: {
        id: "u1",
        fullName: "Nguyen Van A",
        displayName: "vana",
      },
    });
    expect(updateProfile).toHaveBeenCalledWith({
      fullName: "Nguyen Van A",
      displayName: "vana",
    });
  });
});

describe("userWall query - block rule across friendship and user", () => {
  const server = new ApolloServer({ typeDefs, resolvers, formatError });

  beforeAll(() => server.start());
  afterAll(() => server.stop());

  const WALL_QUERY = `
    query {
      userWall(userId: "u2") {
        available
        relationship { status requestId }
        friendCount
        profile { displayName staff }
      }
    }
  `;

  async function runWall(
    friendshipApi: Record<string, unknown>,
    userApi: Record<string, unknown>,
  ) {
    const response = await server.executeOperation(
      { query: WALL_QUERY },
      { contextValue: makeContext({ apis: { friendshipApi, userApi } }) },
    );
    if (response.body.kind !== "single")
      throw new Error("expected single result");
    return response.body.singleResult;
  }

  it("composes relationship, friend count and profile for a friend", async () => {
    const result = await runWall(
      {
        relationship: vi.fn().mockResolvedValue({
          userId: "u2",
          relationship: "FRIENDS",
          requestId: null,
        }),
        friendCount: vi.fn().mockResolvedValue({ count: 12 }),
      },
      {
        publicProfile: vi.fn().mockResolvedValue({
          userId: "u2",
          displayName: "An",
          avatarUrl: null,
          bannerUrl: null,
          staff: false,
          joinedAt: "2026-01-01T00:00:00Z",
        }),
      },
    );

    expect(result.errors).toBeUndefined();
    expect(result.data).toEqual({
      userWall: {
        available: true,
        relationship: { status: "FRIENDS", requestId: null },
        friendCount: 12,
        profile: { displayName: "An", staff: false },
      },
    });
  });

  it("hides the wall without reading the profile or the count when the REST body says UNAVAILABLE", async () => {
    const friendCount = vi.fn();
    const publicProfile = vi.fn();
    const result = await runWall(
      {
        relationship: vi.fn().mockResolvedValue({
          userId: "u2",
          relationship: "UNAVAILABLE",
          requestId: null,
        }),
        friendCount,
      },
      { publicProfile },
    );

    expect(result.errors).toBeUndefined();
    expect(result.data).toEqual({
      userWall: {
        available: false,
        relationship: { status: "UNAVAILABLE", requestId: null },
        friendCount: null,
        profile: null,
      },
    });
    expect(friendCount).not.toHaveBeenCalled();
    expect(publicProfile).not.toHaveBeenCalled();
  });

  it("shows a missing account as a null profile with the backend's USER_NOT_FOUND code", async () => {
    const result = await runWall(
      {
        relationship: vi.fn().mockResolvedValue({
          userId: "u2",
          relationship: "NOT_APPLICABLE",
          requestId: null,
        }),
        friendCount: vi.fn(),
      },
      {
        publicProfile: vi
          .fn()
          .mockRejectedValue(
            new BackendError("No such user", 404, "USER_NOT_FOUND", "trace-1"),
          ),
      },
    );

    expect(result.data).toEqual({
      userWall: {
        available: true,
        relationship: { status: "NOT_APPLICABLE", requestId: null },
        friendCount: null,
        profile: null,
      },
    });
    expect(result.errors).toHaveLength(1);
    expect(result.errors?.[0]?.extensions).toMatchObject({
      code: "NOT_FOUND",
      backendCode: "USER_NOT_FOUND",
    });
  });

  it("keeps the rest of the wall when only the friend count fails", async () => {
    const result = await runWall(
      {
        relationship: vi.fn().mockResolvedValue({
          userId: "u2",
          relationship: "NONE",
          requestId: null,
        }),
        friendCount: vi.fn().mockRejectedValue(new BackendError("boom", 500)),
      },
      {
        publicProfile: vi.fn().mockResolvedValue({
          userId: "u2",
          displayName: "An",
          avatarUrl: null,
          bannerUrl: null,
          staff: false,
          joinedAt: "2026-01-01T00:00:00Z",
        }),
      },
    );

    expect(result.data).toMatchObject({
      userWall: {
        available: true,
        friendCount: null,
        profile: { displayName: "An" },
      },
    });
    expect(result.errors).toHaveLength(1);
  });

  it("maps a backend refusal of a friend mutation to its backendCode", async () => {
    const sendFriendRequest = vi
      .fn()
      .mockRejectedValue(
        new BackendError(
          "This learner cannot be invited",
          403,
          "FRIEND_REQUEST_NOT_ALLOWED",
        ),
      );
    const response = await server.executeOperation(
      {
        query:
          'mutation { sendFriendRequest(addresseeId: "u2") { requestId status } }',
      },
      {
        contextValue: makeContext({
          apis: { friendshipApi: { send: sendFriendRequest } },
        }),
      },
    );
    if (response.body.kind !== "single")
      throw new Error("expected single result");

    expect(response.body.singleResult.errors?.[0]?.extensions).toMatchObject({
      code: "FORBIDDEN",
      backendCode: "FRIEND_REQUEST_NOT_ALLOWED",
    });
  });
});

describe("chat - schema wiring, the nullable fields and the error contract", () => {
  const server = new ApolloServer({ typeDefs, resolvers, formatError });

  beforeAll(() => server.start());
  afterAll(() => server.stop());

  async function run(
    query: string,
    chatApi: Record<string, unknown>,
    variables?: Record<string, unknown>,
  ) {
    const response = await server.executeOperation(
      { query, variables },
      { contextValue: makeContext({ apis: { chatApi } }) },
    );
    if (response.body.kind !== "single")
      throw new Error("expected single result");
    return response.body.singleResult;
  }

  it("lists a conversation whose other person is gone and that has no message", async () => {
    const result = await run(
      `query {
        chatConversations(page: 0, size: 20) {
          totalItems
          items { id otherUser { displayName } lastSeq unreadCount lastMessage { preview } canSend }
        }
      }`,
      {
        conversations: vi.fn().mockResolvedValue({
          items: [
            {
              id: "c1",
              otherUser: null,
              lastSeq: 12,
              lastReadSeq: 9,
              unreadCount: 3,
              lastMessage: null,
              canSend: null,
            },
          ],
          page: 0,
          size: 20,
          totalItems: 1,
          totalPages: 1,
        }),
      },
    );

    expect(result.errors).toBeUndefined();
    expect(result.data).toEqual({
      chatConversations: {
        totalItems: 1,
        items: [
          {
            id: "c1",
            otherUser: null,
            lastSeq: 12,
            unreadCount: 3,
            lastMessage: null,
            canSend: null,
          },
        ],
      },
    });
  });

  it("reads and writes a seq as a Float, in a variable and in the answer", async () => {
    const messages = vi.fn().mockResolvedValue([
      {
        id: "m1",
        conversationId: "c1",
        seq: 42,
        senderId: null,
        body: null,
        imageUrl: null,
        recalled: true,
        sentAt: "2026-11-16T03:15:58.123456Z",
        clientId: null,
      },
    ]);
    const result = await run(
      `query ($c: ID!, $after: Float) {
        chatMessages(conversationId: $c, afterSeq: $after) { seq recalled senderId sentAt }
      }`,
      { messages },
      { c: "c1", after: 41 },
    );

    expect(result.errors).toBeUndefined();
    expect(result.data).toEqual({
      chatMessages: [
        {
          seq: 42,
          recalled: true,
          senderId: null,
          sentAt: "2026-11-16T03:15:58.123456Z",
        },
      ],
    });
    expect(messages).toHaveBeenCalledWith(
      "c1",
      expect.objectContaining({ afterSeq: 41 }),
    );
  });

  it("maps a refused send to FORBIDDEN with the backend's own code", async () => {
    const result = await run(
      'mutation { sendChatMessage(conversationId: "c1", clientId: "k1", body: "hi") { id } }',
      {
        send: vi
          .fn()
          .mockRejectedValue(
            new BackendError(
              "You can only chat with friends",
              403,
              "CHAT_NOT_FRIENDS",
            ),
          ),
      },
    );

    expect(result.errors?.[0]?.extensions).toMatchObject({
      code: "FORBIDDEN",
      backendCode: "CHAT_NOT_FRIENDS",
    });
    expect(result.errors?.[0]?.message).not.toContain("friends");
  });

  it("answers true for the 204 of marking a conversation read", async () => {
    const result = await run(
      'mutation { markChatRead(conversationId: "c1", upToSeq: 5) }',
      { markRead: vi.fn().mockResolvedValue(undefined) },
    );

    expect(result.data).toEqual({ markChatRead: true });
  });

  /**
   * A ticket is single-use: a query could be answered from a cache or repeated
   * by a client, a mutation never is. The schema must not offer it as a query.
   */
  it("offers the socket ticket only as a mutation", async () => {
    const socketTicket = vi
      .fn()
      .mockResolvedValue({ ticket: "t1", expiresInSeconds: 30 });

    const asQuery = await run("query { chatSocketTicket { ticket } }", {
      socketTicket,
    });
    expect(asQuery.errors).toHaveLength(1);
    expect(socketTicket).not.toHaveBeenCalled();

    const asMutation = await run(
      "mutation { chatSocketTicket { ticket expiresInSeconds } }",
      { socketTicket },
    );
    expect(asMutation.data).toEqual({
      chatSocketTicket: { ticket: "t1", expiresInSeconds: 30 },
    });
  });
});

describe("blog - schema wiring, the wall's posts and the error contract", () => {
  const server = new ApolloServer({ typeDefs, resolvers, formatError });

  beforeAll(() => server.start());
  afterAll(() => server.stop());

  async function run(query: string, apis: Record<string, unknown>) {
    const response = await server.executeOperation(
      { query },
      { contextValue: makeContext({ apis }) },
    );
    if (response.body.kind !== "single")
      throw new Error("expected single result");
    return response.body.singleResult;
  }

  const WALL_POSTS = `
    query {
      userWall(userId: "u2") {
        available
        profile { displayName }
        posts(size: 5) { totalItems items { id title status author { displayName } } }
      }
    }
  `;

  const profile = {
    userId: "u2",
    displayName: "An",
    avatarUrl: null,
    bannerUrl: null,
    staff: false,
    joinedAt: "2026-01-01T00:00:00Z",
  };

  const relationship = (status: string) =>
    vi.fn().mockResolvedValue({
      userId: "u2",
      relationship: status,
      requestId: null,
    });

  it("lists the owner's posts on the wall next to the profile, with their status and an erased author as null", async () => {
    const list = vi.fn().mockResolvedValue({
      items: [
        {
          id: "p1",
          title: "Mine, hidden",
          excerpt: "x",
          author: null,
          status: "HIDDEN",
          tags: [],
          likeCount: 0,
          commentCount: 0,
          likedByMe: false,
          createdAt: "2026-11-16T03:00:00Z",
          editedAt: null,
        },
      ],
      page: 0,
      size: 5,
      totalItems: 1,
      totalPages: 1,
    });
    const result = await run(WALL_POSTS, {
      friendshipApi: {
        relationship: relationship("FRIENDS"),
        friendCount: vi.fn().mockResolvedValue({ count: 1 }),
      },
      userApi: { publicProfile: vi.fn().mockResolvedValue(profile) },
      blogApi: { list },
    });

    expect(result.errors).toBeUndefined();
    expect(result.data).toEqual({
      userWall: {
        available: true,
        profile: { displayName: "An" },
        posts: {
          totalItems: 1,
          items: [
            {
              id: "p1",
              title: "Mine, hidden",
              status: "HIDDEN",
              author: null,
            },
          ],
        },
      },
    });
    expect(list).toHaveBeenCalledWith({
      authorId: "u2",
      sort: "NEWEST",
      page: 0,
      size: 5,
    });
  });

  it("asks for no posts when either side blocked the other", async () => {
    const list = vi.fn();
    const result = await run(WALL_POSTS, {
      friendshipApi: {
        relationship: relationship("BLOCKED_BY_ME"),
        friendCount: vi.fn(),
      },
      userApi: { publicProfile: vi.fn() },
      blogApi: { list },
    });

    expect(result.errors).toBeUndefined();
    expect(result.data).toEqual({
      userWall: { available: false, profile: null, posts: null },
    });
    expect(list).not.toHaveBeenCalled();
  });

  it("keeps the rest of the wall when only the posts fail", async () => {
    const result = await run(WALL_POSTS, {
      friendshipApi: {
        relationship: relationship("NONE"),
        friendCount: vi.fn().mockResolvedValue({ count: 1 }),
      },
      userApi: { publicProfile: vi.fn().mockResolvedValue(profile) },
      blogApi: {
        list: vi.fn().mockRejectedValue(new BackendError("boom", 500)),
      },
    });

    expect(result.data).toEqual({
      userWall: {
        available: true,
        profile: { displayName: "An" },
        posts: null,
      },
    });
    expect(result.errors).toHaveLength(1);
    expect(result.errors?.[0]?.message).not.toContain("boom");
  });

  it("answers recommendations flat through the real schema and keeps an empty list", async () => {
    const summary = {
      id: "p1",
      title: "Speaking drills",
      excerpt: "x",
      author: null,
      status: "PUBLISHED",
      tags: [{ kind: "SKILL", value: "SPEAKING" }],
      likeCount: 2,
      commentCount: 0,
      likedByMe: false,
      savedByMe: true,
      createdAt: "2026-11-16T03:00:00Z",
      editedAt: null,
    };
    const recommendations = vi
      .fn()
      .mockResolvedValueOnce([
        {
          post: summary,
          reason: {
            kind: "PROFILE",
            matchedTags: [{ kind: "SKILL", value: "SPEAKING" }],
          },
        },
      ])
      .mockResolvedValueOnce([]);
    const query = `query {
      blogRecommendations(limit: 3) {
        kind
        matchedTags { kind value }
        post { id savedByMe author { displayName } }
      }
    }`;

    const first = await run(query, { blogApi: { recommendations } });
    const second = await run(query, { blogApi: { recommendations } });

    expect(first.errors).toBeUndefined();
    expect(first.data).toEqual({
      blogRecommendations: [
        {
          kind: "PROFILE",
          matchedTags: [{ kind: "SKILL", value: "SPEAKING" }],
          post: { id: "p1", savedByMe: true, author: null },
        },
      ],
    });
    expect(second.data).toEqual({ blogRecommendations: [] });
    expect(recommendations).toHaveBeenCalledWith({ limit: 3 });
  });

  it("saves and unsaves through the real schema, and maps a refused save to CONFLICT with its backendCode", async () => {
    const save = vi
      .fn()
      .mockResolvedValueOnce({ saved: true })
      .mockRejectedValueOnce(
        new BackendError("closed", 409, "BLOG_POST_NOT_OPEN"),
      );
    const unsave = vi.fn().mockResolvedValue({ saved: false });

    const saved = await run(
      'mutation { saveBlogPost(id: "p1") { postId saved } }',
      { blogApi: { save } },
    );
    const refused = await run('mutation { saveBlogPost(id: "p2") { saved } }', {
      blogApi: { save },
    });
    const unsaved = await run(
      'mutation { unsaveBlogPost(id: "p1") { postId saved } }',
      { blogApi: { unsave } },
    );

    expect(saved.data).toEqual({
      saveBlogPost: { postId: "p1", saved: true },
    });
    expect(refused.errors?.[0]?.extensions).toMatchObject({
      code: "CONFLICT",
      backendCode: "BLOG_POST_NOT_OPEN",
    });
    expect(unsaved.data).toEqual({
      unsaveBlogPost: { postId: "p1", saved: false },
    });
  });

  it("pages the saved posts through the real schema", async () => {
    const savedPosts = vi.fn().mockResolvedValue({
      items: [],
      page: 1,
      size: 12,
      totalItems: 13,
      totalPages: 2,
    });

    const result = await run(
      "query { savedBlogPosts(page: 1, size: 12) { totalItems totalPages items { id } } }",
      { blogApi: { savedPosts } },
    );

    expect(result.data).toEqual({
      savedBlogPosts: { totalItems: 13, totalPages: 2, items: [] },
    });
    expect(savedPosts).toHaveBeenCalledWith({ page: 1, size: 12 });
  });

  it("maps a post that is not there - or not for this viewer - to NOT_FOUND with its backendCode", async () => {
    const result = await run('query { blogPost(id: "p9") { id } }', {
      blogApi: {
        post: vi
          .fn()
          .mockRejectedValue(
            new BackendError("No post", 404, "BLOG_POST_NOT_FOUND", "trace-1"),
          ),
      },
    });

    expect(result.errors?.[0]?.extensions).toMatchObject({
      code: "NOT_FOUND",
      backendCode: "BLOG_POST_NOT_FOUND",
      traceId: "trace-1",
    });
  });

  it("maps a stale edit to CONFLICT with BLOG_POST_STALE, and sends the version", async () => {
    const update = vi
      .fn()
      .mockRejectedValue(new BackendError("stale", 409, "BLOG_POST_STALE"));
    const result = await run(
      `mutation {
        updateBlogPost(
          id: "p1"
          version: 4
          input: { title: "T", body: "B", tags: [{ kind: SKILL, value: "WRITING" }] }
        ) { id }
      }`,
      { blogApi: { update } },
    );

    expect(result.errors?.[0]?.extensions).toMatchObject({
      code: "CONFLICT",
      backendCode: "BLOG_POST_STALE",
    });
    expect(update).toHaveBeenCalledWith("p1", {
      title: "T",
      body: "B",
      tags: [{ kind: "SKILL", value: "WRITING" }],
      version: 4,
    });
  });

  it("maps a learner's refused moderation to FORBIDDEN, and acts through the enum", async () => {
    const adminModerate = vi
      .fn()
      .mockRejectedValue(
        new BackendError("no", 403, "BLOG_MODERATION_OWN_CONTENT"),
      );
    const result = await run(
      `mutation {
        adminModerateBlog(type: POST, id: "p1", action: HIDE, reason: "spam") {
          targetStatus
        }
      }`,
      { blogApi: { adminModerate } },
    );

    expect(result.errors?.[0]?.extensions).toMatchObject({
      code: "FORBIDDEN",
      backendCode: "BLOG_MODERATION_OWN_CONTENT",
    });
    expect(adminModerate).toHaveBeenCalledWith("POST", "p1", {
      action: "HIDE",
      reason: "spam",
    });
  });

  it("shows a moderated target with its deleted content and erased people as null", async () => {
    const adminTarget = vi.fn().mockResolvedValue({
      targetType: "COMMENT",
      targetId: "c1",
      targetStatus: "DELETED",
      content: null,
      author: null,
      reports: [
        {
          id: "r1",
          reporter: null,
          reason: "SPAM",
          detail: null,
          status: "OPEN",
          resolutionNote: null,
          createdAt: "2026-11-16T03:00:00Z",
          resolvedAt: null,
        },
      ],
      actions: [],
    });
    const result = await run(
      `query {
        adminBlogTarget(type: COMMENT, id: "c1") {
          targetStatus
          content { body }
          author { userId }
          reports { reporter { userId } reason status }
        }
      }`,
      { blogApi: { adminTarget } },
    );

    expect(result.errors).toBeUndefined();
    expect(result.data).toEqual({
      adminBlogTarget: {
        targetStatus: "DELETED",
        content: null,
        author: null,
        reports: [{ reporter: null, reason: "SPAM", status: "OPEN" }],
      },
    });
    expect(adminTarget).toHaveBeenCalledWith("COMMENT", "c1");
  });
});
