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
const sendPasswordResetLink = vi.fn();
vi.mock("@/features/auth/api/authClient", () => ({
  signInWithPassword: (...args: unknown[]) => signInWithPassword(...args),
  sendPasswordResetLink: (...args: unknown[]) => sendPasswordResetLink(...args),
}));
vi.mock("@/features/auth/api/sessionSync", () => ({
  announceSessionChange: vi.fn(),
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
  sendPasswordResetLink.mockReset();
  notificationsShow.mockReset();
  notificationsUpdate.mockReset();
  refresh.mockReset();
  push.mockReset();
});

describe("LoginForm", () => {
  it("shows validation errors on empty submit and sends nothing", async () => {
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
    signInWithPassword.mockResolvedValue({ error: null, session: null });
    const user = userEvent.setup();
    const { onSuccess } = renderForm();

    await user.type(screen.getByLabelText("Email"), "learner@example.com");
    await user.type(screen.getByLabelText("Mật khẩu"), "password123");
    await user.click(screen.getByRole("button", { name: "Đăng nhập" }));

    await waitFor(() =>
      expect(signInWithPassword).toHaveBeenCalledWith({
        email: "learner@example.com",
        password: "password123",
        rememberMe: false,
      }),
    );
    expect(refresh).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalled();
  });

  // Supabase's own text is English and written for developers; the learner
  // gets a sentence in Vietnamese, keyed on the error code.
  it("shows a toast when Supabase rejects the credentials", async () => {
    signInWithPassword.mockResolvedValue({
      error: { code: "invalid_credentials", status: 400 },
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

  // The choice is the server's to act on (it writes the cookies); the form's
  // part is to say which one was made.
  it("tells the server to end the session with the browser when remember me stays unchecked", async () => {
    signInWithPassword.mockResolvedValue({ error: null, session: null });
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText("Email"), "learner@example.com");
    await user.type(screen.getByLabelText("Mật khẩu"), "password123");
    await user.click(screen.getByRole("button", { name: "Đăng nhập" }));

    await waitFor(() =>
      expect(signInWithPassword).toHaveBeenCalledWith(
        expect.objectContaining({ rememberMe: false }),
      ),
    );
  });

  it("asks for a persistent session when remember me is checked", async () => {
    signInWithPassword.mockResolvedValue({ error: null, session: null });
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText("Email"), "learner@example.com");
    await user.type(screen.getByLabelText("Mật khẩu"), "password123");
    await user.click(screen.getByLabelText("Ghi nhớ đăng nhập"));
    await user.click(screen.getByRole("button", { name: "Đăng nhập" }));

    await waitFor(() =>
      expect(signInWithPassword).toHaveBeenCalledWith(
        expect.objectContaining({ rememberMe: true }),
      ),
    );
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
    expect(sendPasswordResetLink).not.toHaveBeenCalled();
  });

  // Each role lands where its work is.
  it.each([
    ["ADMIN", "/admin"],
    ["STAFF", "/admin"],
  ])("sends %s to the administration area", async (role, home) => {
    signInWithPassword.mockResolvedValue({
      session: { userId: "u1", email: "admin@example.com", role },
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
      session: { userId: "u2", email: "learner@example.com", role: "LEARNER" },
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
