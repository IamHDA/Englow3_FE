import { act, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { BlogCommentStatus, BlogPostStatus } from "@/lib/graphql/generated";

import { createAccountStore } from "../../../testing/accountStore";
import { renderInApp, resetLanguage } from "../../../testing/providers";

import { BlogPostView } from "./index";

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
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

const idle = vi.hoisted(() => () => [vi.fn(), { loading: false }]);
vi.mock("@/lib/graphql/generated/hooks", () => ({
  useBlogPostQuery: () => ({
    data: { blogPost: POST },
    error: undefined,
    refetch: vi.fn(),
  }),
  useBlogCommentsQuery: () => ({
    data: { blogComments: COMMENTS },
    previousData: undefined,
    loading: false,
    error: undefined,
    refetch: vi.fn(),
  }),
  useDeleteBlogPostMutation: idle,
  useReportBlogPostMutation: idle,
  useCreateBlogCommentMutation: idle,
  useUpdateBlogCommentMutation: idle,
  useDeleteBlogCommentMutation: idle,
  useReportBlogCommentMutation: idle,
  useLikeBlogPostMutation: idle,
  useUnlikeBlogPostMutation: idle,
}));

const WRITER = { userId: "writer-1", displayName: "An", avatarUrl: null };
const COMMENTER = {
  userId: "commenter-1",
  displayName: "Binh",
  avatarUrl: null,
};

const POST = {
  id: "p1",
  title: "A post",
  body: "Body text",
  status: BlogPostStatus.PUBLISHED,
  version: 1,
  likeCount: 0,
  commentCount: 2,
  likedByMe: false,
  canEdit: false,
  canInteract: true,
  createdAt: "2026-11-16T03:00:00Z",
  editedAt: null,
  moderationNote: null,
  author: WRITER,
  tags: [],
  images: [],
};

const comment = (id: string, author: typeof WRITER | null, body: string) => ({
  id,
  postId: "p1",
  body,
  status: BlogCommentStatus.VISIBLE,
  canEdit: false,
  createdAt: "2026-11-16T03:30:00Z",
  editedAt: null,
  author,
});

const COMMENTS = {
  page: 0,
  size: 20,
  totalItems: 2,
  totalPages: 1,
  items: [
    comment("c1", WRITER, "Written by the post's author"),
    comment("c2", COMMENTER, "Written by somebody else"),
  ],
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

const draw = (language: "vi" | "en" = "vi") =>
  renderInApp(<BlogPostView postId="p1" />, language);

const reports = () => screen.queryAllByRole("button", { name: "Báo cáo" });
const commentItem = (text: string) => screen.getByText(text).closest("li")!;

describe("BlogPostView: Report, Delete and whose they are", () => {
  it("offers no Report and no Delete anywhere while the viewer's profile loads, on the post or on a comment", () => {
    draw();

    expect(reports()).toHaveLength(0);
    expect(
      screen.queryByRole("button", { name: "Xóa bài" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Xóa" }),
    ).not.toBeInTheDocument();
    // The content itself does not wait for it.
    expect(screen.getByText("Body text")).toBeInTheDocument();
    expect(screen.getByText("Written by somebody else")).toBeInTheDocument();
  });

  it("offers Report on somebody else's post and comments once the profile arrives - and not before", () => {
    draw();
    expect(reports()).toHaveLength(0);

    act(() =>
      account.store!.set({ profile: { id: "reader-1" }, loading: false }),
    );

    // The post, and both comments: none is the reader's own.
    expect(reports()).toHaveLength(3);
    expect(
      screen.queryByRole("button", { name: "Xóa bài" }),
    ).not.toBeInTheDocument();
  });

  it("leaves Report off the viewer's own post and comment, and offers Delete there, once the profile arrives", () => {
    draw();

    act(() =>
      account.store!.set({ profile: { id: WRITER.userId }, loading: false }),
    );

    expect(screen.getByRole("button", { name: "Xóa bài" })).toBeInTheDocument();
    const own = commentItem("Written by the post's author");
    expect(
      within(own).queryByRole("button", { name: "Báo cáo" }),
    ).not.toBeInTheDocument();
    expect(
      within(own).getByRole("button", { name: "Xóa" }),
    ).toBeInTheDocument();
    const other = commentItem("Written by somebody else");
    expect(
      within(other).getByRole("button", { name: "Báo cáo" }),
    ).toBeInTheDocument();
    expect(
      within(other).queryByRole("button", { name: "Xóa" }),
    ).not.toBeInTheDocument();
    // One Report is left, on the other person's comment.
    expect(reports()).toHaveLength(1);
  });

  it.each(["vi", "en"] as const)(
    "offers no Report and no Delete when the profile failed to load, says so with a retry, in %s",
    (language) => {
      draw(language);

      act(() => account.store!.set({ hasError: true, loading: false }));

      expect(
        screen.queryAllByRole("button", { name: /^(Báo cáo|Report)$/ }),
      ).toHaveLength(0);
      expect(
        screen.queryByRole("button", { name: /^(Xóa bài|Delete post)$/ }),
      ).not.toBeInTheDocument();
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

  it("offers the controls after a failed profile loads on retry", () => {
    draw();
    act(() => account.store!.set({ hasError: true, loading: false }));
    expect(reports()).toHaveLength(0);

    act(() =>
      account.store!.set({ profile: { id: "reader-1" }, hasError: false }),
    );

    expect(reports()).toHaveLength(3);
  });
});
