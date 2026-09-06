import { GraphQLError } from "graphql";
import { describe, expect, it, vi } from "vitest";

import { examResolvers } from "./exam.resolvers.js";
import type { GraphQLContext } from "../../graphql/context.js";

function makeContext(
  searchAsAdmin = vi.fn(),
  overrides: Partial<GraphQLContext> = {},
): GraphQLContext {
  return {
    token: "token",
    requireToken: () => "token",
    apis: {
      userApi: {} as any,
      onboardingApi: {} as any,
      examApi: { searchAsAdmin } as any,
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
