import { describe, expect, it, vi } from "vitest";

import { contentManagementResolvers } from "./contentManagement.resolvers.js";
import { makeContext } from "../../test/makeContext.js";

describe("Query.adminContent", () => {
  it("fails before calling the backend when there is no token", () => {
    const searchContentForAuthoring = vi.fn();
    const ctx = makeContext({
      token: null,
      apis: { contentManagementApi: { searchContentForAuthoring } },
    });

    expect(() =>
      contentManagementResolvers.Query.adminContent(
        {},
        { kind: "QUIZ" } as never,
        ctx,
      ),
    ).toThrow("Missing or invalid access token");
    expect(searchContentForAuthoring).not.toHaveBeenCalled();
  });

  it("caps the page size and forwards the kind", async () => {
    const searchContentForAuthoring = vi.fn().mockResolvedValue({ items: [] });
    const ctx = makeContext({
      apis: { contentManagementApi: { searchContentForAuthoring } },
    });

    await contentManagementResolvers.Query.adminContent(
      {},
      { kind: "FLASHCARD_SET", size: 5000 } as never,
      ctx,
    );

    expect(searchContentForAuthoring).toHaveBeenCalledWith({
      kind: "FLASHCARD_SET",
      size: 100,
    });
  });

  /** No status means every status, which is what makes one endpoint serve the queue and the full list. */
  it("leaves status out rather than defaulting it", async () => {
    const searchContentForAuthoring = vi.fn().mockResolvedValue({ items: [] });
    const ctx = makeContext({
      apis: { contentManagementApi: { searchContentForAuthoring } },
    });

    await contentManagementResolvers.Query.adminContent(
      {},
      { kind: "QUIZ" } as never,
      ctx,
    );

    expect(searchContentForAuthoring).toHaveBeenCalledWith({
      kind: "QUIZ",
      size: 20,
    });
  });
});

describe("Mutation.rejectContent", () => {
  it("fails before calling the backend when there is no token", () => {
    const rejectContent = vi.fn();
    const ctx = makeContext({
      token: null,
      apis: { contentManagementApi: { rejectContent } },
    });

    expect(() =>
      contentManagementResolvers.Mutation.rejectContent(
        {},
        { kind: "QUIZ", id: "q-1", note: "no" } as never,
        ctx,
      ),
    ).toThrow("Missing or invalid access token");
    expect(rejectContent).not.toHaveBeenCalled();
  });

  /**
   * The rule that a rejection must say why lives in the backend entity. Trimming
   * the note here would hide a blank one from the only check that enforces it.
   */
  it("forwards a blank note rather than short-circuiting it", async () => {
    const rejectContent = vi.fn().mockResolvedValue({ status: "REJECTED" });
    const ctx = makeContext({
      apis: { contentManagementApi: { rejectContent } },
    });

    await contentManagementResolvers.Mutation.rejectContent(
      {},
      { kind: "DICTATION_LESSON", id: "l-1", note: "  " } as never,
      ctx,
    );

    expect(rejectContent).toHaveBeenCalledWith("DICTATION_LESSON", "l-1", "  ");
  });
});

describe("adminContent for speaking prompts", () => {
  /**
   * The speaking module answers with its own record - same lifecycle fields,
   * no item count. A prompt is one sentence rather than a collection, so the
   * count is null instead of a 1 that would tell a reviewer nothing.
   */
  it("passes a speaking prompt through as a content review with no item count", async () => {
    const searchContentForAuthoring = vi.fn().mockResolvedValue({
      items: [{ id: "p-1", title: "Seat vs sit", itemCount: null }],
    });
    const ctx = makeContext({
      apis: { contentManagementApi: { searchContentForAuthoring } },
    });

    const page = await contentManagementResolvers.Query.adminContent(
      {},
      { kind: "SPEAKING_PROMPT" } as never,
      ctx,
    );

    expect(searchContentForAuthoring).toHaveBeenCalledWith({
      kind: "SPEAKING_PROMPT",
      size: 20,
    });
    expect(page.items[0].itemCount).toBeNull();
  });

  it("forwards the kind to the review actions unchanged", async () => {
    const approveContent = vi.fn().mockResolvedValue({ status: "PUBLISHED" });
    const ctx = makeContext({
      apis: { contentManagementApi: { approveContent } },
    });

    await contentManagementResolvers.Mutation.approveContent(
      {},
      { kind: "SPEAKING_PROMPT", id: "p-1" } as never,
      ctx,
    );

    expect(approveContent).toHaveBeenCalledWith("SPEAKING_PROMPT", "p-1");
  });
});

describe("Query.adminOverview", () => {
  it("fails before calling the backend when there is no token", () => {
    const getAdminOverview = vi.fn();
    const ctx = makeContext({
      token: null,
      apis: { contentManagementApi: { getAdminOverview } },
    });

    expect(() =>
      contentManagementResolvers.Query.adminOverview({}, {}, ctx),
    ).toThrow("Missing or invalid access token");
    expect(getAdminOverview).not.toHaveBeenCalled();
  });

  it("returns the backend's overview as it is", async () => {
    const overview = {
      content: [
        { kind: "FLASHCARD_SET", drafts: 5, pendingReview: 1, published: 2 },
      ],
      pendingReviewTotal: 1,
      learners: 3,
      newLearners: 1,
      activeLearners: 2,
      cardReviews: 40,
      dictationSentences: 12,
      quizzesSubmitted: 4,
      examsSubmitted: 1,
      periodDays: 7,
    };
    const getAdminOverview = vi.fn().mockResolvedValue(overview);
    const ctx = makeContext({
      apis: { contentManagementApi: { getAdminOverview } },
    });

    await expect(
      contentManagementResolvers.Query.adminOverview({}, {}, ctx),
    ).resolves.toEqual(overview);
  });
});
