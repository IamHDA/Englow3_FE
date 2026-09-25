import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { theme } from "@/lib/mantine/theme";

import { AdminOverviewView } from "./index";

const query = vi.hoisted(() => ({
  result: {} as { data?: unknown; loading: boolean; error?: unknown },
}));
vi.mock("@/lib/graphql/generated/hooks", () => ({
  useAdminOverviewQuery: () => query.result,
}));

function overview(content: unknown[], pendingReviewTotal = 0) {
  return {
    adminOverview: {
      content,
      pendingReviewTotal,
      learners: 4,
      newLearners: 1,
      activeLearners: 2,
      cardReviews: 40,
      dictationSentences: 12,
      quizzesSubmitted: 3,
      examsSubmitted: 1,
      periodDays: 7,
    },
  };
}

function renderView() {
  render(
    <MantineProvider theme={theme}>
      <AdminOverviewView />
    </MantineProvider>,
  );
}

beforeEach(() => {
  query.result = { loading: false };
});

describe("AdminOverviewView", () => {
  // Waiting on review is what needs a decision, so it links straight to the
  // queue of that kind rather than to the full list.
  it("links what waits on review to that kind's review queue", () => {
    query.result = {
      loading: false,
      data: overview(
        [{ kind: "QUIZ", drafts: 0, pendingReview: 2, published: 1 }],
        2,
      ),
    };
    renderView();

    const link = screen
      .getByText(/bài trắc nghiệm đang chờ duyệt/)
      .closest("a");
    expect(link).toHaveAttribute(
      "href",
      "/admin/content?kind=QUIZ&status=PENDING_REVIEW",
    );
  });

  // Imported content lands as drafts; an overview that said "nothing to do"
  // while 35 of them sat there would hide the one job left.
  it("lists drafts as work still to do", () => {
    query.result = {
      loading: false,
      data: overview([
        { kind: "FLASHCARD_SET", drafts: 5, pendingReview: 0, published: 0 },
      ]),
    };
    renderView();

    expect(screen.getByText(/bộ thẻ còn ở bản nháp/)).toBeInTheDocument();
    expect(screen.queryByText("Không có việc gì đang chờ.")).toBeNull();
  });

  it("says so when nothing waits", () => {
    query.result = {
      loading: false,
      data: overview([
        { kind: "EXAM", drafts: 0, pendingReview: 0, published: 9 },
      ]),
    };
    renderView();

    expect(screen.getByText("Không có việc gì đang chờ.")).toBeInTheDocument();
  });

  it("says the figures could not be loaded instead of showing zeros", () => {
    query.result = { loading: false, error: new Error("down") };
    renderView();

    expect(screen.getByText("Không tải được số liệu")).toBeInTheDocument();
  });
});
