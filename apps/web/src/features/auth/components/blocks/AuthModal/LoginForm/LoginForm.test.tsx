import { MantineProvider } from "@mantine/core";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { theme } from "@/lib/mantine/theme";

import { LoginForm } from "./index";

const refresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh }),
}));

const signInWithPassword = vi.fn();
const resetPasswordForEmail = vi.fn();
const forgetSessionOnBrowserClose = vi.fn();
vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    auth: {
      signInWithPassword: (...args: unknown[]) => signInWithPassword(...args),
      resetPasswordForEmail: (...args: unknown[]) =>
        resetPasswordForEmail(...args),
    },
  },
  forgetSessionOnBrowserClose: (...args: unknown[]) =>
    forgetSessionOnBrowserClose(...args),
}));

const notificationsShow = vi.fn();
vi.mock("@mantine/notifications", () => ({
  notifications: { show: (...args: unknown[]) => notificationsShow(...args) },
}));

function renderForm() {
  const onSuccess = vi.fn();
  render(
    <MantineProvider theme={theme}>
      <LoginForm onSuccess={onSuccess} />
    </MantineProvider>,
  );
  return { onSuccess };
}

beforeEach(() => {
  signInWithPassword.mockReset();
  resetPasswordForEmail.mockReset();
  forgetSessionOnBrowserClose.mockReset();
  notificationsShow.mockReset();
  refresh.mockReset();
});

describe("LoginForm", () => {
  it("shows validation errors on empty submit and does not call Supabase", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("button", { name: "Đăng nhập" }));

    expect(await screen.findByText("Vui lòng nhập email")).toBeInTheDocument();
    expect(screen.getByText("Vui lòng nhập mật khẩu")).toBeInTheDocument();
    expect(signInWithPassword).not.toHaveBeenCalled();
  });

  it("shows an error for an invalid email format", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText("Email"), "not-an-email");
    await user.type(screen.getByLabelText("Mật khẩu"), "password123");
    await user.click(screen.getByRole("button", { name: "Đăng nhập" }));

    expect(await screen.findByText("Email không hợp lệ")).toBeInTheDocument();
    expect(signInWithPassword).not.toHaveBeenCalled();
  });

  it("submits valid credentials and calls onSuccess", async () => {
    signInWithPassword.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    const { onSuccess } = renderForm();

    await user.type(screen.getByLabelText("Email"), "learner@example.com");
    await user.type(screen.getByLabelText("Mật khẩu"), "password123");
    await user.click(screen.getByRole("button", { name: "Đăng nhập" }));

    await waitFor(() =>
      expect(signInWithPassword).toHaveBeenCalledWith({
        email: "learner@example.com",
        password: "password123",
      }),
    );
    expect(refresh).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalled();
  });

  it("shows a toast when Supabase rejects the credentials", async () => {
    signInWithPassword.mockResolvedValue({
      error: { message: "Invalid login credentials" },
    });
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText("Email"), "learner@example.com");
    await user.type(screen.getByLabelText("Mật khẩu"), "wrongpassword");
    await user.click(screen.getByRole("button", { name: "Đăng nhập" }));

    await waitFor(() =>
      expect(notificationsShow).toHaveBeenCalledWith(
        expect.objectContaining({
          color: "warn",
          message: "Invalid login credentials",
        }),
      ),
    );
  });

  it("forgets the session on browser close when remember me stays unchecked", async () => {
    signInWithPassword.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText("Email"), "learner@example.com");
    await user.type(screen.getByLabelText("Mật khẩu"), "password123");
    await user.click(screen.getByRole("button", { name: "Đăng nhập" }));

    await waitFor(() => expect(forgetSessionOnBrowserClose).toHaveBeenCalled());
  });

  it("keeps the persistent session when remember me is checked", async () => {
    signInWithPassword.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText("Email"), "learner@example.com");
    await user.type(screen.getByLabelText("Mật khẩu"), "password123");
    await user.click(screen.getByLabelText("Ghi nhớ đăng nhập"));
    await user.click(screen.getByRole("button", { name: "Đăng nhập" }));

    await waitFor(() => expect(signInWithPassword).toHaveBeenCalled());
    expect(forgetSessionOnBrowserClose).not.toHaveBeenCalled();
  });

  it("sends a reset email from the forgot password link", async () => {
    resetPasswordForEmail.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText("Email"), "learner@example.com");
    await user.click(screen.getByRole("button", { name: "Quên mật khẩu?" }));

    await waitFor(() =>
      expect(resetPasswordForEmail).toHaveBeenCalledWith(
        "learner@example.com",
        expect.objectContaining({
          redirectTo: expect.stringContaining(
            "/auth/callback?next=/auth/reset",
          ),
        }),
      ),
    );
    expect(notificationsShow).toHaveBeenCalledWith(
      expect.objectContaining({ color: "green" }),
    );
  });

  it("rejects the forgot password click without a valid email", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("button", { name: "Quên mật khẩu?" }));

    expect(
      await screen.findByText("Nhập email hợp lệ trước khi lấy lại mật khẩu"),
    ).toBeInTheDocument();
    expect(resetPasswordForEmail).not.toHaveBeenCalled();
  });
});
