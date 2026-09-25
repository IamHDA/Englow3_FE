import { MantineProvider } from "@mantine/core";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { theme } from "@/lib/mantine/theme";

import { ResetPasswordForm } from "./index";

const replace = vi.fn();
const refresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, refresh }),
}));

const updateUser = vi.fn();
vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    auth: {
      updateUser: (...args: unknown[]) => updateUser(...args),
    },
  },
}));

const notificationsShow = vi.fn();
vi.mock("@mantine/notifications", () => ({
  notifications: { show: (...args: unknown[]) => notificationsShow(...args) },
}));

function renderForm() {
  render(
    <MantineProvider theme={theme}>
      <ResetPasswordForm />
    </MantineProvider>,
  );
}

beforeEach(() => {
  updateUser.mockReset();
  notificationsShow.mockReset();
  replace.mockReset();
  refresh.mockReset();
});

describe("ResetPasswordForm", () => {
  it("shows a validation error on empty submit and does not call Supabase", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("button", { name: "Đặt lại mật khẩu" }));

    expect(
      await screen.findByText("Mật khẩu tối thiểu 8 ký tự"),
    ).toBeInTheDocument();
    expect(updateUser).not.toHaveBeenCalled();
  });

  it("rejects a password missing complexity requirements", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText("Mật khẩu mới"), "newpassword123");
    await user.click(screen.getByRole("button", { name: "Đặt lại mật khẩu" }));

    expect(
      await screen.findByText("Mật khẩu cần ít nhất 1 chữ hoa"),
    ).toBeInTheDocument();
    expect(updateUser).not.toHaveBeenCalled();
  });

  // Typed blind, so typed twice - a typo would lock the learner out again.
  it("refuses a confirmation that does not match", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText("Mật khẩu mới"), "NewPassword123!");
    await user.type(
      screen.getByLabelText("Nhập lại mật khẩu mới"),
      "NewPassword124!",
    );
    await user.click(screen.getByRole("button", { name: "Đặt lại mật khẩu" }));

    expect(
      await screen.findByText("Mật khẩu nhập lại không khớp"),
    ).toBeInTheDocument();
    expect(updateUser).not.toHaveBeenCalled();
  });

  it("updates the password and redirects home", async () => {
    updateUser.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText("Mật khẩu mới"), "NewPassword123!");
    await user.type(
      screen.getByLabelText("Nhập lại mật khẩu mới"),
      "NewPassword123!",
    );
    await user.click(screen.getByRole("button", { name: "Đặt lại mật khẩu" }));

    await waitFor(() =>
      expect(updateUser).toHaveBeenCalledWith({
        password: "NewPassword123!",
      }),
    );
    expect(notificationsShow).toHaveBeenCalledWith(
      expect.objectContaining({ color: "green" }),
    );
    expect(replace).toHaveBeenCalledWith("/");
  });

  it("shows a toast when Supabase rejects the update", async () => {
    updateUser.mockResolvedValue({
      error: {
        message: "New password should be different from the old password.",
        code: "same_password",
      },
    });
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText("Mật khẩu mới"), "NewPassword123!");
    await user.type(
      screen.getByLabelText("Nhập lại mật khẩu mới"),
      "NewPassword123!",
    );
    await user.click(screen.getByRole("button", { name: "Đặt lại mật khẩu" }));

    await waitFor(() =>
      expect(notificationsShow).toHaveBeenCalledWith(
        expect.objectContaining({
          color: "warn",
          message: "Mật khẩu mới phải khác mật khẩu cũ.",
        }),
      ),
    );
    expect(replace).not.toHaveBeenCalled();
  });
});
