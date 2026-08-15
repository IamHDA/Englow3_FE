import { MantineProvider } from "@mantine/core";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { theme } from "@/lib/mantine/theme";

import { RegisterForm } from "./index";

const refresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh }),
}));

const signUp = vi.fn();
vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    auth: {
      signUp: (...args: unknown[]) => signUp(...args),
    },
  },
}));

const notificationsShow = vi.fn();
vi.mock("@mantine/notifications", () => ({
  notifications: { show: (...args: unknown[]) => notificationsShow(...args) },
}));

const VALID_PASSWORD = "Password123!";

function renderForm() {
  const onSuccess = vi.fn();
  render(
    <MantineProvider theme={theme}>
      <RegisterForm onSuccess={onSuccess} />
    </MantineProvider>,
  );
  return { onSuccess };
}

async function fillValidForm(
  user: ReturnType<typeof userEvent.setup>,
  password = VALID_PASSWORD,
) {
  await user.type(screen.getByLabelText("Họ và tên"), "Nguyễn Văn A");
  await user.type(screen.getByLabelText(/Nickname/), "vana");
  await user.type(screen.getByLabelText("Email"), "vana@example.com");
  await user.type(screen.getByLabelText(/Mật khẩu/), password);
  await user.selectOptions(screen.getByLabelText("Ngày sinh - ngày"), "15");
  await user.selectOptions(screen.getByLabelText("Ngày sinh - tháng"), "6");
  await user.selectOptions(screen.getByLabelText("Ngày sinh - năm"), "2000");
}

beforeEach(() => {
  signUp.mockReset();
  notificationsShow.mockReset();
  refresh.mockReset();
});

describe("RegisterForm", () => {
  it("shows validation errors on empty submit and does not call Supabase", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("button", { name: "Tạo tài khoản" }));

    expect(
      await screen.findByText("Họ và tên phải có ít nhất 2 ký tự"),
    ).toBeInTheDocument();
    expect(screen.getByText(/Nickname chỉ gồm chữ cái/)).toBeInTheDocument();
    expect(screen.getByText("Vui lòng nhập email")).toBeInTheDocument();
    expect(screen.getByText("Mật khẩu tối thiểu 8 ký tự")).toBeInTheDocument();
    expect(screen.getByText("Vui lòng chọn ngày sinh")).toBeInTheDocument();
    expect(signUp).not.toHaveBeenCalled();
  });

  it.each([
    ["password123!", "Mật khẩu cần ít nhất 1 chữ hoa"],
    ["PASSWORD123!", "Mật khẩu cần ít nhất 1 chữ thường"],
    ["Password123", "Mật khẩu cần ít nhất 1 ký tự đặc biệt"],
  ])(
    "rejects a password missing complexity requirements (%s)",
    async (password, expectedMessage) => {
      const user = userEvent.setup();
      renderForm();

      await fillValidForm(user, password);
      await user.click(screen.getByRole("button", { name: "Tạo tài khoản" }));

      expect(await screen.findByText(expectedMessage)).toBeInTheDocument();
      expect(signUp).not.toHaveBeenCalled();
    },
  );

  it("blocks a calendar date that doesn't exist", async () => {
    signUp.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText("Họ và tên"), "Nguyễn Văn A");
    await user.type(screen.getByLabelText(/Nickname/), "vana");
    await user.type(screen.getByLabelText("Email"), "vana@example.com");
    await user.type(screen.getByLabelText(/Mật khẩu/), VALID_PASSWORD);
    await user.selectOptions(screen.getByLabelText("Ngày sinh - ngày"), "31");
    await user.selectOptions(screen.getByLabelText("Ngày sinh - tháng"), "2");
    await user.selectOptions(screen.getByLabelText("Ngày sinh - năm"), "2000");
    await user.click(screen.getByRole("button", { name: "Tạo tài khoản" }));

    expect(
      await screen.findByText("Ngày sinh không hợp lệ"),
    ).toBeInTheDocument();
    expect(signUp).not.toHaveBeenCalled();
  });

  it("blocks submit when terms are not accepted", async () => {
    const user = userEvent.setup();
    renderForm();

    await fillValidForm(user);
    await user.click(screen.getByRole("checkbox")); // uncheck the pre-ticked terms box
    await user.click(screen.getByRole("button", { name: "Tạo tài khoản" }));

    expect(
      await screen.findByText("Bạn cần đồng ý với điều khoản để tiếp tục"),
    ).toBeInTheDocument();
    expect(signUp).not.toHaveBeenCalled();
  });

  it("submits a valid form with the full signUp payload", async () => {
    signUp.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    const { onSuccess } = renderForm();

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: "Tạo tài khoản" }));

    await waitFor(() =>
      expect(signUp).toHaveBeenCalledWith({
        email: "vana@example.com",
        password: VALID_PASSWORD,
        options: expect.objectContaining({
          data: {
            full_name: "Nguyễn Văn A",
            display_name: "vana",
            birth_date: "2000-06-15",
            gender: "MALE",
          },
        }),
      }),
    );
    expect(notificationsShow).toHaveBeenCalledWith(
      expect.objectContaining({ color: "green" }),
    );
    expect(refresh).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalled();
  });

  it("shows a toast when Supabase rejects the sign up", async () => {
    signUp.mockResolvedValue({ error: { message: "Email already in use" } });
    const user = userEvent.setup();
    renderForm();

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: "Tạo tài khoản" }));

    await waitFor(() =>
      expect(notificationsShow).toHaveBeenCalledWith(
        expect.objectContaining({
          color: "warn",
          message: "Email already in use",
        }),
      ),
    );
  });

  it("disables the submit button while pending", async () => {
    let resolveSignUp!: (value: { error: null }) => void;
    signUp.mockReturnValue(
      new Promise((resolve) => {
        resolveSignUp = resolve;
      }),
    );
    const user = userEvent.setup();
    renderForm();

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: "Tạo tài khoản" }));

    expect(
      screen.getByRole("button", { name: "Tạo tài khoản" }),
    ).toBeDisabled();
    resolveSignUp({ error: null });
  });
});
