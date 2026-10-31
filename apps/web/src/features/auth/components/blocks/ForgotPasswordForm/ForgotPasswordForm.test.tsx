import { MantineProvider } from "@mantine/core";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { theme } from "@/lib/mantine/theme";

import { ForgotPasswordForm } from "./index";

function renderForm(onSend = vi.fn().mockResolvedValue(null)) {
  render(
    <MantineProvider theme={theme}>
      <ForgotPasswordForm onSend={onSend} />
    </MantineProvider>,
  );
  return { onSend };
}

afterEach(() => {
  vi.useRealTimers();
});

describe("ForgotPasswordForm", () => {
  it("asks for a valid email before sending anything", async () => {
    const user = userEvent.setup();
    const { onSend } = renderForm();

    await user.type(screen.getByLabelText("Email"), "not-an-email");
    await user.click(
      screen.getByRole("button", { name: "Gửi link đặt lại mật khẩu" }),
    );

    expect(await screen.findByText("Email không hợp lệ")).toBeInTheDocument();
    expect(onSend).not.toHaveBeenCalled();
  });

  it("sends the link and says where it went", async () => {
    const user = userEvent.setup();
    const { onSend } = renderForm();

    await user.type(screen.getByLabelText("Email"), "learner@example.com");
    await user.click(
      screen.getByRole("button", { name: "Gửi link đặt lại mật khẩu" }),
    );

    expect(onSend).toHaveBeenCalledWith("learner@example.com");
    expect(
      await screen.findByText("Đã gửi link đặt lại mật khẩu"),
    ).toBeInTheDocument();
    expect(screen.getByText("learner@example.com")).toBeInTheDocument();
  });

  it("keeps the form and shows the reason when sending fails", async () => {
    const user = userEvent.setup();
    renderForm(
      vi
        .fn()
        .mockResolvedValue(
          "Bạn vừa yêu cầu gửi thư. Đợi vài phút rồi thử lại nhé.",
        ),
    );

    await user.type(screen.getByLabelText("Email"), "learner@example.com");
    await user.click(
      screen.getByRole("button", { name: "Gửi link đặt lại mật khẩu" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Đợi vài phút rồi thử lại",
    );
    expect(screen.queryByText("Đã gửi link đặt lại mật khẩu")).toBeNull();
  });

  // Supabase refuses a second link to the same address within a minute, so
  // the button waits too rather than offering a resend that would fail.
  it("lets the learner resend only after the cooldown", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const { onSend } = renderForm();

    await user.type(screen.getByLabelText("Email"), "learner@example.com");
    await user.click(
      screen.getByRole("button", { name: "Gửi link đặt lại mật khẩu" }),
    );

    const resend = await screen.findByRole("button", {
      name: /Gửi lại sau \d+ giây/,
    });
    expect(resend).toBeDisabled();

    for (let second = 0; second < 60; second++) {
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });
    }

    const ready = await screen.findByRole("button", { name: "Gửi lại link" });
    await user.click(ready);

    await waitFor(() => expect(onSend).toHaveBeenCalledTimes(2));
  });
});
