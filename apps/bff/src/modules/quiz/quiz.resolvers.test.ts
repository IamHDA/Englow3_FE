import { describe, expect, it, vi } from "vitest";

import { quizResolvers } from "./quiz.resolvers.js";
import { makeContext } from "../../test/makeContext.js";

describe("Query.quizzes", () => {
  it("caps the page size so a client cannot ask for the whole table", async () => {
    const searchQuizzes = vi.fn().mockResolvedValue({ items: [] });
    const ctx = makeContext({ apis: { quizApi: { searchQuizzes } } });

    await quizResolvers.Query.quizzes({}, { size: 5000 }, ctx);

    expect(searchQuizzes).toHaveBeenCalledWith({ size: 100 });
  });
});

describe("Query.quizPaper", () => {
  it("fails before calling the backend when there is no token", () => {
    const getQuizPaper = vi.fn();
    const ctx = makeContext({
      token: null,
      apis: { quizApi: { getQuizPaper } },
    });

    expect(() =>
      quizResolvers.Query.quizPaper({}, { attemptId: "attempt-1" }, ctx),
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
    const ctx = makeContext({ apis: { quizApi: { getQuizPaper } } });

    const result = await quizResolvers.Query.quizPaper(
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
    const ctx = makeContext({ apis: { quizApi: { submitQuizAttempt } } });
    const answers = [{ questionId: "q1", response: "opt-b" }];

    await quizResolvers.Mutation.submitQuizAttempt(
      {},
      { attemptId: "attempt-1", answers },
      ctx,
    );

    expect(submitQuizAttempt).toHaveBeenCalledWith("attempt-1", { answers });
  });
});
