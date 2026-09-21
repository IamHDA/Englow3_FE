import { GraphQLError } from "graphql";
import { describe, expect, it, vi } from "vitest";

import { learningResolvers } from "./learning.resolvers.js";
import type { GraphQLContext } from "../../graphql/context.js";

function makeContext(
  learningApiOverrides: Record<string, unknown> = {},
  overrides: Partial<GraphQLContext> = {},
): GraphQLContext {
  return {
    token: "token",
    requireToken: () => "token",
    apis: {
      userApi: {} as any,
      onboardingApi: {} as any,
      examApi: {} as any,
      learningApi: learningApiOverrides as any,
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

describe("Query.flashcardSets", () => {
  it("fails before calling the backend when there is no token", () => {
    const searchFlashcardSets = vi.fn();
    const ctx = makeContext({ searchFlashcardSets }, unauthenticated());

    expect(() => learningResolvers.Query.flashcardSets({}, {}, ctx)).toThrow(
      "Missing or invalid access token",
    );
    expect(searchFlashcardSets).not.toHaveBeenCalled();
  });

  it("caps the page size so a client cannot ask for the whole table", async () => {
    const searchFlashcardSets = vi.fn().mockResolvedValue({ items: [] });
    const ctx = makeContext({ searchFlashcardSets });

    await learningResolvers.Query.flashcardSets({}, { size: 5000 }, ctx);

    expect(searchFlashcardSets).toHaveBeenCalledWith({ size: 100 });
  });

  it("forwards the filters as given", async () => {
    const searchFlashcardSets = vi.fn().mockResolvedValue({ items: [] });
    const ctx = makeContext({ searchFlashcardSets });

    await learningResolvers.Query.flashcardSets(
      {},
      { topic: "TOEIC", title: "unit 1", page: 2, size: 10 },
      ctx,
    );

    expect(searchFlashcardSets).toHaveBeenCalledWith({
      topic: "TOEIC",
      title: "unit 1",
      page: 2,
      size: 10,
    });
  });
});

describe("Query.flashcardStudyQueue", () => {
  it("caps the queue length", async () => {
    const getStudyQueue = vi.fn().mockResolvedValue([]);
    const ctx = makeContext({ getStudyQueue });

    await learningResolvers.Query.flashcardStudyQueue(
      {},
      { setId: "set-1", limit: 5000 },
      ctx,
    );

    expect(getStudyQueue).toHaveBeenCalledWith("set-1", 100);
  });

  /** The order is the schedule. Re-sorting here would quietly undo spaced repetition. */
  it("passes the backend's ordering through untouched", async () => {
    const queue = [{ id: "due-card" }, { id: "unseen-card" }];
    const getStudyQueue = vi.fn().mockResolvedValue(queue);
    const ctx = makeContext({ getStudyQueue });

    const result = await learningResolvers.Query.flashcardStudyQueue(
      {},
      { setId: "set-1" },
      ctx,
    );

    expect(result).toEqual(queue);
  });
});

describe("Mutation.rateFlashcard", () => {
  it("fails before calling the backend when there is no token", () => {
    const rateFlashcard = vi.fn();
    const ctx = makeContext({ rateFlashcard }, unauthenticated());

    expect(() =>
      learningResolvers.Mutation.rateFlashcard(
        {},
        { flashcardId: "card-1", rating: "GOOD", timeSpentSeconds: 4 },
        ctx,
      ),
    ).toThrow("Missing or invalid access token");
    expect(rateFlashcard).not.toHaveBeenCalled();
  });

  it("splits the card id from the body the backend expects", async () => {
    const rateFlashcard = vi
      .fn()
      .mockResolvedValue({ flashcardId: "card-1", status: "LEARNING" });
    const ctx = makeContext({ rateFlashcard });

    const result = await learningResolvers.Mutation.rateFlashcard(
      {},
      { flashcardId: "card-1", rating: "GOOD", timeSpentSeconds: 4 },
      ctx,
    );

    expect(rateFlashcard).toHaveBeenCalledWith("card-1", {
      rating: "GOOD",
      timeSpentSeconds: 4,
    });
    expect(result).toEqual({ flashcardId: "card-1", status: "LEARNING" });
  });
});
