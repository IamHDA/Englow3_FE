import { MantineProvider } from "@mantine/core";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { theme } from "@/lib/mantine/theme";

import { LoginForm } from "./index";

const refresh = vi.fn();
const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh, push }),
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
const notificationsUpdate = vi.fn();
vi.mock("@mantine/notifications", () => ({
  notifications: {
    show: (...args: unknown[]) => notificationsShow(...args),
    update: (...args: unknown[]) => notificationsUpdate(...args),
  },
}));

function renderForm() {
  const onSuccess = vi.fn();
  const onLeave = vi.fn();
  render(
    <MantineProvider theme={theme}>
      <LoginForm onSuccess={onSuccess} onLeave={onLeave} />
    </MantineProvider>,
  );
  return { onSuccess, onLeave };
}

beforeEach(() => {
  signInWithPassword.mockReset();
  resetPasswordForEmail.mockReset();
  forgetSessionOnBrowserClose.mockReset();
  notificationsShow.mockReset();
  notificationsUpdate.mockReset();
  refresh.mockReset();
  push.mockReset();
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

  // Supabase's own text is English and written for developers; the learner
  // gets a sentence in Vietnamese, keyed on the error code.
  it("shows a toast when Supabase rejects the credentials", async () => {
    signInWithPassword.mockResolvedValue({
      error: {
        message: "Invalid login credentials",
        code: "invalid_credentials",
      },
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
          message: "Email hoặc mật khẩu không đúng.",
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

  // Forgot password is a page of its own now, with room to say what happened
  // and to resend. The link goes there and closes this modal; it sends nothing.
  it("links to the forgot password page and closes the modal", async () => {
    const user = userEvent.setup();
    const { onLeave } = renderForm();

    const link = screen.getByRole("link", { name: "Quên mật khẩu?" });
    expect(link).toHaveAttribute("href", "/auth/forgot");

    await user.click(link);

    expect(onLeave).toHaveBeenCalled();
    expect(resetPasswordForEmail).not.toHaveBeenCalled();
  });

  // Each role lands where its work is.
  it.each([
    ["ADMIN", "/admin"],
    ["STAFF", "/admin"],
  ])("sends %s to the administration area", async (role, home) => {
    signInWithPassword.mockResolvedValue({
      data: {
        user: { id: "u1", email: "admin@example.com", app_metadata: { role } },
      },
      error: null,
    });
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText("Email"), "admin@example.com");
    await user.type(screen.getByLabelText("Mật khẩu"), "password123");
    await user.click(screen.getByRole("button", { name: "Đăng nhập" }));

    await waitFor(() => expect(push).toHaveBeenCalledWith(home));
  });

  it("leaves a learner on the page they signed in from", async () => {
    signInWithPassword.mockResolvedValue({
      data: {
        user: {
          id: "u2",
          email: "learner@example.com",
          app_metadata: { role: "LEARNER" },
        },
      },
      error: null,
    });
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText("Email"), "learner@example.com");
    await user.type(screen.getByLabelText("Mật khẩu"), "password123");
    await user.click(screen.getByRole("button", { name: "Đăng nhập" }));

    await waitFor(() => expect(refresh).toHaveBeenCalled());
    expect(push).not.toHaveBeenCalled();
  });
});
