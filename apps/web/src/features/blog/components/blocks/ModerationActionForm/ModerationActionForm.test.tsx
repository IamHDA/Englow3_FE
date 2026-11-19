import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { BlogModerationAction } from "@/lib/graphql/generated";

import { MAX_MODERATION_REASON_LENGTH } from "../../../constants/blog";
import {
  renderInApp,
  resetLanguage,
  type TestLanguage,
} from "../../../testing/providers";
import { refusal } from "../../../testing/refusals";

import { ModerationActionForm } from "./index";

afterEach(resetLanguage);

const TEXT = {
  vi: {
    hide: "Ẩn",
    restore: "Khôi phục",
    remove: "Gỡ",
    dismiss: "Bỏ qua báo cáo",
    reason: /Lý do \(được lưu vào lịch sử/,
    apply: "Thực hiện",
    actionRequired: "Hãy chọn một hành động.",
    reasonRequired: "Hãy nhập lý do.",
    reasonTooLong: "Lý do tối đa 500 ký tự.",
    confirmTitle: "Gỡ nội dung này?",
    confirm: "Gỡ vĩnh viễn",
    back: "Quay lại",
    invalidTransition:
      "Nội dung đang ở trạng thái khác, không thực hiện được thao tác này. Hãy tải lại trang.",
    own: "Bạn không thể tự kiểm duyệt nội dung của mình - cần một thành viên khác xử lý.",
    noActions: "Không có thao tác nào áp dụng cho nội dung ở trạng thái này.",
  },
  en: {
    hide: "Hide",
    restore: "Restore",
    remove: "Remove",
    dismiss: "Dismiss reports",
    reason: /Reason \(kept in the history/,
    apply: "Apply",
    actionRequired: "Choose an action.",
    reasonRequired: "Enter a reason.",
    reasonTooLong: "The reason is 500 characters at most.",
    confirmTitle: "Remove this content?",
    confirm: "Remove for good",
    back: "Go back",
    invalidTransition:
      "The content is in a different state, so that cannot be done. Reload the page.",
    own: "You cannot moderate your own content - another member has to handle it.",
    noActions: "No action applies to content in this state.",
  },
} as const;

const ALL = [
  BlogModerationAction.HIDE,
  BlogModerationAction.REMOVE,
  BlogModerationAction.DISMISS,
];

function setup({
  actions = ALL,
  language = "vi" as TestLanguage,
  onSubmit = vi.fn().mockResolvedValue(undefined),
}: {
  actions?: BlogModerationAction[];
  language?: TestLanguage;
  onSubmit?: (values: {
    action: BlogModerationAction;
    reason: string;
  }) => Promise<void>;
} = {}) {
  renderInApp(
    <ModerationActionForm actions={actions} onSubmit={onSubmit} />,
    language,
  );
  return { user: userEvent.setup(), onSubmit, text: TEXT[language] };
}

describe("ModerationActionForm", () => {
  it("offers exactly the actions it is given", () => {
    const { text } = setup({ actions: [BlogModerationAction.RESTORE] });

    expect(screen.getAllByRole("radio")).toHaveLength(1);
    expect(
      screen.getByRole("radio", { name: new RegExp(text.restore) }),
    ).toBeInTheDocument();
  });

  it("says no action applies, and shows no form, when it is given none", () => {
    const { text } = setup({ actions: [] });

    expect(screen.getByText(text.noActions)).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("sends the action and the trimmed reason, then empties the form", async () => {
    const { user, onSubmit, text } = setup();

    await user.click(
      screen.getByRole("radio", { name: new RegExp(`^${text.hide}`) }),
    );
    await user.type(screen.getByLabelText(text.reason), "  spam links  ");
    await user.click(screen.getByRole("button", { name: text.apply }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledExactlyOnceWith({
        action: BlogModerationAction.HIDE,
        reason: "spam links",
      }),
    );
    await waitFor(() =>
      expect(screen.getByLabelText(text.reason)).toHaveValue(""),
    );
  });

  it.each(["vi", "en"] as const)(
    "needs an action and a reason before anything is sent, in %s",
    async (language) => {
      const { user, onSubmit, text } = setup({ language });

      await user.click(screen.getByRole("button", { name: text.apply }));

      expect(await screen.findByText(text.actionRequired)).toBeInTheDocument();
      expect(screen.getByText(text.reasonRequired)).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    },
  );

  it("treats a reason of blanks as none", async () => {
    const { user, onSubmit, text } = setup();

    await user.click(
      screen.getByRole("radio", { name: new RegExp(`^${text.dismiss}`) }),
    );
    await user.type(screen.getByLabelText(text.reason), "     ");
    await user.click(screen.getByRole("button", { name: text.apply }));

    expect(await screen.findByText(text.reasonRequired)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("takes a reason of exactly 500 characters and refuses 501", async () => {
    const { user, onSubmit, text } = setup();
    await user.click(
      screen.getByRole("radio", { name: new RegExp(`^${text.hide}`) }),
    );
    const reason = screen.getByLabelText(text.reason);

    await user.click(reason);
    await user.paste("r".repeat(MAX_MODERATION_REASON_LENGTH + 1));
    await user.click(screen.getByRole("button", { name: text.apply }));
    expect(await screen.findByText(text.reasonTooLong)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();

    await user.clear(reason);
    await user.paste("r".repeat(MAX_MODERATION_REASON_LENGTH));
    await user.click(screen.getByRole("button", { name: text.apply }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
  });

  describe("removing", () => {
    async function chooseRemove(
      user: ReturnType<typeof userEvent.setup>,
      text: (typeof TEXT)[TestLanguage],
    ) {
      await user.click(
        screen.getByRole("radio", { name: new RegExp(`^${text.remove}`) }),
      );
      await user.type(screen.getByLabelText(text.reason), "abuse");
      await user.click(screen.getByRole("button", { name: text.apply }));
    }

    it.each(["vi", "en"] as const)(
      "asks first and says it cannot be taken back, in %s, and sends nothing yet",
      async (language) => {
        const { user, onSubmit, text } = setup({ language });

        await chooseRemove(user, text);

        const dialog = await screen.findByRole("dialog", {
          name: text.confirmTitle,
        });
        expect(
          within(dialog).getByText(/(không khôi phục được|cannot be restored)/),
        ).toBeInTheDocument();
        expect(onSubmit).not.toHaveBeenCalled();
      },
    );

    it("removes only after the confirmation", async () => {
      const { user, onSubmit, text } = setup();
      await chooseRemove(user, text);

      const dialog = await screen.findByRole("dialog", {
        name: text.confirmTitle,
      });
      await user.click(
        within(dialog).getByRole("button", { name: text.confirm }),
      );

      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledExactlyOnceWith({
          action: BlogModerationAction.REMOVE,
          reason: "abuse",
        }),
      );
    });

    it("does not remove when the person goes back, and keeps what was typed", async () => {
      const { user, onSubmit, text } = setup();
      await chooseRemove(user, text);

      const dialog = await screen.findByRole("dialog", {
        name: text.confirmTitle,
      });
      await user.click(within(dialog).getByRole("button", { name: text.back }));

      await waitFor(() =>
        expect(
          screen.queryByRole("dialog", { name: text.confirmTitle }),
        ).not.toBeInTheDocument(),
      );
      expect(onSubmit).not.toHaveBeenCalled();
      expect(screen.getByLabelText(text.reason)).toHaveValue("abuse");
    });
  });

  it("puts a refused reason under the box", async () => {
    const onSubmit = vi
      .fn()
      .mockRejectedValue(refusal("BLOG_MODERATION_REASON_INVALID"));
    const { user, text } = setup({ onSubmit });

    await user.click(
      screen.getByRole("radio", { name: new RegExp(`^${text.hide}`) }),
    );
    await user.type(screen.getByLabelText(text.reason), "x");
    await user.click(screen.getByRole("button", { name: text.apply }));

    expect(
      await screen.findByText("Lý do cần từ 1 đến 500 ký tự."),
    ).toBeInTheDocument();
  });

  it.each([
    ["BLOG_MODERATION_INVALID_TRANSITION", "CONFLICT", "invalidTransition"],
    ["BLOG_MODERATION_OWN_CONTENT", "FORBIDDEN", "own"],
  ] as const)(
    "says clearly what %s means, above the form, and keeps what was typed",
    async (backendCode, code, key) => {
      const onSubmit = vi.fn().mockRejectedValue(refusal(backendCode, code));
      const { user, text } = setup({ onSubmit });

      await user.click(
        screen.getByRole("radio", { name: new RegExp(`^${text.hide}`) }),
      );
      await user.type(screen.getByLabelText(text.reason), "keep me");
      await user.click(screen.getByRole("button", { name: text.apply }));

      expect(await screen.findByRole("alert")).toHaveTextContent(text[key]);
      expect(screen.getByLabelText(text.reason)).toHaveValue("keep me");
    },
  );

  it("sends only once for a double press", async () => {
    let finish: () => void = () => undefined;
    const onSubmit = vi.fn(
      () => new Promise<void>((resolve) => (finish = resolve)),
    );
    const { user, text } = setup({ onSubmit });

    await user.click(
      screen.getByRole("radio", { name: new RegExp(`^${text.hide}`) }),
    );
    await user.type(screen.getByLabelText(text.reason), "x");
    await user.dblClick(screen.getByRole("button", { name: text.apply }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    finish();
  });
});
