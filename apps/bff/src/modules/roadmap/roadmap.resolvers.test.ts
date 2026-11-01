import { describe, expect, it, vi } from "vitest";

import { roadmapResolvers } from "./roadmap.resolvers.js";
import { makeContext } from "../../test/makeContext.js";

describe("roadmap resolvers", () => {
  it("fails before calling the backend when there is no token", () => {
    const getRoadmap = vi.fn();
    const ctx = makeContext({
      token: null,
      apis: { roadmapApi: { getRoadmap } },
    });

    expect(() => roadmapResolvers.Query.roadmap({}, {}, ctx)).toThrow(
      "Missing or invalid access token",
    );
    expect(getRoadmap).not.toHaveBeenCalled();
  });

  /** A learner who never had a roadmap reads null, not an error. */
  it("passes on the absence of a roadmap as null", async () => {
    const getRoadmap = vi.fn().mockResolvedValue(null);
    const ctx = makeContext({ apis: { roadmapApi: { getRoadmap } } });

    await expect(
      roadmapResolvers.Query.roadmap({}, {}, ctx),
    ).resolves.toBeNull();
  });

  it("starts an onboarding level check without inventing a milestone", async () => {
    const startLevelCheck = vi.fn().mockResolvedValue({ id: "check-1" });
    const ctx = makeContext({ apis: { roadmapApi: { startLevelCheck } } });

    await roadmapResolvers.Mutation.startLevelCheck(
      {},
      { purpose: "ONBOARDING", milestoneId: null },
      ctx,
    );

    expect(startLevelCheck).toHaveBeenCalledWith({
      purpose: "ONBOARDING",
      milestoneId: undefined,
    });
  });

  it("hands a mock sitting to the milestone it closes", async () => {
    const recordMilestoneSitting = vi.fn().mockResolvedValue({ id: "r" });
    const ctx = makeContext({
      apis: { roadmapApi: { recordMilestoneSitting } },
    });

    await roadmapResolvers.Mutation.recordMilestoneSitting(
      {},
      { milestoneId: "m-1", examAttemptId: "a-1" },
      ctx,
    );

    expect(recordMilestoneSitting).toHaveBeenCalledWith("m-1", "a-1");
  });

  it("passes new weights on as they were entered", async () => {
    const setLevelCheckWeight = vi.fn().mockResolvedValue({
      purposes: [],
      history: [],
    });
    const ctx = makeContext({ apis: { roadmapApi: { setLevelCheckWeight } } });
    const input = {
      purposeCode: "WORK",
      vocabulary: 40,
      listening: 30,
      speaking: 30,
      priority: 5,
    };

    await roadmapResolvers.Mutation.setLevelCheckWeight({}, { input }, ctx);

    expect(setLevelCheckWeight).toHaveBeenCalledWith(input);
  });
});
