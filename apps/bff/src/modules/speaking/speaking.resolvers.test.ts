import { GraphQLError } from "graphql";
import { describe, expect, it, vi } from "vitest";

import { speakingResolvers } from "./speaking.resolvers.js";
import type { GraphQLContext } from "../../graphql/context.js";

function makeContext(
  speakingApiOverrides: Record<string, unknown> = {},
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
      speakingApi: speakingApiOverrides as any,
      tutorApi: {} as any,
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

describe("Query.speakingPrompts", () => {
  it("fails before calling the backend when there is no token", () => {
    const searchPrompts = vi.fn();
    const ctx = makeContext({ searchPrompts }, unauthenticated());

    expect(() => speakingResolvers.Query.speakingPrompts({}, {}, ctx)).toThrow(
      "Missing or invalid access token",
    );
    expect(searchPrompts).not.toHaveBeenCalled();
  });

  it("caps the page size so a client cannot ask for the whole table", async () => {
    const searchPrompts = vi.fn().mockResolvedValue({ items: [] });
    const ctx = makeContext({ searchPrompts });

    await speakingResolvers.Query.speakingPrompts({}, { size: 5000 }, ctx);

    expect(searchPrompts).toHaveBeenCalledWith({ size: 100 });
  });
});

describe("Mutation.startSpeakingAttempt", () => {
  it("fails before calling the backend when there is no token", () => {
    const startAttempt = vi.fn();
    const ctx = makeContext({ startAttempt }, unauthenticated());

    expect(() =>
      speakingResolvers.Mutation.startSpeakingAttempt(
        {},
        { promptId: "p-1", contentType: "audio/wav", contentLength: 1024 },
        ctx,
      ),
    ).toThrow("Missing or invalid access token");
    expect(startAttempt).not.toHaveBeenCalled();
  });

  /**
   * The format travels as given. Quietly substituting one the backend accepts
   * would upload audio that is not what it claims to be, and the failure would
   * surface at assessment time reading like a provider problem.
   */
  it("forwards an unsupported format rather than correcting it", async () => {
    const startAttempt = vi.fn().mockResolvedValue({ attemptId: "a-1" });
    const ctx = makeContext({ startAttempt });

    await speakingResolvers.Mutation.startSpeakingAttempt(
      {},
      { promptId: "p-1", contentType: "audio/mpeg", contentLength: 1024 },
      ctx,
    );

    expect(startAttempt).toHaveBeenCalledWith("p-1", "audio/mpeg", 1024);
  });

  /**
   * The size travels as declared. Clamping it here would produce a signature
   * bound to one number and a body of another, which fails at the bucket with
   * an error about signatures rather than about size - the backend refuses an
   * oversized request itself, with a message that says so.
   */
  it("forwards an oversized length rather than clamping it", async () => {
    const startAttempt = vi.fn().mockResolvedValue({ attemptId: "a-1" });
    const ctx = makeContext({ startAttempt });

    await speakingResolvers.Mutation.startSpeakingAttempt(
      {},
      {
        promptId: "p-1",
        contentType: "audio/wav",
        contentLength: 999_000_000,
      },
      ctx,
    );

    expect(startAttempt).toHaveBeenCalledWith("p-1", "audio/wav", 999_000_000);
  });
});

describe("Mutation.submitSpeakingAttempt", () => {
  it("fails before calling the backend when there is no token", () => {
    const submitAttempt = vi.fn();
    const ctx = makeContext({ submitAttempt }, unauthenticated());

    expect(() =>
      speakingResolvers.Mutation.submitSpeakingAttempt(
        {},
        { attemptId: "a-1" },
        ctx,
      ),
    ).toThrow("Missing or invalid access token");
    expect(submitAttempt).not.toHaveBeenCalled();
  });

  it("asks the backend to queue the assessment", async () => {
    const submitAttempt = vi.fn().mockResolvedValue({ status: "QUEUED" });
    const ctx = makeContext({ submitAttempt });

    await speakingResolvers.Mutation.submitSpeakingAttempt(
      {},
      { attemptId: "a-1" },
      ctx,
    );

    expect(submitAttempt).toHaveBeenCalledWith("a-1");
  });
});
