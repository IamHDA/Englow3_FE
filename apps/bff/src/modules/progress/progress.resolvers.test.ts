import { describe, expect, it, vi } from "vitest";

import { progressResolvers } from "./progress.resolvers.js";
import { makeContext } from "../../test/makeContext.js";

describe("Query.dailyPath", () => {
  it("fails before calling the backend when there is no token", () => {
    const getDailyPath = vi.fn();
    const ctx = makeContext({
      token: null,
      apis: { progressApi: { getDailyPath } },
    });

    expect(() => progressResolvers.Query.dailyPath({}, {}, ctx)).toThrow(
      "Missing or invalid access token",
    );
    expect(getDailyPath).not.toHaveBeenCalled();
  });

  /**
   * No arguments to forward, and none to accept: a learner id in the query would
   * be a way to read someone else's plan. The backend takes it from the token.
   */
  it("asks for the caller's own path with no arguments", async () => {
    const getDailyPath = vi
      .fn()
      .mockResolvedValue({ streakDays: 3, tasks: [], quests: [] });
    const ctx = makeContext({ apis: { progressApi: { getDailyPath } } });

    const path = await progressResolvers.Query.dailyPath({}, {}, ctx);

    expect(getDailyPath).toHaveBeenCalledWith();
    expect(path).toEqual({ streakDays: 3, tasks: [], quests: [] });
  });
});
