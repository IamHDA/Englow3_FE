import { describe, expect, it, vi } from "vitest";

import { onboardingResolvers } from "./onboarding.resolvers.js";
import type { LearningPurposeResponse } from "./onboarding.types.js";
import { makeContext } from "../../test/makeContext.js";
import type { UserInformationResponse } from "../user/user.types.js";

describe("bootstrap onboarding snapshot", () => {
  it("does not make a second REST call for a preloaded snapshot", async () => {
    const getCurrentState = vi.fn();
    const ctx = makeContext({ apis: { onboardingApi: { getCurrentState } } });
    const snapshot = { step: "COMPLETED" };
    const parent = { onboardingState: snapshot } as UserInformationResponse;
    expect(await onboardingResolvers.Me.onboardingState(parent, {}, ctx)).toBe(
      snapshot,
    );
    expect(getCurrentState).not.toHaveBeenCalled();
  });
  it("does not fetch learner state when bootstrap explicitly returns null", async () => {
    const getCurrentState = vi.fn();
    const ctx = makeContext({ apis: { onboardingApi: { getCurrentState } } });
    expect(
      await onboardingResolvers.Me.onboardingState(
        { onboardingState: null } as UserInformationResponse,
        {},
        ctx,
      ),
    ).toBeNull();
    expect(getCurrentState).not.toHaveBeenCalled();
  });
  it("retains the legacy resolver for a profile mutation or an older backend", async () => {
    const snapshot = { step: "CURRENT_LEVEL" };
    const getCurrentState = vi.fn().mockResolvedValue(snapshot);
    const ctx = makeContext({ apis: { onboardingApi: { getCurrentState } } });
    expect(
      await onboardingResolvers.Me.onboardingState(
        {} as UserInformationResponse,
        {},
        ctx,
      ),
    ).toBe(snapshot);
    expect(getCurrentState).toHaveBeenCalledOnce();
  });
});

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
