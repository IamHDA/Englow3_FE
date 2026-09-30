import { describe, expect, it, vi } from "vitest";

import { onboardingResolvers } from "./onboarding.resolvers.js";
import type { LearningPurposeResponse } from "./onboarding.types.js";
import { makeContext } from "../../test/makeContext.js";

describe("Query.learningPurposes", () => {
  it("fails before calling the backend when there is no token", () => {
    const getLearningPurposes = vi.fn();
    const ctx = makeContext({
      token: null,
      apis: { onboardingApi: { getLearningPurposes } },
    });

    expect(() =>
      onboardingResolvers.Query.learningPurposes({}, {}, ctx),
    ).toThrow("Missing or invalid access token");
    expect(getLearningPurposes).not.toHaveBeenCalled();
  });

  it("returns the OnboardingApi response directly", async () => {
    const purposes: LearningPurposeResponse[] = [
      { id: 1, purposeCode: "CERTIFICATE", displayName: "Luyện thi chứng chỉ" },
      { id: 11, purposeCode: "TRAVEL", displayName: "Du lịch" },
    ];
    const getLearningPurposes = vi.fn().mockResolvedValue(purposes);
    const ctx = makeContext({
      apis: { onboardingApi: { getLearningPurposes } },
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
