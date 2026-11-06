import { describe, expect, it, vi } from "vitest";

import { fullTestResolvers } from "./fullTest.resolvers.js";
import { makeContext } from "../../test/makeContext.js";

const input = {
  title: "IELTS Academic Full Test 1",
  description: null,
  certificateVariant: "ACADEMIC" as const,
  examId: "exam-1",
  writingTask1Id: "w1",
  writingTask2Id: "w2",
  speakingPart1Id: "s1",
  speakingPart2Id: "s2",
  speakingPart3Id: "s3",
};

describe("full test resolvers", () => {
  it("fails before calling the backend when there is no token", () => {
    const start = vi.fn();
    const ctx = makeContext({ token: null, apis: { fullTestApi: { start } } });

    expect(() =>
      fullTestResolvers.Mutation.startFullTest({}, { fullTestId: "f" }, ctx),
    ).toThrow("Missing or invalid access token");
    expect(start).not.toHaveBeenCalled();
  });

  /** Who may sit it is the backend's call (FULL_TEST_IELTS_ONLY), not ours. */
  it("starts a sitting by asking the backend", async () => {
    const start = vi.fn().mockResolvedValue({ id: "sitting-1" });
    const ctx = makeContext({ apis: { fullTestApi: { start } } });

    await expect(
      fullTestResolvers.Mutation.startFullTest({}, { fullTestId: "f" }, ctx),
    ).resolves.toEqual({ id: "sitting-1" });
    expect(start).toHaveBeenCalledWith("f");
  });

  it("creates a draft without an id and drops a null description", async () => {
    const create = vi.fn().mockResolvedValue({ id: "new" });
    const update = vi.fn();
    const ctx = makeContext({ apis: { fullTestApi: { create, update } } });

    await fullTestResolvers.Mutation.saveFullTest({}, { id: null, input }, ctx);

    expect(create).toHaveBeenCalledWith({ ...input, description: undefined });
    expect(update).not.toHaveBeenCalled();
  });

  it("updates the full test it is given", async () => {
    const create = vi.fn();
    const update = vi.fn().mockResolvedValue({ id: "f" });
    const ctx = makeContext({ apis: { fullTestApi: { create, update } } });

    await fullTestResolvers.Mutation.saveFullTest({}, { id: "f", input }, ctx);

    expect(update).toHaveBeenCalledWith("f", {
      ...input,
      description: undefined,
    });
    expect(create).not.toHaveBeenCalled();
  });

  it("forwards a rejection note as it stands", async () => {
    const reject = vi.fn().mockResolvedValue({ id: "f" });
    const ctx = makeContext({ apis: { fullTestApi: { reject } } });

    await fullTestResolvers.Mutation.rejectFullTest(
      {},
      { id: "f", note: "  " },
      ctx,
    );

    expect(reject).toHaveBeenCalledWith("f", "  ");
  });
});
