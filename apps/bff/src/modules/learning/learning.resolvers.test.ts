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
      speakingApi: {} as any,
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

describe("Query.quizzes", () => {
  it("caps the page size so a client cannot ask for the whole table", async () => {
    const searchQuizzes = vi.fn().mockResolvedValue({ items: [] });
    const ctx = makeContext({ searchQuizzes });

    await learningResolvers.Query.quizzes({}, { size: 5000 }, ctx);

    expect(searchQuizzes).toHaveBeenCalledWith({ size: 100 });
  });
});

describe("Query.quizPaper", () => {
  it("fails before calling the backend when there is no token", () => {
    const getQuizPaper = vi.fn();
    const ctx = makeContext({ getQuizPaper }, unauthenticated());

    expect(() =>
      learningResolvers.Query.quizPaper({}, { attemptId: "attempt-1" }, ctx),
    ).toThrow("Missing or invalid access token");
    expect(getQuizPaper).not.toHaveBeenCalled();
  });

  /** The shuffle is the backend's, seeded per attempt. Reordering here would deal a new puzzle on every load. */
  it("passes the question order and the shuffled halves through untouched", async () => {
    const paper = {
      questions: [
        { id: "q1", rightTexts: ["so we left", "because it rained"] },
      ],
    };
    const getQuizPaper = vi.fn().mockResolvedValue(paper);
    const ctx = makeContext({ getQuizPaper });

    const result = await learningResolvers.Query.quizPaper(
      {},
      { attemptId: "attempt-1" },
      ctx,
    );

    expect(getQuizPaper).toHaveBeenCalledWith("attempt-1");
    expect(result).toBe(paper);
  });
});

describe("Mutation.submitQuizAttempt", () => {
  it("splits the attempt id from the body the backend expects", async () => {
    const submitQuizAttempt = vi
      .fn()
      .mockResolvedValue({ id: "attempt-1", status: "SCORED" });
    const ctx = makeContext({ submitQuizAttempt });
    const answers = [{ questionId: "q1", response: "opt-b" }];

    await learningResolvers.Mutation.submitQuizAttempt(
      {},
      { attemptId: "attempt-1", answers },
      ctx,
    );

    expect(submitQuizAttempt).toHaveBeenCalledWith("attempt-1", { answers });
  });
});

describe("Mutation.submitDictation", () => {
  it("fails before calling the backend when there is no token", () => {
    const submitDictation = vi.fn();
    const ctx = makeContext({ submitDictation }, unauthenticated());

    expect(() =>
      learningResolvers.Mutation.submitDictation(
        {},
        { sentenceId: "s-1", response: "the cat sat" },
        ctx,
      ),
    ).toThrow("Missing or invalid access token");
    expect(submitDictation).not.toHaveBeenCalled();
  });

  /** An empty answer is a real answer - the backend scores it zero rather than rejecting it. */
  it("forwards an empty answer rather than short-circuiting it", async () => {
    const submitDictation = vi
      .fn()
      .mockResolvedValue({ sentenceId: "s-1", accuracyPercent: 0 });
    const ctx = makeContext({ submitDictation });

    await learningResolvers.Mutation.submitDictation(
      {},
      { sentenceId: "s-1", response: "" },
      ctx,
    );

    expect(submitDictation).toHaveBeenCalledWith("s-1", "");
  });
});

describe("Query.dailyPath", () => {
  it("fails before calling the backend when there is no token", () => {
    const getDailyPath = vi.fn();
    const ctx = makeContext({ getDailyPath }, unauthenticated());

    expect(() => learningResolvers.Query.dailyPath({}, {}, ctx)).toThrow(
      "Missing or invalid access token",
    );
    expect(getDailyPath).not.toHaveBeenCalled();
  });

  /**
   * No arguments to forward, and none to accept: a learner id in the query would
   * be a way to read someone else's plan. The backend takes it from the token.
   */
  it("asks for the caller's own path with no arguments", async () => {
    const getDailyPath = vi
      .fn()
      .mockResolvedValue({ streakDays: 3, tasks: [], quests: [] });
    const ctx = makeContext({ getDailyPath });

    const path = await learningResolvers.Query.dailyPath({}, {}, ctx);

    expect(getDailyPath).toHaveBeenCalledWith();
    expect(path).toEqual({ streakDays: 3, tasks: [], quests: [] });
  });
});

