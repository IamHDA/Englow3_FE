import { act, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  BlogReportReason,
  BlogReportStatus,
  BlogTargetStatus,
  BlogTargetType,
} from "@/lib/graphql/generated";

import { createAccountStore } from "../../../testing/accountStore";
import { renderInApp, resetLanguage } from "../../../testing/providers";

import { AdminBlogTargetView } from "./index";

const refresh = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const account = vi.hoisted(() => ({
  store: null as ReturnType<typeof createAccountStore> | null,
}));
vi.mock("@/features/account", async () => {
  const { useSyncExternalStore } = await import("react");
  return {
    useAccountProfile: () =>
      useSyncExternalStore(
        (listener) => account.store!.subscribe(listener),
        () => account.store!.get(),
      ),
  };
});
vi.mock("@/lib/graphql/generated/hooks", () => ({
  useAdminBlogTargetQuery: () => ({
    data: { adminBlogTarget: TARGET },
    error: undefined,
    refetch: vi.fn(),
  }),
  useAdminModerateBlogMutation: () => [vi.fn()],
}));

const AUTHOR = { userId: "author-1", displayName: "An", avatarUrl: null };

const TARGET = {
  targetType: BlogTargetType.POST,
  targetId: "p1",
  targetStatus: BlogTargetStatus.PUBLISHED,
  author: AUTHOR,
  content: {
    title: "A reported post",
    body: "Some text",
    postId: null,
    createdAt: "2026-11-16T03:00:00Z",
    images: [],
    tags: [],
  },
  reports: [
    {
      id: "r1",
      reason: BlogReportReason.SPAM,
      detail: null,
      status: BlogReportStatus.OPEN,
      resolutionNote: null,
      createdAt: "2026-11-16T04:00:00Z",
      resolvedAt: null,
      reporter: { userId: "rep-1", displayName: "Binh", avatarUrl: null },
    },
  ],
  actions: [],
};

beforeEach(() => {
  refresh.mockClear();
  account.store = createAccountStore({
    profile: null,
    hasError: false,
    loading: true,
    refresh,
  });
});
afterEach(resetLanguage);

function draw(language: "vi" | "en" = "vi") {
  renderInApp(
    <AdminBlogTargetView type={BlogTargetType.POST} id="p1" />,
    language,
  );
}

const formControls = () => document.querySelectorAll('input[type="radio"]');
const skeletons = () => document.querySelectorAll(".mantine-Skeleton-root");

describe("AdminBlogTargetView: the form and whose content it is", () => {
  it("draws no form while the viewer's profile loads, only a placeholder - the content is already there", () => {
    draw();

    expect(formControls()).toHaveLength(0);
    expect(
      screen.queryByRole("button", { name: "Thực hiện" }),
    ).not.toBeInTheDocument();
    expect(skeletons().length).toBeGreaterThan(0);
    expect(screen.getByText("Some text")).toBeInTheDocument();
  });

  it("draws the form for somebody else's content once the profile arrives", () => {
    draw();

    act(() =>
      account.store!.set({ profile: { id: "moderator-1" }, loading: false }),
    );

    expect(formControls().length).toBeGreaterThan(0);
    expect(
      screen.getByRole("button", { name: "Thực hiện" }),
    ).toBeInTheDocument();
    expect(skeletons()).toHaveLength(0);
  });

  it.each(["vi", "en"] as const)(
    "says the content is the moderator's own, in %s, and draws no form, once the profile arrives",
    (language) => {
      draw(language);

      act(() =>
        account.store!.set({ profile: { id: AUTHOR.userId }, loading: false }),
      );

      expect(
        screen.getByText(
          /(tự kiểm duyệt nội dung của mình|moderate your own content)/,
        ),
      ).toBeInTheDocument();
      expect(formControls()).toHaveLength(0);
    },
  );

  it.each(["vi", "en"] as const)(
    "draws no form, and says why with a retry, when the profile failed to load, in %s",
    (language) => {
      draw(language);

      act(() => account.store!.set({ hasError: true, loading: false }));

      expect(formControls()).toHaveLength(0);
      expect(
        screen.getByText(
          /(Chưa xác định được tài khoản|Could not tell who you are)/,
        ),
      ).toBeInTheDocument();
      act(() => {
        screen.getByRole("button", { name: /(Thử lại|Try again)/ }).click();
      });
      expect(refresh).toHaveBeenCalledTimes(1);
    },
  );

  it("draws the form after a failed profile loads on retry", () => {
    draw();
    act(() => account.store!.set({ hasError: true, loading: false }));
    expect(formControls()).toHaveLength(0);

    act(() =>
      account.store!.set({ profile: { id: "moderator-1" }, hasError: false }),
    );

    expect(formControls().length).toBeGreaterThan(0);
  });
});
