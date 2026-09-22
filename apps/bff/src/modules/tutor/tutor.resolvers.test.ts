import { GraphQLError } from "graphql";
import { describe, expect, it, vi } from "vitest";

import { tutorResolvers } from "./tutor.resolvers.js";
import type { GraphQLContext } from "../../graphql/context.js";

function makeContext(
  tutorApiOverrides: Record<string, unknown> = {},
  overrides: Partial<GraphQLContext> = {},
): GraphQLContext {
  return {
    token: "token",
    requireToken: () => "token",
    apis: {
      userApi: {} as any,
      onboardingApi: {} as any,
      examApi: {} as any,
      learningApi: {} as any,
      speakingApi: {} as any,
      tutorApi: tutorApiOverrides as any,
    },
    ...overrides,
  };
}

function unauthenticated(): Partial<GraphQLContext> {
  return {
    requireToken: () => {
      throw new GraphQLError("Missing or invalid access token", {
        extensions: { code: "UNAUTHENTICATED" },
      });
    },
  };
}

describe("Query.tutorConversations", () => {
  it("fails before calling the backend when there is no token", () => {
    const getConversations = vi.fn();
    const ctx = makeContext({ getConversations }, unauthenticated());

    expect(() => tutorResolvers.Query.tutorConversations({}, {}, ctx)).toThrow(
      "Missing or invalid access token",
    );
    expect(getConversations).not.toHaveBeenCalled();
  });

  it("returns what the backend returned", async () => {
    const threads = [{ id: "c1", title: "What is a gerund?" }];
    const ctx = makeContext({
      getConversations: vi.fn().mockResolvedValue(threads),
    });

    await expect(
      tutorResolvers.Query.tutorConversations({}, {}, ctx),
    ).resolves.toBe(threads);
  });
});

describe("Query.tutorConversation", () => {
  it("fails before calling the backend when there is no token", () => {
    const getConversation = vi.fn();
    const ctx = makeContext({ getConversation }, unauthenticated());

    expect(() =>
      tutorResolvers.Query.tutorConversation({}, { id: "c1" }, ctx),
    ).toThrow("Missing or invalid access token");
    expect(getConversation).not.toHaveBeenCalled();
  });

  it("asks for the thread the caller named", () => {
    const getConversation = vi.fn().mockResolvedValue({});
    const ctx = makeContext({ getConversation });

    tutorResolvers.Query.tutorConversation({}, { id: "c1" }, ctx);

    expect(getConversation).toHaveBeenCalledWith("c1");
  });
});

describe("Mutation.sendTutorMessage", () => {
  it("fails before calling the backend when there is no token", () => {
    const sendMessage = vi.fn();
    const ctx = makeContext({ sendMessage }, unauthenticated());

    expect(() =>
      tutorResolvers.Mutation.sendTutorMessage(
        {},
        { message: "What is a gerund?" },
        ctx,
      ),
    ).toThrow("Missing or invalid access token");
    expect(sendMessage).not.toHaveBeenCalled();
  });

  // Forwarded as typed. Trimming or truncating here would send the tutor
  // something the learner did not write, and they would be reading an answer to
  // a question they never asked.
  it("forwards the message exactly as it was typed", () => {
    const sendMessage = vi.fn().mockResolvedValue({});
    const ctx = makeContext({ sendMessage });

    tutorResolvers.Mutation.sendTutorMessage(
      {},
      { message: "  what is a GERUND?  ", topic: "grammar" },
      ctx,
    );

    expect(sendMessage).toHaveBeenCalledWith({
      message: "  what is a GERUND?  ",
      topic: "grammar",
    });
  });

  it("starts a new thread when no conversation is named", () => {
    const sendMessage = vi.fn().mockResolvedValue({});
    const ctx = makeContext({ sendMessage });

    tutorResolvers.Mutation.sendTutorMessage({}, { message: "hello" }, ctx);

    expect(sendMessage.mock.calls[0][0].conversationId).toBeUndefined();
  });

  it("continues an existing thread when one is named", () => {
    const sendMessage = vi.fn().mockResolvedValue({});
    const ctx = makeContext({ sendMessage });

    tutorResolvers.Mutation.sendTutorMessage(
      {},
      { conversationId: "c1", message: "and an example?" },
      ctx,
    );

    expect(sendMessage.mock.calls[0][0].conversationId).toBe("c1");
  });

  // Refused here rather than after a round trip. The whole message is re-sent
  // with every later question in the thread, so the cap is about what the
  // conversation costs from here on, not just this one request.
  it("refuses a message longer than the backend would take", () => {
    const sendMessage = vi.fn();
    const ctx = makeContext({ sendMessage });

    expect(() =>
      tutorResolvers.Mutation.sendTutorMessage(
        {},
        { message: "x".repeat(4_001) },
        ctx,
      ),
    ).toThrow("at most 4000 characters");
    expect(sendMessage).not.toHaveBeenCalled();
  });

  it("accepts a message exactly at the limit", () => {
    const sendMessage = vi.fn().mockResolvedValue({});
    const ctx = makeContext({ sendMessage });

    tutorResolvers.Mutation.sendTutorMessage(
      {},
      { message: "x".repeat(4_000) },
      ctx,
    );

    expect(sendMessage).toHaveBeenCalled();
  });
});

describe("Mutation.reportTutorMessage", () => {
  it("fails before calling the backend when there is no token", () => {
    const reportMessage = vi.fn();
    const ctx = makeContext({ reportMessage }, unauthenticated());

    expect(() =>
      tutorResolvers.Mutation.reportTutorMessage(
        {},
        { conversationId: "c1", messageId: "m1" },
        ctx,
      ),
    ).toThrow("Missing or invalid access token");
    expect(reportMessage).not.toHaveBeenCalled();
  });

  // A learner who can see the answer is wrong should not have to explain why in
  // order to say so.
  it("sends a report with no note", () => {
    const reportMessage = vi.fn().mockResolvedValue({});
    const ctx = makeContext({ reportMessage });

    tutorResolvers.Mutation.reportTutorMessage(
      {},
      { conversationId: "c1", messageId: "m1" },
      ctx,
    );

    expect(reportMessage).toHaveBeenCalledWith("c1", "m1", undefined);
  });

  it("passes the learner's note through", () => {
    const reportMessage = vi.fn().mockResolvedValue({});
    const ctx = makeContext({ reportMessage });

    tutorResolvers.Mutation.reportTutorMessage(
      {},
      { conversationId: "c1", messageId: "m1", note: "That rule is wrong." },
      ctx,
    );

    expect(reportMessage).toHaveBeenCalledWith("c1", "m1", "That rule is wrong.");
  });
});

describe("Mutation.archiveTutorConversation", () => {
  it("fails before calling the backend when there is no token", () => {
    const archiveConversation = vi.fn();
    const ctx = makeContext({ archiveConversation }, unauthenticated());

    expect(() =>
      tutorResolvers.Mutation.archiveTutorConversation({}, { id: "c1" }, ctx),
    ).toThrow("Missing or invalid access token");
    expect(archiveConversation).not.toHaveBeenCalled();
  });
});
