import { GraphQLError } from "graphql";
import { describe, expect, it, vi } from "vitest";

import { onboardingResolvers } from "./onboarding.resolvers.js";
import type { LearningPurposeResponse } from "./onboarding.types.js";
import type { GraphQLContext } from "../../graphql/context.js";

function makeContext(overrides: Partial<GraphQLContext> = {}): GraphQLContext {
  return {
    token: "token",
    requireToken: () => "token",
    apis: {
      userApi: {} as any,
      onboardingApi: { getLearningPurposes: vi.fn() } as any,
      examApi: {} as any,
    },
    ...overrides,
  };
}

describe("Query.learningPurposes", () => {
  it("fails before calling the backend when there is no token", () => {
    const ctx = makeContext({
      requireToken: () => {
        throw new GraphQLError("Missing or invalid access token", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      },
    });

    expect(() =>
      onboardingResolvers.Query.learningPurposes({}, {}, ctx),
    ).toThrow("Missing or invalid access token");
    expect(ctx.apis.onboardingApi.getLearningPurposes).not.toHaveBeenCalled();
  });

  it("returns the OnboardingApi response directly", async () => {
    const purposes: LearningPurposeResponse[] = [
      { id: 1, purposeCode: "CERTIFICATE", displayName: "Luyện thi chứng chỉ" },
      { id: 11, purposeCode: "TRAVEL", displayName: "Du lịch" },
    ];
    const getLearningPurposes = vi.fn().mockResolvedValue(purposes);
    const ctx = makeContext({
      apis: {
        userApi: {} as any,
        onboardingApi: { getLearningPurposes } as any,
        examApi: {} as any,
      },
    });

    const result = await onboardingResolvers.Query.learningPurposes(
      {},
      {},
      ctx,
    );

    expect(result).toBe(purposes);
    expect(getLearningPurposes).toHaveBeenCalledTimes(1);
  });
});