describe("Query.adminContent", () => {
  it("fails before calling the backend when there is no token", () => {
    const searchContentForAuthoring = vi.fn();
    const ctx = makeContext({ searchContentForAuthoring }, unauthenticated());

    expect(() =>
      learningResolvers.Query.adminContent({}, { kind: "QUIZ" } as never, ctx),
    ).toThrow("Missing or invalid access token");
    expect(searchContentForAuthoring).not.toHaveBeenCalled();
  });

  it("caps the page size and forwards the kind", async () => {
    const searchContentForAuthoring = vi.fn().mockResolvedValue({ items: [] });
    const ctx = makeContext({ searchContentForAuthoring });

    await learningResolvers.Query.adminContent(
      {},
      { kind: "FLASHCARD_SET", size: 5000 } as never,
      ctx,
    );

    expect(searchContentForAuthoring).toHaveBeenCalledWith({
      kind: "FLASHCARD_SET",
      size: 100,
    });
  });

  /** No status means every status, which is what makes one endpoint serve the queue and the full list. */
  it("leaves status out rather than defaulting it", async () => {
    const searchContentForAuthoring = vi.fn().mockResolvedValue({ items: [] });
    const ctx = makeContext({ searchContentForAuthoring });

    await learningResolvers.Query.adminContent(
      {},
      { kind: "QUIZ" } as never,
      ctx,
    );

    expect(searchContentForAuthoring).toHaveBeenCalledWith({
      kind: "QUIZ",
      size: 20,
    });
  });
});

describe("Mutation.rejectContent", () => {
  it("fails before calling the backend when there is no token", () => {
    const rejectContent = vi.fn();
    const ctx = makeContext({ rejectContent }, unauthenticated());

    expect(() =>
      learningResolvers.Mutation.rejectContent(
        {},
        { kind: "QUIZ", id: "q-1", note: "no" } as never,
        ctx,
      ),
    ).toThrow("Missing or invalid access token");
    expect(rejectContent).not.toHaveBeenCalled();
  });

  /**
   * The rule that a rejection must say why lives in the backend entity. Trimming
   * the note here would hide a blank one from the only check that enforces it.
   */
  it("forwards a blank note rather than short-circuiting it", async () => {
    const rejectContent = vi.fn().mockResolvedValue({ status: "REJECTED" });
    const ctx = makeContext({ rejectContent });

    await learningResolvers.Mutation.rejectContent(
      {},
      { kind: "DICTATION_LESSON", id: "l-1", note: "  " } as never,
      ctx,
    );

    expect(rejectContent).toHaveBeenCalledWith("DICTATION_LESSON", "l-1", "  ");
  });
});

describe("adminContent for speaking prompts", () => {
  /**
   * The speaking module answers with its own record - same lifecycle fields,
   * no item count. A prompt is one sentence rather than a collection, so the
   * count is null instead of a 1 that would tell a reviewer nothing.
   */
  it("passes a speaking prompt through as a content review with no item count", async () => {
    const searchContentForAuthoring = vi.fn().mockResolvedValue({
      items: [{ id: "p-1", title: "Seat vs sit", itemCount: null }],
    });
    const ctx = makeContext({ searchContentForAuthoring });

    const page = await learningResolvers.Query.adminContent(
      {},
      { kind: "SPEAKING_PROMPT" } as never,
      ctx,
    );

    expect(searchContentForAuthoring).toHaveBeenCalledWith({
      kind: "SPEAKING_PROMPT",
      size: 20,
    });
    expect(page.items[0].itemCount).toBeNull();
  });

  it("forwards the kind to the review actions unchanged", async () => {
    const approveContent = vi.fn().mockResolvedValue({ status: "PUBLISHED" });
    const ctx = makeContext({ approveContent });

    await learningResolvers.Mutation.approveContent(
      {},
      { kind: "SPEAKING_PROMPT", id: "p-1" } as never,
      ctx,
    );

    expect(approveContent).toHaveBeenCalledWith("SPEAKING_PROMPT", "p-1");
  });
});
