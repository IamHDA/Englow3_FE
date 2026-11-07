import { describe, expect, it, vi } from "vitest";

import { generationResolvers } from "./generation.resolvers.js";
import { makeContext } from "../../test/makeContext.js";

describe("generation resolvers", () => {
  it("fails before calling the backend when there is no token", () => {
    const request = vi.fn();
    const ctx = makeContext({
      token: null,
      apis: { generationApi: { request } },
    });

    expect(() =>
      generationResolvers.Mutation.requestGeneration(
        {},
        { kind: "IELTS_FULL_TEST", brief: null },
        ctx,
      ),
    ).toThrow("Missing or invalid access token");
    expect(request).not.toHaveBeenCalled();
  });

  /** The limits are the backend's (GENERATION_DAILY_LIMIT), not ours. */
  it("passes the brief trimmed and leaves a blank one out", async () => {
    const request = vi.fn().mockResolvedValue({ id: "r1" });
    const ctx = makeContext({ apis: { generationApi: { request } } });

    await generationResolvers.Mutation.requestGeneration(
      {},
      { kind: "IELTS_FULL_TEST", brief: "  science topics  " },
      ctx,
    );
    await generationResolvers.Mutation.requestGeneration(
      {},
      { kind: "IELTS_FULL_TEST", brief: "   " },
      ctx,
    );

    expect(request).toHaveBeenNthCalledWith(1, {
      kind: "IELTS_FULL_TEST",
      brief: "science topics",
    });
    expect(request).toHaveBeenNthCalledWith(2, {
      kind: "IELTS_FULL_TEST",
      brief: undefined,
    });
  });

  it("asks the backend for the page shown", async () => {
    const list = vi.fn().mockResolvedValue({ items: [] });
    const ctx = makeContext({ apis: { generationApi: { list } } });

    await generationResolvers.Query.generationRequests(
      {},
      { page: 2, size: 10 },
      ctx,
    );

    expect(list).toHaveBeenCalledWith(2, 10);
  });
});
