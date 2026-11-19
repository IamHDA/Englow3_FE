import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MAX_COMMENT_LENGTH } from "../../../constants/blog";
import { refusal } from "../../../testing/refusals";
import {
  renderInApp,
  resetLanguage,
  type TestLanguage,
} from "../../../testing/providers";

import { CommentForm } from "./index";

afterEach(resetLanguage);

const TEXT = {
  vi: {
    box: "Bình luận của bạn",
    send: "Gửi bình luận",
    required: "Hãy viết nội dung bình luận.",
    tooLong: "Bình luận tối đa 2000 ký tự.",
    invalid: "Bình luận cần từ 1 đến 2000 ký tự.",
    closed: "Bạn không thể bình luận ở bài này.",
    save: "Lưu",
    cancel: "Hủy",
  },
  en: {
    box: "Your comment",
    send: "Post comment",
    required: "Write something first.",
    tooLong: "A comment is 2000 characters at most.",
    invalid: "A comment needs 1 to 2,000 characters.",
    closed: "You cannot comment on this post.",
    save: "Save",
    cancel: "Cancel",
  },
} as const;

function setup(
  props: Partial<Parameters<typeof CommentForm>[0]> = {},
  language: TestLanguage = "vi",
) {
  const onSubmit = vi.fn().mockResolvedValue(undefined);
  renderInApp(
    <CommentForm
      submitLabel={TEXT[language].send}
      onSubmit={onSubmit}
      {...props}
    />,
    language,
  );
  const user = userEvent.setup();
  const box = screen.getByRole("textbox", { name: TEXT[language].box });
  return { onSubmit, user, box, text: TEXT[language] };
}

describe("CommentForm", () => {
  it("sends the text trimmed, then empties the box", async () => {
    const { user, box, onSubmit, text } = setup();

    await user.type(box, "  hay quá  ");
    await user.click(screen.getByRole("button", { name: text.send }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledExactlyOnceWith("hay quá"),
    );
    await waitFor(() => expect(box).toHaveValue(""));
  });

  it.each(["vi", "en"] as const)(
    "says a blank comment is not enough, in %s, and sends nothing",
    async (language) => {
      const { user, box, onSubmit, text } = setup({}, language);

      await user.type(box, "    ");
      await user.click(screen.getByRole("button", { name: text.send }));

      expect(await screen.findByText(text.required)).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    },
  );

  it("takes exactly 2000 characters and refuses 2001, with the limit in the message", async () => {
    const { user, box, onSubmit, text } = setup();

    await user.click(box);
    await user.paste("a".repeat(MAX_COMMENT_LENGTH + 1));
    await user.click(screen.getByRole("button", { name: text.send }));
    expect(await screen.findByText(text.tooLong)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();

    await user.clear(box);
    await user.paste("a".repeat(MAX_COMMENT_LENGTH));
    await user.click(screen.getByRole("button", { name: text.send }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
  });

  it("shows the counter only near the limit", async () => {
    const { user, box } = setup();

    await user.type(box, "short");
    expect(screen.queryByText(/\/2000/)).not.toBeInTheDocument();

    await user.clear(box);
    await user.paste("a".repeat(1900));
    expect(screen.getByText("1900/2000")).toBeInTheDocument();
  });

  it("sends only once for a double press, and waits while it is saving", async () => {
    let finish: () => void = () => undefined;
    const onSubmit = vi.fn(
      () => new Promise<void>((resolve) => (finish = resolve)),
    );
    const { user, box, text } = setup({ onSubmit });

    await user.type(box, "hi");
    const send = screen.getByRole("button", { name: text.send });
    await user.dblClick(send);

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(send).toBeDisabled();
    finish();
    await waitFor(() => expect(send).toBeEnabled());
  });

  it("puts the backend's refusal of the text under the box, and keeps what was typed", async () => {
    const onSubmit = vi.fn().mockRejectedValue(refusal("BLOG_COMMENT_INVALID"));
    const { user, box, text } = setup({ onSubmit });

    await user.type(box, "something");
    await user.click(screen.getByRole("button", { name: text.send }));

    expect(await screen.findByText(text.invalid)).toBeInTheDocument();
    expect(box).toHaveValue("something");
  });

  it("says in a sentence above the box when the post closed to comments meanwhile", async () => {
    const onSubmit = vi
      .fn()
      .mockRejectedValue(refusal("BLOG_INTERACTION_NOT_ALLOWED", "FORBIDDEN"));
    const { user, box, text } = setup({ onSubmit });

    await user.type(box, "something");
    await user.click(screen.getByRole("button", { name: text.send }));

    expect(await screen.findByRole("alert")).toHaveTextContent(text.closed);
  });

  it("starts from the comment's own text when editing, keeps it after saving, and can be cancelled", async () => {
    const onCancel = vi.fn();
    const { user, box, onSubmit, text } = setup({
      initialBody: "before",
      submitLabel: TEXT.vi.save,
      onCancel,
    });
    expect(box).toHaveValue("before");

    await user.clear(box);
    await user.type(box, "after");
    await user.click(screen.getByRole("button", { name: text.save }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith("after"));
    expect(box).toHaveValue("after");

    await user.click(screen.getByRole("button", { name: text.cancel }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
