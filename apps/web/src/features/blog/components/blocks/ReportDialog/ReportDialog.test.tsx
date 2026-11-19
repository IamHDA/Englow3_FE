import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { BlogReportReason } from "@/lib/graphql/generated";

import { MAX_REPORT_DETAIL_LENGTH } from "../../../constants/blog";
import {
  renderInApp,
  resetLanguage,
  type TestLanguage,
} from "../../../testing/providers";
import { refusal } from "../../../testing/refusals";

import { ReportDialog } from "./index";

afterEach(resetLanguage);

const TEXT = {
  vi: {
    postTitle: "Báo cáo bài viết",
    commentTitle: "Báo cáo bình luận",
    spam: "Spam hoặc quảng cáo",
    harassment: "Quấy rối, lăng mạ",
    note: "Ghi chú thêm (không bắt buộc)",
    send: "Gửi báo cáo",
    cancel: "Hủy",
    reasonRequired: "Hãy chọn một lý do.",
    tooLong: "Ghi chú tối đa 500 ký tự.",
    closed: "Bài này không còn nhận báo cáo.",
  },
  en: {
    postTitle: "Report this post",
    commentTitle: "Report this comment",
    spam: "Spam or advertising",
    harassment: "Harassment or abuse",
    note: "More detail (optional)",
    send: "Send report",
    cancel: "Cancel",
    reasonRequired: "Choose a reason.",
    tooLong: "The note is 500 characters at most.",
    closed: "This post no longer takes reports.",
  },
} as const;

function setup({
  target = "post" as "post" | "comment",
  language = "vi" as TestLanguage,
  onSubmit = vi.fn().mockResolvedValue(undefined),
} = {}) {
  const onClose = vi.fn();
  renderInApp(
    <ReportDialog
      opened
      target={target}
      onSubmit={onSubmit}
      onClose={onClose}
    />,
    language,
  );
  return {
    user: userEvent.setup(),
    onSubmit,
    onClose,
    text: TEXT[language],
  };
}

describe("ReportDialog", () => {
  it.each([
    ["post", "postTitle"],
    ["comment", "commentTitle"],
  ] as const)("is titled for what is reported: a %s", (target, key) => {
    const { text } = setup({ target });
    expect(screen.getByRole("dialog", { name: text[key] })).toBeInTheDocument();
  });

  it("sends the chosen reason with no note as null, then closes", async () => {
    const { user, onSubmit, onClose, text } = setup();

    await user.click(screen.getByRole("radio", { name: text.spam }));
    await user.click(screen.getByRole("button", { name: text.send }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledExactlyOnceWith({
        reason: BlogReportReason.SPAM,
        detail: null,
      }),
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("sends the note trimmed", async () => {
    const { user, onSubmit, text } = setup();

    await user.click(screen.getByRole("radio", { name: text.harassment }));
    await user.type(screen.getByLabelText(text.note), "  insults  ");
    await user.click(screen.getByRole("button", { name: text.send }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        reason: BlogReportReason.HARASSMENT,
        detail: "insults",
      }),
    );
  });

  it.each(["vi", "en"] as const)(
    "asks for a reason before anything is sent, in %s",
    async (language) => {
      const { user, onSubmit, onClose, text } = setup({ language });

      await user.click(screen.getByRole("button", { name: text.send }));

      expect(await screen.findByText(text.reasonRequired)).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
      expect(onClose).not.toHaveBeenCalled();
    },
  );

  it("takes a note of exactly 500 characters and refuses 501, naming the limit", async () => {
    const { user, onSubmit, text } = setup();
    await user.click(screen.getByRole("radio", { name: text.spam }));
    const note = screen.getByLabelText(text.note);

    await user.click(note);
    await user.paste("n".repeat(MAX_REPORT_DETAIL_LENGTH + 1));
    await user.click(screen.getByRole("button", { name: text.send }));
    expect(await screen.findByText(text.tooLong)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();

    await user.clear(note);
    await user.paste("n".repeat(MAX_REPORT_DETAIL_LENGTH));
    await user.click(screen.getByRole("button", { name: text.send }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
  });

  it("stays open with the refusal as a sentence when the post is no longer open to reports", async () => {
    const onSubmit = vi
      .fn()
      .mockRejectedValue(refusal("BLOG_POST_NOT_OPEN", "CONFLICT"));
    const { user, onClose, text } = setup({ onSubmit, language: "en" });

    await user.click(screen.getByRole("radio", { name: text.spam }));
    await user.click(screen.getByRole("button", { name: text.send }));

    expect(await screen.findByRole("alert")).toHaveTextContent(text.closed);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("puts a refused note under the note box", async () => {
    const onSubmit = vi
      .fn()
      .mockRejectedValue(refusal("BLOG_REPORT_DETAIL_TOO_LONG"));
    const { user, text } = setup({ onSubmit });

    await user.click(screen.getByRole("radio", { name: text.spam }));
    await user.click(screen.getByRole("button", { name: text.send }));

    expect(await screen.findByText(text.tooLong)).toBeInTheDocument();
  });

  it("sends only once for a double press", async () => {
    let finish: () => void = () => undefined;
    const onSubmit = vi.fn(
      () => new Promise<void>((resolve) => (finish = resolve)),
    );
    const { user, text } = setup({ onSubmit });

    await user.click(screen.getByRole("radio", { name: text.spam }));
    await user.dblClick(screen.getByRole("button", { name: text.send }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    finish();
  });

  it("closes without sending when cancelled", async () => {
    const { user, onSubmit, onClose, text } = setup();

    await user.click(screen.getByRole("button", { name: text.cancel }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
