import { GraphQLError } from "graphql";
import { describe, expect, it, vi } from "vitest";

import { userResolvers } from "./user.resolvers.js";
import type { UserInformationResponse } from "./user.types.js";
import type { GraphQLContext } from "../../graphql/context.js";

function makeContext(overrides: Partial<GraphQLContext> = {}): GraphQLContext {
  return {
    token: "token",
    requireToken: () => "token",
    apis: {
      userApi: { getMe: vi.fn() } as any,
      onboardingApi: {} as any,
      examApi: {} as any,
    },
    ...overrides,
  };
}

describe("Query.me", () => {
  it("fails before calling the backend when there is no token", () => {
    const ctx = makeContext({
      requireToken: () => {
        throw new GraphQLError("Missing or invalid access token", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      },
    });

    expect(() => userResolvers.Query.me({}, {}, ctx)).toThrow(
      "Missing or invalid access token",
    );
    expect(ctx.apis.userApi.getMe).not.toHaveBeenCalled();
  });

  it("returns the UserApi response directly", async () => {
    const me: UserInformationResponse = {
      id: "u1",
      email: "learner@example.com",
      fullName: "Nguyen Van A",
      displayName: "vana",
      gender: null,
      birthDate: null,
      avatarUrl: null,
      bannerUrl: null,
      onboardingStep: "LEARNING_PURPOSES",
    };
    const getMe = vi.fn().mockResolvedValue(me);
    const ctx = makeContext({
      apis: {
        userApi: { getMe } as any,
        onboardingApi: {} as any,
        examApi: {} as any,
      },
    });

    const result = await userResolvers.Query.me({}, {}, ctx);

    expect(result).toBe(me);
    expect(getMe).toHaveBeenCalledTimes(1);
  });
});
