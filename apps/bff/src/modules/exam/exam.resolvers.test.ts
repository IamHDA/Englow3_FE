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

  it("forwards filters and decorates items with bestScore and attemptStatus", async () => {
    const searchAsLearner = vi.fn().mockResolvedValue({
      items: [{ id: "exam-1", title: "Test 1" }],
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
      bestScore: null,
      attemptStatus: "NOT_STARTED",
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
    const getByIdAsLearner = vi.fn().mockResolvedValue({ id: "exam-1", title: "Detail" });
    const ctx = makeContext(vi.fn(), {}, { getByIdAsLearner });

    const res = await examResolvers.Query.exam({}, { id: "exam-1" }, ctx);

    expect(getByIdAsLearner).toHaveBeenCalledWith("exam-1");
    expect(res).toEqual({ id: "exam-1", title: "Detail" });
  });
});

describe("Query.examPaper", () => {
  it("fails before calling the backend when there is no token", () => {
    const getPaperAsLearner = vi.fn();
    const ctx = makeContext(
      vi.fn(),
      {
        requireToken: () => {
          throw new GraphQLError("Missing or invalid access token", {
            extensions: { code: "UNAUTHENTICATED" },
          });
        },
      },
      { getPaperAsLearner },
    );

    expect(() => examResolvers.Query.examPaper({}, { id: "exam-1" }, ctx)).toThrow(
      "Missing or invalid access token",
    );
    expect(getPaperAsLearner).not.toHaveBeenCalled();
  });

  it("forwards id to getPaperAsLearner", async () => {
    const getPaperAsLearner = vi.fn().mockResolvedValue({ id: "exam-1", sections: [] });
    const ctx = makeContext(vi.fn(), {}, { getPaperAsLearner });

    const res = await examResolvers.Query.examPaper({}, { id: "exam-1" }, ctx);

    expect(getPaperAsLearner).toHaveBeenCalledWith("exam-1");
    expect(res).toEqual({ id: "exam-1", sections: [] });
  });
});

