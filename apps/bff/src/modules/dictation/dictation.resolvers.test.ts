import { describe, expect, it, vi } from "vitest";

import { dictationResolvers } from "./dictation.resolvers.js";
import { makeContext } from "../../test/makeContext.js";

describe("Mutation.submitDictation", () => {
  it("fails before calling the backend when there is no token", () => {
    const submitDictation = vi.fn();
    const ctx = makeContext({
      token: null,
      apis: { dictationApi: { submitDictation } },
    });

    expect(() =>
      dictationResolvers.Mutation.submitDictation(
        {},
        { sentenceId: "s-1", response: "the cat sat" },
        ctx,
      ),
    ).toThrow("Missing or invalid access token");
    expect(submitDictation).not.toHaveBeenCalled();
  });

  /** An empty answer is a real answer - the backend scores it zero rather than rejecting it. */
  it("forwards an empty answer rather than short-circuiting it", async () => {
    const submitDictation = vi
      .fn()
      .mockResolvedValue({ sentenceId: "s-1", accuracyPercent: 0 });
    const ctx = makeContext({ apis: { dictationApi: { submitDictation } } });

    await dictationResolvers.Mutation.submitDictation(
      {},
      { sentenceId: "s-1", response: "" },
      ctx,
    );

    expect(submitDictation).toHaveBeenCalledWith("s-1", "");
  });
});
