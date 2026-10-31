import { describe, it, expect, vi } from "vitest";
import { assessmentResolvers } from "./assessment.resolvers.js";
import { makeContext } from "../../test/makeContext.js";
describe("productive assessment forwarding", () => {
  it("rejects unauthenticated submissions before calling the backend", () => {
    const action = vi.fn();
    const ctx = makeContext({
      token: null,
      apis: { assessmentApi: { action } },
    });
    expect(() =>
      assessmentResolvers.Mutation.submitAssessment({}, { id: "attempt" }, ctx),
    ).toThrow("Missing or invalid access token");
    expect(action).not.toHaveBeenCalled();
  });
  it("forwards the exact optimistic draft version", async () => {
    const save = vi.fn().mockResolvedValue({});
    const ctx = makeContext({ apis: { assessmentApi: { save } } });
    await assessmentResolvers.Mutation.saveAssessmentDraft(
      {},
      { id: "attempt", answerText: "draft", version: 8 },
      ctx,
    );
    expect(save).toHaveBeenCalledWith("attempt", "draft", 8);
  });
  it("keeps manual review separate from a new paid retry", async () => {
    const action = vi.fn().mockResolvedValue({});
    const ctx = makeContext({ apis: { assessmentApi: { action } } });
    await assessmentResolvers.Mutation.requestAssessmentReview(
      {},
      { id: "attempt" },
      ctx,
    );
    expect(action).toHaveBeenCalledWith("attempt", "request-review");
  });
});
