import { GraphQLError } from "graphql";
import { describe, expect, it, vi } from "vitest";

import { examResolvers } from "./exam.resolvers.js";
import type { GraphQLContext } from "../../graphql/context.js";

function makeContext(
  searchAsAdmin = vi.fn(),
  overrides: Partial<GraphQLContext> = {},
  examApiOverrides: Record<string, unknown> = {},
): GraphQLContext {
  return {
    token: "token",
    requireToken: () => "token",
    apis: {
      userApi: {} as any,
      onboardingApi: {} as any,
      examApi: { searchAsAdmin, ...examApiOverrides } as any,
      learningApi: {} as any,
    },
    ...overrides,
  };
}

describe("Query.adminExams", () => {
  it("fails before calling the backend when there is no token", () => {
    const searchAsAdmin = vi.fn();
    const ctx = makeContext(searchAsAdmin, {
      requireToken: () => {
        throw new GraphQLError("Missing or invalid access token", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      },
    });

    expect(() => examResolvers.Query.adminExams({}, {}, ctx)).toThrow(
      "Missing or invalid access token",
    );
    expect(searchAsAdmin).not.toHaveBeenCalled();
  });

  it("forwards the filters and pagination as given", async () => {
    const searchAsAdmin = vi.fn().mockResolvedValue({ items: [] });
    const ctx = makeContext(searchAsAdmin);

    await examResolvers.Query.adminExams(
      {},
      { status: "DRAFT", examType: "MOCK", title: "toeic", page: 2, size: 50 },
      ctx,
    );

    expect(searchAsAdmin).toHaveBeenCalledWith({
      status: "DRAFT",
      examType: "MOCK",
      title: "toeic",
      page: 2,
      size: 50,
    });
  });

  it("caps the page size so a client cannot ask for the whole table", async () => {
    const searchAsAdmin = vi.fn().mockResolvedValue({ items: [] });
    const ctx = makeContext(searchAsAdmin);

    await examResolvers.Query.adminExams({}, { size: 5000 }, ctx);

    expect(searchAsAdmin).toHaveBeenCalledWith({ size: 100 });
  });
});

describe("Mutation.publishExam", () => {
  it("fails before calling the backend when there is no token", () => {
    const publishAsAdmin = vi.fn();
    const ctx = makeContext(
      vi.fn(),
      {
        requireToken: () => {
          throw new GraphQLError("Missing or invalid access token", {
            extensions: { code: "UNAUTHENTICATED" },
          });
        },
      },
      { publishAsAdmin },
    );

    expect(() =>
      examResolvers.Mutation.publishExam({}, { id: "exam-1" }, ctx),
    ).toThrow("Missing or invalid access token");
    expect(publishAsAdmin).not.toHaveBeenCalled();
  });

  it("forwards the id to the backend", async () => {
    const publishAsAdmin = vi.fn().mockResolvedValue({ id: "exam-1" });
    const ctx = makeContext(vi.fn(), {}, { publishAsAdmin });

    await examResolvers.Mutation.publishExam({}, { id: "exam-1" }, ctx);

    expect(publishAsAdmin).toHaveBeenCalledWith("exam-1");
  });
});

describe("Mutation.archiveExam", () => {
  it("fails before calling the backend when there is no token", () => {
    const archiveAsAdmin = vi.fn();
    const ctx = makeContext(
      vi.fn(),
      {
        requireToken: () => {
          throw new GraphQLError("Missing or invalid access token", {
            extensions: { code: "UNAUTHENTICATED" },
          });
        },
      },
      { archiveAsAdmin },
    );

    expect(() =>
      examResolvers.Mutation.archiveExam({}, { id: "exam-1" }, ctx),
    ).toThrow("Missing or invalid access token");
    expect(archiveAsAdmin).not.toHaveBeenCalled();
  });

  it("forwards the id to the backend", async () => {
    const archiveAsAdmin = vi.fn().mockResolvedValue({ id: "exam-1" });
    const ctx = makeContext(vi.fn(), {}, { archiveAsAdmin });

    await examResolvers.Mutation.archiveExam({}, { id: "exam-1" }, ctx);

    expect(archiveAsAdmin).toHaveBeenCalledWith("exam-1");
  });
});

describe("Query.exams", () => {
  it("fails before calling the backend when there is no token", async () => {
    const searchAsLearner = vi.fn();
    const ctx = makeContext(
      vi.fn(),
      {
        requireToken: () => {
          throw new GraphQLError("Missing or invalid access token", {
            extensions: { code: "UNAUTHENTICATED" },
          });
        },
      },
      { searchAsLearner },
    );

    await expect(examResolvers.Query.exams({}, {}, ctx)).rejects.toThrow(
      "Missing or invalid access token",
    );
    expect(searchAsLearner).not.toHaveBeenCalled();
  });

  /**
   * The per-learner figures used to be invented here - null and NOT_STARTED for
   * everyone. They come from the backend now, so this asserts the page is
   * passed through rather than rewritten.
   */
  it("forwards filters and passes the learner's own figures through untouched", async () => {
    const searchAsLearner = vi.fn().mockResolvedValue({
      items: [
        {
          id: "exam-1",
          title: "Test 1",
          bestScorePercentage: 82.5,
          attemptStatus: "COMPLETED",
        },
      ],
      page: 0,
      size: 20,
      totalItems: 1,
      totalPages: 1,
    });
    const ctx = makeContext(vi.fn(), {}, { searchAsLearner });

    const res = await examResolvers.Query.exams(
      {},
      { certificateType: "TOEIC", targetLevel: "B1", page: 0, size: 20 },
      ctx,
    );

    expect(searchAsLearner).toHaveBeenCalledWith({
      certificateType: "TOEIC",
      targetLevel: "B1",
      page: 0,
      size: 20,
    });
    expect(res.items[0]).toEqual({
      id: "exam-1",
      title: "Test 1",
      bestScorePercentage: 82.5,
      attemptStatus: "COMPLETED",
    });
  });
});

describe("Query.exam", () => {
  it("fails before calling the backend when there is no token", () => {
    const getByIdAsLearner = vi.fn();
    const ctx = makeContext(
      vi.fn(),
      {
        requireToken: () => {
          throw new GraphQLError("Missing or invalid access token", {
            extensions: { code: "UNAUTHENTICATED" },
          });
        },
      },
      { getByIdAsLearner },
    );

    expect(() => examResolvers.Query.exam({}, { id: "exam-1" }, ctx)).toThrow(
      "Missing or invalid access token",
    );
    expect(getByIdAsLearner).not.toHaveBeenCalled();
  });

  it("forwards id to getByIdAsLearner", async () => {
    const getByIdAsLearner = vi
      .fn()
      .mockResolvedValue({ id: "exam-1", title: "Detail" });
    const ctx = makeContext(vi.fn(), {}, { getByIdAsLearner });

    const res = await examResolvers.Query.exam({}, { id: "exam-1" }, ctx);

    expect(getByIdAsLearner).toHaveBeenCalledWith("exam-1");
    expect(res).toEqual({ id: "exam-1", title: "Detail" });
  });
});

describe("Query.attemptPaper", () => {
  it("fails before calling the backend when there is no token", () => {
    const getAttemptPaper = vi.fn();
    const ctx = makeContext(
      vi.fn(),
      {
        requireToken: () => {
          throw new GraphQLError("Missing or invalid access token", {
            extensions: { code: "UNAUTHENTICATED" },
          });
        },
      },
      { getAttemptPaper },
    );

    expect(() =>
      examResolvers.Query.attemptPaper({}, { attemptId: "attempt-1" }, ctx),
    ).toThrow("Missing or invalid access token");
    expect(getAttemptPaper).not.toHaveBeenCalled();
  });

  it("reads the paper by attempt id, never by exam id", async () => {
    const getAttemptPaper = vi
      .fn()
      .mockResolvedValue({ id: "exam-1", sections: [] });
    const ctx = makeContext(vi.fn(), {}, { getAttemptPaper });

    const res = await examResolvers.Query.attemptPaper(
      {},
      { attemptId: "attempt-1" },
      ctx,
    );

    expect(getAttemptPaper).toHaveBeenCalledWith("attempt-1");
    expect(res).toEqual({ id: "exam-1", sections: [] });
  });
});

describe("Mutation.startExamAttempt", () => {
  it("fails before calling the backend when there is no token", () => {
    const startAttempt = vi.fn();
    const ctx = makeContext(
      vi.fn(),
      {
        requireToken: () => {
          throw new GraphQLError("Missing or invalid access token", {
            extensions: { code: "UNAUTHENTICATED" },
          });
        },
      },
      { startAttempt },
    );

    expect(() =>
      examResolvers.Mutation.startExamAttempt({}, { examId: "exam-1" }, ctx),
    ).toThrow("Missing or invalid access token");
    expect(startAttempt).not.toHaveBeenCalled();
  });

  it("passes the resumed attempt through rather than starting a second one", async () => {
    const startAttempt = vi
      .fn()
      .mockResolvedValue({ id: "attempt-1", resumed: true });
    const ctx = makeContext(vi.fn(), {}, { startAttempt });

    const res = await examResolvers.Mutation.startExamAttempt(
      {},
      { examId: "exam-1" },
      ctx,
    );

    expect(startAttempt).toHaveBeenCalledTimes(1);
    expect(startAttempt).toHaveBeenCalledWith("exam-1");
    expect(res).toEqual({ id: "attempt-1", resumed: true });
  });
});

describe("Mutation.submitExamAttempt", () => {
  it("forwards the answers untouched - scoring is the backend's call", async () => {
    const submitAttempt = vi
      .fn()
      .mockResolvedValue({ id: "attempt-1", status: "SCORED" });
    const ctx = makeContext(vi.fn(), {}, { submitAttempt });
    const answers = [{ questionId: "q-1", selectedOptionIds: ["o-1"] }];

    const res = await examResolvers.Mutation.submitExamAttempt(
      {},
      { attemptId: "attempt-1", answers },
      ctx,
    );

    expect(submitAttempt).toHaveBeenCalledWith("attempt-1", answers);
    expect(res).toEqual({ id: "attempt-1", status: "SCORED" });
  });
});
