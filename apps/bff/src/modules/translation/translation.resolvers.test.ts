import { describe, expect, it, vi } from "vitest";

import { translationResolvers } from "./translation.resolvers.js";
import { makeContext } from "../../test/makeContext.js";

describe("Query.translationSets", () => {
  it("fails before calling the backend when there is no token", () => {
    const searchSets = vi.fn();
    const ctx = makeContext({
      token: null,
      apis: { translationApi: { searchSets } },
    });

    expect(() =>
      translationResolvers.Query.translationSets(
        {},
        { page: 0, size: 20 },
        ctx,
      ),
    ).toThrow("Missing or invalid access token");
    expect(searchSets).not.toHaveBeenCalled();
  });

  it("caps the page size so a client cannot ask for the whole table", async () => {
    const searchSets = vi.fn().mockResolvedValue({ items: [] });
    const ctx = makeContext({ apis: { translationApi: { searchSets } } });

    await translationResolvers.Query.translationSets(
      {},
      { topic: "daily-life", page: 0, size: 5000 },
      ctx,
    );

    expect(searchSets).toHaveBeenCalledWith({
      topic: "daily-life",
      page: 0,
      size: 100,
    });
  });
});

describe("Mutation.submitTranslation", () => {
  it("fails before calling the backend when there is no token", () => {
    const submit = vi.fn();
    const ctx = makeContext({
      token: null,
      apis: { translationApi: { submit } },
    });

    expect(() =>
      translationResolvers.Mutation.submitTranslation(
        {},
        { itemId: "i-1", response: "It is raining." },
        ctx,
      ),
    ).toThrow("Missing or invalid access token");
    expect(submit).not.toHaveBeenCalled();
  });

  it("sends the learner's words as they typed them", async () => {
    const submit = vi.fn().mockResolvedValue({ id: "a-1", status: "QUEUED" });
    const ctx = makeContext({ apis: { translationApi: { submit } } });

    await translationResolvers.Mutation.submitTranslation(
      {},
      { itemId: "i-1", response: "  It's pouring down. " },
      ctx,
    );

    expect(submit).toHaveBeenCalledWith("i-1", "  It's pouring down. ");
  });
});
