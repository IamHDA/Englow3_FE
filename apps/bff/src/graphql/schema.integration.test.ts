import { ApolloServer } from "@apollo/server";
import { GraphQLError } from "graphql";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import type { GraphQLContext } from "./context.js";
import { formatError } from "./errors.js";
import { resolvers, typeDefs } from "./schema.js";
import type { UserInformationResponse } from "../modules/user/user.types.js";
import { BackendError } from "../shared/http/backendError.js";

function makeContext(overrides: Partial<GraphQLContext> = {}): GraphQLContext {
  return {
    token: "token",
    requireToken: () => "token",
    apis: {
      userApi: { getMe: vi.fn() } as any,
      onboardingApi: { getCurrentState: vi.fn() } as any,
      examApi: {
        searchAsAdmin: vi.fn(),
        publishAsAdmin: vi.fn(),
        archiveAsAdmin: vi.fn(),
      } as any,
    },
    ...overrides,
  };
}

const ME: UserInformationResponse = {
  id: "u1",
  email: "learner@example.com",
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
        userApi: { getMe } as any,
        onboardingApi: { getCurrentState } as any,
        examApi: {} as any,
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
        userApi: { getMe } as any,
        onboardingApi: { getCurrentState } as any,
        examApi: {} as any,
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
      requireToken: () => {
        throw new GraphQLError("Missing or invalid access token", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      },
      apis: {
        userApi: { getMe } as any,
        onboardingApi: { getCurrentState: vi.fn() } as any,
        examApi: {} as any,
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
        userApi: {} as any,
        onboardingApi: {} as any,
        examApi: { publishAsAdmin, archiveAsAdmin: vi.fn() } as any,
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
        userApi: {} as any,
        onboardingApi: {} as any,
        examApi: { publishAsAdmin, archiveAsAdmin: vi.fn() } as any,
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
        userApi: { updateProfile } as any,
        onboardingApi: {} as any,
        examApi: {} as any,
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
